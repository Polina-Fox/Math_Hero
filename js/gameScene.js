// Глобальные настройки игры
const gameSettings = {
    addition: true,
    subtraction: false,
    multiplication: false,
    currentLevel: 1,
    score: 0,
    lives: 3,
    lastQuestion: null,
    lastAnswer: null,
    shield: false,
    bonusLife: false,
    easyStart: false
};

class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        const progressBar = this.add.graphics();
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Загрузка...', {
            fontSize: '20px', fill: '#ffffff'
        }).setOrigin(0.5);
        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);

            const htmlProgress = document.getElementById('progress');
            const htmlProgressText = document.getElementById('progress-text');
            if (htmlProgress) htmlProgress.style.width = (value * 100) + '%';
            if (htmlProgressText) htmlProgressText.textContent = parseInt(value * 100) + '%';
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // === Статические ресурсы ===
        this.load.image('menu-bg', 'assets/images/background0.png');
        this.load.audio('bgMusic', 'assets/audio/bg_music.mp3');

        // Фоны уровней
        this.load.image('bg-grass', 'assets/images/backgroundColorGrass.png');
        this.load.image('bg-forest', 'assets/images/backgroundColorForest.png');
        this.load.image('bg-fall', 'assets/images/backgroundColorFall.png');
        this.load.image('bg-desert', 'assets/images/backgroundColorDesert.png');

        // Кнопки
        this.createButtonTextures();

        // === Части монстров ТОЛЬКО для blue, green, red ===
        const activeColors = ['blue', 'green', 'red'];

        // Тела (A–F)
        activeColors.forEach(color => {
            ['A', 'B', 'C', 'D', 'E', 'F'].forEach(v => {
                this.load.image(`body_${color}${v}`, `assets/images/mobs/body_${color}${v}.png`);
            });
        });

        // Глаза (обычные и злые)
        activeColors.forEach(color => {
            this.load.image(`eye_${color}`, `assets/images/mobs/eye_${color}.png`);
            this.load.image(`eye_angry_${color}`, `assets/images/mobs/eye_angry_${color}.png`);
        });

        // Рты (A–H) — они общие для всех цветов
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(m => {
            this.load.image(`mouth${m}`, `assets/images/mobs/mouth${m}.png`);
        });

        // Детали: только антенны (маленькие) для трёх цветов
        activeColors.forEach(color => {
            this.load.image(`detail_${color}_antenna_small`, `assets/images/mobs/detail_${color}_antenna_small.png`);
        });

        // Для босса: большое тело красного цвета, злые глаза, рога и антенны
        this.load.image('body_redF', 'assets/images/mobs/body_redF.png');
        this.load.image('detail_red_horn_large', 'assets/images/mobs/detail_red_horn_large.png');
        this.load.image('detail_red_antenna_small', 'assets/images/mobs/detail_red_antenna_small.png');

        // ============================
    }

    createButtonTextures() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x3498db);
        graphics.fillRoundedRect(0, 0, 300, 60, 15);
        graphics.generateTexture('button-normal', 300, 60);

        graphics.clear();
        graphics.fillStyle(0x2980b9);
        graphics.fillRoundedRect(0, 0, 300, 60, 15);
        graphics.generateTexture('button-hover', 300, 60);

        graphics.clear();
        graphics.fillStyle(0x2c3e50);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('fallback-bg', 800, 600);

        graphics.destroy();
    }

    create() {
        console.log('Preloader complete');
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) loadingElement.style.display = 'none';
        this.scene.start('MainMenu');
    }
}

function initGame() {
    console.log('Initializing Math Hero game...');
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        backgroundColor: '#2c3e50',
        scene: [Preloader, MainMenu, Settings, GameScene, BossScene, Victory, RescueMiniGame, MagicPauseMiniGame, SecretTrainingMiniGame],
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 }, debug: false }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    try {
        const game = new Phaser.Game(config);
        console.log('Game created');
    } catch (error) {
        console.error('Failed to create game:', error);
        const loading = document.querySelector('.loading');
        if (loading) loading.innerHTML = 'Ошибка: ' + error.message;
    }
}

window.addEventListener('load', function () {
    setTimeout(initGame, 100);
});