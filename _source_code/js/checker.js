document.addEventListener('DOMContentLoaded', function () {
    const accountList = document.getElementById('accountList');
    const slowModeBtn = document.getElementById('slowMode');
    const fastModeBtn = document.getElementById('fastMode');
    const fileUpload = document.getElementById('fileUpload');
    const fileInput = document.getElementById('fileInput');
    const checkBtn = document.getElementById('checkBtn');
    const stopBtn = document.getElementById('stopBtn');

    // Progress Elements
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    const resultsBody = document.getElementById('resultsBody');

    // Stats Elements
    const elements = {
        total: document.getElementById('totalAccounts'),
        checked: document.getElementById('checkedCount'),
        remaining: document.getElementById('remainingCount'),
        good: document.getElementById('goodCount'),
        verified: document.getElementById('verifiedCount'),
        disabled: document.getElementById('disabledCount'),
        notExist: document.getElementById('notExistCount'),
        unknown: document.getElementById('unknownCount')
    };

    let currentMode = 'slow';
    let isChecking = false;
    let shouldStop = false;

    // Data Storage
    let resultData = {
        'good': [],
        'verified': [],
        'disabled': [],
        'not-exist': [],
        'unknown': []
    };
    // Counts
    let counts = { 'Good': 0, 'Verified': 0, 'Disabled': 0, 'Not Exist': 0, 'Unknown': 0 };

    // --- Event Listeners ---

    slowModeBtn?.addEventListener('click', () => setMode('slow'));
    fastModeBtn?.addEventListener('click', () => setMode('fast'));

    function setMode(mode) {
        currentMode = mode;
        if (mode === 'slow') {
            slowModeBtn.classList.add('active');
            fastModeBtn.classList.remove('active');
        } else {
            fastModeBtn.classList.add('active');
            slowModeBtn.classList.remove('active');
        }
    }

    fileUpload?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', (e) => processFile(e.target.files[0]));

    fileUpload?.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = 'var(--primary-color)';
        fileUpload.style.backgroundColor = 'var(--hover-bg)';
    });
    fileUpload?.addEventListener('dragleave', () => {
        fileUpload.style.borderColor = 'var(--border-color)';
        fileUpload.style.backgroundColor = 'var(--input-bg)';
    });
    fileUpload?.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = 'var(--border-color)';
        fileUpload.style.backgroundColor = 'var(--input-bg)';
        processFile(e.dataTransfer.files[0]);
    });

    function processFile(file) {
        if (!file) return;
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function (e) {
                accountList.value = e.target.result;
                resetStats();
                window.showToast('toast_upload_ok');
            };
            reader.readAsText(file);
        } else {
            window.showToast('toast_upload_err', 'error');
        }
    }

    checkBtn?.addEventListener('click', async () => {
        if (isChecking) return;

        const accounts = getAccountList();
        if (accounts.length === 0) {
            window.showToast('toast_no_accts', 'error');
            return;
        }

        await startChecking(accounts);
    });

    stopBtn?.addEventListener('click', () => {
        shouldStop = true;
        stopBtn.disabled = true;
        stopBtn.textContent = 'Stopping...';
    });

    accountList?.addEventListener('input', resetStats);

    if (accountList) resetStats();

    // Copy/Download Actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            const action = this.getAttribute('data-action');

            if (action === 'copy') {
                copyResults(type);
            } else if (action === 'download') {
                downloadResults(type);
            }
        });
    });

    // --- Core Logic ---

    function getAccountList() {
        const text = accountList.value.trim();
        if (!text) return [];
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(email => {
                const atIndex = email.indexOf('@gmail.com');
                if (atIndex !== -1) {
                    return email.substring(0, atIndex + 10);
                }
                return email;
            });
    }

    function resetStats() {
        if (isChecking) return;

        const accounts = getAccountList();
        const total = accounts.length;

        if (elements.total) elements.total.textContent = total;
        if (elements.remaining) elements.remaining.textContent = total;
        if (elements.checked) elements.checked.textContent = 0;

        ['good', 'verified', 'disabled', 'notExist', 'unknown'].forEach(k => {
            if (elements[k]) elements[k].textContent = '0';
        });

        resultData = { 'good': [], 'verified': [], 'disabled': [], 'not-exist': [], 'unknown': [] };
        counts = { 'Good': 0, 'Verified': 0, 'Disabled': 0, 'Not Exist': 0, 'Unknown': 0 };

        if (resultsBody) resultsBody.innerHTML = '';
        if (progressContainer) progressContainer.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
    }

    function generateRandomApiKey() {
        const chars = '0123456789abcdef';
        let key = '';
        for (let i = 0; i < 32; i++) {
            key += chars[Math.floor(Math.random() * chars.length)];
        }
        return key;
    }

    async function startChecking(accounts) {
        isChecking = true;
        shouldStop = false;

        // UI State
        checkBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        stopBtn.disabled = false;
        stopBtn.textContent = 'Stop';

        if (progressContainer) {
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.style.display = 'block';
            progressText.textContent = '0%';
        }

        // Speed Logic
        // Slow: Batch=100 (Safe). Fast: Batch=2000 (Turbo/Max).
        // Since API is PHP based, usually handles decent load.
        // User said "remove slow speed", so even slow mode should be reasonably fast, maybe 200?
        // Fast mode -> send 2000?
        const batchSize = currentMode === 'fast' ? 2000 : 200;
        const total = accounts.length;
        let processed = 0;

        const chunks = [];
        for (let i = 0; i < total; i += batchSize) {
            chunks.push(accounts.slice(i, i + batchSize));
        }

        try {
            for (const chunk of chunks) {
                if (shouldStop) {
                    window.showToast('Stopped by user', 'info');
                    break;
                }

                // Call API
                const chunkResults = await checkBatchAPI(chunk, currentMode);

                // Process Results
                processChunkResults(chunkResults, chunk);

                // Update Progress
                processed += chunk.length;
                const percent = Math.round((processed / total) * 100);

                if (progressBar) progressBar.style.width = `${percent}%`;
                if (progressText) progressText.textContent = `${percent}%`;

                updateCounterUI(processed, total - processed);

                // Minimal delay
                await new Promise(r => setTimeout(r, 0));
            }

            if (!shouldStop) window.showToast('toast_check_ok');

        } catch (err) {
            console.error(err);
            window.showToast('Error: ' + err.message, 'error');
        } finally {
            isChecking = false;
            checkBtn.style.display = 'inline-flex';
            stopBtn.style.display = 'none';
            checkBtn.disabled = false;
            checkBtn.textContent = window.getMsg('check_btn');
        }
    }

    async function checkBatchAPI(batchAccounts, mode) {
        const randomKey = generateRandomApiKey();
        const requestData = {
            mail: batchAccounts,
            key: randomKey,
            fastCheck: mode === 'fast'
        };

        try {
            const response = await fetch('https://gmailver.com/php/check1.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://www.gmailcek.com',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) throw new Error('Network error');
            const data = await response.json();

            if (data.status) {
                return data.data;
            } else {
                throw new Error(data.message || 'API Error');
            }
        } catch (e) {
            console.warn("Batch failed", e);
            // Fallback
            return batchAccounts.map(email => ({ email: email, status: 'Unknown' }));
        }
    }

    function processChunkResults(apiData, originalChunk) {
        const chunkMap = {};
        apiData.forEach(item => {
            let status = 'Unknown';
            switch (item.status.toLowerCase()) {
                case 'live': status = 'Good'; break;
                case 'verify': status = 'Verified'; break;
                case 'die':
                case 'disabled': status = 'Disabled'; break;
                case 'not exist':
                case 'not-exist': status = 'Not Exist'; break;
                default: status = 'Unknown';
            }
            chunkMap[item.email] = status;
        });

        originalChunk.forEach(email => {
            let status = chunkMap[email] || 'Unknown';

            if (status === 'Good') { counts.Good++; resultData.good.push(email); }
            else if (status === 'Verified') { counts.Verified++; resultData.verified.push(email); }
            else if (status === 'Disabled') { counts.Disabled++; resultData.disabled.push(email); }
            else if (status === 'Not Exist') { counts['Not Exist']++; resultData['not-exist'].push(email); }
            else { counts.Unknown++; resultData.unknown.push(email); }

            appendRow(email, status);
        });
    }

    function appendRow(email, status) {
        if (!resultsBody) return;

        const row = document.createElement('tr');

        let badgeClass = 'bg-neutral';
        if (status === 'Good') badgeClass = 'bg-success';
        if (status === 'Verified') badgeClass = 'bg-warning';
        if (status === 'Disabled') badgeClass = 'bg-danger';
        if (status === 'Not Exist') badgeClass = 'bg-warning';

        const statusKey = status.toLowerCase().replace(' ', '_');
        const displayStatus = window.getMsg(statusKey) || status;

        row.innerHTML = `
            <td>${email}</td>
            <td><span class="count-badge ${badgeClass}">${displayStatus}</span></td>
        `;
        resultsBody.appendChild(row);
    }

    function updateCounterUI(processedCount, remainingCount) {
        if (elements.checked) elements.checked.textContent = processedCount;
        if (elements.remaining) elements.remaining.textContent = remainingCount;

        if (elements.good) elements.good.textContent = counts.Good;
        if (elements.verified) elements.verified.textContent = counts.Verified;
        if (elements.disabled) elements.disabled.textContent = counts.Disabled;
        if (elements.notExist) elements.notExist.textContent = counts['Not Exist'];
        if (elements.unknown) elements.unknown.textContent = counts.Unknown;
    }

    function copyResults(type) {
        let textToCopy = '';
        if (type === 'all') {
            Object.values(resultData).flat().forEach(e => textToCopy += e + '\n');
        } else {
            if (resultData[type] && resultData[type].length > 0) {
                textToCopy = resultData[type].join('\n');
            } else {
                window.showToast('toast_no_data', 'info');
                return;
            }
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            window.showToast('toast_copy');
        });
    }

    function downloadResults(type) {
        let content = '';
        let filename = `${type}_results.txt`;

        if (type === 'all') {
            Object.entries(resultData).forEach(([key, emails]) => {
                emails.forEach(e => content += `${e} - ${key.toUpperCase()}\n`);
            });
        } else {
            if (resultData[type] && resultData[type].length > 0) {
                content = resultData[type].join('\n');
            } else {
                window.showToast('toast_no_data', 'info');
                return;
            }
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
});
