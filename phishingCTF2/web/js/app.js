// ============================================
// PHISHING ARSENAL CTF - Main Application
// ============================================

// State Management
const state = {
    flagParts: ['', ''],
    challengesCompleted: [false, false],
    downloadClicks: 0,
    wrongAttempts: 0,
    startTime: Date.now()
};

// Correct flag parts (matching the actual flag)
const CORRECT_FLAGS = {
    part1: 'SECOPS{Th2Ré_Is_n0_',
    part2: 'R3aL_H3r0_With0ut_Zer0}',
    full: 'SECOPS{Th2Ré_Is_n0_R3aL_H3r0_With0ut_Zer0}'
};

// ============================================
// Timer
// ============================================
let timerSeconds = 0;
const timerInterval = setInterval(() => {
    timerSeconds++;
    const mins = Math. floor(timerSeconds / 60). toString().padStart(2, '0');
    const secs = (timerSeconds % 60). toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${mins}:${secs}`;
}, 1000);

// ============================================
// Challenge 1: Steganography
// ============================================
function initCanvas() {
    const canvas = document. getElementById('stego-canvas');
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 600, 300);
    gradient.addColorStop(0, '#1c2128');
    gradient.addColorStop(1, '#22272e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 300);
    
    ctx.fillStyle = '#539bf5';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('SecureBank', 150, 100);
    
    ctx.fillStyle = '#768390';
    ctx.font = '20px Arial';
    ctx.fillText('Trusted Financial Services', 180, 140);
    
    ctx.strokeStyle = '#373e47';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(80, 80, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(520, 80, 40, 0, Math.PI * 2);
    ctx.stroke();
    
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 600;
        const y = Math.random() * 300;
        ctx.fillStyle = `rgba(83, 155, 245, ${Math.random() * 0.1})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // STEGANOGRAPHY: Hide flag in bottom pixels (y=295)
    const flag = 'SECOPS{Th2Ré_Is_n0_';
    
    let pixelX = 50;
    for (let i = 0; i < flag.length; i++) {
        const charCode = flag.charCodeAt(i);
        const r = charCode;
        const g = (i * 10) + 100;
        const b = charCode ^ i;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx. fillRect(pixelX, 295, 5, 5);
        pixelX += 6;
    }
    
    ctx.fillStyle = '#2d3339';
    ctx.font = '9px monospace';
    ctx.fillText('© 2025 SecureBank Inc. ', 230, 292);
}

function downloadImage() {
    state.downloadClicks++;
    
    const canvas = document. getElementById('stego-canvas');
    const link = document.createElement('a');
    link.download = 'securebank_logo. png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    const feedback = document.getElementById('feedback-1');
    const consoleDiv = document. getElementById('pixel-console');
    
    if (state.downloadClicks === 1) {
        feedback.className = 'challenge-feedback warning';
        feedback.innerHTML = '💾 <strong>Asset Extracted</strong><br>Intelligence suggests embedded data.  Standard forensic protocols apply.';
        
        consoleDiv.innerHTML = `
<span style="color: #539bf5;">[INFO]</span> Asset: securebank_logo.png
<span style="color: #539bf5;">[INFO]</span> Dimensions: 600x300px, RGB 24-bit
<span style="color: #c69026;">[SCAN]</span> Visual layer: Clean
<span style="color: #c69026;">[SCAN]</span> Metadata: Sanitized
        `;
    } else if (state.downloadClicks === 2) {
        feedback.className = 'challenge-feedback warning';
        feedback.innerHTML = '🔍 <strong>Surface Analysis Complete</strong><br>No obvious indicators.  Microscopic examination required.';
        
        consoleDiv.innerHTML += `\n<span style="color: #539bf5;">[DEEP SCAN]</span> Initiating pixel-level analysis`;
        consoleDiv.innerHTML += `\n<span style="color: #c69026;">[METHOD]</span> LSB extraction, RGB decomposition recommended`;
    } else if (state.downloadClicks >= 3) {
        feedback.className = 'challenge-feedback warning';
        feedback.innerHTML = '💡 <strong>Field Intel</strong><br>Operatives report: "Foundation holds the key.  Where earth meets structure."';
        
        consoleDiv.innerHTML += `\n<span style="color: #c69026;">[SIGNAL]</span> Anomaly detected in substrate region`;
        consoleDiv.innerHTML += `\n<span style="color: #c69026;">[WAVELENGTH]</span> Red spectrum irregularities present`;
    }
}

function submitFlagPart1() {
    const input = document.getElementById('input-part-1').value. trim();
    const result = document.getElementById('result-1');
    
    if (input === CORRECT_FLAGS.part1) {
        result.className = 'submission-result success';
        result.innerHTML = '✅ <strong>Fragment 1 Authenticated</strong><br>Steganographic layer penetrated! ';
        
        state.flagParts[0] = input;
        state.challengesCompleted[0] = true;
        updateProgress();
        
        setTimeout(() => {
            document.getElementById('challenge-2').style.display = 'block';
            document.getElementById('challenge-2').scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    } else {
        result.className = 'submission-result error';
        result. innerHTML = '❌ <strong>Authentication Failed</strong><br>Extraction incomplete. RGB methodology required. ';
    }
}

// ============================================
// Challenge 2: Multi-Layer Decryption
// ============================================
function submitFlagPart2() {
    const input = document.getElementById('input-part-2').value. trim();
    const result = document.getElementById('result-2');
    const feedback = document.getElementById('feedback-2');
    
    if (input === CORRECT_FLAGS.part2) {
        result.className = 'submission-result success';
        result.innerHTML = '✅ <strong>Fragment 2 Authenticated</strong><br>All encryption layers defeated!';
        
        state.flagParts[1] = input;
        state.challengesCompleted[1] = true;
        updateProgress();
        
        setTimeout(() => {
            const finalFlag = state.flagParts[0] + state.flagParts[1];
            document.getElementById('final-input').value = finalFlag;
            
            document.getElementById('final-challenge').style.display = 'block';
            document. getElementById('final-challenge').scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    } else {
        state.wrongAttempts++;
        result.className = 'submission-result error';
        
        if (state.wrongAttempts === 1) {
            feedback.className = 'challenge-feedback error';
            feedback.innerHTML = '❌ <strong>Decryption Failed</strong><br>Fragment reconstruction incorrect. Each packet uses a different cipher.';
            result.innerHTML = '❌ Incorrect. Analyze encoding types per packet.';
        } else if (state.wrongAttempts === 2) {
            feedback.className = 'challenge-feedback warning';
            feedback.innerHTML = '💡 <strong>Analysis Hint</strong><br>Different encoding schemes detected. Historical rotation ciphers, base encoding systems, and bitwise operations present.';
            result.innerHTML = '❌ Still wrong.  Examine X-Encoding headers and Fragment IDs.';
        } else if (state.wrongAttempts === 3) {
            feedback.className = 'challenge-feedback warning';
            feedback.innerHTML = '🔍 <strong>Deeper Hint</strong><br>Different domains may indicate decoy traffic. Fragment IDs suggest order: alpha → beta → gamma.  Check packet numbering carefully.';
            result.innerHTML = '❌ Incorrect. One packet is a decoy (different domain).  Sequence matters! ';
        } else {
            feedback.className = 'challenge-feedback warning';
            feedback.innerHTML = `
                💡 <strong>Critical Intel</strong><br>
                Rotation cipher: Shift value is a baker's dozen (13)<br>
                BASE encoding: Think 2^5 = 32<br>
                XOR operation: Key in HTML comment "Build: 0x2A"<br>
                PKT-004 is noise - different domain infrastructure<br>
                Order by Fragment-ID: alpha, beta, gamma
            `;
            result.innerHTML = '❌ Review the HTML source code comments at the top for more clues.';
        }
    }
}

// ============================================
// Final Submission
// ============================================
function submitFinalFlag() {
    const input = document.getElementById('final-input').value.trim();
    const result = document.getElementById('final-result');
    
    if (input === CORRECT_FLAGS.full) {
        clearInterval(timerInterval);
        
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        
        result.className = 'final-result success';
        result.innerHTML = `
            🎉 <strong>OPERATION SUCCESSFUL</strong> 🎉<br><br>
            ⏱️ Completion: ${minutes}m ${seconds}s<br><br>
            You've successfully breached the phisher's crypto-arsenal. <br>
            Multi-layer decryption, steganography - all conquered.<br><br>
            <em>"There's no hero without zero"</em><br>
            And you are the proof!  🔥<br><br>
            - b1l4l
        `;
    } else {
        result.className = 'final-result error';
        result.innerHTML = '❌ <strong>Operation Failed</strong><br>Final flag incorrect.  Combine: Fragment1 + Fragment2';
    }
}

// ============================================
// Progress Tracker
// ============================================
function updateProgress() {
    const completed = state.flagParts.filter(p => p !== '').length;
    document.getElementById('progress'). textContent = `${completed}/2`;
    
    let display = state.flagParts[0] || 'SECOPS{??? _';
    display += state. flagParts[1] || '??? }';
    
    document. getElementById('flag-display').textContent = display;
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    
    document. getElementById('btn-download-image'). addEventListener('click', downloadImage);
    document.getElementById('submit-part-1').addEventListener('click', submitFlagPart1);
    document.getElementById('submit-part-2').addEventListener('click', submitFlagPart2);
    document.getElementById('btn-final-submit').addEventListener('click', submitFinalFlag);
    
    document. getElementById('input-part-1'). addEventListener('keypress', (e) => {
        if (e. key === 'Enter') submitFlagPart1();
    });
    
    document.getElementById('input-part-2').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitFlagPart2();
    });
    
    document.getElementById('final-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitFinalFlag();
    });
    
    updateProgress();
});