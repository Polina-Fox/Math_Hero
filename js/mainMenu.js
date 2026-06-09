class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        this.instructionElements = [];
        this.authorsElements = [];
        this.bgMusic = null;
    }

    preload() {
        console.log('Loading main menu assets...');
    }

    create() {
        console.log('Creating main menu...');

        // Фон
        try {
            this.add.image(400, 300, 'menu-bg').setDisplaySize(800, 600);
        } catch (error) {
            console.log('Background image not found, using fallback');
            this.add.image(400, 300, 'fallback-bg');
        }

        // Запускаем фоновую музыку
        this.playBackgroundMusic();

        // Заголовок игры
        this.add.text(400, 120, 'МАТЕМАТИЧЕСКИЙ ГЕРОЙ', {
            fontSize: '42px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Основные кнопки меню
        this.createMenuButton(400, 250, 'ИГРАТЬ', 'Settings');
        this.createMenuButton(400, 330, 'КАК ИГРАТЬ', () => this.showInstructions());
        this.createMenuButton(400, 410, 'АВТОРЫ', () => this.showAuthors());

        // Кнопка управления музыкой
        this.createMusicToggle();

        // Футер с информацией
        this.add.text(400, 570, 'Разработано в рамках дипломной работы', {
            fontSize: '14px',
            fill: '#bdc3c7',
            fontStyle: 'italic',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    playBackgroundMusic() {
        try {
            if (!this.bgMusic) {
                this.bgMusic = this.sound.add('menuMusic', {
                    loop: true,
                    volume: 0.3
                });
            }

            if (!this.bgMusic.isPlaying) {
                this.bgMusic.play();
                console.log('Menu music started');
            }
        } catch (error) {
            console.log('Could not play menu music:', error);
        }
    }

    stopBackgroundMusic() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }

    createMusicToggle() {
        const musicButton = this.add.rectangle(750, 50, 40, 40, 0x3498db)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xffffff);

        const musicIcon = this.add.text(750, 50, '♪', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        let musicOn = true;

        musicButton.on('pointerdown', () => {
            musicOn = !musicOn;

            if (musicOn) {
                this.playBackgroundMusic();
                musicButton.setFillStyle(0x3498db);
                musicIcon.setStyle({ fill: '#ffffff' });
            } else {
                this.stopBackgroundMusic();
                musicButton.setFillStyle(0xe74c3c);
                musicIcon.setStyle({ fill: '#ffffff' });
            }
        });
    }

    createMenuButton(x, y, text, target) {
        const button = this.add.image(x, y, 'button-normal')
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000',
                blur: 2
            }
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setTexture('button-hover');
            buttonText.setScale(1.05);
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power2'
            });
        });

        button.on('pointerout', () => {
            button.setTexture('button-normal');
            buttonText.setScale(1);
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });

        button.on('pointerdown', () => {
            console.log('Button clicked:', text);

            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                ease: 'Power2',
                yoyo: true
            });

            this.time.delayedCall(100, () => {
                if (typeof target === 'string') {
                    // Останавливаем музыку меню перед переходом
                    this.stopBackgroundMusic();
                    this.scene.start(target);
                } else {
                    target.call(this);
                }
            });
        });

        return { button, text: buttonText };
    }

    showInstructions() {
        console.log('Showing instructions');

        this.clearInstructionElements();

        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
        this.instructionElements.push(overlay);

        // Увеличенная панель (выше)
        const panel = this.add.rectangle(400, 300, 700, 520, 0x2c3e50); // было 500, стало 520
        panel.setStrokeStyle(4, 0xf1c40f);
        this.instructionElements.push(panel);

        // Крестик закрытия в левом верхнем углу панели
        const closeButton = this.add.rectangle(150, 100, 40, 40, 0xe74c3c)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xffffff);
        this.instructionElements.push(closeButton);

        const closeIcon = this.add.text(150, 100, '×', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        this.instructionElements.push(closeIcon);

        const title = this.add.text(400, 130, 'КАК ИГРАТЬ', {
            fontSize: '36px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.instructionElements.push(title);

        const instructions = [
            '🎯 ЦЕЛЬ ИГРЫ:',
            'Помоги герою победить злых слизней!',
            'Решай математические примеры правильно.',
            '',
            '🎮 УПРАВЛЕНИЕ:',
            '• Кликай мышью на правильные ответы',
            '• На мобильных - касайся экрана',
            '• Защити героя от приближающихся слизней',
            '',
            '📚 МАТЕМАТИКА:',
            '• Сложение: 5 + 3 = 8',
            '• Вычитание: 10 - 4 = 6',
            '• Умножение: 3 × 4 = 12',
            '',
            '⭐ СИСТЕМА УРОВНЕЙ:',
            '• 6 уровней с увеличением сложности',
            '• Финальный босс-уровень',
            '• Мини-игры при проигрыше'
        ];

        instructions.forEach((line, index) => {
            const text = this.add.text(400, 170 + index * 22, line, {
                fontSize: '16px',
                fill: '#ecf0f1',
                fontFamily: 'Arial, sans-serif',
                align: 'center',
                backgroundColor: line.includes('🎯') || line.includes('🎮') ||
                    line.includes('📚') || line.includes('⭐') ? '#00000044' : 'transparent',
                padding: { left: 5, right: 5, top: 2, bottom: 2 }
            }).setOrigin(0.5);
            this.instructionElements.push(text);
        });

        closeButton.on('pointerdown', () => {
            this.clearInstructionElements();
        });

        overlay.on('pointerdown', () => {
            this.clearInstructionElements();
        });
    }

    showAuthors() {
        console.log('Showing authors');

        this.clearAuthorsElements();

        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
        this.authorsElements.push(overlay);

        const panel = this.add.rectangle(400, 300, 600, 400, 0x2c3e50);
        panel.setStrokeStyle(4, 0xf1c40f);
        this.authorsElements.push(panel);

        const title = this.add.text(400, 160, 'АВТОРЫ', {
            fontSize: '36px',
            fill: '#f1c40f',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.authorsElements.push(title);

        const creator = this.add.text(400, 220, 'Создатель игры:', {
            fontSize: '20px',
            fill: '#bdc3c7',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.authorsElements.push(creator);

        const creatorName = this.add.text(400, 260, 'Лисянская Полина Руслановна', {
            fontSize: '24px',
            fill: '#f1c40f',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.authorsElements.push(creatorName);

        const supervisor = this.add.text(400, 310, 'Научный руководитель:', {
            fontSize: '20px',
            fill: '#bdc3c7',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.authorsElements.push(supervisor);

        const supervisorName = this.add.text(400, 360, 'Доцент, доктор физико-математических наук\nИММиКН им. И. И. Воровича\nКарякин Михаил Игорьевич', {
            fontSize: '20px',
            fill: '#f1c40f',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            align: 'center'
        }).setOrigin(0.5);
        this.authorsElements.push(supervisorName);

        // Крестик закрытия
        const closeButton = this.add.rectangle(150, 120, 40, 40, 0xe74c3c)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xffffff);
        this.authorsElements.push(closeButton);

        const closeIcon = this.add.text(150, 120, '×', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        this.authorsElements.push(closeIcon);

        closeButton.on('pointerdown', () => {
            this.clearAuthorsElements();
        });

        overlay.on('pointerdown', () => {
            this.clearAuthorsElements();
        });
    }

    clearInstructionElements() {
        this.instructionElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.instructionElements = [];
    }

    clearAuthorsElements() {
        this.authorsElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.authorsElements = [];
    }

    shutdown() {
        this.stopBackgroundMusic();
    }
}