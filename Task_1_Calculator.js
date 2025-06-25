document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons-grid button');
    const themeToggle = document.getElementById('themeToggle');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelp = document.getElementById('closeHelp');
    const copyBtn = document.getElementById('copyBtn');
    const historyList = document.getElementById('historyList');
    const clearHistory = document.getElementById('clearHistory');
    
    let currentInput = '';
    let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
    let isDarkTheme = localStorage.getItem('calculatorTheme') !== 'light';

    // Initialize theme
    if (!isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '☀️';
    }

    // Load history
    loadHistory();

    function updateDisplay(value) {
        display.value = value;
    }

    function addToHistory(calculation, result) {
        const historyItem = `${calculation} = ${result}`;
        history.unshift(historyItem);
        if (history.length > 10) history.pop(); // Keep only last 10 items
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = item;
            div.style.cursor = 'pointer';
            div.onclick = () => {
                const result = item.split(' = ')[1];
                currentInput = result;
                updateDisplay(currentInput);
            };
            historyList.appendChild(div);
        });
    }

    function playClickSound() {
        // Create a simple click sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    function calculatePercentage(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Error';
        return (num / 100).toString();
    }

    function calculateSquareRoot(value) {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return 'Error';
        return Math.sqrt(num).toString();
    }

    function calculatePower(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Error';
        return Math.pow(num, 2).toString();
    }

    function calculateReciprocal(value) {
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return 'Error';
        return (1 / num).toString();
    }

    buttons.forEach(button => {
        const value = button.getAttribute('data-value');
        const action = button.getAttribute('data-action');

        button.addEventListener('click', () => {
            playClickSound();
            
            if (action === 'clear') {
                currentInput = '';
                updateDisplay(currentInput);
            } else if (action === 'delete') {
                currentInput = currentInput.slice(0, -1);
                updateDisplay(currentInput);
            } else if (action === 'calculate') {
                try {
                    const calculation = currentInput;
                    currentInput = eval(currentInput).toString();
                    addToHistory(calculation, currentInput);
                } catch {
                    currentInput = 'Error';
                }
                updateDisplay(currentInput);
            } else if (action === 'sqrt') {
                currentInput = calculateSquareRoot(currentInput);
                updateDisplay(currentInput);
            } else if (action === 'power') {
                currentInput = calculatePower(currentInput);
                updateDisplay(currentInput);
            } else if (action === 'reciprocal') {
                currentInput = calculateReciprocal(currentInput);
                updateDisplay(currentInput);
            } else if (value !== null) {
                if (value === '%') {
                    currentInput = calculatePercentage(currentInput);
                    updateDisplay(currentInput);
                } else {
                    // Prevent multiple decimals in a number
                    if (value === '.' && /\.?$/.test(currentInput.split(/[-+*/]/).pop())) {
                        if (currentInput.split(/[-+*/]/).pop().includes('.')) return;
                    }
                    // Prevent leading zeros
                    if (value === '0' && currentInput === '0') return;
                    if (value === '00' && currentInput === '0') return;
                    if (currentInput === 'Error') currentInput = '';
                    currentInput += value;
                    updateDisplay(currentInput);
                }
            }
        });
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        if (isDarkTheme) {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
            localStorage.setItem('calculatorTheme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.textContent = '☀️';
            localStorage.setItem('calculatorTheme', 'light');
        }
    });

    // Help modal
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });

    closeHelp.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Copy functionality
    copyBtn.addEventListener('click', () => {
        if (display.value && display.value !== 'Error') {
            navigator.clipboard.writeText(display.value).then(() => {
                copyBtn.textContent = '✓';
                setTimeout(() => {
                    copyBtn.textContent = '📋';
                }, 1000);
            });
        }
    });

    // Clear history
    clearHistory.addEventListener('click', () => {
        history = [];
        localStorage.removeItem('calculatorHistory');
        loadHistory();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '.'].includes(e.key)) {
            if (currentInput === 'Error') currentInput = '';
            currentInput += e.key;
            updateDisplay(currentInput);
        } else if (e.key === 'Enter') {
            try {
                const calculation = currentInput;
                currentInput = eval(currentInput).toString();
                addToHistory(calculation, currentInput);
            } catch {
                currentInput = 'Error';
            }
            updateDisplay(currentInput);
        } else if (e.key === 'Backspace') {
            currentInput = currentInput.slice(0, -1);
            updateDisplay(currentInput);
        } else if (e.key === 'Escape') {
            currentInput = '';
            updateDisplay(currentInput);
        } else if (e.key === '%') {
            currentInput = calculatePercentage(currentInput);
            updateDisplay(currentInput);
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            if (display.value && display.value !== 'Error') {
                navigator.clipboard.writeText(display.value);
            }
        }
    });
});