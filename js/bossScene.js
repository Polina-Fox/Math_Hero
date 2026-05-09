class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
        this.correctAnswers = 0;
        this.requiredAnswers = 3;
        this.bossDefeated = false;
    }

    preload() {
        this.createColorTexture('boss-enemy', 0xe74c3c);
        this.createColorTexture('boss-button', 0x9b59b6);
        this.createColorTexture('boss-correct', 0x27ae60);
        this.createColorTexture('boss-wrong', 0xc0392b);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        if (key === 'boss-enemy') {
            graphics.fillCircle(50, 50, 50);
        } else {
            graphics.fillRoundedRect(0, 0, 120, 50, 10);
        }
        graphics.generateTexture(key, key === 'boss-enemy' ? 120 : 120, 50);
        graphics.destroy();
    }

    create() {
        console.log('Boss level started');
        // Фон пустыни
        this.add.image(400, 300, 'bg-desert').setDisplaySize(800, 600);

        this.add.text(400, 80, 'БОСС-УРОВЕНЬ!', {
            fontSize: '48px', fill: '#f1c40f', fontFamily: 'Arial', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this.boss = this.add.image(400, 200, 'boss-enemy').setScale(2);
        this.tweens.add({
            targets: this.boss, scaleX: 2.1, scaleY: 2.1, duration: 1000, yoyo: true, repeat: -1
        });

        this.add.text(400, 280, `Реши ${this.requiredAnswers} примера подряд, чтобы победить босса!`, {
            fontSize: '20px', fill: '#ecf0f1', fontFamily: 'Arial', backgroundColor: '#00000066', padding: 10
        }).setOrigin(0.5);

        this.counterText = this.add.text(400, 320, `Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`, {
            fontSize: '24px', fill: '#f1c40f', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => this.generateBossProblem());
    }

    generateBossProblem() {
        if (this.problemText) this.problemText.destroy();
        if (this.answerButtons) {
            this.answerButtons.forEach(b => { if (b.button) b.button.destroy(); if (b.text) b.text.destroy(); });
        }
        this.answerButtons = [];

        let a, b, answer, question;
        const ops = [];
        if (gameSettings.addition) ops.push('+');
        if (gameSettings.subtraction) ops.push('-');
        if (gameSettings.multiplication) ops.push('×');
        const operation = Phaser.Math.RND.pick(ops);

        if (operation === '×') {
            a = Phaser.Math.Between(4, 9);
            b = Phaser.Math.Between(2, 8);
            answer = a * b;
            question = `${a} × ${b} = ?`;
        } else {
            a = Phaser.Math.Between(10, 15);
            b = Phaser.Math.Between(5, 10);
            if (operation === '+') {
                answer = a + b;
                question = `${a} + ${b} = ?`;
            } else {
                answer = a - b;
                question = `${a} - ${b} = ?`;
            }
        }

        this.currentBossProblem = { question, answer };
        gameSettings.lastQuestion = this.currentBossProblem.question;
        gameSettings.lastAnswer = this.currentBossProblem.answer;

        this.showBossProblem();
    }

    showBossProblem() {
        this.problemText = this.add.text(400, 370, this.currentBossProblem.question, {
            fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial', backgroundColor: '#000000aa', padding: 20
        }).setOrigin(0.5);

        const answers = [this.currentBossProblem.answer];
        while (answers.length < 3) {
            const wrong = this.currentBossProblem.answer + Phaser.Math.Between(-8, 8);
            if (wrong > 0 && !answers.includes(wrong)) answers.push(wrong);
        }
        Phaser.Utils.Array.Shuffle(answers);

        answers.forEach((ans, i) => {
            const x = 300 + i * 150, y = 450;
            const btn = this.add.image(x, y, 'boss-button').setInteractive({ useHandCursor: true });
            const txt = this.add.text(x, y, ans.toString(), {
                fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5);
            btn.on('pointerdown', () => this.checkBossAnswer(ans, btn, txt));
            this.answerButtons.push({ button: btn, text: txt });
        });
    }

    checkBossAnswer(selected, btn, txt) {
        this.answerButtons.forEach(b => b.button.disableInteractive());
        if (selected === this.currentBossProblem.answer) {
            btn.setTexture('boss-correct');
            this.correctAnswers++;
            this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);
            if (this.correctAnswers >= this.requiredAnswers) {
                this.bossDefeated = true;
                this.add.text(400, 520, 'БОСС ПОБЕЖДЁН! 🎉', { fontSize: '32px', fill: '#27ae60' }).setOrigin(0.5);
                this.tweens.add({
                    targets: this.boss, scaleX: 0, scaleY: 0, alpha: 0, duration: 1000,
                    onComplete: () => {
                        this.time.delayedCall(1500, () => this.scene.start('OutroCutscene')); // или 'Victory'
                    }
                });
            } else {
                this.add.text(400, 520, 'Правильно! 👍', { fontSize: '24px', fill: '#27ae60' }).setOrigin(0.5);
                this.time.delayedCall(1000, () => this.generateBossProblem());
            }
        } else {
            btn.setTexture('boss-wrong');
            this.correctAnswers = 0;
            this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);
            this.answerButtons.forEach(b => {
                if (parseInt(b.text.text) === this.currentBossProblem.answer) b.button.setTexture('boss-correct');
            });
            this.add.text(400, 520, 'Неправильно! Начинаем заново... 🔄', { fontSize: '20px', fill: '#e74c3c' }).setOrigin(0.5);
            this.time.delayedCall(2000, () => this.generateBossProblem());
        }
    }
}