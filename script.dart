// Referências aos elementos do HTML
const dino = document.getElementById('dino');
const gameBoard = document.getElementById('game-board');
const ground = document.getElementById('ground');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');

// Variáveis de estado
let isJumping = false;
let isGameOver = false;
let score = 0;

// Constantes
const OBSTACLE_WIDTH = 60; // Largura do obstáculo (clouds.png)
const GAME_SPEED = 8;      // Velocidade de movimento dos obstáculos
const JUMP_DURATION = 600; // Duração do pulo em ms (deve ser igual ao CSS)

// --- Funções de Jogo ---

function jump() {
    if (isJumping || isGameOver) {
        return;
    }

    isJumping = true;
    dino.classList.add('jump');

    // Remove a classe 'jump' após a duração da animação
    setTimeout(() => {
        dino.classList.remove('jump');
        isJumping = false;
    }, JUMP_DURATION);
}

function generateObstacle() {
    if (isGameOver) return;

    // Cria o elemento do obstáculo (nuvem)
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameBoard.appendChild(obstacle);

    let obstaclePosition = 600; // Começa na borda direita
    
    // Move o obstáculo
    const moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval);
            return;
        }

        obstaclePosition -= GAME_SPEED;
        obstacle.style.right = obstaclePosition + 'px';

        // --- Detecção de Colisão ---
        // Pega as posições e dimensões exatas de ambos os elementos
        const dinoRect = dino.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        // Verifica a sobreposição nos eixos X e Y
        const collisionX = dinoRect.left < obstacleRect.right && dinoRect.right > obstacleRect.left;
        const collisionY = dinoRect.bottom > obstacleRect.top && dinoRect.top < obstacleRect.bottom;

        if (collisionX && collisionY) {
            // FIM DE JOGO
            isGameOver = true;
            clearInterval(moveInterval);
            ground.style.animationPlayState = 'paused'; // Para o movimento do chão
            
            // Pausa a animação de pulo, se houver
            dino.style.animation = 'none'; 
            
            finalScoreDisplay.innerText = score.toString().padStart(5, '0');
            gameOverScreen.classList.remove('hidden');
            
            // Remove todos os obstáculos restantes
            document.querySelectorAll('.obstacle').forEach(o => o.remove());
            return;
        }

        // Se o obstáculo sair da tela, remove e aumenta o score
        if (obstaclePosition < -OBSTACLE_WIDTH) {
            clearInterval(moveInterval);
            gameBoard.removeChild(obstacle);
            updateScore();
        }
    }, 20); // Atualiza a cada 20ms
}

function updateScore() {
    score++;
    scoreDisplay.innerText = score.toString().padStart(5, '0'); // Garante 5 dígitos
}

// Inicia o loop para gerar obstáculos em intervalos aleatórios
function startGameLoop() {
    // A cada 1.5 a 3 segundos, gera um novo obstáculo
    const minDelay = 1500; 
    const maxDelay = 3000; 
    
    setTimeout(() => {
        if (!isGameOver) {
            generateObstacle();
        }
        startGameLoop(); // Chama a si mesma para loop
    }, Math.random() * (maxDelay - minDelay) + minDelay);
}

// --- Eventos ---

// Pula ao pressionar a tecla Espaço (ou Seta para Cima)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        jump();
    }
});

// Inicia o jogo
startGameLoop();