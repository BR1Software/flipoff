const COLS = 20;
const ROWS = 5;
const TOTAL_CELLS = COLS * ROWS;
const gridElement = document.getElementById('grid');
const inputGridElement = document.getElementById('input-grid');
const flippers = [];
const gridInputs = [];

// Initialize grid
for (let i = 0; i < TOTAL_CELLS; i++) {
    // Flip Letter
    const host = document.createElement('div');
    host.className = 'flip-letter-host';
    gridElement.appendChild(host);
    
    const flip = new FlipLetter(host, {
        flipDelay: 100 + (Math.random() * 50) // Slight variance for more organic feel
    });
    flippers.push(flip);

    // Input Cell
    const inputCell = document.createElement('input');
    inputCell.className = 'grid-input-cell';
    inputCell.type = 'text';
    inputCell.maxLength = 1;
    inputCell.placeholder = ' ';
    inputCell.dataset.index = i;
    inputGridElement.appendChild(inputCell);
    gridInputs.push(inputCell);

    // Sync input to flipper
    inputCell.addEventListener('input', (e) => {
        const char = e.target.value.toUpperCase();
        e.target.value = char; // Force uppercase in input
        
        // Only allow characters that are in the FlipLetter's character set
        if (char && !flip.chars.includes(char)) {
            e.target.value = '';
            return;
        }

        // Removed automatic flip update on input as per request

        // Auto-focus next
        if (char && i < TOTAL_CELLS - 1) {
            gridInputs[i + 1].focus();
        }
    });

    // Handle backspace and navigation
    inputCell.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inputCell.value && i > 0) {
            gridInputs[i - 1].focus();
        } else if (e.key === 'ArrowRight' && i < TOTAL_CELLS - 1) {
            gridInputs[i + 1].focus();
        } else if (e.key === 'ArrowLeft' && i > 0) {
            gridInputs[i - 1].focus();
        } else if (e.key === 'ArrowDown' && i + COLS < TOTAL_CELLS) {
            gridInputs[i + COLS].focus();
        } else if (e.key === 'ArrowUp' && i - COLS >= 0) {
            gridInputs[i - COLS].focus();
        }
    });
}

// Scaling logic
function resizeGrid() {
    const container = document.querySelector('.scaling-container');
    const inputContainer = document.querySelector('.inputs-container');
    if (!container || !gridElement || !inputGridElement) return;

    const containerWidth = container.clientWidth - 20;
    const containerHeight = window.innerHeight * 0.4; // Allocate 40% of height for the main grid
    
    const originalWidth = (COLS * 96) + ((COLS - 1) * 10) + 20;
    const originalHeight = (ROWS * 128) + ((ROWS - 1) * 10) + 20;

    const scale = Math.min(containerWidth / originalWidth, containerHeight / originalHeight, 1);

    gridElement.style.transform = `scale(${scale})`;

    // Scale input grid as well to match
    if (inputContainer) {
        const inputContainerWidth = inputContainer.clientWidth - 20;
        const inputContainerHeight = window.innerHeight * 0.25; // Allocate 25% of height for input grid
        const inputScale = Math.min(inputContainerWidth / originalWidth, inputContainerHeight / originalHeight, 0.4); 
        inputGridElement.style.transform = `scale(${inputScale})`;
    }
}

window.addEventListener('resize', resizeGrid);
resizeGrid();

// Controls
const input = document.getElementById('grid-input');
const btn = document.getElementById('set-text-btn');
const flipGridBtn = document.getElementById('flip-grid-btn');
const clearBtn = document.getElementById('clear-btn');

// Updated setText to match "SEND TO GRID" logic
function setText(text) {
    text = text.toUpperCase().padEnd(TOTAL_CELLS, ' ');
    for (let i = 0; i < TOTAL_CELLS; i++) {
        // Update input field
        if (gridInputs[i]) {
            gridInputs[i].value = text[i] === ' ' ? '' : text[i];
        }
        
        // Flip the letter to match
        setTimeout(() => {
            flippers[i].setChar(text[i]);
        }, i * 20);
    }
}

function syncFlipGrid() {
    for (let i = 0; i < TOTAL_CELLS; i++) {
        const char = gridInputs[i].value || ' ';
        // Delay each letter slightly for a wave effect
        setTimeout(() => {
            flippers[i].setChar(char);
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

if (flipGridBtn) {
    flipGridBtn.addEventListener('click', () => {
        syncFlipGrid();
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (input) input.value = '';
        setText('');
    });
}
