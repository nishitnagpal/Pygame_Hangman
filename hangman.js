const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 1000;
const HEIGHT = 600;
const WORD_WIDTH = 100;
const WORD_HEIGHT = 10;
const SPACING = 50;
const MAX_ATTEMPTS = 6;

let inputChar = "";
let inputHistory = [];
let attempts = 0;
let gameStarted = false;
let winMessage = false;
let endMessage = false;
let startTime = 0;
let elapsedTime = 0;
let finalTime = 0;
let dashes = [];
let guessedLetters = [];
let WORD = "";
let wordLetters = [];
let WORDS_LIST = [];

// Load words from file
async function loadWords() {
    try {
        const response = await fetch('five_letter_words.txt');
        const text = await response.text();
        WORDS_LIST = text.split('\n').map(word => word.trim().toUpperCase()).filter(word => word.length === 5);
        resetGame();
    } catch (error) {
        console.error('Error loading words:', error);
    }
}

const FONT = "20px Comic Sans MS";

function drawGame() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gameStarted) {
        for (let i = 0; i < dashes.length; i++) {
            const dash = dashes[i];
            ctx.strokeStyle = 'white';
            ctx.strokeRect(dash.x, dash.y, WORD_WIDTH, WORD_HEIGHT);
            if (guessedLetters[i]) {
                ctx.fillStyle = 'white';
                ctx.font = FONT;
                ctx.fillText(guessedLetters[i], dash.x + (WORD_WIDTH - ctx.measureText(guessedLetters[i]).width) / 2, dash.y - 10);
            }
        }
    }

    ctx.fillStyle = 'orange';
    ctx.font = FONT;
    ctx.fillText(`Time: ${Math.round(elapsedTime)}s`, 10, 20);

    if (gameStarted) {
        ctx.fillStyle = 'white';
        ctx.fillText(`Letters Tried: ${inputHistory.join(", ")}`, 250, 100);
    }

    ctx.fillStyle = 'orange';
    ctx.fillText(`Attempts: ${attempts}/${MAX_ATTEMPTS}`, WIDTH - 150, 20);

    if (!gameStarted && !endMessage && !winMessage) {
        const startText = "Press Enter to Play\n\n Guess the word in SIX tries\n\n Enter a letter in each try \n\n Press q to Quit";
        drawMultilineText(startText, FONT, "white", WIDTH / 2, HEIGHT / 3);
    }

    if (!gameStarted && winMessage) {
        const winText = `You Won!\n Time Taken: ${Math.round(finalTime)}s \n\n Press Enter to Play Again or q to Quit`;
        drawMultilineText(winText, FONT, "green", WIDTH / 2, HEIGHT / 3);
    }

    if (!gameStarted && endMessage) {
        const lostText = `The word was: ${WORD} \n\n Game Over! \n\n You've exceeded the maximum attempts! \n\n Press Enter to Play Again or q to Quit`;
        drawMultilineText(lostText, FONT, "red", WIDTH / 2, HEIGHT / 3);
    }

    requestAnimationFrame(drawGame);
}

function drawMultilineText(text, font, color, x, y) {
    const lines = text.split("\n");
    ctx.fillStyle = color;
    ctx.font = font;
    lines.forEach((line, index) => {
        ctx.fillText(line, x - ctx.measureText(line).width / 2, y + (index * 30));
    });
}

function resetGame() {
    gameStarted = false;
    endMessage = false;
    winMessage = false;
    startTime = Date.now();
    elapsedTime = 0;
    finalTime = 0;
    inputChar = "";
    inputHistory = [];
    attempts = 0;

    if (WORDS_LIST.length === 0) {
        return;
    }

    WORD = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
    wordLetters = WORD.split("");
    guessedLetters = Array(WORD.length).fill("");

    dashes = [];
    const totalDashWidth = WORD.length * WORD_WIDTH + (WORD.length - 1) * SPACING;
    const startX = (WIDTH - totalDashWidth) / 2;

    for (let i = 0; i < WORD.length; i++) {
        const dashX = startX + i * (WORD_WIDTH + SPACING);
        dashes.push({ x: dashX, y: HEIGHT / 2 });
    }
}

function handleInput(event) {
    const key = event.key.toUpperCase();
    if (key === 'BACKSPACE') {
        inputChar = inputChar.slice(0, -1);
    } else if (/^[A-Z]$/.test(key) && inputChar.length < 1) {
        inputChar = key;
        if (!inputHistory.includes(inputChar)) {
            inputHistory.push(inputChar);

            if (wordLetters.includes(inputChar)) {
                wordLetters.forEach((letter, index) => {
                    if (letter === inputChar) {
                        guessedLetters[index] = inputChar;
                    }
                });

                if (guessedLetters.join("") === WORD) {
                    winMessage = true;
                    finalTime = (Date.now() - startTime) / 1000;
                    gameStarted = false;
                }
            } else {
                attempts++;
                if (attempts >= MAX_ATTEMPTS) {
                    endMessage = true;
                    gameStarted = false;
                }
            }
        }
        inputChar = ""; // Reset inputChar after processing
    }
}

function main() {
    loadWords();

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (!gameStarted) {
                gameStarted = true;
                startTime = Date.now();
            } else if (endMessage || winMessage) {
                resetGame();
            }
        } else if (event.key === 'q') {
            window.close();
        } else if (gameStarted && !winMessage) {
            handleInput(event);
        }
    });

    function gameLoop() {
        if (gameStarted) {
            elapsedTime = (Date.now() - startTime) / 1000;
        }
        drawGame();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

main();
