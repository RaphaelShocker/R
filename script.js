// Referências aos elementos do HTML
const dino = document.getElementById('dino');
const gameBoard = document.getElementById('game-board');
const ground = document.getElementById('ground');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');

// Variáveis de estado do jogo
let isJumping = false;
let isGameOver = false;
let score = 0;

// Constantes de configuração
let GAME_SPEED = 8;      // AGORA É 'LET': Velocidade inicial que será aumentada
const JUMP_DURATION = 600; 

// Configurações da Dificuldade Progressiva
const SPEED_INCREASE_RATE = 0.5; // Quanto a velocidade aumenta a cada ciclo
const DIFFICULTY_INTERVAL = 10000; // Tempo em milissegundos (10 segundos)

// --- Funções de Jogo ---

// Função para fazer o Dino pular
function jump() {
    if (isJumping || isGameOver) {
        return;
    }
    isJumping = true;
    dino.classList.add('jump'); 
    setTimeout(() => {
        dino.classList.remove('jump');
        isJumping = false;
    }, JUMP_DURATION);
}

// Função para atualizar o placar
function updateScore(points = 1) {
    score += points;
    scoreDisplay.innerText = score.toString().padStart(5, '0');
}

// **NOVA FUNÇÃO: Aumenta a dificuldade do jogo**
function increaseDifficulty() {
    if (isGameOver) return;

    // Aumenta a velocidade dos próximos elementos
    GAME_SPEED += SPEED_INCREASE_RATE;
    console.log(`Dificuldade aumentada! Nova velocidade: ${GAME_SPEED}`);

    // Configura o próximo aumento de dificuldade
    setTimeout(increaseDifficulty, DIFFICULTY_INTERVAL);
}

// Função principal para gerar e gerenciar o movimento e colisão de elementos
function generateGameElement() {
    if (isGameOver) return; 

    // Decide aleatoriamente se será um 'espinho' ou uma 'moeda'
    const type = Math.random() < 0.5 ? 'espinho' : 'moeda'; 
    
    // Configurações específicas para cada tipo de elemento
    const elementConfigs = {
        espinho: { 
            class: 'espinho', 
            width: 30, 
            points: -1, 
            bottom: 50 
        },
        moeda: { 
            class: 'moeda', 
            width: 25, 
            points: 10, 
            bottom: 80 
        }
    };
    const currentElementConfig = elementConfigs[type];

    const element = document.createElement('div');
    element.classList.add('game-element', currentElementConfig.class);
    element.style.bottom = currentElementConfig.bottom + 'px'; 
    gameBoard.appendChild(element); 

    let elementRightPosition = -currentElementConfig.width; 
    element.style.right = elementRightPosition + 'px'; 

    // O elemento usa a velocidade ATUAL do jogo
    const currentElementSpeed = GAME_SPEED; 

    const moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval); 
            return;
        }

        // Usa a velocidade capturada no momento da criação do elemento
        elementRightPosition += currentElementSpeed; 
        element.style.right = elementRightPosition + 'px'; 

        // --- Detecção de Colisão ---
        const dinoRect = dino.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        const collisionX = dinoRect.left < elementRect.right && dinoRect.right > elementRect.left;
        const collisionY = dinoRect.bottom > elementRect.top && dinoRect.top < elementRect.bottom;

        if (collisionX && collisionY) {
            if (currentElementConfig.points === -1) {
                // Colisão com ESPINHO: FIM DE JOGO
                handleGameOver(moveInterval);
                return;
            } else if (currentElementConfig.points > 0) {
                // Colisão com MOEDA: Pontua e remove a moeda
                updateScore(currentElementConfig.points);
                clearInterval(moveInterval);
                gameBoard.removeChild(element); 
                return; 
            }
        }

        // Se o elemento sair da tela pela esquerda, remove-o
        if (elementRightPosition > gameBoard.clientWidth) {
            clearInterval(moveInterval);
            gameBoard.removeChild(element);
        }
    }, 20); 
    
    // Armazena o intervalo para poder parar no Game Over
    element.moveInterval = moveInterval; 
}

// Função para lidar com o Game Over
function handleGameOver(currentInterval) {
    isGameOver = true;
    ground.style.animationPlayState = 'paused'; 
    document.getElementById('background-cloud').style.animationPlayState = 'paused'; 
    
    // Para todos os loops de movimento de elementos ativos
    document.querySelectorAll('.game-element').forEach(o => clearInterval(o.moveInterval)); 
    clearInterval(currentInterval); // Garante que o intervalo atual também pare

    dino.style.animation = 'none'; 
    
    finalScoreDisplay.innerText = score.toString().padStart(5, '0');
    gameOverScreen.classList.remove('hidden');
    
    // Remove todos os elementos ativos na tela para limpeza
    document.querySelectorAll('.game-element').forEach(o => o.remove());
}

// Loop principal que gera novos elementos (obstáculos/moedas)
function startGameLoop() {
    const minDelay = 1200; 
    const maxDelay = 2500; 
    
    setTimeout(() => {
        if (!isGameOver) {
            generateGameElement(); 
        }
        startGameLoop(); 
    }, Math.random() * (maxDelay - minDelay) + minDelay); 
}

// --- Eventos de Controle ---
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        jump();
    }
});

// --- Início do Jogo ---
startGameLoop(); // Começa a gerar elementos
increaseDifficulty(); // Começa a aumentar a dificuldade