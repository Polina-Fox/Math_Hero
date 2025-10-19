class Settings extends Phaser.Scene {
    constructor() {
        super({ key: 'Settings' });
    }

    preload() {
        // Загрузка фона для настроек
        this.load.image('settings-bg', 'assets/images/background0.png');
        this.createColorTexture('fallback-bg', 0x34495e);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture(key, 800, 600);
        graphics.destroy();
    }

    create() {
        console.log('Settings scene created');

        // Фон
        try {
            this.add.image(400, 300, 'settings-bg').setDisplaySize(800, 600);
        } catch (error) {
            this.add.image(400, 300, 'fallback-bg');
        }

        // Заголовок
        this.add.text(400, 80, 'ВЫБЕРИ РЕЖИМ ИГРЫ', {
            fontSize: '36px',
            fill: '#f1c40f',
            fontWeight: 'bold',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Информация
        this.add.text(400, 130, 'Выбери математические операции для игры:', {
            fontSize: '20px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Чекбоксы для выбора операций
        this.createCheckbox(400, 180, 'Сложение', 'addition', 0x27ae60);
        this.createCheckbox(400, 230, 'Вычитание', 'subtraction', 0xe74c3c);
        this.createCheckbox(400, 280, 'Умножение', 'multiplication', 0x3498db);

        // Сообщение о выборе
        this.add.text(400, 320, 'Рекомендуется выбрать все операции', {
            fontSize: '16px',
            fill: '#bdc3c7',
            fontStyle: 'italic',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 345, 'для лучшего обучения!', {
            fontSize: '16px',
            fill: '#bdc3c7',
            fontStyle: 'italic',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Кнопка начала игры
        const startButton = this.add.rectangle(400, 400, 350, 70, 0x27ae60)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0x2ecc71);

        const startText = this.add.text(400, 400, 'НАЧАТЬ ИГРУ', {
            fontSize: '28px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Кнопка назад
        const backButton = this.add.rectangle(400, 490, 200, 50, 0x95a5a6)
            .setInteractive({ useHandCursor: true });

        const backText = this.add.text(400, 490, 'НАЗАД', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Сообщение об ошибке
        let errorText = null;

        // Обработчики событий
        startButton.on('pointerdown', () => {
            if (!gameSettings.addition && !gameSettings.subtraction && !gameSettings.multiplication) {
                // Показываем ошибку
                if (errorText) errorText.destroy();
                errorText = this.add.text(400, 450, 'Выбери хотя бы одну операцию!', {
                    fontSize: '18px',
                    fill: '#e74c3c',
                    fontFamily: 'Arial, sans-serif'
                }).setOrigin(0.5);
                return;
            }

            console.log('Starting game with settings:', gameSettings);
            gameSettings.currentLevel = 1;
            gameSettings.score = 0;
            gameSettings.lives = 3;

            this.scene.start('GameScene');
        });

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // Анимации при наведении
        [startButton, backButton].forEach(button => {
            button.on('pointerover', () => {
                button.setScale(1.05);
            });

            button.on('pointerout', () => {
                button.setScale(1);
            });
        });
    }

    createCheckbox(x, y, text, setting, color) {
        const checkboxSize = 30;
        const checkbox = this.add.rectangle(x - 120, y, checkboxSize, checkboxSize,
            gameSettings[setting] ? color : 0x7f8c8d
        ).setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xecf0f1);

        const checkmark = this.add.text(x - 120, y, '✓', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setVisible(gameSettings[setting]);

        const checkboxText = this.add.text(x - 80, y, text, {
            fontSize: '22px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0, 0.5);

        checkbox.on('pointerdown', () => {
            gameSettings[setting] = !gameSettings[setting];
            checkbox.setFillStyle(gameSettings[setting] ? color : 0x7f8c8d);
            checkmark.setVisible(gameSettings[setting]);
        });

        return { checkbox, checkmark, text: checkboxText };
    }
}