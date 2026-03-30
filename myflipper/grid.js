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

    // Get current CSS variable values
    const style = getComputedStyle(document.documentElement);
    const flipWidth = parseInt(style.getPropertyValue('--flip-width')) || 96;
    const flipHeight = parseInt(style.getPropertyValue('--flip-height')) || 128;
    const gap = parseInt(style.getPropertyValue('--gap')) || 10;

    // Grid padding from grid.css: padding: 36px 48px 40px;
    const gridPaddingTop = 36;
    const gridPaddingRight = 48;
    const gridPaddingBottom = 40;
    const gridPaddingLeft = 48;

    const originalWidth = (COLS * flipWidth) + ((COLS - 1) * gap) + gridPaddingLeft + gridPaddingRight;
    const originalHeight = (ROWS * flipHeight) + ((ROWS - 1) * gap) + gridPaddingTop + gridPaddingBottom;

    // Set fixed dimensions so scale transform doesn't leave ghost layout space
    gridElement.style.width = originalWidth + 'px';
    gridElement.style.height = originalHeight + 'px';

    // Input grid padding from grid-inputs.css: padding: 10px;
    const inputGridPadding = 20; // 10px each side
    const inputOriginalWidth = (COLS * flipWidth) + ((COLS - 1) * gap) + inputGridPadding;
    const inputOriginalHeight = (ROWS * flipHeight) + ((ROWS - 1) * gap) + inputGridPadding;
    
    inputGridElement.style.width = inputOriginalWidth + 'px';
    inputGridElement.style.height = inputOriginalHeight + 'px';

    const parentWidth = container.parentElement.clientWidth;
    const availableWidth = parentWidth - (48 * 2);
    const containerHeight = window.innerHeight * 0.45; 
    
    const scale = Math.min(availableWidth / originalWidth, containerHeight / originalHeight, 1);
    gridElement.style.transform = `scale(${scale})`;
    
    // Set actual visual size on the container to center the scaled grid perfectly
    const visualWidth = originalWidth * scale;
    const visualHeight = originalHeight * scale;
    
    container.style.width = (visualWidth + (48 * 2)) + 'px';
    container.style.height = (visualHeight + (60 + 40)) + 'px';

    // Scale input grid
    if (inputContainer) {
        const inputParentWidth = inputContainer.parentElement.clientWidth;
        const inputAvailableWidth = inputParentWidth - (48 * 2);
        const inputContainerHeight = window.innerHeight * 0.25;
        const inputScale = Math.min(inputAvailableWidth / inputOriginalWidth, inputContainerHeight / inputOriginalHeight, 0.4); 
        inputGridElement.style.transform = `scale(${inputScale})`;
        
        const inputVisualWidth = inputOriginalWidth * inputScale;
        const inputVisualHeight = inputOriginalHeight * inputScale;

        inputContainer.style.width = (inputVisualWidth + (48 * 2)) + 'px';
        inputContainer.style.height = (inputVisualHeight + (60 + 60)) + 'px'; // 120px = 60px padding top/bottom
    }
}

window.addEventListener('resize', resizeGrid);
resizeGrid();

// Controls
const input = document.getElementById('grid-input');
const btn = document.getElementById('set-text-btn');
const flipGridBtn = document.getElementById('flip-grid-btn');
const clearBtn = document.getElementById('clear-btn');

// Updated setText to match "SEND TO GRID" logic with layout requirements
function setText(text) {
    const lines = Array(ROWS).fill().map(() => Array(COLS).fill(' '));
    const words = text.toUpperCase().trim().split(/\s+/).filter(w => w.length > 0);

    // 1. Word-wrapping (Simple greedy)
    const wrappedLines = [];
    let currentLine = [];
    let currentLen = 0;

    for (const word of words) {
        if (word.length > COLS) {
            // Word is longer than the entire line width, must split it anyway
            let remainingWord = word;
            while (remainingWord.length > 0) {
                if (currentLen > 0) {
                    wrappedLines.push(currentLine.join(''));
                    currentLine = [];
                    currentLen = 0;
                }
                const chunk = remainingWord.slice(0, COLS);
                wrappedLines.push(chunk);
                remainingWord = remainingWord.slice(COLS);
            }
        } else if (currentLen + (currentLen > 0 ? 1 : 0) + word.length <= COLS) {
            if (currentLen > 0) {
                currentLine.push(' ');
                currentLen += 1;
            }
            currentLine.push(word);
            currentLen += word.length;
        } else {
            wrappedLines.push(currentLine.join(''));
            currentLine = [word];
            currentLen = word.length;
        }
    }
    if (currentLine.length > 0) {
        wrappedLines.push(currentLine.join(''));
    }

    // Only take what fits in ROWS
    const finalWrappedLines = wrappedLines.slice(0, ROWS);

    // 2. Vertical Centering
    const spareRows = ROWS - finalWrappedLines.length;
    const startRow = Math.floor(spareRows / 2); // e.g. if 3 lines out of 5, spare=2, start=1 (1 blank above, 1 below)
    // If spare is 1, floor(1/2) = 0. Requirement: "In the case of odds numbers have it higher in the grid rather than lower."
    // 5 rows, 4 lines used -> spare=1. floor(1/2) = 0. One blank at bottom. Correct (higher).
    // 5 rows, 2 lines used -> spare=3. floor(3/2) = 1. One blank above, two below. Correct (higher).

    for (let i = 0; i < finalWrappedLines.length; i++) {
        const lineText = finalWrappedLines[i];
        const rowIdx = startRow + i;
        if (rowIdx >= ROWS) break;

        // 3. Horizontal Centering
        const spareChars = COLS - lineText.length;
        const startCol = Math.floor(spareChars / 2);
        
        for (let j = 0; j < lineText.length; j++) {
            if (startCol + j < COLS) {
                lines[rowIdx][startCol + j] = lineText[j];
            }
        }
    }

    // Flatten lines into a single string for consistency with existing logic if needed
    // or just update flippers/inputs directly.
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const i = r * COLS + c;
            const char = lines[r][c];
            
            // Update input field
            if (gridInputs[i]) {
                gridInputs[i].value = char === ' ' ? '' : char;
            }
            
            // Flip the letter to match
            setTimeout(() => {
                flippers[i].setChar(char);
            }, i * 10); // Sped up the wave slightly for better feel
        }
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
