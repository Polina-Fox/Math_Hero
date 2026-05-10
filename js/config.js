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
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Загрузка...', { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
        const percentText = this.add.text(width / 2, height / 2 - 5, '0%', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);

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

        this.load.image('menu-bg', 'assets/images/background0.png');
        this.load.audio('bgMusic', 'assets/audio/bg_music.mp3');

        this.load.image('bg-grass', 'assets/images/backgroundColorGrass.png');
        this.load.image('bg-forest', 'assets/images/backgroundColorForest.png');
        this.load.image('bg-fall', 'assets/images/backgroundColorFall.png');
        this.load.image('bg-desert', 'assets/images/backgroundColorDesert.png');

        this.createButtonTextures();

        // Только проверенные части (blue, green, red)
        const colors = ['blue', 'green', 'red'];
        colors.forEach(c => {
            ['A', 'B', 'C', 'D', 'E', 'F'].forEach(v => this.load.image(`body_${c}${v}`, `assets/images/mobs/body_${c}${v}.png`));
            this.load.image(`eye_${c}`, `assets/images/mobs/eye_${c}.png`);
            this.load.image(`eye_angry_${c}`, `assets/images/mobs/eye_angry_${c}.png`);
            this.load.image(`detail_${c}_antenna_small`, `assets/images/mobs/detail_${c}_antenna_small.png`);
        });
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(m => this.load.image(`mouth${m}`, `assets/images/mobs/mouth${m}.png`));
    }

    createButtonTextures() {
        const g = this.add.graphics();
        g.fillStyle(0x3498db); g.fillRoundedRect(0, 0, 300, 60, 15); g.generateTexture('button-normal', 300, 60);
        g.clear(); g.fillStyle(0x2980b9); g.fillRoundedRect(0, 0, 300, 60, 15); g.generateTexture('button-hover', 300, 60);
        g.clear(); g.fillStyle(0x2c3e50); g.fillRect(0, 0, 800, 600); g.generateTexture('fallback-bg', 800, 600);
        g.destroy();
    }

    create() {
        console.log('Preloader complete');
        document.querySelector('.loading').style.display = 'none';
        this.scene.start('MainMenu');
    }
}

function initGame() {
    console.log('Initializing Math Hero game...');
    const config = {
        type: Phaser.AUTO,
        width: 800, height: 600,
        parent: 'game-container',
        backgroundColor: '#2c3e50',
        scene: [Preloader, MainMenu, Settings, GameScene, BossScene, Victory, RescueMiniGame, MagicPauseMiniGame, SecretTrainingMiniGame],
        physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    };
    try { new Phaser.Game(config); console.log('Game created'); } catch (e) { console.error(e); }
}
window.addEventListener('load', () => setTimeout(initGame, 100));