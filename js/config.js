// Глобальные настройки игры
const gameSettings = {
    addition: true,
    subtraction: false,
    multiplication: false,
    currentLevel: 1,
    score: 0,
    lives: 3
};

// Функция инициализации игры
function initGame() {
    console.log('Initializing Math Hero game...');

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#2c3e50',
        scene: [MainMenu, Settings, GameScene, BossScene, Victory, RescueMiniGame],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        callbacks: {
            postBoot: function (game) {
                console.log('Game successfully booted!');
                // Скрываем сообщение о загрузке
                const loading = document.querySelector('.loading');
                if (loading) loading.style.display = 'none';
            }
        }
    };

    try {
        const game = new Phaser.Game(config);
        console.log('Phaser game instance created');
    } catch (error) {
        console.error('Failed to create game:', error);
        const loading = document.querySelector('.loading');
        if (loading) loading.textContent = 'Ошибка: ' + error.message;
    }
}

// Запуск когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}