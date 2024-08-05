'use strict';

const wordCache = {};
var gameBoard;
var currentWord = '';
var score = 0;
var timer;
var playerName = '';
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

function preloadValidWords() {
    validFourLetterWords.forEach(word => {
        wordCache[word.toLowerCase()] = true;
    });
    console.log('Palabras válidas precargadas en caché');
}


function initializeGame() {
    var startButton = document.getElementById('startGame');
    startButton.addEventListener('click', startGame);
    
    var reshuffleButton = document.getElementById('reshuffleBoard');
    reshuffleButton.addEventListener('click', reshuffleBoard);

    var submitButton = document.getElementById('submitWord');
    submitButton.addEventListener('click', submitWord);

    var clearButton = document.getElementById('clearWord');
    clearButton.addEventListener('click', clearCurrentWord);
    
    preloadValidWords();

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

   // Ocultar el selector de tiempo y mostrar el temporizador
   document.getElementById('timerSelector').style.display = 'none';
   document.getElementById('timerDisplay').style.display = 'block';
    
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
    
    // Seleccionar una palabra aleatoria de 4 letras
    var selectedWord = validFourLetterWords[Math.floor(Math.random() * validFourLetterWords.length)];
    
    // Determinar una posición aleatoria para la palabra (horizontal o vertical)
    var isHorizontal = Math.random() < 0.5;
    var startRow = isHorizontal ? Math.floor(Math.random() * 4) : 0;
    var startCol = isHorizontal ? 0 : Math.floor(Math.random() * 4);
    
    // Llenar el tablero con letras aleatorias
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 16; i++) {
        var row = Math.floor(i / 4);
        var col = i % 4;
        var letter;
        
        // Colocar la palabra seleccionada
        if (isHorizontal && row === startRow && col >= startCol && col < startCol + 4) {
            letter = selectedWord[col - startCol];
        } else if (!isHorizontal && col === startCol && row >= startRow && row < startRow + 4) {
            letter = selectedWord[row - startRow];
        } else {
            letter = letters.charAt(Math.floor(Math.random() * letters.length));
        }
        
        gameBoard.push(letter);
        
        var letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.dataset.index = i;
        boardElement.appendChild(letterElement);
    }
    
    console.log("Palabra válida en el nuevo tablero:", selectedWord);
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
    console.log("Palabra enviada:", currentWord);
    if (currentWord.length < 3) {
        resetCurrentWord();
        return;
    }
    
    const isValid = await isValidWord(currentWord);
    console.log("¿Es válida la palabra?", isValid);
    
    if (isValid) {
        var wordScore = calculateScore(currentWord);
        score += wordScore;
        document.getElementById('score').textContent = score;
        
        var wordList = document.getElementById('foundWords');
        var wordItem = document.createElement('li');
        wordItem.textContent = currentWord + ' (' + wordScore + ' puntos)';
        wordList.appendChild(wordItem);
        console.log("Palabra aceptada y puntuación actualizada");
    } else {
        alert('Palabra inválida. Pierdes 1 punto.');
        score = Math.max(0, score - 1);
        document.getElementById('score').textContent = score;
        console.log("Palabra rechazada, puntuación reducida");
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
    var timeLeft = parseInt(document.getElementById('gameTime').value);
    var timerElement = document.getElementById('time');
    
    // Limpiar el temporizador existente si lo hay
    if (timer) {
        clearInterval(timer);
    }
    
    function updateTimerDisplay() {
        var minutes = Math.floor(timeLeft / 60);
        var seconds = timeLeft % 60;
        
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        
        timerElement.textContent = minutes + ":" + seconds;
    }
    
    updateTimerDisplay(); // Actualizar inmediatamente para mostrar el tiempo inicial
    
    timer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
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
    var selectedTime = parseInt(document.getElementById('gameTime').value);
    var timePlayed = selectedTime - parseInt(document.getElementById('time').textContent.split(':')[0]) * 60 - parseInt(document.getElementById('time').textContent.split(':')[1]);
    var minutes = Math.floor(timePlayed / 60);
    var seconds = timePlayed % 60;
    
    alert('¡Tiempo terminado! Tu puntuación final es: ' + score + '\nTiempo jugado: ' + minutes + ' minutos y ' + seconds + ' segundos');
    
    saveScore();
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
    
    // Mostrar el selector de tiempo y ocultar el temporizador
    document.getElementById('timerSelector').style.display = 'block';
    document.getElementById('timerDisplay').style.display = 'none';
    
    var gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    var startButton = document.getElementById('startGame');
    startButton.disabled = false;
    
    // Reiniciar el temporizador
    if (timer) {
        clearInterval(timer);
    }
    document.getElementById('time').textContent = '00:00';
}

async function isValidWord(word) {
    word = word.toUpperCase();
    
    console.log("Verificando palabra:", word);
    console.log("Tablero actual:", gameBoard);

    if (word.length < 3) {
        console.log('Palabra rechazada: menos de 3 letras');
        return false;
    }
    
    const canForm = canFormWordOnBoard(word);
    console.log('¿Se puede formar la palabra en el tablero?', canForm);
    if (!canForm) {
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
    
    // Verificar la palabra en el diccionario (usando caché si está disponible)
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
    // Generar un nuevo tablero
    generateBoard();
    
    // Limpiar la palabra actual
    resetCurrentWord();
    
    // Volver a habilitar la interacción con el tablero
    enableBoardInteraction();
    
    console.log("Nuevo tablero generado y habilitado");
}

async function checkWordInDictionary(word) {
    word = word.toLowerCase();
    
    // Verificar si la palabra está en el caché
    if (word in wordCache) {
        console.log('Palabra encontrada en caché:', word, wordCache[word]);
        return wordCache[word];
    }

    console.log('Consultando API para la palabra:', word);
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const isValid = response.ok;
        
        // Almacenar el resultado en el caché
        wordCache[word] = isValid;
        
        console.log('Respuesta de la API para', word, ':', isValid ? 'Válida' : 'Inválida');
        return isValid;
    } catch (error) {
        console.error('Error al verificar la palabra:', error);
        return false;
    }
}