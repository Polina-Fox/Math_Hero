class Victory extends Phaser.Scene {
    constructor() {
        super({ key: 'Victory' });
    }

    preload() {
        this.createColorTexture('victory-bg', 0x27ae60);
        this.createColorTexture('victory-button', 0x3498db);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);

        if (key === 'victory-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else {
            graphics.fillRoundedRect(0, 0, 300, 60, 15);
        }

        graphics.generateTexture(key,
            key === 'victory-bg' ? 800 : 300,
            key === 'victory-bg' ? 600 : 60
        );
        graphics.destroy();
    }

    create() {
        console.log('Victory scene started');

        // Фон
        this.add.image(400, 300, 'victory-bg');

        // Поздравление
        this.add.text(400, 120, 'ПОБЕДА!', {
            fontSize: '64px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000',
                blur: 8
            }
        }).setOrigin(0.5);

        this.add.text(400, 200, 'Ты помог герою добраться домой! 🏠', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#00000066',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        // Статистика
        this.add.text(400, 260, `Итоговый счёт: ${gameSettings.score}`, {
            fontSize: '32px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 300, `Пройдено уровней: ${gameSettings.currentLevel - 1}`, {
            fontSize: '24px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Поздравительное сообщение
        const messages = [
            'Ты настоящий математический герой! 🦸',
            'Родители очень рады видеть героя дома! 👨‍👩‍👧',
            'Слизни больше не посмеют нападать! 😄',
            'Твои математические навыки впечатляют! 📚'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.add.text(400, 340, randomMessage, {
            fontSize: '20px',
            fill: '#bdc3c7',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5);

        // Салют из конфетти
        this.createConfetti();

        // Кнопка возврата в меню
        const menuButton = this.add.image(400, 450, 'victory-button')
            .setInteractive({ useHandCursor: true });

        const menuText = this.add.text(400, 450, 'В ГЛАВНОЕ МЕНЮ', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        menuButton.on('pointerover', () => {
            menuButton.setScale(1.1);
            menuText.setScale(1.1);
        });

        menuButton.on('pointerout', () => {
            menuButton.setScale(1);
            menuText.setScale(1);
        });

        menuButton.on('pointerdown', () => {
            // Сброс настроек игры
            gameSettings.currentLevel = 1;
            gameSettings.score = 0;
            gameSettings.lives = 3;

            this.scene.start('MainMenu');
        });

        // Анимация появления элементов
        this.tweens.add({
            targets: [menuButton, menuText],
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
            delay: 1000
        });
    }

    createConfetti() {
        const colors = [0xff6b6b, 0x48dbfb, 0x1dd1a1, 0xfeca57, 0xff9ff3, 0x54a0ff];

        for (let i = 0; i < 30; i++) {
            const confetti = this.add.rectangle(
                Phaser.Math.Between(100, 700),
                -20,
                Phaser.Math.Between(10, 20),
                Phaser.Math.Between(5, 15),
                Phaser.Math.RND.pick(colors)
            );

            this.tweens.add({
                targets: confetti,
                y: 650,
                rotation: Math.PI * 4,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Power2',
                delay: Phaser.Math.Between(0, 1000)
            });
        }

        // Второй залп конфетти
        this.time.delayedCall(800, () => {
            for (let i = 0; i < 20; i++) {
                const confetti = this.add.rectangle(
                    Phaser.Math.Between(100, 700),
                    -20,
                    Phaser.Math.Between(8, 15),
                    Phaser.Math.Between(4, 10),
                    Phaser.Math.RND.pick(colors)
                );

                this.tweens.add({
                    targets: confetti,
                    y: 650,
                    rotation: Math.PI * 6,
                    duration: Phaser.Math.Between(1500, 3000),
                    ease: 'Power2'
                });
            }
        });
    }
}