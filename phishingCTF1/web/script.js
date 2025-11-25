let flagParts = ['', '', ''];
let challengesCompleted = [false, false, false];
let emailAttempts = 0;
let linkAttempts = 0;
let pageAttempts = 0;

const correctFlagParts = ['SECOPS{y0u_r2_', 'Th2_rEaL_', 'oNe}'];

function checkEmail(choice) {
    const hint = document.getElementById('email-hint');
    
    if (choice === 2) {
        hint.className = 'hint-box correct';
        hint.innerHTML = '✅ Correct! This email is legitimate.<br><br>🔍 <strong>Next step:</strong> Open <a href="challenges/email2.html" target="_blank" style="color:var(--success); text-decoration:underline;">Email B</a> and open your eyes... the truth is in the source.';
        emailAttempts = 0;
        
        // Show flag input for part 1
        document.getElementById('flag-input-1').style.display = 'block';
        document.getElementById('flag-input-1').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        emailAttempts++;
        hint.className = 'hint-box incorrect';
        if (choice === 1) {
            hint.innerHTML = '❌ This is phishing!<br><br>🚩 Red flags: Suspicious domain (micros0ft-support.com), urgency tactics, suspicious URL with .tk TLD';
        } else {
            hint.innerHTML = '❌ This is phishing!<br><br>🚩 Red flags: CEO fraud/Business Email Compromise (BEC), urgency without proper verification, unprofessional tone';
        }
        
        if (emailAttempts >= 3) {
            hint.innerHTML += '<br><br>💡 <strong>Hint:</strong> Look for the email with proper company domain, no suspicious links, and professional tone. IT Support emails are usually informational only.';
        }
    }
}

function checkLink(choice) {
    const hint = document.getElementById('link-hint');
    
    if (choice === 3) {
        const encoded = event.currentTarget.getAttribute('data-encoded');
        hint.className = 'hint-box correct';
        hint.innerHTML = `✅ Correct! This is the legitimate link.<br><br>🔐 <strong>Encrypted message:</strong> <code>${encoded}</code><br><br>💡 There are too many bases... but what base? 🤔`;
        
        linkAttempts = 0;
        
        // Show flag input for part 2
        document.getElementById('flag-input-2').style.display = 'block';
        document.getElementById('flag-input-2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        linkAttempts++;
        hint.className = 'hint-box incorrect';
        if (choice === 1) {
            hint.innerHTML = '❌ Phishing link detected!<br><br>🚩 Typosquatting: "micros0ft" (zero instead of o)';
        } else {
            hint.innerHTML = '❌ Phishing link detected!<br><br>🚩 Typosquatting: "paypa1" (number 1 instead of lowercase L)';
        }
        
        if (linkAttempts >= 3) {
            hint.innerHTML += '<br><br>💡 <strong>Hint:</strong> Hover over each link and check the URL carefully. Look for character substitutions (0 vs o, 1 vs l). The legitimate one is a real tech company.';
        }
    }
    return false;
}

function openPage(page) {
    window.open('challenges/' + page, '_blank');
    const hint = document.getElementById('page-hint');
    pageAttempts++;
    
    hint.className = 'hint-box warning';
    hint.innerHTML = '💡 Page opened in new tab.<br><br>🕵️ <strong>Your mission:</strong> Something fishy is running in the background... Check what the page is trying to tell you. Developer tools might help! 🔧';
    
    if (pageAttempts >= 1) {
        // Show flag input for part 3 immediately after first page open
        document.getElementById('flag-input-3').style.display = 'block';
        document.getElementById('flag-input-3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    if (pageAttempts >= 6) {
        hint.innerHTML += '<br><br>✅ <strong>Pro tip:</strong> The Bank Login page has secrets. Open the console and try running <code>revealSecret()</code>... 👀';
    }
}

function submitFlagPart(partNumber) {
    const input = document.getElementById(`flag-part-${partNumber}`).value.trim();
    const result = document.getElementById(`flag-result-${partNumber}`);
    
    if (input === correctFlagParts[partNumber - 1]) {
        result.className = 'result-box success';
        result.innerHTML = `✅ Correct! Part ${partNumber} accepted.`;
        flagParts[partNumber - 1] = input;
        updateProgress();
        
        // Move to next challenge
        if (partNumber === 1 && !challengesCompleted[0]) {
            challengesCompleted[0] = true;
            setTimeout(() => {
                document.getElementById('challenge2').style.display = 'block';
                document.getElementById('challenge2').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        } else if (partNumber === 2 && !challengesCompleted[1]) {
            challengesCompleted[1] = true;
            setTimeout(() => {
                document.getElementById('challenge3').style.display = 'block';
                document.getElementById('challenge3').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        } else if (partNumber === 3 && !challengesCompleted[2]) {
            challengesCompleted[2] = true;
            setTimeout(() => {
                // Pre-fill the final flag
                const finalFlag = flagParts[0] + flagParts[1] + flagParts[2];
                document.getElementById('final-flag').value = finalFlag;
                
                document.getElementById('final-submit').style.display = 'block';
                document.getElementById('final-submit').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }
    } else {
        result.className = 'result-box error';
        result.innerHTML = `❌ Incorrect! Make sure you found the correct flag part ${partNumber}.`;
    }
}

function submitFinalFlag() {
    const input = document.getElementById('final-flag').value.trim();
    const correctFlag = 'SECOPS{y0u_r2_Th2_rEaL_oNe}';
    const result = document.getElementById('final-result');
    
    if (input === correctFlag) {
        result.className = 'result-box success';
        result.innerHTML = '🎉 <strong>CONGRATULATIONS, HACKER!</strong> 🎉<br><br>You cracked all three challenges and proved you\'re the real deal! 🔥<br>Keep hunting those phishing attacks and stay sharp! 🛡️<br><br><em>- b1l4l</em>';
    } else {
        result.className = 'result-box error';
        result.innerHTML = '❌ Incorrect flag. Combine all three parts correctly: Part1 + Part2 + Part3';
    }
}

function updateProgress() {
    const partsFound = flagParts.filter(p => p !== '').length;
    document.getElementById('parts-found').textContent = partsFound + '/3';
    
    let display = flagParts[0] || 'SECOPS{???_';
    display += flagParts[1] || '???_';
    display += flagParts[2] || '???}';
    
    document.getElementById('flag-display').textContent = display;
}

// Initialize on page load
updateProgress();