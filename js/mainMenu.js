class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        this.instructionElements = [];
        this.settingsElements = [];
    }

    preload() {
        console.log('Loading main menu assets...');

        // Загрузка фона
        this.load.image('menu-bg', 'assets/images/background0.png');

        // Создаем простые текстуры для кнопок (на случай если фон не загрузится)
        this.createColorTexture('button-normal', 0x3498db);
        this.createColorTexture('button-hover', 0x2980b9);
        this.createColorTexture('fallback-bg', 0x2c3e50);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);

        if (key === 'fallback-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else {
            graphics.fillRoundedRect(0, 0, 300, 60, 15);
        }

        graphics.generateTexture(key,
            key === 'fallback-bg' ? 800 : 300,
            key === 'fallback-bg' ? 600 : 60
        );
        graphics.destroy();
    }

    create() {
        console.log('Creating main menu...');

        // Фон - пробуем загрузить картинку, если нет - используем цветной фон
        try {
            this.add.image(400, 300, 'menu-bg').setDisplaySize(800, 600);
        } catch (error) {
            console.log('Background image not found, using fallback');
            this.add.image(400, 300, 'fallback-bg');
        }

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

        // Основные кнопки меню
        this.createMenuButton(400, 250, 'ИГРАТЬ', 'Settings');
        this.createMenuButton(400, 330, 'КАК ИГРАТЬ', () => this.showInstructions());
        this.createMenuButton(400, 410, 'НАСТРОЙКИ', () => this.showSettings());

        // Футер с информацией (исправлено на дипломную работу)
        this.add.text(400, 570, 'Разработано в рамках дипломной работы', {
            fontSize: '14px',
            fill: '#bdc3c7',
            fontStyle: 'italic',
            fontFamily: 'Arial, sans-serif'
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

        // Очищаем предыдущие элементы если есть
        this.clearInstructionElements();

        // Затемнение фона
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
        this.instructionElements.push(overlay);

        // Панель инструкций (увеличиваем размер)
        const panel = this.add.rectangle(400, 300, 700, 500, 0x2c3e50);
        panel.setStrokeStyle(4, 0xf1c40f);
        this.instructionElements.push(panel);

        // Заголовок
        const title = this.add.text(400, 130, 'КАК ИГРАТЬ', {
            fontSize: '36px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.instructionElements.push(title);

        // Текст инструкций (улучшенный и полный с прокруткой)
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
            '• 4 уровня с увеличением сложности',
            '• Финальный босс-уровень',
            '• Мини-игры при проигрыше',
            '',
            '💫 ОСОБЕННОСТИ:',
            '• Постепенное усложнение примеров',
            '• Система очков и жизней',
            '• Яркая графика и анимации'
        ];

        instructions.forEach((line, index) => {
            const text = this.add.text(400, 170 + index * 22, line, {
                fontSize: '16px',
                fill: '#ecf0f1',
                fontFamily: 'Arial, sans-serif',
                align: 'center',
                backgroundColor: line.includes('🎯') || line.includes('🎮') ||
                    line.includes('📚') || line.includes('⭐') ||
                    line.includes('💫') ? '#00000044' : 'transparent',
                padding: { left: 5, right: 5, top: 2, bottom: 2 }
            }).setOrigin(0.5);
            this.instructionElements.push(text);
        });

        // Кнопка закрытия
        const closeButton = this.add.rectangle(400, 520, 200, 50, 0xe74c3c)
            .setInteractive({ useHandCursor: true });
        this.instructionElements.push(closeButton);

        const closeText = this.add.text(400, 520, 'ПОНЯТНО', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.instructionElements.push(closeText);

        closeButton.on('pointerdown', () => {
            this.clearInstructionElements();
        });
    }

    showSettings() {
        console.log('Showing settings');

        // Очищаем предыдущие элементы если есть
        this.clearSettingsElements();

        // Затемнение фона
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
        this.settingsElements.push(overlay);

        // Панель настроек (увеличиваем размер)
        const panel = this.add.rectangle(400, 300, 600, 400, 0x2c3e50);
        panel.setStrokeStyle(4, 0xf1c40f);
        this.settingsElements.push(panel);

        // Заголовок
        const title = this.add.text(400, 160, 'НАСТРОЙКИ', {
            fontSize: '36px',
            fill: '#f1c40f',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.settingsElements.push(title);

        // Информация о настройках
        const info1 = this.add.text(400, 210, 'Выбери математические операции', {
            fontSize: '20px',
            fill: '#ecf0f1',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.settingsElements.push(info1);

        const info2 = this.add.text(400, 240, 'в меню настроек перед игрой!', {
            fontSize: '20px',
            fill: '#ecf0f1',
            align: 'center',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.settingsElements.push(info2);

        const info3 = this.add.text(400, 280, 'Сейчас доступны:', {
            fontSize: '18px',
            fill: '#bdc3c7',
            fontStyle: 'italic',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.settingsElements.push(info3);

        const info4 = this.add.text(400, 310, 'Сложение, Вычитание, Умножение', {
            fontSize: '18px',
            fill: '#f1c40f',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.settingsElements.push(info4);

        // Кнопка закрытия
        const closeButton = this.add.rectangle(400, 380, 200, 50, 0xe74c3c)
            .setInteractive({ useHandCursor: true });
        this.settingsElements.push(closeButton);

        const closeText = this.add.text(400, 380, 'ЗАКРЫТЬ', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        this.settingsElements.push(closeText);

        closeButton.on('pointerdown', () => {
            this.clearSettingsElements();
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

    clearSettingsElements() {
        this.settingsElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.settingsElements = [];
    }
}