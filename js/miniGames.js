class RescueMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'RescueMiniGame' });
        this.currentNumber = 1;
        this.timeLeft = 10;
        this.numbers = [];
    }

    preload() {
        this.createColorTexture('rescue-bg', 0x2c3e50);
        this.createColorTexture('number-bubble', 0x3498db);
        this.createColorTexture('number-correct', 0x27ae60);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);

        if (key === 'rescue-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else {
            graphics.fillCircle(25, 25, 25);
        }

        graphics.generateTexture(key,
            key === 'rescue-bg' ? 800 : 50,
            key === 'rescue-bg' ? 600 : 50
        );
        graphics.destroy();
    }

    create() {
        console.log('Rescue mini-game started');

        // Фон
        this.add.image(400, 300, 'rescue-bg');

        // Заголовок
        this.add.text(400, 80, 'СПАСИ ДРУГА!', {
            fontSize: '36px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Инструкция
        this.add.text(400, 130, 'Нажимай на числа по порядку от 1 до 9', {
            fontSize: '20px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 160, 'У тебя есть 10 секунд! ⏰', {
            fontSize: '18px',
            fill: '#e74c3c',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Запуск мини-игры
        this.startMiniGame();
    }

    startMiniGame() {
        // Создание чисел от 1 до 9
        const positions = [];
        for (let i = 1; i <= 9; i++) {
            let x, y;
            let attempts = 0;

            // Генерация позиции без наложения
            do {
                x = Phaser.Math.Between(100, 700);
                y = Phaser.Math.Between(200, 500);
                attempts++;
            } while (this.isOverlapping(x, y, positions) && attempts < 50);

            positions.push({ x, y });

            const number = this.add.image(x, y, 'number-bubble')
                .setInteractive({ useHandCursor: true })
                .setData('value', i);

            const numberText = this.add.text(x, y, i.toString(), {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            number.on('pointerdown', () => {
                this.handleNumberClick(number, numberText, i);
            });

            this.numbers.push({ bubble: number, text: numberText, value: i });
        }

        // Таймер
        this.timerText = this.add.text(400, 550, `Время: ${this.timeLeft} сек`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#00000066',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Запуск таймера
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    isOverlapping(x, y, positions) {
        for (const pos of positions) {
            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            if (distance < 80) { // Минимальное расстояние между пузырями
                return true;
            }
        }
        return false;
    }

    handleNumberClick(bubble, text, value) {
        if (value === this.currentNumber) {
            // Правильное число
            bubble.setTexture('number-correct');
            text.setStyle({ fill: '#ffffff' });
            bubble.disableInteractive();
            this.currentNumber++;

            // Анимация успеха
            this.tweens.add({
                targets: [bubble, text],
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: true
            });

            if (this.currentNumber > 9) {
                this.miniGameSuccess();
            }
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(`Время: ${this.timeLeft} сек`);

        if (this.timeLeft <= 5) {
            this.timerText.setStyle({ fill: '#e74c3c' });
        }

        if (this.timeLeft <= 0) {
            this.miniGameFail();
        }
    }

    miniGameSuccess() {
        this.timer.remove();

        this.add.text(400, 50, 'УСПЕХ! Друг спасён! 🎉', {
            fontSize: '28px',
            fill: '#27ae60',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 90, 'Герой возвращается в бой! ⚔️', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            gameSettings.lives = 3;
            this.scene.start('GameScene');
        });
    }

    miniGameFail() {
        this.timer.remove();

        this.add.text(400, 50, 'ВРЕМЯ ВЫШЛО! ⏰', {
            fontSize: '28px',
            fill: '#e74c3c',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 90, 'Но герой сам выбрался! 💪', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 120, 'Следующие 2 слизня уже побеждены! 🎯', {
            fontSize: '16px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            gameSettings.lives = 3;
            this.scene.start('GameScene');
        });
    }
}

class MagicPauseMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MagicPauseMiniGame' });
    }

    create() {
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        this.add.text(400, 250, 'МАГИЧЕСКАЯ ПАУЗА', {
            fontSize: '32px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 300, 'Эта мини-игра находится в разработке 🛠️', {
            fontSize: '20px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.add.text(400, 340, 'Скоро здесь появятся волшебные математические духи! ✨', {
            fontSize: '16px',
            fill: '#bdc3c7',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Кнопка возврата
        const backButton = this.add.rectangle(400, 420, 200, 50, 0x3498db)
            .setInteractive({ useHandCursor: true });

        const backText = this.add.text(400, 420, 'ВЕРНУТЬСЯ', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        backButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Автоматический возврат через 5 секунд
        this.time.delayedCall(5000, () => {
            this.scene.start('GameScene');
        });
    }
}