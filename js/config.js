// config.js - полный код с загрузкой музыки

const gameSettings = {
    addition: true, subtraction: false, multiplication: false,
    currentLevel: 1, score: 0, lives: 3,
    lastQuestion: null, lastAnswer: null,
    shield: false, bonusLife: false, easyStart: false
};

class Preloader extends Phaser.Scene {
    constructor() { super({ key: 'Preloader' }); }

    preload() {
        const w = this.cameras.main.width, h = this.cameras.main.height;
        const pb = this.add.graphics(); pb.fillStyle(0x222222, 0.8); pb.fillRect(w/2-160, h/2-30, 320, 50);
        const pbar = this.add.graphics();
        const lt = this.add.text(w/2, h/2-50, '«агрузка...', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        const pt = this.add.text(w/2, h/2-5, '0%', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        this.load.on('progress', v => { pt.setText(parseInt(v*100)+'%'); pbar.clear(); pbar.fillStyle(0xffffff,1); pbar.fillRect(w/2-150, h/2-20, 300*v, 30); });
        this.load.on('complete', () => { pbar.destroy(); pb.destroy(); lt.destroy(); pt.destroy(); });

        this.load.image('menu-bg', 'assets/images/background0.png');
        this.load.audio('bgMusic', 'assets/audio/palm_of_my_hand_-_intro.mp3');
        this.load.audio('music-at-altar', 'assets/audio/palm_of_my_hand_-_at_the_altar.mp3');
        this.load.audio('music-story-time', 'assets/audio/story_time.mp3');
        this.load.audio('music-ancient-waters', 'assets/audio/over_ancient_waters_looping.mp3');
        this.load.audio('music-otts', 'assets/audio/otts.mp3');

        this.load.image('bg-grass', 'assets/images/backgroundColorGrass.png');
        this.load.image('bg-forest', 'assets/images/backgroundColorForest.png');
        this.load.image('bg-fall', 'assets/images/backgroundColorFall.png');
        this.load.image('bg-desert', 'assets/images/backgroundColorDesert.png');

        this.createButtonTextures();

        ['blue','green','red'].forEach(c => {
            ['A','B','C','D','E','F'].forEach(v => this.load.image(`body_${c}${v}`, `assets/images/mobs/body_${c}${v}.png`));
            this.load.image(`eye_angry_${c}`, `assets/images/mobs/eye_angry_${c}.png`);
            if (c==='blue'||c==='red') this.load.image(`eye_${c}`, `assets/images/mobs/eye_${c}.png`);
            this.load.image(`detail_${c}_antenna_small`, `assets/images/mobs/detail_${c}_antenna_small.png`);
        });
        ['A','B','C','D','E','F','G','H'].forEach(m => this.load.image(`mouth${m}`, `assets/images/mobs/mouth${m}.png`));

        const hp = 'assets/images/Poses HD/character_maleAdventurer';
        ['idle','fall','fallDown','hurt','hit','cheer0','cheer1','walk0','walk1','walk2','walk3','walk4','walk5','walk6','walk7','run0','run1','run2','attack0','attack1','attack2','attackKick','kick','jump','slide','duck','climb0','climb1','back','behindBack','down','drag','hang','hold','interact','rope','shove','shoveBack','show','side','switch0','switch1','talk','think','wide'].forEach(f => this.load.image(`hero_${f}`, `${hp}_${f}.png`));

        this.load.image('pause-button', 'assets/images/buttons/button_round_depth_flat.png');
        this.load.image('resume-button', 'assets/images/buttons/arrow_basic_e.png');
        this.load.image('menu-button', 'assets/images/buttons/slide_hangle.png');
    }

    createButtonTextures() {
        const g = this.add.graphics();
        g.fillStyle(0x3498db); g.fillRoundedRect(0,0,300,60,15); g.generateTexture('button-normal',300,60);
        g.clear(); g.fillStyle(0x2980b9); g.fillRoundedRect(0,0,300,60,15); g.generateTexture('button-hover',300,60);
        g.clear(); g.fillStyle(0x2c3e50); g.fillRect(0,0,800,600); g.generateTexture('fallback-bg',800,600);
        g.destroy();
    }

    create() { console.log('Preloader complete'); document.querySelector('.loading').style.display='none'; this.scene.start('MainMenu'); }
}

function initGame() {
    new Phaser.Game({
        type: Phaser.AUTO, width:800, height:600, parent:'game-container', backgroundColor:'#2c3e50',
        scene:[Preloader, MainMenu, Settings, GameScene, BossScene, Victory, RescueMiniGame, MagicPauseMiniGame, SecretTrainingMiniGame],
        physics:{default:'arcade',arcade:{gravity:{y:0},debug:false}},
        scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}
    });
}
window.addEventListener('load', () => setTimeout(initGame,100));