class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
        this.correctAnswers = 0;
        this.requiredAnswers = 3;
        this.bossDefeated = false;
    }

    preload() {
        this.createColorTexture('boss-bg', 0x8e44ad);
        this.createColorTexture('boss-enemy', 0xe74c3c);
        this.createColorTexture('boss-button', 0x9b59b6);
        this.createColorTexture('boss-correct', 0x27ae60);
        this.createColorTexture('boss-wrong', 0xc0392b);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);

        if (key === 'boss-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else if (key === 'boss-enemy') {
            graphics.fillCircle(50, 50, 50);
        } else {
            graphics.fillRoundedRect(0, 0, 120, 50, 10);
        }

        graphics.generateTexture(key,
            key === 'boss-bg' ? 800 : 120,
            key === 'boss-bg' ? 600 : 50
        );
        graphics.destroy();
    }

    create() {
        console.log('Boss level started');

        // Фон
        this.add.image(400, 300, 'boss-bg');

        // Заголовок
        this.add.text(400, 80, 'БОСС-УРОВЕНЬ!', {
            fontSize: '48px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5
            }
        }).setOrigin(0.5);

        // Босс
        this.boss = this.add.image(400, 200, 'boss-enemy').setScale(2);

        // Анимация босса
        this.tweens.add({
            targets: this.boss,
            scaleX: 2.1,
            scaleY: 2.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Инструкция
        this.add.text(400, 280, `Реши ${this.requiredAnswers} примера подряд, чтобы победить босса!`, {
            fontSize: '20px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            backgroundColor: '#00000066',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Счетчик правильных ответов
        this.counterText = this.add.text(400, 320, `Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`, {
            fontSize: '24px',
            fill: '#f1c40f',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => {
            this.generateBossProblem();
        });
    }

    generateBossProblem() {
        // Очистка предыдущих элементов
        if (this.problemText) this.problemText.destroy();
        if (this.answerButtons) {
            this.answerButtons.forEach(btn => {
                if (btn.button) btn.button.destroy();
                if (btn.text) btn.text.destroy();
            });
        }
        this.answerButtons = [];

        // Сложные примеры для босса
        const a = Phaser.Math.Between(10, 20);
        const b = Phaser.Math.Between(5, 15);
        const operations = [];
        if (gameSettings.addition) operations.push('+');
        if (gameSettings.subtraction) operations.push('-');
        if (gameSettings.multiplication) operations.push('×');

        const operation = operations[Math.floor(Math.random() * operations.length)];

        let answer;
        switch (operation) {
            case '+':
                answer = a + b;
                break;
            case '-':
                answer = a - b;
                break;
            case '×':
                answer = a * b;
                break;
        }

        this.currentBossProblem = {
            question: `${a} ${operation} ${b} = ?`,
            answer: answer
        };

        this.showBossProblem();
    }

    showBossProblem() {
        // Отображение вопроса
        this.problemText = this.add.text(400, 370, this.currentBossProblem.question, {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa',
            padding: { x: 20, y: 10 },
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Генерация вариантов ответов
        const answers = [this.currentBossProblem.answer];
        while (answers.length < 3) {
            let wrongAnswer;
            const variation = Phaser.Math.Between(-8, 8);
            wrongAnswer = this.currentBossProblem.answer + variation;

            if (wrongAnswer !== this.currentBossProblem.answer && !answers.includes(wrongAnswer) && wrongAnswer > 0) {
                answers.push(wrongAnswer);
            }
        }

        // Перемешивание ответов
        Phaser.Utils.Array.Shuffle(answers);

        // Создание кнопок ответов
        answers.forEach((answer, index) => {
            const button = this.add.image(300 + index * 150, 450, 'boss-button')
                .setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(300 + index * 150, 450, answer.toString(), {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.checkBossAnswer(answer, button, buttonText);
            });

            this.answerButtons.push({ button, text: buttonText });
        });
    }

    checkBossAnswer(selectedAnswer, button, buttonText) {
        // Блокируем все кнопки
        this.answerButtons.forEach(btn => {
            btn.button.disableInteractive();
        });

        if (selectedAnswer === this.currentBossProblem.answer) {
            // Правильный ответ
            button.setTexture('boss-correct');
            this.correctAnswers++;

            // Обновление счетчика
            this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);

            // Анимация успеха
            this.tweens.add({
                targets: this.boss,
                scaleX: 1.8,
                scaleY: 1.8,
                duration: 300,
                yoyo: true
            });

            if (this.correctAnswers >= this.requiredAnswers) {
                // Победа над боссом
                this.bossDefeated = true;
                this.add.text(400, 520, 'БОСС ПОБЕЖДЁН! 🎉', {
                    fontSize: '32px',
                    fill: '#27ae60',
                    fontWeight: 'bold'
                }).setOrigin(0.5);

                // Анимация исчезновения босса
                this.tweens.add({
                    targets: this.boss,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power2',
                    onComplete: () => {
                        this.time.delayedCall(1500, () => {
                            this.scene.start('Victory');
                        });
                    }
                });
            } else {
                // Продолжаем бой
                this.add.text(400, 520, 'Правильно! 👍', {
                    fontSize: '24px',
                    fill: '#27ae60'
                }).setOrigin(0.5);

                this.time.delayedCall(1000, () => {
                    this.generateBossProblem();
                });
            }
        } else {
            // Неправильный ответ
            button.setTexture('boss-wrong');
            this.correctAnswers = 0;

            // Обновление счетчика
            this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);

            // Анимация неудачи
            this.tweens.add({
                targets: this.boss,
                x: 410,
                duration: 100,
                yoyo: true,
                repeat: 5
            });

            // Подсветка правильного ответа
            this.answerButtons.forEach(btn => {
                if (parseInt(btn.text.text) === this.currentBossProblem.answer) {
                    btn.button.setTexture('boss-correct');
                }
            });

            this.add.text(400, 520, 'Неправильно! Начинаем заново... 🔄', {
                fontSize: '20px',
                fill: '#e74c3c'
            }).setOrigin(0.5);

            this.time.delayedCall(2000, () => {
                this.generateBossProblem();
            });
        }
    }
}