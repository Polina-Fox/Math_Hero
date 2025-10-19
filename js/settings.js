class Settings extends Phaser.Scene {
    constructor() {
        super('Settings');
    }

    create() {
        this.add.image(400, 300, 'background');

        this.add.text(400, 80, 'Выбери типы примеров', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Чекбоксы для выбора операций
        this.createCheckbox(400, 160, 'Сложение', 'addition');
        this.createCheckbox(400, 220, 'Вычитание', 'subtraction');
        this.createCheckbox(400, 280, 'Умножение', 'multiplication');

        // Кнопка начала игры
        const startButton = this.add.rectangle(400, 380, 300, 60, 0x4a9f4a)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        const startText = this.add.text(400, 380, 'Начать игру!', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x6abf6a);
            startText.setScale(1.1);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x4a9f4a);
            startText.setScale(1);
        });

        startButton.on('pointerdown', () => {
            if (gameSettings.addition || gameSettings.subtraction || gameSettings.multiplication) {
                gameSettings.currentLevel = 1;
                gameSettings.score = 0;
                gameSettings.lives = 3;
                this.scene.start('GameScene');
            } else {
                this.showError('Выбери хотя бы один тип примеров!');
            }
        });

        // Кнопка назад
        const backButton = this.add.text(100, 500, '← Назад', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    createCheckbox(x, y, text, setting) {
        const checkbox = this.add.rectangle(x - 100, y, 30, 30,
            gameSettings[setting] ? 0x00ff00 : 0xff0000
        ).setInteractive().setStrokeStyle(2, 0xffffff);

        const checkboxText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5);

        checkbox.on('pointerdown', () => {
            gameSettings[setting] = !gameSettings[setting];
            checkbox.setFillStyle(gameSettings[setting] ? 0x00ff00 : 0xff0000);
        });

        return checkbox;
    }

    showError(message) {
        const errorText = this.add.text(400, 450, message, {
            fontSize: '20px',
            fill: '#ff4444',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            errorText.destroy();
        });
    }
}