window.startHeroAnimation = () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- NEW: PREVENT DUPLICATE ANIMATIONS ON RESET ---
    if (window.heroAnimationFrame) {
        cancelAnimationFrame(window.heroAnimationFrame);
    }

    const name = "DANIEL HAN";
    const initialCountdown = (Math.random() * 1.5 + 3.5).toFixed(2);
    let countdown = parseFloat(initialCountdown);
    let exploded = false;
    let particles = [];
    let splatters = []; 
    let animationFrame;

    let timeSinceStop = 0;
    let isCrawling = false;
    let crawlStartTime = 0; 
    let isWaving = false;
    
    // --- NEW STATES FOR THE BUTTON TRIGGER ---
    window.isCountingDown = false; 
    window.triggerDetonation = () => {
        window.isCountingDown = true;
    };

    let glitchState = 0; 
    let bodyOffsetX = 0;
    let bodyOffsetY = 0;
    let walkCycle = 0;

    const explosionForce = Math.min(window.innerWidth, window.innerHeight) * 0.05; 
    const friction = 0.94; 

    const bloodDark = "#4a0000"; 
    const bloodBright = "#8b0000"; 

    class BloodSplatter {
        constructor(x, y, vx, vy, isTrail = false) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.radius = isTrail ? Math.random() * 3 + 1 : Math.random() * 8 + 2;
            this.stopped = false;
            this.friction = 0.85;
            this.gravity = 0.5;
            this.alpha = 1;
            this.color = Math.random() > 0.8 ? bloodBright : bloodDark;
        }

        update(startFading) {
            if (!this.stopped) {
                this.vy += this.gravity; 
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= this.friction;
                this.vy *= this.friction;

                if (this.y > canvas.height) {
                    this.y = canvas.height;
                    this.stopped = true;
                }

                if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) this.stopped = true;
            } else if (startFading) {
                this.alpha -= 0.005; 
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            
            if (!this.stopped) {
                const angle = Math.atan2(this.vy, this.vx);
                const speed = Math.hypot(this.vx, this.vy);
                const stretch = Math.max(1, speed * 0.4);

                ctx.translate(this.x, this.y);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.ellipse(0, 0, this.radius * stretch, this.radius, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class LetterShard {
        constructor(char, x, y) {
            this.char = char;
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.rotation = 0;
            this.spin = 0; 
            this.stopped = false;
            
            this.startX = 0;
            this.startY = 0;
            this.startRot = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.targetRot = 0;
            this.id = '';
            this.inPosition = false;
        }

        explode() {
            const randomAngle = Math.random() * Math.PI * 2; 
            const speed = (Math.random() * 0.6 + 0.4) * explosionForce; 
            
            this.vx = Math.cos(randomAngle) * speed;
            this.vy = Math.sin(randomAngle) * speed;
            this.spin = (Math.random() - 0.5) * 0.6;
        }

        update() {
            if (!this.stopped && !isCrawling && !isWaving) {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.spin; 
                
                this.vx *= friction;
                this.vy *= friction;
                this.spin *= friction; 

                const margin = 50; 
                if (this.x < margin) { this.x = margin; this.vx *= -0.6; this.spin *= -0.5; } 
                else if (this.x > canvas.width - margin) { this.x = canvas.width - margin; this.vx *= -0.6; this.spin *= -0.5; }

                if (this.y < margin) { this.y = margin; this.vy *= -0.6; this.spin *= -0.5; } 
                else if (this.y > canvas.height - margin) { this.y = canvas.height - margin; this.vy *= -0.6; this.spin *= -0.5; }

                if (Math.random() > 0.4 && (Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1)) {
                    splatters.push(new BloodSplatter(this.x, this.y, this.vx * 0.1, this.vy * 0.1, true));
                }

                if (Math.abs(this.vx) < 0.05 && Math.abs(this.vy) < 0.05 && Math.abs(this.spin) < 0.01) {
                    this.stopped = true;
                }

            } else if (isCrawling && !this.inPosition) {
                const elapsed = Date.now() - crawlStartTime;
                const crawlDuration = 4500; 
                const progress = Math.min(elapsed / crawlDuration, 1);

                if (progress === 1) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    this.rotation = this.targetRot;
                    this.inPosition = true;
                } else if (Math.random() > 0.7) { 
                    this.x = this.startX + (this.targetX - this.startX) * progress + (Math.random() - 0.5) * 4;
                    this.y = this.startY + (this.targetY - this.startY) * progress + (Math.random() - 0.5) * 4;

                    let rotDiff = this.targetRot - this.startRot;
                    rotDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff));
                    this.rotation = this.startRot + (rotDiff * progress);

                    if (Math.random() > 0.6) splatters.push(new BloodSplatter(this.x, this.y, 0, 0, true));
                }
            } else if (isWaving) {
                
                let cTargetX = this.targetX;
                let cTargetY = this.targetY;
                let cTargetRot = this.targetRot;

                if (this.id !== 'head' || glitchState >= 5) {
                    cTargetX += bodyOffsetX;
                    cTargetY += bodyOffsetY;
                }

                if (glitchState === 1) {
                    this.x = cTargetX + (Math.random() - 0.5) * 20;
                    this.y = cTargetY + (Math.random() - 0.5) * 20;
                    this.rotation = cTargetRot + (Math.random() - 0.5) * 0.8;
                
                } else if (glitchState >= 2) {
                    
                    if (this.id === 'head' && glitchState <= 4) {
                        this.vy += 0.6; 
                        this.x += this.vx;
                        this.y += this.vy;
                        this.rotation += this.spin;

                        if (this.x < 50) { this.x = 50; this.vx *= -0.7; }
                        else if (this.x > canvas.width - 50) { this.x = canvas.width - 50; this.vx *= -0.7; }

                        const floorY = canvas.height / 2 + 150; 
                        if (this.y > floorY) {
                            this.y = floorY;
                            this.vy *= -0.5; 
                            this.vx *= 0.8;  
                            this.spin *= 0.8;
                        }
                    }

                    const isMoving = (glitchState === 3 || glitchState === 5) && 
                                     (Math.abs(this.targetX + bodyOffsetX - this.x) > 10 || Math.abs(bodyOffsetX) > 10);

                    if (isMoving && this.id !== 'head') {
                        if (this.id === 'l_leg') {
                            cTargetX += Math.sin(walkCycle) * (35 + Math.random() * 15); 
                            cTargetY -= Math.max(0, Math.cos(walkCycle)) * (20 + Math.random() * 10); 
                            cTargetRot += Math.sin(walkCycle) * 0.2;
                        }
                        if (this.id === 'r_leg') {
                            cTargetX += Math.sin(walkCycle + Math.PI) * 15; 
                            cTargetY -= Math.max(0, Math.cos(walkCycle + Math.PI)) * 5; 
                            cTargetRot += Math.sin(walkCycle + Math.PI) * 0.1;
                        }
                        if (this.id.includes('torso') || this.id.includes('arm')) {
                            cTargetY += Math.abs(Math.sin(walkCycle)) * 18 + (Math.random() * 5);
                            cTargetX += (Math.random() - 0.5) * 8;
                            cTargetRot += (Math.random() - 0.5) * 0.15;
                        }
                        if (this.id === 'r_arm_1' || this.id === 'r_arm_2') {
                            cTargetX += Math.sin(walkCycle + Math.PI) * 20;
                            cTargetRot += Math.sin(walkCycle + Math.PI) * 0.3;
                        }
                    }

                    if (glitchState === 4 && (this.id === 'l_arm_1' || this.id === 'l_arm_2')) {
                        const headParticle = particles.find(p => p.id === 'head');
                        if (this.id === 'l_arm_2') {
                            cTargetX = headParticle.x;
                            cTargetY = headParticle.y - 15;
                            cTargetRot = 0;
                        } else {
                            cTargetX = (this.targetX + bodyOffsetX + headParticle.x) / 2 - 10;
                            cTargetY = (this.targetY + bodyOffsetY + headParticle.y) / 2;
                            cTargetRot = -1.0;
                        }
                    }

                    if (this.id === 'head' && glitchState === 5) {
                        const lHand = particles.find(p => p.id === 'l_arm_2');
                        this.x += (lHand.x - this.x) * 0.4;
                        this.y += (lHand.y - 15 - this.y) * 0.4; 
                        this.rotation += (0 - this.rotation) * 0.1; 
                    }

                    if (glitchState === 5 && (this.id === 'l_arm_1' || this.id === 'l_arm_2')) {
                        const neckX = canvas.width / 2 + bodyOffsetX;
                        const neckY = canvas.height / 2 - 110 + bodyOffsetY;
                        const bobbingOffset = isMoving ? Math.abs(Math.sin(walkCycle)) * 18 : 0;

                        if (this.id === 'l_arm_2') {
                            cTargetX = neckX - 35;
                            cTargetY = neckY - 10 + bobbingOffset;
                            cTargetRot = 0.5;
                        } else {
                            cTargetX = (this.targetX + bodyOffsetX + neckX) / 2 - 30;
                            cTargetY = (this.targetY + bodyOffsetY + neckY) / 2 + bobbingOffset;
                            cTargetRot = 0.2;
                        }
                    }

                    let trackingSpeed = 0.15;
                    if (isMoving) {
                        if (Math.random() > 0.8) trackingSpeed = 0.02; 
                        else if (Math.random() > 0.9) trackingSpeed = 0.4; 
                    }

                    if (this.id !== 'head' || glitchState >= 6) {
                        this.x += (cTargetX - this.x) * trackingSpeed;
                        this.y += (cTargetY - this.y) * trackingSpeed;
                        this.rotation += (cTargetRot - this.rotation) * trackingSpeed;
                    }

                } else {
                    if (this.id === 'r_arm_2') {
                        const waveAngle = -0.85 + Math.sin(Date.now() * 0.003) * 0.6; 
                        const pivotX = canvas.width / 2 + 45; 
                        const pivotY = canvas.height / 2 - 30; 
                        const radius = 53; 
                        cTargetX = pivotX + Math.cos(waveAngle) * radius;
                        cTargetY = pivotY + Math.sin(waveAngle) * radius;
                        cTargetRot = waveAngle + Math.PI/2; 
                    }
                    this.x += (cTargetX - this.x) * 0.15;
                    this.y += (cTargetY - this.y) * 0.15;
                    this.rotation += (cTargetRot - this.rotation) * 0.15;
                }
            }
        }

        draw() {
            ctx.save();
            let renderColor = "#ff003c";
            let renderShadow = bloodDark;
            let renderX = this.x;
            let renderY = this.y;
            let glowFlicker = 10;

            if (isWaving) {
                if (glitchState === 1) {
                    renderColor = "#ff003c"; 
                    renderShadow = bloodDark;
                    renderX += (Math.random() - 0.5) * 10; 
                    renderY += (Math.random() - 0.5) * 10;
                    glowFlicker = 20 + Math.random() * 15;
                } else if (glitchState >= 2) {
                    renderColor = "#ff003c"; 
                    renderShadow = bloodDark;
                    glowFlicker = 5; 
                } else {
                    renderColor = "#00ff41"; 
                    renderShadow = "#00ff41";
                    glowFlicker = 10 + Math.random() * 2;
                }
            }

            ctx.translate(renderX, renderY);
            ctx.rotate(this.rotation);
            ctx.fillStyle = renderColor;
            ctx.shadowColor = renderShadow;
            ctx.shadowBlur = glowFlicker; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, 0, 0);
            ctx.restore(); 
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createShrapnel() {
        ctx.font = 'bold 80px "JetBrains Mono"';
        const totalWidth = ctx.measureText(name).width;
        const startX = (canvas.width - totalWidth) / 2;
        const startY = canvas.height / 2;

        for (let i = 0; i < 70; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 30 + 10;
            splatters.push(new BloodSplatter(canvas.width / 2, canvas.height / 2, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }

        for (let i = 0; i < name.length; i++) {
            if (name[i] === ' ') continue; 
            const prevWidth = ctx.measureText(name.substring(0, i)).width;
            const charWidth = ctx.measureText(name[i]).width;
            const charCenterX = startX + prevWidth + (charWidth / 2);
            const shard = new LetterShard(name[i], charCenterX, startY);
            shard.explode();
            particles.push(shard);
        }
    }

    function assignStickFigureTargets() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + 30;

        const targets = [
            { x: cx, y: cy - 110, rot: (Math.random()-0.5)*0.3, id: 'head' },     
            { x: cx - 85, y: cy - 5, rot: 0.8, id: 'l_arm_2' },                   
            { x: cx - 45, y: cy - 40, rot: 0.8, id: 'l_arm_1' },                  
            { x: cx, y: cy - 40, rot: 0, id: 'torso_1' },                         
            { x: cx + 45, y: cy - 60, rot: -0.4, id: 'r_arm_1' },                 
            { x: cx + 80, y: cy - 100, rot: -0.85, id: 'r_arm_2' },               
            { x: cx - 35, y: cy + 80, rot: 0, id: 'l_leg' },                      
            { x: cx, y: cy + 10, rot: 0, id: 'torso_2' },                         
            { x: cx + 35, y: cy + 80, rot: 0, id: 'r_leg' }                       
        ];

        particles.forEach((p, index) => {
            p.targetX = targets[index].x;
            p.targetY = targets[index].y;
            p.targetRot = targets[index].rot;
            p.id = targets[index].id;
            p.startX = p.x;
            p.startY = p.y;
            p.startRot = p.rotation;
        });
    }

    function drawIdleName() {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.font = 'bold 80px "JetBrains Mono"';
        ctx.fillStyle = "#00ff41"; 
        ctx.shadowColor = "#00ff41";
        // Very slow, calm breathing effect before the button is clicked
        ctx.shadowBlur = 10 + Math.sin(Date.now() / 400) * 5; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 0, 0);
        ctx.restore();
    }

    function drawPulsingName() {
        const progress = 1 - (countdown / initialCountdown); 
        const intensity = Math.pow(progress, 4); 
        const freq = 5 + (intensity * 60); 
        const amp = 0.005 + (intensity * 0.15); 
        const scale = 1 + Math.sin(Date.now() / 1000 * freq) * amp;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.font = 'bold 80px "JetBrains Mono"';
        ctx.fillStyle = "#00ff41"; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 0, 0);

        if (countdown < 0.6 && Math.random() > 0.4) {
            ctx.fillStyle = "rgba(255, 0, 60, 0.7)";
            ctx.fillText(name, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
            ctx.fillStyle = "rgba(0, 212, 255, 0.7)";
            ctx.fillText(name, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
        }
        ctx.restore();
    }

    function animate() {
        // --- MASTER TIMELINE UPDATED TO 17 SECONDS ---
        const cycleTime = Date.now() % 17000;
        let newPhase = 0;
        
        // 1-SECOND GREEN PAUSE INSERTED IN THE MIDDLE OF THE SHAKE
        if (cycleTime > 5000 && cycleTime < 5200) newPhase = 1;       // 1st half of violent red shake
        else if (cycleTime >= 5200 && cycleTime < 5900) newPhase = 0; // 1-second calm green pause
        else if (cycleTime >= 5900 && cycleTime < 6400) newPhase = 1; // 2nd half of violent red shake
        
        // The rest of the Frankenstein walk cycle (Shifted +1000ms)
        else if (cycleTime >= 6400 && cycleTime < 7800) newPhase = 2; 
        else if (cycleTime >= 7800 && cycleTime < 11000) newPhase = 3; 
        else if (cycleTime >= 11000 && cycleTime < 12200) newPhase = 4; 
        else if (cycleTime >= 12200 && cycleTime < 15500) newPhase = 5; 
        else if (cycleTime >= 15500 && cycleTime < 17000) newPhase = 6; 

        if (newPhase === 3) {
            const headParticle = particles.find(p => p.id === 'head');
            if (headParticle) {
                let targetOffsetX = headParticle.x - (canvas.width / 2) + 35; 
                let dist = targetOffsetX - bodyOffsetX;
                if (Math.abs(dist) > 30) {
                    if (Math.random() > 0.92) { 
                        bodyOffsetX += dist * (Math.random() * 0.1 + 0.02); 
                        walkCycle += Math.random() * 0.6 + 0.2; 
                    }
                }
            }
        } else if (newPhase === 4) {
            bodyOffsetY += (50 - bodyOffsetY) * 0.04; 
        } else if (newPhase === 5) {
            let dist = 0 - bodyOffsetX;
            if (Math.abs(dist) > 30) {
                if (Math.random() > 0.92) {
                    bodyOffsetX += dist * (Math.random() * 0.1 + 0.02);
                    walkCycle += Math.random() * 0.6 + 0.2;
                }
            } else {
                bodyOffsetX = 0;
            }
            bodyOffsetY += (0 - bodyOffsetY) * 0.04; 
        } else if (newPhase === 6) {
            bodyOffsetX += (0 - bodyOffsetX) * 0.05;
            bodyOffsetY += (0 - bodyOffsetY) * 0.05;
            walkCycle = 0;
        } else {
            bodyOffsetX = 0;
            bodyOffsetY = 0;
            walkCycle = 0;
        }

        if (newPhase === 2 && glitchState !== 2 && isWaving) {
            const head = particles.find(p => p.id === 'head');
            if (head) {
                head.vy = -12 - Math.random() * 4; 
                head.vx = -Math.abs(Math.random() * 5 + 4); 
                head.spin = (Math.random() - 0.5) * 0.8;
                
                for(let i = 0; i < 25; i++) {
                    splatters.push(new BloodSplatter(head.targetX, head.targetY, (Math.random()-0.5)*15, Math.random()*-15));
                }
            }
        }
        glitchState = newPhase;

        const allLettersStopped = exploded && particles.length > 0 && particles.every(p => p.stopped);
        
        // --- TWITCHING HEAD WAKE-UP SEQUENCE ---
        if (allLettersStopped && !isCrawling && !isWaving) {
            if (timeSinceStop === 0) timeSinceStop = Date.now();
            
            let elapsedIdle = Date.now() - timeSinceStop;
            
            // Between 1.5s and 1.7s, the "D" (head) violently twitches
            if (elapsedIdle > 1500 && elapsedIdle < 1700) {
                
                // INCREASED FREQUENCY: Now twitches on 90% of frames instead of 50%
                if (Math.random() > 0.1) {
                    // INCREASED MAGNITUDE: Jumps up to 14 pixels instead of 6
                    particles[0].x += (Math.random() - 0.5) * 14; 
                    particles[0].y += (Math.random() - 0.5) * 14; 
                    
                    // Thrashes its rotation twice as hard
                    particles[0].rotation += (Math.random() - 0.5) * 0.8; 
                    
                    // Bleeds more often while thrashing
                    if (Math.random() > 0.6) { 
                        splatters.push(new BloodSplatter(particles[0].x, particles[0].y, (Math.random()-0.5)*6, (Math.random()-0.5)*6, true));
                    }
                }
            }

            // After 2.7 seconds, start crawling
            if (elapsedIdle > 2700) {
                isCrawling = true;
                crawlStartTime = Date.now(); 
                assignStickFigureTargets();
            }
        }

        if (isCrawling && particles.every(p => p.inPosition)) {
            isCrawling = false;
            isWaving = true;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- NEW RENDER LOGIC FOR THE IDLE/COUNTDOWN STATE ---
        if (!isCountingDown) {
            // STATE 1: Waiting for the user to click the button
            drawIdleName();
        } else if (!exploded) {
            // STATE 2: Button clicked! Start the countdown
            countdown = (parseFloat(countdown) - 0.016).toFixed(2);
            if (countdown <= 0) {
                countdown = 0;
                exploded = true;
                createShrapnel();
                document.body.style.animation = "glitch 0.3s 2"; 
            }
            drawPulsingName();
        } else {
            // STATE 3: Exploded, run the Frankenstein logic
            splatters = splatters.filter(s => s.alpha > 0);
            splatters.forEach(s => {
                s.update(allLettersStopped);
                s.draw();
            });
            ctx.font = 'bold 80px "JetBrains Mono"'; 
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }
        window.heroAnimationFrame = requestAnimationFrame(animate);    
    }

    resize();
    animate();
    window.addEventListener('resize', resize);
};