class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        console.log('MainMenu preload');
        // Создаем простые цветные прямоугольники как заглушки
        this.createPlaceholder('background', 0x4488aa);
        this.createPlaceholder('hero', 0xff6b6b);
        this.createPlaceholder('slime', 0x4ecdc4);
    }

    createPlaceholder(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture(key, 64, 64);
        graphics.destroy();
    }

    create() {
        console.log('MainMenu create');

        // Фон
        this.add.rectangle(400, 300, 800, 600, 0x4488aa);

        // Заголовок
        this.add.text(400, 100, 'Математический герой', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Простые фигуры вместо спрайтов
        this.add.rectangle(200, 400, 50, 80, 0xff6b6b); // Герой
        this.add.circle(600, 450, 30, 0x4ecdc4); // Слизни
        this.add.circle(650, 400, 30, 0x45b7af);
        this.add.circle(550, 350, 30, 0x3ba099);

        // Кнопка игры
        const playButton = this.add.rectangle(400, 250, 300, 60, 0x4a4a9f)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        const playText = this.add.text(400, 250, 'Играть', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x6a6abf);
            playText.setScale(1.1);
        });

        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x4a4a9f);
            playText.setScale(1);
        });

        playButton.on('pointerdown', () => {
            console.log('Starting game...');
            this.scene.start('Settings');
        });
    }
}