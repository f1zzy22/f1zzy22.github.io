
    // --- TYPING TEST SUPABASE & CHART LOGIC ---
    const _supabaseUrl = 'https://vefnwnxghpcgajiurufx.supabase.co';
    const _supabaseKey = 'sb_publishable_hcvPkj-rK8vtA1hI1TZF4g_pufYZQLk';
    const _db = supabase.createClient(_supabaseUrl, _supabaseKey);
    const promptText = "Stumble. Because you will fall. You will faceplant in front of random people and even those you are trying so hard to impress. You turn into a hot honey chicken tender, burning with shameful, red, and oily tears. It burns. But learn how to sit in that fire. Laugh because you fell. Laugh until it almost feels masochistic. There is simply no time to overthink the pain.";
    
    // Globals for Text Animation Injection
    let myWPM = 100;
    let myDateString = "";
    let baseRaceSpeedMs = 60000 / (myWPM * 5); 

    const starCanvas = document.createElement('canvas');
    starCanvas.width = 40;
    starCanvas.height = 40;
    const sCtx = starCanvas.getContext('2d');
    
    function drawSparkle(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.quadraticCurveTo(cx, cy, cx + size, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + size);
        ctx.quadraticCurveTo(cx, cy, cx - size, cy);
        ctx.closePath();
    }
    
    const grad1 = sCtx.createRadialGradient(20, 20, 0, 20, 20, 20);
    grad1.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
    grad1.addColorStop(1, 'rgba(255, 215, 0, 0)');
    sCtx.fillStyle = grad1;
    sCtx.fillRect(0, 0, 40, 40);
    
    sCtx.fillStyle = '#ffd700';
    drawSparkle(sCtx, 20, 20, 14);
    sCtx.fill();
    
    sCtx.fillStyle = '#ffffff';
    drawSparkle(sCtx, 20, 20, 6);
    sCtx.fill();

    const starCanvasHover = document.createElement('canvas');
    starCanvasHover.width = 70;
    starCanvasHover.height = 70;
    const hCtx = starCanvasHover.getContext('2d');
    
    const grad2 = hCtx.createRadialGradient(35, 35, 0, 35, 35, 35);
    grad2.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
    grad2.addColorStop(1, 'rgba(255, 215, 0, 0)');
    hCtx.fillStyle = grad2;
    hCtx.fillRect(0, 0, 70, 70);
    
    hCtx.fillStyle = '#ffd700';
    drawSparkle(hCtx, 35, 35, 26); 
    hCtx.fill();
    
    hCtx.fillStyle = '#ffffff';
    drawSparkle(hCtx, 35, 35, 10);
    hCtx.fill();

    const display = document.getElementById('text-display'), input = document.getElementById('hidden-input');
    const wpmDisplay = document.getElementById('wpm-display'), accDisplay = document.getElementById('acc-display'), timeDisplay = document.getElementById('time-display');
    const restartBtn = document.getElementById('restart-btn'), typingContainer = document.getElementById('typing-test');
    const usernameInput = document.getElementById('username-input'), syncStatus = document.getElementById('sync-status');
    const raceSwitch = document.getElementById('race-switch'), raceHintText = document.getElementById('race-hint-text');
    
    let characters = [], charIndex = 0, mistakes = 0, timerInterval = null, startTime = null, isTyping = false;
    let keystrokeLog = [], lastKeyTime = 0;
    let raceIndex = 0, raceTimeout = null, ghostDelays = [], performanceChart = null;

    usernameInput.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 0) {
            e.target.classList.remove('error');
            e.target.classList.add('success');
        } else {
            e.target.classList.remove('success');
        }
    });

    raceSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            raceHintText.innerText = "Turn this off if distracting";
        } else {
            raceHintText.innerText = "Turn this on if competitive";
        }
    });

    async function fetchDanielScore() {
      const { data, error } = await _db
        .from('typing_scores')
        .select('wpm, created_at')
        .eq('username', 'f1zzy22')
        .order('wpm', { ascending: false })
        .limit(1);
        
      if (data && data.length > 0) {
        myWPM = data[0].wpm;
        baseRaceSpeedMs = 60000 / (myWPM * 5);
        
        const d = new Date(data[0].created_at);
        if (!isNaN(d.getTime())) {
            myDateString = ` (as of ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})`;
        }
      }
      
      document.getElementById('daniel-toggle-text').innerText = `Race Me (${myWPM} WPM)`;
    }

    function initTest() {
      charIndex = 0; raceIndex = 0; mistakes = 0; isTyping = false; startTime = null;
      keystrokeLog = [];
      clearInterval(timerInterval); clearTimeout(raceTimeout);
      wpmDisplay.innerText = "0 WPM"; accDisplay.innerText = "100%"; timeDisplay.innerText = "0.00s";
      
      syncStatus.innerText = ""; 
      syncStatus.style.color = "var(--accent)";

      input.value = ""; display.innerHTML = "";
      promptText.split('').forEach(char => {
        let span = document.createElement('span'); span.innerText = char; display.appendChild(span);
      });
      characters = display.querySelectorAll('span');
      if(characters.length > 0) characters[0].classList.add('active');
    }

    function startTimer() {
      startTime = Date.now();
      timerInterval = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        timeDisplay.innerText = `${elapsed.toFixed(2)}s`;
        let wpm = Math.round(((charIndex - mistakes) / 5) / (elapsed / 60));
        wpmDisplay.innerText = (wpm < 0 || !wpm ? 0 : wpm) + " WPM";
      }, 50);
      if (raceSwitch.checked) {
        let rawDelays = [], phase = 0, oscillations = 2.5;
        let phaseStep = (Math.PI * 2 * oscillations) / characters.length;
        for (let i = 0; i < characters.length; i++) {
          rawDelays.push(1 + (Math.sin(phase) * 0.3) + ((Math.random() * 0.1) - 0.05));
          phase += phaseStep;
        }
        let scale = (characters.length * baseRaceSpeedMs) / rawDelays.reduce((a,b)=>a+b,0);
        ghostDelays = rawDelays.map(d => d * scale);
        const advanceGhost = () => {
          if (raceIndex < characters.length) {
            if (raceIndex > 0) characters[raceIndex - 1].classList.remove('race-active');
            characters[raceIndex].classList.add('race-active');
            raceTimeout = setTimeout(advanceGhost, ghostDelays[raceIndex++]);
          }
        };
        advanceGhost();
      }
    }

    typingContainer.addEventListener('mousedown', (e) => {
      if (e.target !== usernameInput && e.target !== raceSwitch) {
          setTimeout(() => input.focus({ preventScroll: true }), 10);
      }
    });

    input.addEventListener('input', (e) => {
      if (!e.isTrusted) {
          console.warn("Untrusted input detected. Script execution blocked.");
          return;
      }
      
      const now = Date.now();
      if (charIndex === 0 && keystrokeLog.length === 0) {
          lastKeyTime = now;
      }
      const delta = now - (keystrokeLog.length === 0 ? now : lastKeyTime);
      keystrokeLog.push(delta);
      lastKeyTime = now;

      if (!usernameInput.value.trim()) { 
          usernameInput.classList.remove('success');
          usernameInput.classList.add('error'); 
          return; 
      }
      
      usernameInput.classList.remove('error');
      usernameInput.classList.add('success');

      if (e.inputType === 'insertFromPaste' || (input.value.length - charIndex) > 1) { initTest(); return; }
      if (!isTyping) { startTimer(); isTyping = true; }
      let typedChar = input.value.split('')[charIndex];
      if (typedChar == null) {
        charIndex--;
        if (characters[charIndex].classList.contains('incorrect')) mistakes--;
        characters[charIndex].classList.remove('correct', 'incorrect');
      } else {
        if (characters[charIndex].innerText === typedChar) characters[charIndex].classList.add('correct');
        else { mistakes++; characters[charIndex].classList.add('incorrect'); }
        charIndex++;
      }
      characters.forEach(s => s.classList.remove('active'));
      if (charIndex < characters.length) characters[charIndex].classList.add('active');
      else finishTest();
      let acc = Math.round(((charIndex - mistakes) / charIndex) * 100);
      accDisplay.innerText = `${!acc ? 100 : acc}%`;
    });

    function getPersonalBests(rawData) {
      if (!rawData || rawData.length === 0) return [];
      const pbs = {};
      rawData.forEach(row => {
        if (!pbs[row.username] || row.wpm > pbs[row.username]) pbs[row.username] = row.wpm;
      });
      return Object.entries(pbs).map(([username, wpm]) => ({ username, wpm })).sort((a, b) => a.wpm - b.wpm);
    }

    function processChartData(pbData) {
      const total = pbData.length;
      return pbData.map((d, index) => {
        let percentile = total > 1 ? (index / (total - 1)) * 100 : 100;
        return { x: percentile, y: d.wpm, user: d.username };
      });
    }

    function renderHallOfFame(data) {
        const hofList = document.getElementById('hof-list');
        hofList.innerHTML = ''; 

        const winners = {};
        data.forEach(row => {
            if (row.is_beat_daniel && row.username !== 'f1zzy22') {
                if (!winners[row.username] || row.wpm > winners[row.username].wpm) {
                    winners[row.username] = { wpm: row.wpm, date: row.created_at };
                }
            }
        });

        const sortedWinners = Object.entries(winners).sort((a, b) => b[1].wpm - a[1].wpm);

        if (sortedWinners.length === 0) {
            hofList.innerHTML = '<div class="hof-empty"> The throne remains unchallenged... too fast for y\'all, huh? <br><br> Be the first to beat me if you can ;) </div>';
            return;
        }

        sortedWinners.forEach(([uname, info]) => {
            const card = document.createElement('div');
            card.className = 'hof-card rainbow';
            
            const header = document.createElement('div');
            header.className = 'hof-header';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'hof-name rainbow';
            nameSpan.textContent = uname; 

            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'hof-score';
            scoreSpan.textContent = `${info.wpm} WPM`;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'hof-date';
            
            const d = new Date(info.date);
            if (!isNaN(d.getTime())) {
                dateSpan.textContent = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            }

            header.appendChild(nameSpan);
            header.appendChild(scoreSpan);
            card.appendChild(header);
            card.appendChild(dateSpan);
            hofList.appendChild(card);
        });
    }

    async function finishTest() {
      clearInterval(timerInterval); clearTimeout(raceTimeout); input.blur();
      const wpm = parseInt(wpmDisplay.innerText), acc = parseInt(accDisplay.innerText);
      
      let rawUsername = usernameInput.value.trim();
      const username = rawUsername.replace(/[<>]/g, "").substring(0, 15);
      
      if (!username || wpm > 350 || acc < 30) { 
          syncStatus.innerText = "Integrity check failed."; 
          syncStatus.style.color = "#ff003c";
          return; 
      }
      
      syncStatus.innerText = "Publishing to global performance graph...";
      syncStatus.style.color = "var(--accent)";
      
      const { error } = await _db.rpc('verify_and_submit_score', {
        p_username: username,
        p_wpm: wpm,
        p_accuracy: acc,
        p_keystrokes: keystrokeLog
      });
      
      if (!error) { 
        syncStatus.innerText = "Score live on global graph.";
        if (username === 'f1zzy22') await fetchDanielScore();
        updateChart(username); 
      } else { 
        syncStatus.innerText = "Sync failed."; 
        syncStatus.style.color = "#ff003c";
        console.error("SUPABASE REJECTED IT:", error); 
      }
    }

    window.rainbowHue = 0;
    setInterval(() => {
        window.rainbowHue = (window.rainbowHue + 1) % 360;
        if (performanceChart && performanceChart.tooltip && performanceChart.tooltip.opacity > 0) {
            performanceChart.draw();
        }
    }, 50);

    async function initChart() {
      const { data } = await _db.from('typing_scores').select('wpm, username, is_beat_daniel, created_at');
      const ctx = document.getElementById('performanceChart').getContext('2d');
      const fillGradient = ctx.createLinearGradient(0, 400, 0, 0);
      fillGradient.addColorStop(0, 'rgba(0, 255, 65, 0)');
      fillGradient.addColorStop(1, 'rgba(0, 255, 65, 0.2)');
      const pbData = getPersonalBests(data);
      const chartData = processChartData(pbData);

      renderHallOfFame(data);

      performanceChart = new Chart(ctx, {
        type: 'line',
        data: { 
          datasets: [{
            label: 'Global Rank', 
            data: chartData,
            borderColor: '#00ff41',
            borderWidth: 2,
            backgroundColor: fillGradient,
            fill: true,
            tension: 0.4,
            
            pointStyle: (context) => {
                if (!context.raw) return 'circle';
                if (context.raw.user === 'f1zzy22') {
                    return context.active ? starCanvasHover : starCanvas;
                }
                return 'circle';
            },
            pointRadius: (context) => {
                if (!context.raw) return 4;
                return context.raw.user === 'f1zzy22' ? 20 : 4; 
            },
            pointHoverRadius: (context) => {
                if (!context.raw) return 10;
                return context.raw.user === 'f1zzy22' ? 35 : 10; 
            },
            pointBackgroundColor: (context) => {
                if (!context.raw) return 'rgba(0, 255, 65, 0.4)';
                if (context.raw.user === 'f1zzy22') return '#ffd700';
                if (context.raw.y > myWPM) return '#ffffff';
                return 'rgba(0, 255, 65, 0.4)';
            },
            pointBorderColor: (context) => {
                if (!context.raw) return 'rgba(0, 255, 65, 0.4)';
                if (context.raw.user === 'f1zzy22') return '#ffd700';
                if (context.raw.y > myWPM) return '#ffffff';
                return 'rgba(0, 255, 65, 0.4)';
            },
            pointHoverBorderWidth: 3, 
          }]
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          layout: { padding: { top: 80, left: 50, right: 40, bottom: 20 } },
          scales: {
            x: { 
              type: 'linear', min: 0, max: 100,
              title: { display: true, text: 'Percentile (%)', color: '#888', font: { family: 'JetBrains Mono', size: 12 } },
              grid: { display: false },
              ticks: { color: '#555', font: { family: 'JetBrains Mono' } }
            },
            y: { 
              beginAtZero: true, 
              min: 0, 
              grace: '40%',
              title: { display: true, text: 'Speed (WPM)', color: '#888', font: { family: 'JetBrains Mono', size: 12 } },
              grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
              ticks: { color: '#555', font: { family: 'JetBrains Mono' } }
            }
          },
          hover: {
            mode: 'nearest',
            intersect: true,
            onHover: (event, chartElement) => {
              event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            }
          },
          plugins: { 
            legend: { display: false },
            tooltip: {
                enabled: true,
                position: 'nearest',
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                yAlign: 'bottom', 
                caretPadding: 15,
                titleFont: { family: 'JetBrains Mono', size: 14, weight: 'bold' },
                titleColor: (context) => {
                    const user = context.tooltip.dataPoints?.[0]?.raw?.user;
                    const y = context.tooltip.dataPoints?.[0]?.raw?.y;
                    if (user === 'f1zzy22') return '#ffd700';
                    if (y > myWPM) return `hsl(${window.rainbowHue}, 60%, 75%)`;
                    return '#00ff41'; 
                },
                bodyFont: { family: 'JetBrains Mono', size: 13 },
                bodyColor: '#e0e0e0',
                callbacks: { 
                title: (c) => c[0].raw.user, 
                label: (c) => {
                    const percentile = c.raw.x;
                    let topPct = 100 - percentile;
                    if (topPct <= 0.01) topPct = 0.01;
                    if (topPct >= 99.99) topPct = 99.99;
                    const displayPct = parseFloat(topPct.toFixed(2));
                    return `${c.raw.y} WPM (top ${displayPct}%)`;
                }
              }
            },
            annotation: {
              annotations: {
                danielLine: {
                  type: 'line', 
                  yMin: myWPM, 
                  yMax: myWPM, 
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                  borderWidth: 1, 
                  label: {
                    display: true,
                    content: `DANIEL [f1zzy22]: ${myWPM} WPM`,
                    position: 'start',
                    xAdjust: 10,
                    yAdjust: -12,
                    backgroundColor: 'transparent',
                    color: 'rgba(255, 215, 0, 0.9)',
                    font: { size: 12, family: 'JetBrains Mono', weight: '500' }
                  }
                },
                userLine: {
                  type: 'line', 
                  display: false, 
                  yMin: 0, 
                  yMax: 0, 
                  borderColor: 'rgba(0, 255, 65, 0.5)', 
                  borderWidth: 1, 
                  label: {
                    display: false,
                    content: '',
                    position: 'start',
                    xAdjust: 10,
                    yAdjust: -12,
                    backgroundColor: 'transparent',
                    color: 'rgba(0, 255, 65, 0.9)',
                    font: { size: 12, family: 'JetBrains Mono', weight: '500' }
                  }
                }
              }
            }
          }
        }
      });
    }

    async function updateChart(newUsername) {
      const { data } = await _db.from('typing_scores').select('wpm, username, is_beat_daniel, created_at');
      const pbData = getPersonalBests(data);
      const chartData = processChartData(pbData);
      
      renderHallOfFame(data);

      performanceChart.data.datasets[0].data = chartData;
      
      const danielLabel = performanceChart.options.plugins.annotation.annotations.danielLine.label;
      performanceChart.options.plugins.annotation.annotations.danielLine.yMin = myWPM;
      performanceChart.options.plugins.annotation.annotations.danielLine.yMax = myWPM;
      danielLabel.content = `f1zzy22: ${myWPM} WPM`;

      if (newUsername && newUsername !== 'f1zzy22') {
        const userPoint = chartData.find(d => d.user === newUsername);
        if (userPoint) {
            const userLine = performanceChart.options.plugins.annotation.annotations.userLine;
            userLine.display = true;
            userLine.yMin = userPoint.y;
            userLine.yMax = userPoint.y;
            userLine.borderColor = '#ffffff'; 
            userLine.label.display = true;
            userLine.label.color = '#ffffff'; 
            userLine.label.content = `You [${newUsername}]: ${userPoint.y} WPM`;

            if (Math.abs(userPoint.y - myWPM) <= 15) {
                if (userPoint.y >= myWPM) {
                    userLine.label.yAdjust = -12;
                    danielLabel.yAdjust = 16;
                } else {
                    danielLabel.yAdjust = -12;
                    userLine.label.yAdjust = 16;
                }
            } else {
                danielLabel.yAdjust = -12;
                userLine.label.yAdjust = -12;
            }
        }
      } else {
          danielLabel.yAdjust = -12;
          performanceChart.options.plugins.annotation.annotations.userLine.display = false;
      }

      performanceChart.update();
    }

    // --- NEW DESCRIPTION TYPO EFFECT ---
    async function typeDescriptionTypoEffect() {
        const container = document.getElementById('animated-desc-container');
        if (!container) return;

        container.innerHTML = ""; // Clear existing

        const speed = () => new Promise(r => setTimeout(r, Math.random() * 30 + 15));
        const fastSpeed = () => new Promise(r => setTimeout(r, 20));

        // Create spans for styling
        const span1 = document.createElement('span');
        
        const wpmSpan = document.createElement('strong');
        wpmSpan.style.color = '#ffd700';
        
        const dateSpan = document.createElement('span');
        dateSpan.style.opacity = '0.7';
        dateSpan.style.fontSize = '0.9em';
        
        const span2 = document.createElement('span');
        const span3 = document.createElement('span');

        container.appendChild(span1);
        container.appendChild(wpmSpan);
        container.appendChild(dateSpan);
        container.appendChild(span2);

        // 1. Type First Part
        const str1 = "My best recorded pace so far is ";
        for(let char of str1) { span1.textContent += char; await speed(); }

        // 2. Type WPM Data
        const strWpm = `${myWPM} WPM`;
        for(let char of strWpm) { wpmSpan.textContent += char; await speed(); }

        // 3. Type Date Data
        if (myDateString) {
            for(let char of myDateString) { dateSpan.textContent += char; await speed(); }
        }

        // 4. Type the Mistake
        const str2_typo = ". Bet my scjore to froever earn";
        for(let char of str2_typo) { span2.textContent += char; await speed(); }

        // Pause to "realize" mistake
        await new Promise(r => setTimeout(r, 400)); 

        // 5. Backspace the Mistake
        for(let i=0; i<29; i++) { // Deletes "froever e"
            span2.textContent = span2.textContent.slice(0, -1);
            await fastSpeed();
        }

        await new Promise(r => setTimeout(r, 200));

        // 6. Finish Correctly
        const str2_correct = "Beat my score to forever earn a spot on my digital Hall of Fame.";
        for(let char of str2_correct) { span2.textContent += char; await speed(); }

        // Add line breaks and final sentence
        container.appendChild(document.createElement('br'));
        container.appendChild(document.createElement('br'));
        container.appendChild(span3);

        const str3 = "Note: High scores are published to the performance graph below.";
        for(let char of str3) { span3.textContent += char; await speed(); }
    }

    restartBtn.addEventListener('click', initTest);
    
    // Updated window.onload to trigger the new description typing function
    window.onload = async () => { 
      await fetchDanielScore();
      initTest(); 
      initChart(); 
      typeDescriptionTypoEffect();
    };
  

    // --- MATRIX RAIN & MALWARE FUNCTIONS ---
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
                    ctx.fillStyle = 'rgba(255, 0, 193, 0.6)';
                } else if (colorChance > 0.93) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                } else if (colorChance > 0.78) {
                    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
                } else {
                    ctx.fillStyle = 'rgba(0, 255, 65, 0.3)';
                }
                
                const x = ind * 20;
                ctx.fillText(text, x, y);
                
                if (y > 100 + Math.random() * 10000) yPos[ind] = 0;
                else yPos[ind] = y + 20;
            });
        }
        matrixInterval = setInterval(drawMatrix, 50); 
    }

    const inactivityLimit = 60 * 1000;
    let inactivityTimer;
    let countdownInterval;
    let isMalwareActive = false;
    let timeLeft = 60;

    const malwareOverlay = document.getElementById('malware-overlay');
    const countdownDisplay = document.getElementById('malware-countdown');
    const yesBtn = document.getElementById('malware-yes-btn');
    const terminalContent = document.getElementById('terminal-content');
    const terminalWindow = document.querySelector('.terminal-window');

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
        
        document.querySelector('.nav').style.display = 'none';
        document.querySelector('.section').style.display = 'none';
        
        document.body.classList.add('loading');
        
        if (typeof gsap !== 'undefined' && terminalWindow && overlay) {
            gsap.killTweensOf([terminalWindow, overlay]);
            gsap.set(overlay, { display: 'flex', opacity: 1 });
            gsap.set(terminalWindow, { scale: 1, x: "0vw", y: "0vh", rotation: 0, opacity: 1 });
        } else if (overlay) {
            overlay.style.display = 'flex';
        }

        if (terminalContent) {
            terminalContent.innerHTML = `
                <span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ connection_status<br>
                <span class="cmd-error">Connection closed by remote host.</span><br>
                <span class="cmd-error">Session expired. Idle state detected.</span><br><br>
                <span class="cmd-user">guest@daniel-han-portfolio</span>:<span class="cmd-path">~</span>$ Please refresh the page to establish a new secure connection.<span class="cmd-input"></span>
            `;
        }

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

    // --- HACKER TEXT HOVER EFFECT ---
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
  
