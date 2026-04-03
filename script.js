// --- 1. SCROLL LOGIC ---
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

    // --- 2. SMOOTH SCROLL ---
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // --- 3. HACKER TEXT ---
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
        };
    });

    // --- 4. TERMINAL BOOT SEQUENCE & BINARY RAIN ---
    const terminalContent = document.getElementById('terminal-content');
    const overlay = document.getElementById('terminal-overlay');
    
    let matrixInterval; 

    function startMatrixRain() {
        if (!overlay) return;
        if (matrixInterval) clearInterval(matrixInterval); 

        let matrixCanvas = document.getElementById('matrix-canvas');
        if (!matrixCanvas) {
            matrixCanvas = document.createElement('canvas');
            matrixCanvas.id = 'matrix-canvas';
            matrixCanvas.style.position = 'absolute';
            matrixCanvas.style.top = '0';
            matrixCanvas.style.left = '0';
            matrixCanvas.style.width = '100%';
            matrixCanvas.style.height = '100%';
            matrixCanvas.style.zIndex = '0'; 
            matrixCanvas.style.pointerEvents = 'none';
            overlay.prepend(matrixCanvas);
        }

        const ctx = matrixCanvas.getContext('2d');
        let w = matrixCanvas.width = window.innerWidth;
        let h = matrixCanvas.height = window.innerHeight;

        const cols = Math.floor(w / 20) + 1;
        const yPos = Array(cols).fill(0);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
            ctx.fillRect(0, 0, w, h);
            ctx.font = '14pt "JetBrains Mono", monospace';
            
            yPos.forEach((y, ind) => {
                const text = Math.random() > 0.5 ? '1' : '0'; 
                const colorChance = Math.random();
                
                if (colorChance > 0.98) {
                    ctx.fillStyle = 'rgba(255, 0, 193, 0.6)';  // Hot Pink
                } else if (colorChance > 0.93) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // White
                } else if (colorChance > 0.78) {
                    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';   // Blue
                } else {
                    ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';    // Hacker Green
                }
                
                const x = ind * 20;
                ctx.fillText(text, x, y);
                
                if (y > 100 + Math.random() * 10000) yPos[ind] = 0;
                else yPos[ind] = y + 20;
            });
        }
        matrixInterval = setInterval(drawMatrix, 50); 
    }

    if (overlay && !window.location.hash) {
        startMatrixRain();
    }

    const sequence = [
        { type: "./init_portfolio.sh", delay: 200 },
        { output: "<span class='cmd-error'>bash: ./init_portfolio.sh: Permission denied</span><br>", delay: 300 },
        { type: "chmod +x init_portfolio.sh && ./init_portfolio.sh", delay: 500 },
        { output: "[+] Mounting virtual file system...<br>", delay: 50 },
        { output: "[+] Loading assets... <span style='color: var(--accent)'>Done</span><br>", delay: 200 },
        { output: "[*] Verifying encrypted handshake... <span style='color: var(--accent)'>Success</span><br>", delay: 500 },
        { output: "[+] Starting local session server... <span style='color: var(--accent)'>OK</span><br>", delay: 50 },
        { output: "[+] Connection secure and established.<br>", delay: 50 },
        { output: "<br><span class='login-success'>[*] LOGIN SUCCESSFUL.</span><br>", delay: 600 }
    ];

    async function runTerminal() {
        const terminalWindow = document.querySelector('.terminal-window');
        if (!terminalWindow || !terminalContent) return;

        await gsap.to(terminalWindow, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });

        terminalContent.innerHTML = "";
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

        setTimeout(minimizeTerminal, 800);
    }

    function minimizeTerminal() {
        const tl = gsap.timeline({
            onComplete: () => {
                if (overlay) overlay.style.display = 'none';
                document.body.classList.remove('loading');
                if (matrixInterval) clearInterval(matrixInterval); 

                // --- NEW: Trigger the name explosion here ---
                if (window.startHeroAnimation) window.startHeroAnimation();
            }
        });

        const terminalWindow = document.querySelector('.terminal-window');

        if (terminalWindow) {
            tl.to(terminalWindow, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            });
        }

        if (overlay) {
            tl.to(overlay, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            }, "<"); 
        }
    }

    if (!window.location.hash) {
        runTerminal();
    } else {
        document.body.classList.remove('loading');
        if (overlay) overlay.style.display = 'none';
        
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({ behavior: "auto", block: "start" });
            }
        }, 50);
    }

    // --- 5. SCROLL HIGHLIGHTING ---
    window.addEventListener("scroll", () => {
        const sections = document.querySelectorAll(".section");
        const navLinks = document.querySelectorAll(".nav-links a");
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute("id");
            }
        });
        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === current) {
                link.classList.add("active");
            }
        });
    });

    // --- 6. REVEAL ELEMENTS ---
    setTimeout(() => {
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

        revealElements.forEach(el => revealObserver.observe(el));
    }, 100);

    // --- 7. INACTIVITY MALWARE TIMEOUT ---
    const inactivityLimit = 60 * 1000; 
    let inactivityTimer;
    let countdownInterval;
    let isMalwareActive = false;
    let timeLeft = 60;

    const malwareOverlay = document.getElementById('malware-overlay');
    const countdownDisplay = document.getElementById('malware-countdown');
    const yesBtn = document.getElementById('malware-yes-btn');

    function resetInactivityTimer() {
        if (isMalwareActive) return; 
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(triggerMalware, inactivityLimit);
    }

    function triggerMalware() {
        isMalwareActive = true;
        timeLeft = 60;
        if(countdownDisplay) countdownDisplay.innerText = timeLeft;
        if(malwareOverlay) malwareOverlay.classList.add('active');
        
        countdownInterval = setInterval(() => {
            timeLeft--;
            if(countdownDisplay) countdownDisplay.innerText = timeLeft;
            if (timeLeft <= 0) {
                triggerSessionExpired();
            }
        }, 1000);
    }

    function triggerSessionExpired() {
        clearInterval(countdownInterval);
        if(malwareOverlay) malwareOverlay.classList.remove('active');
        document.body.classList.add('loading');
        const terminalWindow = document.querySelector('.terminal-window');
        gsap.killTweensOf([terminalWindow, overlay]);
        gsap.set(overlay, { display: 'flex', opacity: 1 });
        gsap.set(terminalWindow, { scale: 1, x: "0vw", y: "0vh", rotation: 0, opacity: 1 });

        terminalContent.innerHTML = `
            <span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ connection_status<br>
            <span class="cmd-error">Connection closed by remote host.</span><br>
            <span class="cmd-error">Session expired. Idle state detected.</span><br><br>
            <span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ Please refresh the page to establish a new secure connection.<span class="cmd-input"></span>
        `;
        startMatrixRain();
    }

    if (yesBtn) {
        yesBtn.addEventListener('click', () => {
            isMalwareActive = false;
            clearInterval(countdownInterval);
            if(malwareOverlay) malwareOverlay.classList.remove('active');
            resetInactivityTimer();
        });
    }

    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, resetInactivityTimer);
    });

    resetInactivityTimer();
});