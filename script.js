// Smooth scroll for navigation links
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
  })

  document.addEventListener('DOMContentLoaded', () => {
    // Select both layers
    const layer1 = document.querySelector('.layer-1');
    const layer2 = document.querySelector('.layer-2');

    // This function handles the logic for a single layer
    function runGlitchLoop(element) {
        // Random timings
        const duration = Math.floor(Math.random() * 100) + 50; // Short flash (50-150ms)
        const nextInterval = Math.floor(Math.random() * 2500) + 200; // Wait time

        // FLIP A COIN: 0 = Horizontal, 1 = Vertical
        const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';

        if (orientation === 'horizontal') {
            // HORIZONTAL STRIP
            // Random top position (0-100%)
            const top = Math.floor(Math.random() * 100);
            // Height is thin (1% to 5%)
            const height = Math.floor(Math.random() * 5) + 1; 
            const bottom = 100 - (top + height);
            
            // inset(top right bottom left)
            element.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;
            
        } else {
            // VERTICAL STRIP
            // Random left position (0-100%)
            const left = Math.floor(Math.random() * 100);
            // Width is very thin (0.2% to 2%) for that "scanning" look
            const width = (Math.random() * 2) + 0.2; 
            const right = 100 - (left + width);

            // inset(top right bottom left)
            element.style.clipPath = `inset(0 ${right}% 0 ${left}%)`;
        }

        // Make visible
        element.style.opacity = '0.6'; // Adjust brightness here

        // Hide after duration
        setTimeout(() => {
            element.style.opacity = '0';
        }, duration);

        // Schedule next run
        setTimeout(() => {
            runGlitchLoop(element);
        }, nextInterval + duration);
    }

    // Start both loops independently so they overlap randomly
    if (layer1) runGlitchLoop(layer1);
    
    // Slight delay to the second layer so they don't start exactly in sync
    setTimeout(() => {
        if (layer2) runGlitchLoop(layer2);
    }, 500);

    // --- TERMINAL TYPING LOGIC ---
    const terminalContent = document.getElementById('terminal-content');
    
    // The ASCII Art String
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

    const sequence = [
        { type: "./init_portfolio.sh", delay: 300 },
        { output: "<span class='cmd-error'>bash: ./init_portfolio.sh: Permission denied</span><br>", delay: 400 },
        { type: "chmod +x init_portfolio.sh && ./init_portfolio.sh", delay: 500 },
        { output: "[+] Mounting virtual file system...<br>", delay: 100 },
        { output: "[+] Loading assets... <span style='color: var(--accent)'>Done</span><br>", delay: 100 },
        { output: "[+] Starting local session server... <span style='color: var(--accent)'>OK</span><br>", delay: 300 },
        { output: "Displaying /etc/motd...<br>", delay: 100 },
        { output: asciiArt, delay: 200 },
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
            
            if (step.output) {
                terminalContent.innerHTML += step.output;
            }

            // Always scroll to bottom
            terminalContent.scrollTop = terminalContent.scrollHeight;

            if (step.delay) {
                await new Promise(r => setTimeout(r, step.delay));
            }
        }
    }

    runTerminal();
});