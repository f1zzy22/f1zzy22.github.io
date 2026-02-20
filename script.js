// --- 1. SCROLL LOGIC ---
// Force scroll to top on refresh
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

  // --- 2. SMOOTH SCROLL ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
          e.preventDefault()
          const target = document.querySelector(this.getAttribute("href"))
          if (target) {
              target.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
              })
          }
      })
  });

  // --- 3. HACKER TEXT  ---
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+";
  const hackerTexts = document.querySelectorAll(".hacker-text");

  hackerTexts.forEach(element => {
      element.onmouseover = event => {
          let iteration = 0;
          clearInterval(event.target.interval);
          event.target.interval = setInterval(() => {
              event.target.innerText = event.target.innerText
                  .split("")
                  .map((letter, index) => {
                      if (index < iteration) return event.target.dataset.value[index];
                      return letters[Math.floor(Math.random() * letters.length)];
                  })
                  .join("");
              if (iteration >= event.target.dataset.value.length) clearInterval(event.target.interval);
              iteration += 1 / 3;
          }, 30);
      }
  });

  // --- 4. TERMINAL LOGIC ---
  const terminalContent = document.getElementById('terminal-content');
  const asciiArt = `
<div class="terminal-ascii">
░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓███████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓██████▓▒░ ░▒▓█▓▒░             ░▒▓████████▓▒░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓████████▓▒░▒▓████████▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
</div>`;

  // Hash Check
  if (window.location.hash) {
      document.body.classList.remove('loading');
      if (terminalContent) {
          terminalContent.innerHTML = `
      <span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ ./init_portfolio.sh<br>
      [+] System restored from previous session.<br>
      ${asciiArt}
      <br>[!] <span style='color: var(--accent-blue)'>Interactive mode enabled.</span><br>
      <span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ <span class="cmd-input"></span>
      `;
          terminalContent.scrollTop = terminalContent.scrollHeight;
      }
      return;
  }

  
  const sequence = [
      { type: "./init_portfolio.sh", delay: 200 },
      { output: "<span class='cmd-error'>bash: ./init_portfolio.sh: Permission denied</span><br>", delay: 300 },
      { type: "chmod +x init_portfolio.sh && ./init_portfolio.sh", delay: 300 },
      { output: "[+] Mounting virtual file system...<br>", delay: 200 },
      { output: "[+] Loading assets... <span style='color: var(--accent)'>Done</span><br>", delay: 200 },
      { output: "[+] Establishing secure connection...<br>", delay: 250 },
      { output: "[+] Establishing secure connection...<br>", delay: 500 },
      { output: "[*] Verifying encrypted handshake... <span style='color: var(--accent)'>Success</span><br>", delay: 400 },
      { output: "[+] Starting local session server... <span style='color: var(--accent)'>OK</span><br>", delay: 200 },
      { output: "Displaying /etc/motd...<br>", delay: 100 },
      { output: asciiArt, delay: 100 },
      { output: "<br>[!] <span style='color: var(--accent-blue)'>Interactive mode enabled. Scroll to navigate.</span><br>", delay: 100 }
  ];

  async function runTerminal() {
      if (!terminalContent) return;
      const prompt = `<span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ `;
      for (let step of sequence) {
          if (step.type) {
              terminalContent.innerHTML += prompt;
              const chars = step.type.split('');
              let currentCommand = "";
              const commandSpan = document.createElement('span');
              commandSpan.className = "cmd-input";
              terminalContent.appendChild(commandSpan);
              for (let char of chars) {
                  currentCommand += char;
                  commandSpan.textContent = currentCommand;
                  await new Promise(r => setTimeout(r, Math.random() * 10 + 5));
              }
              terminalContent.innerHTML += "<br>";
          }
          if (step.output) terminalContent.innerHTML += step.output;
          terminalContent.scrollTop = terminalContent.scrollHeight;
          if (step.delay) await new Promise(r => setTimeout(r, step.delay));
      }
      document.body.classList.remove('loading');
  }
  runTerminal();
});


window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".section")
  const navLinks = document.querySelectorAll(".nav-links a")
  let current = ""
  sections.forEach((section) => {
      const sectionTop = section.offsetTop
      const sectionHeight = section.clientHeight
      if (window.pageYOffset >= sectionTop - 200) {
          current = section.getAttribute("id")
      }
  })
  navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href").slice(1) === current) {
          link.classList.add("active")
      }
  })
});