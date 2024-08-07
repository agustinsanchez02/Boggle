'use strict';

// Variables globales
let lastSelectedIndex = -1;
let gameBoard = [];
let currentWord = '';
let score = 0;
let timer;
let playerName = '';
const wordCache = {};
const validFourLetterWords = [
    "ABLE", "ACID", "ALSO", "AREA", "ARMY", "AWAY", "BABY", "BACK", "BALL", "BAND",
    "BANK", "BASE", "BATH", "BEAR", "BEAT", "BEEN", "BELL", "BEST", "BILL", "BIRD",
    "BLUE", "BOAT", "BODY", "BOOK", "BOTH", "CALL", "CAME", "CARD", "CARE", "CASE",
    "CASH", "CITY", "CLUB", "COLD", "COME", "COST", "DARK", "DEAL", "DEEP", "DOES",
    "DONE", "DOOR", "DOWN", "DRAW", "DROP", "EACH", "EAST", "EASY", "EDGE", "EVEN",
    "EVER", "FACT", "FALL", "FARM", "FAST", "FEAR", "FEEL", "FILL", "FILM", "FIND",
    "FINE", "FIRE", "FIRM", "FISH", "FIVE", "FLAT", "FOOD", "FOOT", "FORM", "FOUR",
    "FREE", "FROM", "FULL", "FUND", "GAME", "GATE", "GIRL", "GIVE", "GOAL", "GOOD",
    "GROW", "HAIR", "HALF", "HALL", "HAND", "HANG", "HARD", "HAVE", "HEAD", "HEAR",
    "HEAT", "HELD", "HERE", "HIGH", "HILL", "HOME", "HOPE", "HOUR", "IDEA", "INTO"
];

// Elementos del DOM
const playerNameInput = document.getElementById('playerName');
const startGameButton = document.getElementById('startGame');
const gameBoardElement = document.getElementById('gameBoard');
const currentWordElement = document.getElementById('currentWord');
const submitWordButton = document.getElementById('submitWord');
const clearWordButton = document.getElementById('clearWord');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('time');
const foundWordsElement = document.getElementById('foundWords');
const messageElement = document.getElementById('message');
const reshuffleButton = document.getElementById('reshuffleBoard');
const timerSelector = document.getElementById('gameTime');
const timerDisplay = document.getElementById('timerDisplay');

// Inicialización del juego
function initializeGame() {
    startGameButton.addEventListener('click', startGame);
    submitWordButton.addEventListener('click', submitWord);
    clearWordButton.addEventListener('click', clearCurrentWord);
    reshuffleButton.addEventListener('click', reshuffleBoard);
}

// Inicio del juego
function startGame() {
    playerName = playerNameInput.value.trim();
    if (playerName.length < 3) {
        showError('El nombre del jugador debe tener al menos 3 letras.', 'error');
        return;
    }
    
    hideElement(document.getElementById('playerInfo'));
    hideElement(document.getElementById('gameInstructions'));
    hideElement(document.getElementById('timerSelector'));
    showElement(gameBoardElement);
    showElement(document.getElementById('wordInfo'));
    showElement(document.getElementById('scoreInfo'));
    showElement(timerDisplay);
    showElement(reshuffleButton);
    showElement(document.getElementById('wordList'));
    
    generateBoard();
    startTimer();
    enableBoardInteraction();
    showMessage('¡Juego iniciado! Buena suerte, ' + playerName + '!', 'success');
}

// Generación del tablero
function generateBoard() {
    gameBoard = [];
    gameBoardElement.innerHTML = '';
    
    const selectedWord = validFourLetterWords[Math.floor(Math.random() * validFourLetterWords.length)];
    const isHorizontal = Math.random() < 0.5;
    const startRow = isHorizontal ? Math.floor(Math.random() * 4) : 0;
    const startCol = isHorizontal ? 0 : Math.floor(Math.random() * 4);
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        let letter;
        
        if (isHorizontal && row === startRow && col >= startCol && col < startCol + 4) {
            letter = selectedWord[col - startCol];
        } else if (!isHorizontal && col === startCol && row >= startRow && row < startRow + 4) {
            letter = selectedWord[row - startRow];
        } else {
            letter = letters.charAt(Math.floor(Math.random() * letters.length));
        }
        
        gameBoard.push(letter);
        
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.dataset.index = i;
        gameBoardElement.appendChild(letterElement);
    }
}

// Habilitar interacción con el tablero
function enableBoardInteraction() {
    const letters = document.getElementsByClassName('letter');
    for (let letter of letters) {
        letter.addEventListener('click', selectLetter);
        letter.classList.add('selectable');
    }
}

// Selección de letra
function selectLetter() {
    const index = parseInt(this.dataset.index);
    if (isValidSelection(index)) {
        this.classList.add('selected');
        this.classList.remove('selectable');
        currentWord += this.textContent;
        updateCurrentWordDisplay();
        lastSelectedIndex = index;
        updateSelectableLetters();
    }
}

function updateSelectableLetters() {
    const letters = document.getElementsByClassName('letter');
    for (let letter of letters) {
        letter.classList.remove('selectable');
    }
    if (lastSelectedIndex !== -1) {
        const selectableCells = getAdjacentCells(lastSelectedIndex);
        for (let index of selectableCells) {
            if (!letters[index].classList.contains('selected')) {
                letters[index].classList.add('selectable');
            }
        }
    }
}


function isValidSelection(index) {
    if (lastSelectedIndex === -1) return true;
    return getAdjacentCells(lastSelectedIndex).includes(index);
}
// Actualizar visualización de la palabra actual
function updateCurrentWordDisplay() {
    currentWordElement.textContent = currentWord;
}


// Envío de palabra
async function submitWord() {
    if (currentWord.length < 3) {
        showError('La palabra debe tener al menos 3 letras.');
        return;
    }
    
    if (isWordRepeated(currentWord)) {
        showError('Esta palabra ya ha sido encontrada. Pierdes 1 punto.');
        updateScore(-1);
        clearCurrentWord();
        return;
    }
    
    const isValid = await isValidWord(currentWord);
    
    if (isValid) {
        const wordScore = calculateScore(currentWord);
        updateScore(wordScore);
        
        const wordItem = document.createElement('li');
        wordItem.textContent = currentWord + ' (' + wordScore + ' puntos)';
        foundWordsElement.appendChild(wordItem);
        
        showSuccess('¡Palabra correcta! Has ganado ' + wordScore + ' puntos.');
    } else {
         showError('Palabra incorrecta. Pierdes 1 punto.');
        updateScore(-1);
    }
    
    clearCurrentWord();
}

function showError(message) {
    showMessage(message, 'error');
}

// Función para mostrar un mensaje de éxito
function showSuccess(message) {
    showMessage(message, 'success');
}

// Función para mostrar un mensaje
function showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = type;
    messageElement.classList.remove('hidden');
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 3000);
}

// Función para actualizar la puntuación
function updateScore(points) {
    score += points;
    score = Math.max(0, score); // Evita que la puntuación sea negativa
    updateScoreDisplay();
}

// Función para verificar si una palabra ya ha sido encontrada
function isWordRepeated(word) {
    const foundWords = foundWordsElement.getElementsByTagName('li');
    for (let item of foundWords) {
        if (item.textContent.toUpperCase().startsWith(word.toUpperCase())) {
            return true;
        }
    }
    return false;
}

// Limpiar palabra actual
function clearCurrentWord() {
    currentWord = '';
    updateCurrentWordDisplay();
    const letters = document.getElementsByClassName('letter');
    for (let letter of letters) {
        letter.classList.remove('selected');
        letter.classList.add('selectable');
    }
    lastSelectedIndex = -1;
}


// Validación de palabra
async function isValidWord(word) {
    word = word.toUpperCase();
    
    if (word.length < 3) return false;
    
    if (!canFormWordOnBoard(word)) return false;
    
    const foundWords = foundWordsElement.getElementsByTagName('li');
    for (let item of foundWords) {
        if (item.textContent.toUpperCase().startsWith(word)) return false;
    }
    
    return await checkWordInDictionary(word);
}

// Verificar si la palabra se puede formar en el tablero
function canFormWordOnBoard(word) {
    for (let i = 0; i < gameBoard.length; i++) {
        if (canFormWordFromCell(word, i, [])) return true;
    }
    return false;
}

function canFormWordFromCell(word, cellIndex, usedCells) {
    if (word.length === 0) return true;
    
    if (cellIndex < 0 || cellIndex >= gameBoard.length || usedCells.includes(cellIndex)) return false;
    
    if (gameBoard[cellIndex] !== word[0]) return false;
    
    const newUsedCells = [...usedCells, cellIndex];
    const remainingWord = word.slice(1);
    
    const adjacentCells = getAdjacentCells(cellIndex);
    for (let adjacent of adjacentCells) {
        if (canFormWordFromCell(remainingWord, adjacent, newUsedCells)) return true;
    }
    
    return false;
}

function getAdjacentCells(cellIndex) {
    const row = Math.floor(cellIndex / 4);
    const col = cellIndex % 4;
    const adjacent = [];
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                adjacent.push(newRow * 4 + newCol);
            }
        }
    }
    
    return adjacent;
}

// Verificar palabra en el diccionario (API)
async function checkWordInDictionary(word) {
    word = word.toLowerCase();
    
    if (word in wordCache) return wordCache[word];

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const isValid = response.ok;
        wordCache[word] = isValid;
        return isValid;
    } catch (error) {
        return false;
    }
}

// Calcular puntuación de la palabra
function calculateScore(word) {
    const length = word.length;
    if (length <= 4) return 1;
    if (length === 5) return 2;
    if (length === 6) return 3;
    if (length === 7) return 5;
    return 11; // 8 letras o más
}

// Actualizar visualización de la puntuación
function updateScoreDisplay() {
    scoreElement.textContent = score;
}

// Iniciar temporizador
function startTimer() {
    let timeLeft = parseInt(timerSelector.value);
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

// Finalizar juego
function endGame() {
    disableBoardInteraction();
    showMessage(`¡Tiempo terminado! Tu puntuación final es: ${score}`, 'info');
    showElement(document.getElementById('playerInfo'));
    hideElement(gameBoardElement);
    hideElement(document.getElementById('wordInfo'));
    hideElement(document.getElementById('scoreInfo'));
    hideElement(timerDisplay);
    hideElement(reshuffleButton);
}

// Reordenar tablero
function reshuffleBoard() {
    generateBoard();
    clearCurrentWord();
    enableBoardInteraction();
    showMessage('Tablero reordenado. ¡Buena suerte!', 'info');
}

// Funciones auxiliares
function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function disableBoardInteraction() {
    const letters = document.getElementsByClassName('letter');
    for (let letter of letters) {
        letter.removeEventListener('click', selectLetter);
    }
}

// Inicializar el juego cuando se carga la página
window.addEventListener('load', initializeGame);
