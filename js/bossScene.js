class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
        this.correctAnswers = 0;
        this.requiredAnswers = 3;
        this.bossDefeated = false;
        this.feedbackText = null;
        this.bossMusic = null;
        this.timeLeft = 40;            // 40 секунд на босса
        this.timerText = null;
        this.bossTimer = null;
    }

    preload() {
        this.createColorTexture('boss-button', 0x9b59b6);
        this.createColorTexture('boss-correct', 0x27ae60);
        this.createColorTexture('boss-wrong', 0xc0392b);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRoundedRect(0, 0, 120, 50, 10);
        graphics.generateTexture(key, 120, 50);
        graphics.destroy();
    }

    create() {
        console.log('Boss level started');
        this.correctAnswers = 0;
        this.bossDefeated = false;
        this.feedbackText = null;
        this.timeLeft = 40;

        this.add.image(400, 300, 'bg-desert').setDisplaySize(800, 600);

        // Музыка босса
        try {
            this.bossMusic = this.sound.add('music-otts', { loop: true, volume: 0.3 });
            this.bossMusic.play();
        } catch (e) {
            console.log('Cannot play boss music:', e);
        }

        this.add.text(400, 80, 'БОСС-УРОВЕНЬ!', {
            fontSize: '48px', fill: '#f1c40f', fontFamily: 'Arial', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        // Босс
        const bossBody = this.add.image(0, 0, 'body_redF').setScale(2.5);
        const bossEye = this.add.image(0, -20, 'eye_angry_red').setScale(2.5);
        const bossMouth = this.add.image(0, 25, 'mouthC').setScale(2.0);
        const antennaL = this.add.image(-35, -45, 'detail_red_antenna_small').setScale(2.0);
        const antennaR = this.add.image(35, -45, 'detail_red_antenna_small').setScale(2.0);
        this.bossContainer = this.add.container(400, 200, [bossBody, bossEye, bossMouth, antennaL, antennaR]);
        this.tweens.add({
            targets: this.bossContainer,
            scaleX: 2.1, scaleY: 2.1, duration: 1000, yoyo: true, repeat: -1
        });

        // Счётчик правильных ответов
        this.counterText = this.add.text(400, 320, `Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`, {
            fontSize: '24px', fill: '#f1c40f', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5);

        // Таймер обратного отсчёта
        this.timerText = this.add.text(400, 360, `Время: ${this.timeLeft} сек`, {
            fontSize: '24px', fill: '#e74c3c', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5);

        this.bossTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.time.delayedCall(1000, () => this.generateBossProblem());
    }

    updateTimer() {
        if (this.bossDefeated) return;
        this.timeLeft--;
        this.timerText.setText(`Время: ${this.timeLeft} сек`);

        if (this.timeLeft <= 10) {
            this.timerText.setStyle({ fill: '#ff0000' });
        }

        if (this.timeLeft <= 0) {
            this.bossTimer.remove();
            this.bossMusic.stop();
            this.feedbackText = this.add.text(400, 520, 'ВРЕМЯ ВЫШЛО! Босс ускользнул...', {
                fontSize: '28px', fill: '#e74c3c', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5);
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
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
        this.problemText = this.add.text(400, 410, this.currentBossProblem.question, {
            fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial', backgroundColor: '#000000aa', padding: 20
        }).setOrigin(0.5);

        const answers = [this.currentBossProblem.answer];
        while (answers.length < 3) {
            const wrong = this.currentBossProblem.answer + Phaser.Math.Between(-8, 8);
            if (wrong > 0 && !answers.includes(wrong)) answers.push(wrong);
        }
        Phaser.Utils.Array.Shuffle(answers);

        answers.forEach((ans, i) => {
            const x = 300 + i * 150, y = 470;
            const btn = this.add.image(x, y, 'boss-button').setInteractive({ useHandCursor: true });
            const txt = this.add.text(x, y, ans.toString(), {
                fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5);
            btn.on('pointerdown', () => this.checkBossAnswer(ans, btn, txt));
            this.answerButtons.push({ button: btn, text: txt });
        });
    }

    checkBossAnswer(selected, btn, txt) {
        if (this.bossDefeated) return;
        this.answerButtons.forEach(b => b.button.disableInteractive());

        if (this.feedbackText) {
            this.feedbackText.destroy();
            this.feedbackText = null;
        }

        if (selected === this.currentBossProblem.answer) {
            btn.setTexture('boss-correct');
            this.correctAnswers++;
            this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);

            if (this.correctAnswers >= this.requiredAnswers) {
                this.bossDefeated = true;
                if (this.bossTimer) this.bossTimer.remove();
                if (this.bossMusic) this.bossMusic.stop();
                this.feedbackText = this.add.text(400, 520, 'БОСС ПОБЕЖДЁН! 🎉', {
                    fontSize: '32px', fill: '#27ae60'
                }).setOrigin(0.5);
                this.tweens.add({
                    targets: this.bossContainer, scaleX: 0, scaleY: 0, alpha: 0, duration: 1000,
                    onComplete: () => {
                        this.time.delayedCall(1500, () => this.scene.start('Victory'));
                    }
                });
            } else {
                this.feedbackText = this.add.text(400, 520, 'Правильно! 👍', {
                    fontSize: '24px', fill: '#27ae60'
                }).setOrigin(0.5);
                this.time.delayedCall(1000, () => {
                    if (this.feedbackText) { this.feedbackText.destroy(); this.feedbackText = null; }
                    this.generateBossProblem();
                });
            }
        } else {
            btn.setTexture('boss-wrong');
            this.correctAnswers = 0;
            this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);
            this.answerButtons.forEach(b => {
                if (parseInt(b.text.text) === this.currentBossProblem.answer) b.button.setTexture('boss-correct');
            });
            this.feedbackText = this.add.text(400, 520, 'Неправильно! Начинаем заново... 🔄', {
                fontSize: '20px', fill: '#e74c3c'
            }).setOrigin(0.5);
            this.time.delayedCall(2000, () => {
                if (this.feedbackText) { this.feedbackText.destroy(); this.feedbackText = null; }
                this.generateBossProblem();
            });
        }
    }
}