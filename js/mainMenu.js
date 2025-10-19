class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        console.log('Loading main menu assets...');

        // Создаем простые текстуры для меню
        this.createColorTexture('menu-bg', 0x2c3e50);
        this.createColorTexture('button-normal', 0x3498db);
        this.createColorTexture('button-hover', 0x2980b9);
        this.createColorTexture('hero-icon', 0xe74c3c);
        this.createColorTexture('slime-icon', 0x2ecc71);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);

        if (key === 'hero-icon') {
            graphics.fillRect(0, 0, 80, 100);
        } else if (key === 'slime-icon') {
            graphics.fillCircle(32, 32, 32);
        } else if (key === 'menu-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else {
            graphics.fillRoundedRect(0, 0, 300, 60, 15);
        }

        graphics.generateTexture(key,
            key === 'menu-bg' ? 800 : (key.includes('icon') ? 64 : 300),
            key === 'menu-bg' ? 600 : (key.includes('icon') ? 64 : 60)
        );
        graphics.destroy();
    }

    create() {
        console.log('Creating main menu...');

        // Фон
        this.add.image(400, 300, 'menu-bg');

        // Заголовок игры
        const title = this.add.text(400, 120, 'МАТЕМАТИЧЕСКИЙ ГЕРОЙ', {
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

        // Декоративные элементы - герой и слизни
        this.add.image(150, 400, 'hero-icon').setScale(1.2);
        this.add.image(650, 350, 'slime-icon').setTint(0xff6b9d).setScale(1.3);
        this.add.image(620, 450, 'slime-icon').setTint(0x74b9ff).setScale(1.1);
        this.add.image(680, 380, 'slime-icon').setTint(0x55efc4).setScale(0.9);

        // Основные кнопки меню
        this.createMenuButton(400, 250, 'ИГРАТЬ', 'Settings');
        this.createMenuButton(400, 330, 'КАК ИГРАТЬ', () => this.showInstructions());
        this.createMenuButton(400, 410, 'НАСТРОЙКИ', () => this.showSettings());

        // Футер с информацией
        this.add.text(400, 570, 'Разработано в рамках курсовой работы', {
            fontSize: '14px',
            fill: '#bdc3c7',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    createMenuButton(x, y, text, target) {
        // Основная кнопка
        const button = this.add.image(x, y, 'button-normal')
            .setInteractive({ useHandCursor: true });

        // Текст кнопки
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

        // Анимации при наведении
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

            // Анимация нажатия
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                ease: 'Power2',
                yoyo: true
            });

            // Переход после анимации
            this.time.delayedCall(100, () => {
                if (typeof target === 'string') {
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

        // Затемнение фона
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        // Панель инструкций
        const panel = this.add.rectangle(400, 300, 600, 400, 0x34495e);
        panel.setStrokeStyle(4, 0xf1c40f);

        // Заголовок
        this.add.text(400, 180, 'КАК ИГРАТЬ', {
            fontSize: '32px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Текст инструкций
        const instructions = [
            '🎯 ЦЕЛЬ ИГРЫ:',
            'Помоги герою победить злых слизней!',
            '',
            '🎮 УПРАВЛЕНИЕ:',
            '• Кликай на правильные ответы',
            '• Защити героя от слизней',
            '',
            '📚 ЧТО ИЗУЧАЕМ:',
            '• Сложение и вычитание',
            '• Умножение',
            '• Логическое мышление'
        ];

        instructions.forEach((line, index) => {
            this.add.text(400, 230 + index * 30, line, {
                fontSize: '18px',
                fill: '#ecf0f1',
                fontFamily: 'Arial, sans-serif',
                align: 'center'
            }).setOrigin(0.5);
        });

        // Кнопка закрытия
        const closeButton = this.add.rectangle(400, 450, 200, 50, 0xe74c3c)
            .setInteractive({ useHandCursor: true });

        const closeText = this.add.text(400, 450, 'ПОНЯТНО', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        closeButton.on('pointerdown', () => {
            // Удаляем все элементы инструкций
            overlay.destroy();
            panel.destroy();
            closeButton.destroy();
            closeText.destroy();

            // Удаляем все текстовые элементы инструкций
            this.children.list.forEach(child => {
                if (child.type === 'Text' && child.text !== 'МАТЕМАТИЧЕСКИЙ ГЕРОЙ' &&
                    child.text !== 'Разработано в рамках курсовой работы') {
                    child.destroy();
                }
            });
        });
    }

    showSettings() {
        console.log('Showing settings');

        // Затемнение фона
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        // Панель настроек
        const panel = this.add.rectangle(400, 300, 500, 300, 0x34495e);
        panel.setStrokeStyle(4, 0xf1c40f);

        // Заголовок
        this.add.text(400, 200, 'НАСТРОЙКИ', {
            fontSize: '32px',
            fill: '#f1c40f',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Информация о настройках
        this.add.text(400, 250, 'Настройки появятся в полной версии игры!', {
            fontSize: '18px',
            fill: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 280, 'Сейчас доступен только режим сложения', {
            fontSize: '16px',
            fill: '#bdc3c7',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Кнопка закрытия
        const closeButton = this.add.rectangle(400, 350, 200, 50, 0xe74c3c)
            .setInteractive({ useHandCursor: true });

        const closeText = this.add.text(400, 350, 'ЗАКРЫТЬ', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        closeButton.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            closeButton.destroy();
            closeText.destroy();

            // Удаляем текстовые элементы настроек
            this.children.list.forEach(child => {
                if (child.type === 'Text' && child.text.includes('НАСТРОЙКИ') ||
                    child.text.includes('Сейчас доступен')) {
                    child.destroy();
                }
            });
        });
    }
}