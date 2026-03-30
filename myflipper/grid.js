const COLS = 20;
const ROWS = 5;
const TOTAL_CELLS = COLS * ROWS;
const gridElement = document.getElementById('grid');
const flippers = [];

// Initialize grid
for (let i = 0; i < TOTAL_CELLS; i++) {
    const host = document.createElement('div');
    host.className = 'flip-letter-host';
    gridElement.appendChild(host);
    
    const flip = new FlipLetter(host, {
        flipDelay: 100 + (Math.random() * 50) // Slight variance for more organic feel
    });
    flippers.push(flip);
}

// Scaling logic
function resizeGrid() {
    const container = document.querySelector('.scaling-container');
    if (!container || !gridElement) return;

    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;
    
    // Original size of the grid including padding and gaps
    // CSS vars: 10 * 96px + 9 * 10px + 40px padding = 960 + 90 + 40 = 1090
    // CSS vars: 5 * 128px + 4 * 10px + 40px padding = 640 + 40 + 40 = 720
    const originalWidth = (COLS * 96) + ((COLS - 1) * 10) + 40;
    const originalHeight = (ROWS * 128) + ((ROWS - 1) * 10) + 40;

    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up past 1:1

    gridElement.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeGrid);
resizeGrid();

// Controls
const input = document.getElementById('grid-input');
const btn = document.getElementById('set-text-btn');
const clearBtn = document.getElementById('clear-btn');

function setText(text) {
    text = text.toUpperCase().padEnd(TOTAL_CELLS, ' ');
    for (let i = 0; i < TOTAL_CELLS; i++) {
        // Delay each letter slightly for a wave effect
        setTimeout(() => {
            flippers[i].setChar(text[i]);
        }, i * 20);
    }
}

if (btn && input) {
    btn.addEventListener('click', () => {
        setText(input.value);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            setText(input.value);
        }
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (input) input.value = '';
        setText('');
    });
}
