// -- Elements
const cells = document.querySelectorAll('.cell');
const xPlayer = document.querySelector('#xPlayer');
const oPlayer = document.querySelector('#oPlayer');
const titleHeader = document.querySelector('#titleHeader');
const restartBtn = document.querySelector('#restartBtn');
const singleBtn = document.querySelector('#singleBtn');
const twoBtn = document.querySelector('#twoBtn');

// -- Variables for game
let player = 'X';
let isPauseGame = false;
let isGameStart = false;
let singlePlayer = false; 

// -- Board state
const inputCells = ['', '', '', '', '', '', '', '', ''];
const winConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];
// -- Mode selection
if (singleBtn && twoBtn) {
  twoBtn.classList.add('active');
  singleBtn.addEventListener('click', () => {
    if (singlePlayer)
      return;
    singlePlayer = true;
    singleBtn.classList.add('active');
    twoBtn.classList.remove('active');
    restartGame();
    titleHeader.textContent = 'Single Player';
  });
  twoBtn.addEventListener('click', () => {
    if (!singlePlayer) 
      return;
    singlePlayer = false;
    singleBtn.classList.remove('active');
    twoBtn.classList.add('active');
    restartGame();
    titleHeader.textContent = 'Two Player';
  });
}
function computerMove() {
  const emptyIndices = inputCells
    .map((v, i) => (v === '' ? i : -1))
    .filter(i => i !== -1);
  if (emptyIndices.length === 0)
    return;
  // -- Evaluate board 
  function evaluateBoard(board) {
    for (const [a, b, c] of winConditions) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return board[a];
      }
    }
    return board.every(cell => cell !== '') ? 'draw' : null;
  }
 //-- Minimax algorithm 
 function minimax(board, isMaximizing) {
  const result = evaluateBoard(board);
  if(result === 'O') return 10; //comuter wins
  if(result === 'X') return -10; // human wins
  if(result === 'draw') return 0; // draw

  if(isMaximizing) {
    let bestScore = -Infinity;
    for(let i = 0; i < board.length; i++) {
      if(board[i] === '') {
        board[i] = 'O';
        const score = minimax(board, false);
        board[i] = '';
        bestScore = Math.max(bestScore, score);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for(let i = 0; i < board.length; i++) {
      if(board[i] === '') {
        board[i] = 'X';
        const score = minimax(board, true);
        board[i] = '';
        bestScore = Math.min(bestScore, score);
      }
    }
    return bestScore;
  }
}
//find best move for computer
let bestScore = -Infinity;
let bestMove = null;
for (const idx of emptyIndices) {
  inputCells[idx] = 'O';
  let score = minimax(inputCells, false);
  inputCells[idx] = '';
  if (score > bestScore) {
    bestScore = score;
    bestMove = idx;
  }
}
// fallback to random move if no best move found
const moveIndex = (bestMove !== null ) ? bestMove : emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
//-- perform move --
updateCell(cells[moveIndex], moveIndex);
//-- check results --
if (checkWinner())
  return;
if (inputCells.every(c => c !== '')) {
  declareDraw();
  return;
 }
 changePlayer();
}

// -- Main handlers 
function tapCell(cell, index) {
  if (inputCells[index] !== '' || isPauseGame) 
    return;
  isGameStart = true;
  updateCell(cell, index);
  
  if (checkWinner()) 
    return; 

  if (inputCells.every(c => c !== '')) {
    declareDraw();
    return;
  }

  changePlayer();

    if (singlePlayer && player === 'O') {
    isPauseGame = true;
    setTimeout(() => {
       computerMove();
      isPauseGame = false;
    }, 300);
  }
}

function updateCell(cell, index) {
  cell.textContent = player;
  inputCells[index] = player;
  cell.style.color = (player === 'X') ? '#17bee8' : '#c184f0';
  
  titleHeader.textContent = `${player}'s turn`;
}

function changePlayer() {
  player = (player === 'X') ? 'O' : 'X';
  titleHeader.textContent = `${player}'s turn`;
}

function checkWinner() {
  for (const [a, b, c] of winConditions) {
    if (
      inputCells[a] === player &&
      inputCells[b] === player &&
      inputCells[c] === player
    ) {
      declareWinner([a, b, c]);
      return true;
    }
  }
  return false;
}

function declareWinner(winningIndices) {
  titleHeader.textContent = `${player} Wins!`;
  isPauseGame = true;
  winningIndices.forEach(i => {
    cells[i].style.backgroundColor = '#2A2343';
  });
  restartBtn.style.visibility = 'visible';
}

function declareDraw() {
  titleHeader.textContent = 'Draw!';
  isPauseGame = true;
  restartBtn.style.visibility = 'visible';
}

function choosePlayer(selectedPlayer) {
  if (!isGameStart) {
    player = selectedPlayer;
    xPlayer.classList.toggle('player-active', player === 'X');
    oPlayer.classList.toggle('player-active', player === 'O');
    titleHeader.textContent = `${player}'s turn`;
  }
}

function restartGame() {
  inputCells.fill('');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.style.backgroundColor = '';
    cell.style.color = '';
  });
  isPauseGame = false;
  isGameStart = false;
  player = 'X';
  titleHeader.textContent = 'Choose';
  restartBtn.style.visibility = 'hidden';
  xPlayer.classList.remove('player-active');
  oPlayer.classList.remove('player-active');
}

// -- Event delegation and listeners 
const boardEl = document.querySelector('#board');
  if (boardEl) {
  boardEl.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell');
  if(!cell) return;
  const index = Array.from(cells).indexOf(cell);
  if(index === -1)
    return;
  tapCell(cell, index);
 });
}   
restartBtn.addEventListener('click', restartGame);
xPlayer.addEventListener('click', () => choosePlayer('X'));
oPlayer.addEventListener('click', () => choosePlayer('O'));
