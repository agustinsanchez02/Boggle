'use strict';

var gameBoard;
var currentWord = '';
var score = 0;
var timer;
var playerName = '';


function initializeGame() {
    var startButton = document.getElementById('startGame');
    startButton.addEventListener('click', startGame);
    
    var reshuffleButton = document.getElementById('reshuffleBoard');
    reshuffleButton.addEventListener('click', reshuffleBoard);

    var clearButton = document.getElementById('clearWord');
    clearButton.addEventListener('click', clearCurrentWord);
    
}

function clearCurrentWord() {
    resetCurrentWord();
    updateCurrentWordDisplay();
}

function resetCurrentWord() {
    currentWord = '';
    var selectedLetters = document.getElementsByClassName('selected');
    while (selectedLetters.length > 0) {
        selectedLetters[0].classList.remove('selected');
    }
    updateCurrentWordDisplay();
}

function updateCurrentWordDisplay() {
    document.getElementById('currentWord').textContent = currentWord;
}

function selectLetter() {
    if (!this.classList.contains('selected')) {
        this.classList.add('selected');
        currentWord += this.textContent;
        updateCurrentWordDisplay();
    }
}

function startGame() {
    playerName = document.getElementById('playerName').value;
    if (playerName.length < 3) {
        alert('El nombre del jugador debe tener al menos 3 letras.');
        return;
    }
    
    // Ocultar la sección de entrada del nombre del jugador
    document.getElementById('playerInfo').classList.add('hidden');
    
      // Mostrar los elementos del juego
      var hiddenElements = document.querySelectorAll('.hidden');
      hiddenElements.forEach(function(element) {
          element.classList.remove('hidden');
      });
  
      document.getElementById('clearWord').classList.remove('hidden');
    
    generateBoard();
    startTimer();
    enableBoardInteraction();
}

function generateBoard() {
    gameBoard = [];
    var boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 16; i++) {
        var letter = letters.charAt(Math.floor(Math.random() * letters.length));
        gameBoard.push(letter);
        
        var letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.dataset.index = i;
        boardElement.appendChild(letterElement);
    }
}

function enableBoardInteraction() {
    var letters = document.getElementsByClassName('letter');
    for (var i = 0; i < letters.length; i++) {
        letters[i].addEventListener('click', selectLetter);
    }
    
    var submitButton = document.getElementById('submitWord');
    submitButton.addEventListener('click', async function() {
        await submitWord();
    });

    var clearButton = document.getElementById('clearWord');
    clearButton.addEventListener('click', clearCurrentWord);
}

function selectLetter() {
    this.classList.add('selected');
    currentWord += this.textContent;
    document.getElementById('currentWord').textContent = currentWord;
}

async function submitWord() {
    if (currentWord.length < 3) {
        alert('La palabra debe tener al menos 3 letras.');
        resetCurrentWord();
        return;
    }
    
    const isValid = await isValidWord(currentWord);
    
    if (isValid) {
        var wordScore = calculateScore(currentWord);
        score += wordScore;
        document.getElementById('score').textContent = score;
        
        var wordList = document.getElementById('foundWords');
        var wordItem = document.createElement('li');
        wordItem.textContent = currentWord + ' (' + wordScore + ' puntos)';
        wordList.appendChild(wordItem);
    } else {
        alert('Palabra inválida. Pierdes 1 punto.');
        score = Math.max(0, score - 1);
        document.getElementById('score').textContent = score;
    }
    
    resetCurrentWord();
}

function resetCurrentWord() {
    currentWord = '';
    document.getElementById('currentWord').textContent = '';
    var selectedLetters = document.getElementsByClassName('selected');
    while (selectedLetters.length > 0) {
        selectedLetters[0].classList.remove('selected');
    }
}

function startTimer() {
    var timeLeft = 180; // 3 minutos
    var timerElement = document.getElementById('time');
    
    timer = setInterval(function() {
        var minutes = parseInt(timeLeft / 60, 10);
        var seconds = parseInt(timeLeft % 60, 10);
        
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        timerElement.textContent = minutes + ":" + seconds;
        
        if (--timeLeft < 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    alert('¡Tiempo terminado! Tu puntuación final es: ' + score);
}

window.addEventListener('load', initializeGame);

function endGame() {
    clearInterval(timer);
    saveScore();
    alert('¡Tiempo terminado! Tu puntuación final es: ' + score);
    showHighScores();
    resetGame();
}

function saveScore() {
    var gameResult = {
        playerName: playerName,
        score: score,
        date: new Date().toISOString()
    };
    
    var highScores = JSON.parse(localStorage.getItem('boogleHighScores')) || [];
    highScores.push(gameResult);
    highScores.sort(function(a, b) { return b.score - a.score; });
    highScores = highScores.slice(0, 10); // Mantener solo los 10 mejores puntajes
    
    localStorage.setItem('boogleHighScores', JSON.stringify(highScores));
}

function showHighScores() {
    var highScores = JSON.parse(localStorage.getItem('boogleHighScores')) || [];
    var scoreList = 'Mejores puntuaciones:\n\n';
    
    for (var i = 0; i < highScores.length; i++) {
        scoreList += (i + 1) + '. ' + highScores[i].playerName + ': ' + highScores[i].score + ' puntos\n';
    }
    
    alert(scoreList);
}

function resetGame() {
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('foundWords').innerHTML = '';
    document.getElementById('playerName').value = '';
    document.getElementById('currentWord').textContent = '';
    document.getElementById('time').textContent = '03:00';
    
    var gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Ocultar los elementos del juego
    var gameElements = document.querySelectorAll('#gameBoard, #reshuffleBoard, #wordInfo, #scoreInfo, #timer, #wordList');
    gameElements.forEach(function(element) {
        element.classList.add('hidden');
    });
    
    // Mostrar la sección de entrada del nombre del jugador
    document.getElementById('playerInfo').classList.remove('hidden');
    
    var startButton = document.getElementById('startGame');
    startButton.disabled = false;
}

async function isValidWord(word) {
    word = word.toUpperCase();
    
    if (word.length < 3) {
        console.log('Palabra rechazada: menos de 3 letras');
        return false;
    }
    
    if (!canFormWordOnBoard(word)) {
        console.log('Palabra rechazada: no se puede formar en el tablero');
        return false;
    }
    
    var foundWords = document.getElementById('foundWords').getElementsByTagName('li');
    for (var i = 0; i < foundWords.length; i++) {
        if (foundWords[i].textContent.toUpperCase().startsWith(word)) {
            console.log('Palabra rechazada: ya ha sido encontrada');
            return false;
        }
    }
    
    // Verificar la palabra en el diccionario en línea
    const isInDictionary = await checkWordInDictionary(word);
    console.log('¿La palabra está en el diccionario?', isInDictionary);
    return isInDictionary;
}

function canFormWordOnBoard(word) {
    for (var i = 0; i < gameBoard.length; i++) {
        if (canFormWordFromCell(word, i, [])) {
            return true;
        }
    }
    return false;
}

function canFormWordFromCell(word, cellIndex, usedCells) {
    if (word.length === 0) {
        return true;
    }
    
    if (cellIndex < 0 || cellIndex >= gameBoard.length || usedCells.indexOf(cellIndex) !== -1) {
        return false;
    }
    
    if (gameBoard[cellIndex] !== word[0]) {
        return false;
    }
    
    var newUsedCells = usedCells.concat([cellIndex]);
    var remainingWord = word.slice(1);
    
    var adjacentCells = getAdjacentCells(cellIndex);
    for (var i = 0; i < adjacentCells.length; i++) {
        if (canFormWordFromCell(remainingWord, adjacentCells[i], newUsedCells)) {
            return true;
        }
    }
    
    return false;
}

function getAdjacentCells(cellIndex) {
    var row = Math.floor(cellIndex / 4);
    var col = cellIndex % 4;
    var adjacent = [];
    
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            var newRow = row + i;
            var newCol = col + j;
            if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                adjacent.push(newRow * 4 + newCol);
            }
        }
    }
    
    return adjacent;
}
function calculateScore(word) {
    var length = word.length;
    if (length <= 4) return 1;
    if (length === 5) return 2;
    if (length === 6) return 3;
    if (length === 7) return 5;
    return 11; // 8 letras o más
}

function reshuffleBoard() {
    var letters = gameBoard.slice();
    gameBoard = [];
    var boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    
    while (letters.length > 0) {
        var index = Math.floor(Math.random() * letters.length);
        var letter = letters.splice(index, 1)[0];
        gameBoard.push(letter);
        
        var letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.dataset.index = gameBoard.length - 1;
        boardElement.appendChild(letterElement);
    }
    
    enableBoardInteraction();
}

function checkWordInDictionary(word) {
    return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Palabra no encontrada');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de la API para la palabra', word, ':', data);
            return true; // Si llegamos aquí, la palabra existe
        })
        .catch(error => {
            console.error('Error al verificar la palabra:', error);
            return false;
        });
}