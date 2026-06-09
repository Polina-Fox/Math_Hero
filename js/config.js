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
    constructor() { super({ key: 'Preloader' }); }

    preload() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const pb = this.add.graphics(); pb.fillStyle(0x222222, 0.8); pb.fillRect(w / 2 - 160, h / 2 - 30, 320, 50);
        const pbar = this.add.graphics();
        const lt = this.add.text(w / 2, h / 2 - 50, 'Загрузка...', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        const pt = this.add.text(w / 2, h / 2 - 5, '0%', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        this.load.on('progress', v => { pt.setText(parseInt(v * 100) + '%'); pbar.clear(); pbar.fillStyle(0xffffff, 1); pbar.fillRect(w / 2 - 150, h / 2 - 20, 300 * v, 30); });
        this.load.on('complete', () => { pbar.destroy(); pb.destroy(); lt.destroy(); pt.destroy(); });

        // Основные ресурсы
        this.load.image('menu-bg', 'assets/images/background0.png');
        this.load.audio('menuMusic', 'assets/audio/palm of my hand - intro.ogg');
        this.load.audio('music-at-altar', 'assets/audio/palm of my hand - at the altar.ogg');
        this.load.audio('music-story-time', 'assets/audio/story time.ogg');
        this.load.audio('music-ancient-waters', 'assets/audio/over_ancient_waters_looping.ogg');
        this.load.audio('music-otts', 'assets/audio/otts.flac');

        // Озвучка интро
        this.load.audio('voiceFull', 'assets/audio/intro_voice_full.mp3');

        // Фоны
        this.load.image('bg-grass', 'assets/images/backgroundColorGrass.png');
        this.load.image('bg-forest', 'assets/images/backgroundColorForest.png');
        this.load.image('bg-fall', 'assets/images/backgroundColorFall.png');
        this.load.image('bg-desert', 'assets/images/backgroundColorDesert.png');

        // Картинки интро
        this.load.image('intro1', 'assets/images/intro1.png');
        this.load.image('intro2', 'assets/images/intro2.png');
        this.load.image('intro3', 'assets/images/intro3.png');

        // Финальные картинки
        this.load.image('final1', 'assets/images/final_victory1.png');
        this.load.image('final2', 'assets/images/final_victory2.png');

        // Финальная озвучка
        this.load.audio('finalVoice1', 'assets/audio/final_narration1.mp3');
        this.load.audio('finalVoice2', 'assets/audio/final_narration2.mp3');

        this.createButtonTextures();

        // Части монстров
        ['blue', 'green', 'red'].forEach(c => {
            ['A', 'B', 'C', 'D', 'E', 'F'].forEach(v => this.load.image(`body_${c}${v}`, `assets/images/mobs/body_${c}${v}.png`));
            this.load.image(`eye_angry_${c}`, `assets/images/mobs/eye_angry_${c}.png`);
            if (c === 'blue' || c === 'red') this.load.image(`eye_${c}`, `assets/images/mobs/eye_${c}.png`);
            this.load.image(`detail_${c}_antenna_small`, `assets/images/mobs/detail_${c}_antenna_small.png`);
        });
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(m => this.load.image(`mouth${m}`, `assets/images/mobs/mouth${m}.png`));

        // Герой
        const hp = 'assets/images/Poses HD/character_maleAdventurer';
        const heroFrames = ['idle', 'fall', 'fallDown', 'hurt', 'hit', 'cheer0', 'cheer1',
            'walk0', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6', 'walk7',
            'run0', 'run1', 'run2', 'attack0', 'attack1', 'attack2', 'attackKick', 'kick',
            'jump', 'slide', 'duck', 'climb0', 'climb1', 'back', 'behindBack', 'down', 'drag',
            'hang', 'hold', 'interact', 'rope', 'shove', 'shoveBack', 'show', 'side',
            'switch0', 'switch1', 'talk', 'think', 'wide'];
        heroFrames.forEach(f => this.load.image(`hero_${f}`, `${hp}_${f}.png`));

        // Кнопки паузы
        this.load.image('pause-button', 'assets/images/buttons/button_round_depth_flat.png');
        this.load.image('resume-button', 'assets/images/buttons/arrow_basic_e.png');
        this.load.image('menu-button', 'assets/images/buttons/slide_hangle.png');
    }

    createButtonTextures() {
        const g = this.add.graphics();
        g.fillStyle(0x2c3e50, 0.6); g.fillRoundedRect(5, 5, 300, 60, 20);
        g.fillStyle(0x3498db); g.fillRoundedRect(0, 0, 300, 60, 20); g.generateTexture('button-normal', 305, 65);
        g.clear();
        g.fillStyle(0x2c3e50, 0.6); g.fillRoundedRect(5, 5, 300, 60, 20);
        g.fillStyle(0x2980b9); g.fillRoundedRect(0, 0, 300, 60, 20); g.generateTexture('button-hover', 305, 65);
        g.clear();
        g.fillStyle(0x000000, 0.3); g.fillRoundedRect(10, 10, 680, 480, 30);
        g.fillStyle(0x2c3e50); g.fillRoundedRect(0, 0, 680, 480, 30); g.generateTexture('panel', 690, 490);
        g.clear();
        g.fillStyle(0xffffff); g.fillCircle(4, 4, 4); g.generateTexture('particle', 8, 8);
        g.destroy();
    }

    create() {
        document.querySelector('.loading').style.display = 'none';
        this.scene.start('IntroCutscene');
    }
}

function initGame() {
    new Phaser.Game({
        type: Phaser.AUTO, width: 800, height: 600, parent: 'game-container', backgroundColor: '#2c3e50',
        audio: { disableWebAudio: false },
        render: {
            defaultFontFamily: 'Arial, Helvetica, sans-serif'
        },
        scene: [Preloader, IntroCutscene, MainMenu, Settings, GameScene, MapScene, BossScene, FinalCutscene, Victory, RescueMiniGame, MagicPauseMiniGame, SecretTrainingMiniGame],
        physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    });
}
window.addEventListener('load', () => setTimeout(initGame, 100));