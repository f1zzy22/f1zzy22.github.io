import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-check.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

(function () {
  "use strict";

  const config = window.JELLYBEAN_CONFIG || {};
  const state = {
    contest: null,
    preflightToken: null,
    confirmationResult: null,
    guessToken: null,
    firebaseAuth: null,
    firebaseAppCheck: null,
    firebaseRecaptcha: null,
    turnstileWidgetId: null,
    countdownTimer: null
  };

  const elements = {
    entryCount: document.getElementById("entry-count"),
    status: document.getElementById("contest-status"),
    timeLeft: document.getElementById("time-left"),
    commitment: document.getElementById("commitment-hash"),
    notice: document.getElementById("notice"),
    phoneForm: document.getElementById("phone-form"),
    codeForm: document.getElementById("code-form"),
    guessForm: document.getElementById("guess-form"),
    success: document.getElementById("success-state"),
    results: document.getElementById("results-state"),
    feedState: document.getElementById("feed-state"),
    video: document.getElementById("jar-video"),
    placeholder: document.getElementById("jar-placeholder")
  };

  if (config.pilotMode) {
    document.title = "Jellybean Pilot | Daniel Han";
    document.getElementById("pilot-banner").hidden = false;
  }

  function apiUrl(path) {
    return String(config.apiBase || "").replace(/\/$/, "") + path;
  }

  function setNotice(message, kind) {
    elements.notice.textContent = message;
    elements.notice.className = "form-notice" + (kind ? " " + kind : "");
  }

  function setBusy(form, busy) {
    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = busy;
      button.dataset.originalText ||= button.textContent;
      button.textContent = busy ? "PROCESSING..." : button.dataset.originalText;
    }
  }

  function showStep(step) {
    elements.phoneForm.hidden = step !== "phone";
    elements.codeForm.hidden = step !== "code";
    elements.guessForm.hidden = step !== "guess";
    elements.success.hidden = step !== "success";
    elements.results.hidden = step !== "results";
  }

  function normalizeStatus(status) {
    return String(status || "setup").toUpperCase();
  }

  function updateCountdown() {
    if (!state.contest || state.contest.status !== "open") {
      elements.timeLeft.textContent = state.contest && state.contest.status === "closed" ? "CLOSED" : "--:--:--";
      return;
    }
    const remaining = new Date(state.contest.endsAt).getTime() - Date.now();
    if (remaining <= 0) {
      elements.timeLeft.textContent = "CLOSED";
      elements.status.textContent = "CLOSED";
      lockEntry("Submissions are closed. Results will be published after the answer reveal.");
      clearInterval(state.countdownTimer);
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    elements.timeLeft.textContent = `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function lockEntry(message) {
    showStep("phone");
    elements.phoneForm.querySelectorAll("input, button").forEach((input) => { input.disabled = true; });
    setNotice(message);
  }

  async function request(path, options) {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: { "Content-Type": "application/json", ...(options && options.headers) }
    });
    let payload = {};
    try { payload = await response.json(); } catch (_) { /* generic failure below */ }
    if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
    return payload;
  }

  function loadTurnstile() {
    if (!config.turnstileSiteKey || document.querySelector("script[data-turnstile-loader]")) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileLoader = "true";
    script.onload = function () {
      state.turnstileWidgetId = window.turnstile.render("#turnstile-container", {
        sitekey: config.turnstileSiteKey,
        action: "request_sms",
        theme: "dark"
      });
    };
    document.head.appendChild(script);
  }

  function getTurnstileToken() {
    if (!window.turnstile || state.turnstileWidgetId === null) return "";
    return window.turnstile.getResponse(state.turnstileWidgetId);
  }

  function firebaseConfigured() {
    const firebase = config.firebase || {};
    return [firebase.apiKey, firebase.authDomain, firebase.projectId, firebase.appId, firebase.appCheckSiteKey]
      .every((value) => typeof value === "string" && value.length > 0);
  }

  function initializeFirebase() {
    if (state.firebaseAuth) return;
    const firebaseApp = initializeApp({
      apiKey: config.firebase.apiKey,
      authDomain: config.firebase.authDomain,
      projectId: config.firebase.projectId,
      appId: config.firebase.appId
    });
    state.firebaseAppCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(config.firebase.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    });
    state.firebaseAuth = getAuth(firebaseApp);
    state.firebaseAuth.useDeviceLanguage();
    state.firebaseRecaptcha = new RecaptchaVerifier(state.firebaseAuth, "send-code-button", { size: "invisible" });
  }

  async function resetFirebaseRecaptcha() {
    if (!state.firebaseRecaptcha) return;
    try {
      const widgetId = await state.firebaseRecaptcha.render();
      if (window.grecaptcha) window.grecaptcha.reset(widgetId);
    } catch (_) { /* a new page load can always restart verification */ }
  }

  async function detectMedia() {
    const source = elements.video.querySelector("source");
    if (!source) return;
    try {
      const response = await fetch(source.src, { method: "HEAD", cache: "no-store" });
      if (!response.ok || !(response.headers.get("content-type") || "").startsWith("video/")) return;
      elements.placeholder.hidden = true;
      elements.video.hidden = false;
      document.getElementById("still-views").hidden = false;
      elements.feedState.textContent = "ONLINE";
      elements.feedState.classList.add("live");
    } catch (_) {
      // The production render is deliberately absent during setup.
    }
  }

  async function loadContest() {
    detectMedia();
    if (!config.apiBase || !config.turnstileSiteKey || !firebaseConfigured()) {
      lockEntry("The experiment is being assembled. Entry will unlock when the contest opens.");
      return;
    }
    try {
      const contest = await request(`/api/contest?id=${encodeURIComponent(config.contestId)}`, { method: "GET", headers: {} });
      state.contest = contest;
      elements.entryCount.textContent = `${Number(contest.acceptedEntries || 0).toLocaleString()} / ${Number(contest.maxEntries || 5000).toLocaleString()}`;
      elements.status.textContent = normalizeStatus(contest.status);
      elements.commitment.textContent = contest.commitmentHash || "Commitment pending.";
      updateCountdown();
      state.countdownTimer = setInterval(updateCountdown, 1000);
      if (contest.status === "revealed") {
        await loadResults();
        return;
      }
      if (contest.status !== "open") {
        lockEntry(contest.status === "closed" || contest.status === "revealed" ? "Submissions are closed." : "Submissions are not open yet.");
        return;
      }
      setNotice(config.pilotMode
        ? "Pilot is open. Use only a configured Firebase test number."
        : "Verify a U.S. phone number to unlock your one guess.", "ok");
      loadTurnstile();
      initializeFirebase();
    } catch (_) {
      lockEntry("The entry service is temporarily unavailable. Please try again later.");
    }
  }

  async function loadResults() {
    try {
      const result = await request(`/api/results?id=${encodeURIComponent(config.contestId)}`, { method: "GET", headers: {} });
      const stats = result.statistics || {};
      document.getElementById("result-answer").textContent = Number(result.revealedAnswer).toLocaleString();
      document.getElementById("result-median").textContent = Number(stats.median).toLocaleString();
      document.getElementById("result-mean").textContent = Number(stats.mean).toLocaleString();
      document.getElementById("result-trimmed").textContent = Number(stats.trimmedMean).toLocaleString();
      const verification = document.getElementById("result-verification");
      verification.textContent = result.commitmentVerified ? "✓ Published answer matches the pre-contest SHA-256 commitment." : "⚠ Commitment verification failed.";
      verification.classList.toggle("verified", result.commitmentVerified === true);
      showStep("results");
      setNotice("The sealed answer and aggregate results are now public.", result.commitmentVerified ? "ok" : "error");
    } catch (_) {
      lockEntry("The contest is revealed, but the results service is temporarily unavailable.");
    }
  }

  elements.phoneForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const residencyConfirmed = document.getElementById("residency-confirmed").checked;
    const ageConfirmed = document.getElementById("age-confirmed").checked;
    const phone = document.getElementById("phone").value.trim();
    const turnstileToken = getTurnstileToken();
    if (!residencyConfirmed) return setNotice("Confirm the U.S. residency requirement.", "error");
    if (!ageConfirmed) return setNotice("Confirm that you are at least 18 years old.", "error");
    if (!turnstileToken) return setNotice("Complete the bot check before requesting a code.", "error");
    setBusy(elements.phoneForm, true);
    try {
      const payload = await request("/api/verification/start", {
        method: "POST",
        body: JSON.stringify({ contestId: config.contestId, phone, ageConfirmed, residencyConfirmed, turnstileToken })
      });
      state.preflightToken = payload.preflightToken;
      state.confirmationResult = await signInWithPhoneNumber(state.firebaseAuth, payload.normalizedPhone, state.firebaseRecaptcha);
      showStep("code");
      setNotice("Verification code sent. It expires in 10 minutes.", "ok");
      document.getElementById("verification-code").focus();
    } catch (error) {
      setNotice("Unable to send a verification code. Check the number and try again.", "error");
      if (window.turnstile && state.turnstileWidgetId !== null) window.turnstile.reset(state.turnstileWidgetId);
      await resetFirebaseRecaptcha();
    } finally { setBusy(elements.phoneForm, false); }
  });

  elements.codeForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const code = document.getElementById("verification-code").value.trim();
    if (!/^\d{6}$/.test(code)) return setNotice("Enter the six-digit code from the text message.", "error");
    setBusy(elements.codeForm, true);
    try {
      if (!state.confirmationResult || !state.preflightToken) throw new Error("Restart phone verification and request a new code.");
      const credential = await state.confirmationResult.confirm(code);
      const firebaseIdToken = await credential.user.getIdToken(true);
      const payload = await request("/api/verification/check", {
        method: "POST",
        body: JSON.stringify({ contestId: config.contestId, preflightToken: state.preflightToken, firebaseIdToken })
      });
      state.guessToken = payload.guessToken;
      state.preflightToken = null;
      state.confirmationResult = null;
      showStep("guess");
      setNotice("Number verified. Your next submission is final.", "ok");
      document.getElementById("guess").focus();
    } catch (_) { setNotice("Unable to verify that code. Restart verification if the code has expired.", "error"); }
    finally {
      if (state.firebaseAuth) await signOut(state.firebaseAuth).catch(() => {});
      setBusy(elements.codeForm, false);
    }
  });

  elements.guessForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const guess = Number(document.getElementById("guess").value);
    if (!Number.isInteger(guess) || guess < 1 || guess > 1000000) return setNotice("Enter one whole number from 1 through 1,000,000.", "error");
    setBusy(elements.guessForm, true);
    try {
      await request("/api/guesses", {
        method: "POST",
        headers: { Authorization: `Bearer ${state.guessToken}` },
        body: JSON.stringify({ contestId: config.contestId, guess })
      });
      state.guessToken = null;
      showStep("success");
      setNotice("Entry accepted.", "ok");
      if (state.contest) {
        state.contest.acceptedEntries += 1;
        elements.entryCount.textContent = `${state.contest.acceptedEntries.toLocaleString()} / ${state.contest.maxEntries.toLocaleString()}`;
      }
    } catch (error) { setNotice(error.message, "error"); }
    finally { setBusy(elements.guessForm, false); }
  });

  document.getElementById("restart-verification").addEventListener("click", function () {
    state.preflightToken = null;
    state.confirmationResult = null;
    document.getElementById("verification-code").value = "";
    showStep("phone");
    setNotice("Enter a U.S. phone number to restart verification.");
    if (window.turnstile && state.turnstileWidgetId !== null) window.turnstile.reset(state.turnstileWidgetId);
    resetFirebaseRecaptcha();
  });

  loadContest();
})();
