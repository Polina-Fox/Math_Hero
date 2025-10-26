// Глобальные настройки игры
const gameSettings = {
    addition: true,
    subtraction: false,
    multiplication: false,
    currentLevel: 1,
    score: 0,
    lives: 3
};

// Класс прелоадера
class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        // Создаем простой прогресс-бар
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Загрузка...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const assetText = this.add.text(width / 2, height / 2 + 50, '', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Обновление прогресса загрузки
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);

            // Обновляем прогресс в HTML
            const htmlProgress = document.getElementById('progress');
            const htmlProgressText = document.getElementById('progress-text');
            if (htmlProgress) {
                htmlProgress.style.width = (value * 100) + '%';
            }
            if (htmlProgressText) {
                htmlProgressText.textContent = parseInt(value * 100) + '%';
            }
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Загрузка: ' + file.key);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        // Загружаем только самые необходимые ресурсы для меню
        this.load.image('menu-bg', 'assets/images/background0.png');
        this.load.audio('bgMusic', 'assets/audio/bg_music.mp3');

        // Создаем текстуры для кнопок программно
        this.createButtonTextures();
    }

    createButtonTextures() {
        // Создаем текстуры для кнопок
        const graphics = this.add.graphics();

        // Нормальная кнопка
        graphics.fillStyle(0x3498db);
        graphics.fillRoundedRect(0, 0, 300, 60, 15);
        graphics.generateTexture('button-normal', 300, 60);

        // Кнопка при наведении
        graphics.clear();
        graphics.fillStyle(0x2980b9);
        graphics.fillRoundedRect(0, 0, 300, 60, 15);
        graphics.generateTexture('button-hover', 300, 60);

        // Фон-заглушка
        graphics.clear();
        graphics.fillStyle(0x2c3e50);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('fallback-bg', 800, 600);

        graphics.destroy();
    }

    create() {
        console.log('Preloader complete, starting main menu...');

        // Скрываем HTML прелоадер
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        // Переходим в главное меню
        this.scene.start('MainMenu');
    }
}

// Функция инициализации игры
function initGame() {
    console.log('Initializing Math Hero game...');

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#2c3e50',
        scene: [Preloader, MainMenu, Settings, GameScene, BossScene, Victory, RescueMiniGame],
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
            }
        }
    };

    try {
        const game = new Phaser.Game(config);
        console.log('Phaser game instance created');
    } catch (error) {
        console.error('Failed to create game:', error);
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.innerHTML = '<div style="color: #e74c3c;">Ошибка загрузки: ' + error.message + '</div>';
        }
    }
}

// Запуск когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}