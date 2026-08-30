// Public configuration only. Firebase web configuration is intentionally public.
// Never place Worker secrets, encryption keys, HMAC keys,
// answer or private contest material in this file.
const jellybeanPilotMode = new URLSearchParams(window.location.search).get("pilot") === "1";

window.JELLYBEAN_CONFIG = Object.freeze({
  apiBase: "https://jellybean-contest-api.jellybean-contest-worker.workers.dev",
  turnstileSiteKey: "0x4AAAAAAEiKLaH1vEBRdsq_",
  contestId: jellybeanPilotMode ? "jellybeans-pilot" : "jellybeans-v1",
  pilotMode: jellybeanPilotMode,
  firebase: Object.freeze({
    apiKey: "AIzaSyADaBCN6Cyg5MXEccAXtw2GSeX-hCWZaVo",
    authDomain: "composite-sun-507106-d9.firebaseapp.com",
    projectId: "composite-sun-507106-d9",
    appId: "1:307107800650:web:60ab5f2d14cd8b9698a8b3",
    appCheckSiteKey: "6LeQw58tAAAAADf5hEFfwfaM9Z_CC6ES5zF7de-T"
  })
});
