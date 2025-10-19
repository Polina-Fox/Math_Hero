// Глобальные настройки игры
const gameSettings = {
    addition: true,
    subtraction: false,
    multiplication: false,
    currentLevel: 1,
    score: 0,
    lives: 3
};

// Функция для запуска игры после загрузки всех классов
function initializeGame() {
    console.log('Initializing game...');

    // Проверяем, что все основные классы загружены
    if (typeof MainMenu === 'undefined') {
        console.error('MainMenu class not found');
        return;
    }

    // Конфигурация Phaser
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#4488aa',
        scene: [MainMenu, Settings, GameScene, BossScene, Victory],
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
                console.log('Phaser game booted successfully');
                // Убираем сообщение о загрузке
                const loadingElement = document.querySelector('.loading');
                if (loadingElement) {
                    loadingElement.style.display = 'none';
                }
            }
        }
    };

    // Создание экземпляра игры
    try {
        const game = new Phaser.Game(config);
        console.log('Game instance created');
    } catch (error) {
        console.error('Error creating game:', error);
        document.querySelector('.loading').textContent = 'Ошибка загрузки игры: ' + error.message;
    }
}

// Запускаем игру когда страница полностью загружена
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}