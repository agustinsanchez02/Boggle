'use strict';

var gameBoard;
var currentWord = '';
var score = 0;
var timer;
var playerName = '';

function initializeGame() {
    var startButton = document.getElementById('startGame');
    startButton.addEventListener('click', startGame);
}

function startGame() {
    playerName = document.getElementById('playerName').value;
    if (playerName.length < 3) {
        alert('El nombre del jugador debe tener al menos 3 letras.');
        return;
    }
    
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
    submitButton.addEventListener('click', submitWord);
}

function selectLetter() {
    this.classList.add('selected');
    currentWord += this.textContent;
    document.getElementById('currentWord').textContent = currentWord;
}

function submitWord() {
    if (currentWord.length < 3) {
        alert('La palabra debe tener al menos 3 letras.');
        return;
    }
    
    // Aquí iría la lógica para validar la palabra y actualizar la puntuación
    
    var wordList = document.getElementById('foundWords');
    var wordItem = document.createElement('li');
    wordItem.textContent = currentWord;
    wordList.appendChild(wordItem);
    
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
    // Aquí iría la lógica para guardar la puntuación y reiniciar el juego
}

window.addEventListener('load', initializeGame);