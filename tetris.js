// Constants and Variables
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const blockSize = 32;
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');

let level = 1;
let isPaused = false;

// Tetris Pieces
const pieces = [
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 1, 1, 1],
    ],
  ];
  function createPiece() {
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return piece;
  }
  let nextPiece = createPiece();
  function rotate(piece) {
    const rows = piece.length;
    const cols = piece[0].length;
    const rotated = Array.from({ length: cols }, () => new Array(rows).fill(0));
  
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        rotated[col][rows - row - 1] = piece[row][col];
      }
    }
  
    return rotated;
  }
  
  function createBoard(width, height) {
    const board = Array.from({ length: height }, () =>
      new Array(width).fill(0)
    );
    return board;
  }
  // Add a function to handle game over
function gameOver() {
    gameOverDisplay.style.display = 'block';
    document.addEventListener('keydown', handleGameOver);
  }
// Add a function to handle restarting the game
function handleGameOver(event) {
    if (event.key === 'Enter') {
      document.removeEventListener('keydown', handleGameOver);
      gameOverDisplay.style.display = 'none';
      resetGame();
    }
  }
  // Add a function to reset the game state
function resetGame() {
    board = createBoard(10, 20);
    currentPiece = createPiece();
    currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
    score = 0;
    dropCounter = 0;
    dropInterval = 500;
    lastTime = 0;
  }  
  function collide(piece, board, position) {
    for (let row = 0; row < piece.length; ++row) {
      for (let col = 0; col < piece[row].length; ++col) {
        if (
          piece[row][col] &&
          (board[row + position.y] &&
            board[row + position.y][col + position.x]) !== 0
        ) {
          return true;
        }
      }
    }
  
    return false;
  }
  
  
  function merge(piece, board, position) {
    for (let row = 0; row < piece.length; ++row) {
      for (let col = 0; col < piece[row].length; ++col) {
        if (piece[row][col]) {
          board[row + position.y][col + position.x] = piece[row][col];
        }
      }
    }
  }
  
  
  function isValidMove(piece, board, position) {
    for (let row = 0; row < piece.length; ++row) {
      for (let col = 0; col < piece[row].length; ++col) {
        const newRow = position.y + row;
        const newCol = position.x + col;
  
        if (piece[row][col] && (board[newRow] === undefined || board[newRow][newCol] === undefined || board[newRow][newCol])) {
          return false;
        }
      }
    }
  
    return true;
  }
  
    
  function clearLines() {
    let linesCleared = 0;
  
    outer: for (let row = board.length - 1; row >= 0; --row) {
      for (let col = 0; col < board[row].length; ++col) {
        if (board[row][col] === 0) {
          continue outer;
        }
      }
  
      const fullLine = board.splice(row, 1)[0].fill(0);
      board.unshift(fullLine);
      linesCleared++;
    }
  
    return linesCleared;
  }
  
  function calculateScore(linesCleared) {
    const lineScores = {
      1: 40,
      2: 100,
      3: 300,
      4: 1200,
    };
  
    return lineScores[linesCleared] || 0;
  }
  
// Game Functions
function drawNextPiece() {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
  
    for (let row = 0; row < nextPiece.length; ++row) {
      for (let col = 0; col < nextPiece[row].length; ++col) {
        if (nextPiece[row][col]) {
          nextPieceCtx.fillStyle = 'white';
          nextPieceCtx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
          nextPieceCtx.strokeStyle = 'black';
          nextPieceCtx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
      }
    }
  }
  
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Draw the game board
    for (let row = 0; row < board.length; ++row) {
      for (let col = 0; col < board[row].length; ++col) {
        if (board[row][col]) {
          ctx.fillStyle = 'white';
          ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
      }
    }
  
    // Draw the current piece
    for (let row = 0; row < currentPiece.length; ++row) {
      for (let col = 0; col < currentPiece[row].length; ++col) {
        if (currentPiece[row][col]) {
          ctx.fillStyle = 'white';
          ctx.fillRect(
            (currentPosition.x + col) * blockSize,
            (currentPosition.y + row) * blockSize,
            blockSize,
            blockSize
          );
          ctx.strokeStyle = 'black';
          ctx.strokeRect(
            (currentPosition.x + col) * blockSize,
            (currentPosition.y + row) * blockSize,
            blockSize,
            blockSize
          );
        }
      }
    }
  }
  

  let dropCounter = 0;
  let dropInterval = 500;
  let lastTime = 0;
  
  function update(time = 0) {
    if (!isPaused) {
    const deltaTime = time - lastTime;
    lastTime = time;
  
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      const newPosition = { ...currentPosition, y: currentPosition.y + 1 };
      if (isValidMove(currentPiece, board, newPosition)) {
        currentPosition = newPosition;
      } else {
        merge(currentPiece, board, currentPosition);
        const linesCleared = clearLines();
        score += calculateScore(linesCleared);
        currentPiece = createPiece();
        currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
        
        scoreDisplay.textContent = `Score: ${score}`;
        requestAnimationFrame(update);

        // Check for game over
        if (collide(currentPiece, board, currentPosition)) {
          // Handle game over (e.g., display a message, reset the game)
        }
      }
      dropCounter = 0;

    }
  
    draw();
    requestAnimationFrame(update);
     // Update the level based on the score
     level = Math.floor(score / 500) + 1;
     dropInterval = 1000 - (level - 1) * 100;
 
     // Update the level display
     document.getElementById('level').textContent = `Level: ${level}`;
    }
    
    drawNextPiece();
    setTimeout(update, 1000 / 30);
    //requestAnimationFrame(update);
  }
  

  

function loop() {
    // Main game loop
    update();
    draw();
    requestAnimationFrame(loop);
}
let holdPiece = null;
let canHold = true;

document.addEventListener('keydown', (event) => {
    
    if (event.key === 'ArrowLeft') {
      const newPosition = { ...currentPosition, x: currentPosition.x - 1 };
      if (isValidMove(currentPiece, board, newPosition)) {
        currentPosition = newPosition;
      }
    } else if (event.key === 'ArrowRight') {
      const newPosition = { ...currentPosition, x: currentPosition.x + 1 };
      if (isValidMove(currentPiece, board, newPosition)) {
        currentPosition = newPosition;
      }
    } else  if (event.key === ' ') {
        hardDrop();
      }else if (event.key === 'ArrowDown') {
      const newPosition = { ...currentPosition, y: currentPosition.y + 1 };
      if (isValidMove(currentPiece, board, newPosition)) {
        currentPosition = newPosition;
      } else {
        merge(currentPiece, board, currentPosition);
        currentPiece = createPiece();
        currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
      }
    } else if (event.key === 'ArrowUp') {
      const rotatedPiece = rotate(currentPiece);
      if (isValidMove(rotatedPiece, board, currentPosition)) {
        currentPiece = rotatedPiece;
      }
    }else if (event.key === 'p') {
        isPaused = !isPaused;
      }else  if (event.key === 'z' || event.key === 'x') {
        const rotatedPiece = rotate(currentPiece, event.key === 'c' ? 1 : -1);
        if (isValidMove(rotatedPiece, board, currentPosition)) {
          currentPiece = rotatedPiece;
        }
      }else if (event.key === 'c') {
        if (holdPiece === null) {
          holdPiece = currentPiece;
          currentPiece = nextPiece;
          nextPiece = createPiece();
          currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
        } else if (canHold) {
          [holdPiece, currentPiece] = [currentPiece, holdPiece];
          currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
        }
        canHold = false;
      }
  });
  document.addEventListener('keyup', (event) => {
    if (event.key === 'c') {
      canHold = true;
    }
  });
  function hardDrop() {
    while (isValidMove(currentPiece, board, { ...currentPosition, y: currentPosition.y + 1 })) {
      currentPosition.y++;
    }
    merge(currentPiece, board, currentPosition);
    const linesCleared = clearLines();
    score += calculateScore(linesCleared);
    currentPiece = nextPiece;
    nextPiece = createPiece();
    currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
  }
  
// Initialize game state
const board = createBoard(10, 20);
let currentPiece = createPiece();
let currentPosition = { x: Math.floor(board[0].length / 2) - 1, y: 0 };
let score = 0;

// Start the Game
loop();

update();