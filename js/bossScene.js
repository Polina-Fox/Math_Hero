class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');
    }

    create() {
        this.add.image(400, 300, 'gameBackground');

        this.add.text(400, 100, 'БОСС-УРОВЕНЬ!', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.bossDefeated = false;
        this.correctAnswers = 0;
        this.requiredAnswers = 3;

        this.startBossBattle();
    }

    startBossBattle() {
        this.add.text(400, 150, 'Победи босса, решив 3 примера подряд!', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.generateBossProblem();
    }

    generateBossProblem() {
        // Сложные примеры для босса
        const a = Phaser.Math.Between(10, 20);
        const b = Phaser.Math.Between(5, 15);
        const operations = ['+', '-', '?'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let answer;
        switch (operation) {
            case '+': answer = a + b; break;
            case '-': answer = a - b; break;
            case '?': answer = a * b; break;
        }

        this.currentBossProblem = {
            question: `${a} ${operation} ${b} = ?`,
            answer: answer
        };

        this.showBossProblem();
    }

    showBossProblem() {
        this.add.text(400, 250, this.currentBossProblem.question, {
            fontSize: '36px',
            fill: '#fff',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Генерация вариантов ответов
        const answers = [this.currentBossProblem.answer];
        while (answers.length < 3) {
            const wrongAnswer = this.currentBossProblem.answer + Phaser.Math.Between(-8, 8);
            if (wrongAnswer !== this.currentBossProblem.answer && !answers.includes(wrongAnswer) && wrongAnswer > 0) {
                answers.push(wrongAnswer);
            }
        }

        Phaser.Utils.Array.Shuffle(answers);

        answers.forEach((answer, index) => {
            const button = this.add.rectangle(300 + index * 150, 350, 120, 50, 0x8a2be2)
                .setInteractive()
                .setStrokeStyle(2, 0xffffff);

            const buttonText = this.add.text(300 + index * 150, 350, answer.toString(), {
                fontSize: '24px',
                fill: '#fff'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.checkBossAnswer(answer, button);
            });
        });
    }

    checkBossAnswer(selectedAnswer, button) {
        if (selectedAnswer === this.currentBossProblem.answer) {
            button.setFillStyle(0x00ff00);
            this.correctAnswers++;

            this.add.text(400, 400, `Правильно! ${this.correctAnswers}/3`, {
                fontSize: '24px',
                fill: '#00ff00'
            }).setOrigin(0.5);

            if (this.correctAnswers >= this.requiredAnswers) {
                this.bossDefeated = true;
                this.time.delayedCall(1500, () => {
                    this.scene.start('Victory');
                });
            } else {
                this.time.delayedCall(1000, () => {
                    this.generateBossProblem();
                });
            }
        } else {
            button.setFillStyle(0xff0000);
            this.correctAnswers = 0;

            this.add.text(400, 400, 'Неправильно! Начинаем заново...', {
                fontSize: '24px',
                fill: '#ff0000'
            }).setOrigin(0.5);

            this.time.delayedCall(1500, () => {
                this.generateBossProblem();
            });
        }
    }
}