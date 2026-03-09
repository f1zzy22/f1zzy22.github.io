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

    // --- 4. TERMINAL BOOT SEQUENCE ---
    const terminalContent = document.getElementById('terminal-content');
    const overlay = document.getElementById('terminal-overlay');

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
        
        if (!terminalWindow || !terminalContent) {
            console.error("Terminal elements not found!");
            return;
        }

        // Standard pop-in animation
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

        // Wait 800ms after typing finishes, then trigger minimize animation
        setTimeout(minimizeTerminal, 800);
    }

    function minimizeTerminal() {
        const tl = gsap.timeline({
            onComplete: () => {
                if (overlay) overlay.style.display = 'none';
                document.body.classList.remove('loading');
            }
        });

        const yellowBtn = document.querySelector('.terminal-btn.yellow');
        const terminalWindow = document.querySelector('.terminal-window');

        // Phase 1: Click the yellow minimize button
        if (yellowBtn) {
            tl.to(yellowBtn, { scale: 0.7, filter: "brightness(1.5)", duration: 0.1 })
              .to(yellowBtn, { scale: 1, filter: "brightness(1)", duration: 0.1 });
        }

        // Phase 2: Shrink and drop terminal
        if (terminalWindow) {
            tl.to(terminalWindow, {
                scale: 0.05,
                x: "40vw",
                y: "55vh",
                rotation: 10,
                opacity: 0,
                duration: 1.22,
                ease: "power2.in"
            }, "+=0.2");
        }

        // Phase 3: Fade out the overlay seamlessly
        if (overlay) {
            tl.to(overlay, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                    overlay.style.display = 'none';
                }
            }, "-=0.5"); 
        }
    }

    // Run terminal on fresh load, skip if there's a hash (like #about)
    if (!window.location.hash) {
        runTerminal();
    } else {
        document.body.classList.remove('loading');
        if (overlay) overlay.style.display = 'none';
        
        // Allow layout to render, then jump to the correct hash
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
    }, 100); // The 100ms delay ensures the browser paints the elements before tracking them

});