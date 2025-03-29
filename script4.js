const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameOverDisplay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const particlesContainer = document.getElementById('particles');

function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gridSize = Math.floor(Math.min(canvas.width, canvas.height) / 25);
    tileCountX = Math.floor(canvas.width / gridSize);
    tileCountY = Math.floor(canvas.height / gridSize);
}

let gridSize;
let tileCountX, tileCountY;
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let snake = [
    {x: Math.floor(tileCountX/2), y: Math.floor(tileCountY/2)}
];
let velocityX = 0;
let velocityY = 0;
let foodX = 5;
let foodY = 5;
let score = 0;
let gameSpeed = 7;
let gameRunning = true;
let gamePaused = false;
let gameLoop;

const snakeColor = '#4CAF50';
const foodColor = '#FF5252';
const headColor = '#2E7D32';
const bgColor = '#121212';

function createParticles() {
    particlesContainer.innerHTML = '';
    const particleCount = Math.floor(window.innerWidth / 10);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
    }
}

function initGame() {
    snake = [{x: Math.floor(tileCountX/2), y: Math.floor(tileCountY/2)}];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameRunning = true;
    gamePaused = false;
    gameOverDisplay.style.display = 'none';
    gameSpeed = 7;
    placeFood();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 1000 / gameSpeed);
}

function drawGame() {
    if (gamePaused || !gameRunning) return;
    
    ctx.fillStyle = 'rgba(18, 18, 18, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.arc(
        foodX * gridSize + gridSize/2, 
        foodY * gridSize + gridSize/2, 
        gridSize/2, 
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = foodColor;
    ctx.fill();
    
    ctx.shadowColor = foodColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    for (let i = 0; i < snake.length; i++) {
        const isHead = i === 0;
        const segment = snake[i];
        
        ctx.beginPath();
        ctx.arc(
            segment.x * gridSize + gridSize/2, 
            segment.y * gridSize + gridSize/2, 
            gridSize/2, 
            0, 
            Math.PI * 2
        );
        ctx.fillStyle = isHead ? headColor : snakeColor;
        ctx.fill();
        
        if (isHead) {
            ctx.shadowColor = headColor;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
    
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        gameOver();
        return;
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === foodX && head.y === foodY) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        placeFood();
        
        if (score % 5 === 0) {
            gameSpeed += 1;
            clearInterval(gameLoop);
            gameLoop = setInterval(drawGame, 1000 / gameSpeed);
        }
    } else {
        snake.pop();
    }
}
function placeFood() {
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * tileCountX);
        foodY = Math.floor(Math.random() * tileCountY);
        
        validPosition = true;
        
        for (let segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
}
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreDisplay.textContent = `Final Score: ${score}`;
    gameOverDisplay.style.display = 'flex';
}
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (!gamePaused) {
        drawGame();
    }
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (e.key === ' ' || e.key === 'Space') {
        togglePause();
        return;
    }
    
    if (gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
    }
});

restartBtn.addEventListener('click', initGame);
createParticles();
initGame();
