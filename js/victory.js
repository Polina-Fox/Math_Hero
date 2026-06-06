class Victory extends Phaser.Scene {
    constructor() {
        super({ key: 'Victory' });
    }

    preload() {
        // Текстуры теперь загружаются в Preloader (button-normal, panel, particle)
    }

    create() {
        console.log('Victory scene started');

        // Градиентный фон
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x27ae60, 0x2ecc71, 0x27ae60, 0x2ecc71, 1);
        bg.fillRect(0, 0, 800, 600);

        // Заголовок с панелью
        const titleBg = this.add.image(400, 100, 'panel').setDisplaySize(400, 100).setAlpha(0);
        this.tweens.add({ targets: titleBg, alpha: 1, duration: 500 });

        this.add.text(400, 100, 'ПОБЕДА!', {
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

        // Статистика в панели
        const statsPanel = this.add.image(400, 280, 'panel').setDisplaySize(400, 200).setAlpha(0);
        this.tweens.add({ targets: statsPanel, alpha: 1, duration: 500, delay: 300 });

        this.add.text(400, 240, 'Ты помог герою добраться домой! 🏠', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#00000066',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5);

        this.add.text(400, 290, `Итоговый счёт: ${gameSettings.score}`, {
            fontSize: '32px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 330, `Пройдено уровней: ${gameSettings.currentLevel - 1}`, {
            fontSize: '24px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // Случайное сообщение
        const messages = [
            'Ты настоящий математический герой! 🦸',
            'Родители очень рады видеть героя дома! 👨‍👩‍👧',
            'Слизни больше не посмеют нападать! 😄',
            'Твои математические навыки впечатляют! 📚'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.add.text(400, 370, randomMessage, {
            fontSize: '20px',
            fill: '#bdc3c7',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5);

        // Конфетти
        this.createConfetti();

        // Кнопка возврата в меню с анимацией
        const menuBtn = this.add.image(400, 470, 'button-normal').setInteractive({ useHandCursor: true }).setScale(0);
        this.tweens.add({ targets: menuBtn, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.easeOut', delay: 1000 });

        const menuText = this.add.text(400, 470, 'В ГЛАВНОЕ МЕНЮ', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        menuBtn.on('pointerover', () => { menuBtn.setTexture('button-hover'); menuBtn.setScale(1.05); });
        menuBtn.on('pointerout', () => { menuBtn.setTexture('button-normal'); menuBtn.setScale(1); });
        menuBtn.on('pointerdown', () => {
            // Сброс настроек игры
            gameSettings.currentLevel = 1;
            gameSettings.score = 0;
            gameSettings.lives = 3;

            this.scene.start('MainMenu');
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