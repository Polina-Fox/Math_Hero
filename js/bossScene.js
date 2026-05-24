// bossScene.js - без надписи за боссом, с музыкой

class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
        this.correctAnswers = 0; this.requiredAnswers = 3; this.bossDefeated = false; this.feedbackText = null; this.bossMusic = null;
    }

    preload() { this.createColorTexture('boss-button', 0x9b59b6); this.createColorTexture('boss-correct', 0x27ae60); this.createColorTexture('boss-wrong', 0xc0392b); }
    createColorTexture(key, color) { const g = this.add.graphics(); g.fillStyle(color); g.fillRoundedRect(0, 0, 120, 50, 10); g.generateTexture(key, 120, 50); g.destroy(); }

    create() {
        console.log('Boss level started');
        this.correctAnswers = 0; this.bossDefeated = false; this.feedbackText = null;
        this.add.image(400, 300, 'bg-desert').setDisplaySize(800, 600);

        // Музыка босса
        try { this.bossMusic = this.sound.add('music-otts', { loop: true, volume: 0.3 }); this.bossMusic.play(); } catch (e) { }

        this.add.text(400, 80, 'БОСС-УРОВЕНЬ!', { fontSize: '48px', fill: '#f1c40f', fontFamily: 'Arial', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);

        const bossBody = this.add.image(0, 0, 'body_redF').setScale(2.5);
        const bossEye = this.add.image(0, -20, 'eye_angry_red').setScale(2.5);
        const bossMouth = this.add.image(0, 25, 'mouthC').setScale(2.0);
        const antennaL = this.add.image(-35, -45, 'detail_red_antenna_small').setScale(2.0);
        const antennaR = this.add.image(35, -45, 'detail_red_antenna_small').setScale(2.0);
        this.bossContainer = this.add.container(400, 200, [bossBody, bossEye, bossMouth, antennaL, antennaR]);
        this.tweens.add({ targets: this.bossContainer, scaleX: 2.1, scaleY: 2.1, duration: 1000, yoyo: true, repeat: -1 });

        // Убираем надпись за боссом — теперь только счётчик спереди
        this.counterText = this.add.text(400, 320, `Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`, { fontSize: '24px', fill: '#f1c40f', fontFamily: 'Arial', fontWeight: 'bold' }).setOrigin(0.5);

        this.time.delayedCall(1000, () => this.generateBossProblem());
    }

    generateBossProblem() {
        if (this.problemText) this.problemText.destroy();
        if (this.answerButtons) this.answerButtons.forEach(b => { if (b.button) b.button.destroy(); if (b.text) b.text.destroy(); });
        this.answerButtons = [];
        let a, b, answer, question; const ops = []; if (gameSettings.addition) ops.push('+'); if (gameSettings.subtraction) ops.push('-'); if (gameSettings.multiplication) ops.push('×');
        const op = Phaser.Math.RND.pick(ops);
        if (op === '×') { a = Phaser.Math.Between(4, 9); b = Phaser.Math.Between(2, 8); answer = a * b; question = `${a} × ${b} = ?`; }
        else { a = Phaser.Math.Between(10, 15); b = Phaser.Math.Between(5, 10); answer = op === '+' ? a + b : a - b; question = `${a} ${op} ${b} = ?`; }
        this.currentBossProblem = { question, answer }; gameSettings.lastQuestion = question; gameSettings.lastAnswer = answer;
        this.showBossProblem();
    }

    showBossProblem() {
        this.problemText = this.add.text(400, 370, this.currentBossProblem.question, { fontSize: '36px', fill: '#fff', fontFamily: 'Arial', backgroundColor: '#000000aa', padding: 20 }).setOrigin(0.5);
        const answers = [this.currentBossProblem.answer]; while (answers.length < 3) { const w = this.currentBossProblem.answer + Phaser.Math.Between(-8, 8); if (w > 0 && !answers.includes(w)) answers.push(w); }
        Phaser.Utils.Array.Shuffle(answers);
        answers.forEach((ans, i) => { const x = 300 + i * 150, y = 450; const btn = this.add.image(x, y, 'boss-button').setInteractive({ useHandCursor: true }); const txt = this.add.text(x, y, ans.toString(), { fontSize: '24px', fill: '#fff', fontFamily: 'Arial', fontWeight: 'bold' }).setOrigin(0.5); btn.on('pointerdown', () => this.checkBossAnswer(ans, btn, txt)); this.answerButtons.push({ button: btn, text: txt }); });
    }

    checkBossAnswer(selected, btn, txt) {
        this.answerButtons.forEach(b => b.button.disableInteractive());
        if (this.feedbackText) { this.feedbackText.destroy(); this.feedbackText = null; }
        if (selected === this.currentBossProblem.answer) {
            btn.setTexture('boss-correct'); this.correctAnswers++; this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);
            if (this.correctAnswers >= this.requiredAnswers) { this.bossDefeated = true; this.feedbackText = this.add.text(400, 520, 'БОСС ПОБЕЖДЁН! 🎉', { fontSize: '32px', fill: '#27ae60' }).setOrigin(0.5); if (this.bossMusic) this.bossMusic.stop(); this.tweens.add({ targets: this.bossContainer, scaleX: 0, scaleY: 0, alpha: 0, duration: 1000, onComplete: () => this.time.delayedCall(1500, () => this.scene.start('Victory')) }); }
            else { this.feedbackText = this.add.text(400, 520, 'Правильно! 👍', { fontSize: '24px', fill: '#27ae60' }).setOrigin(0.5); this.time.delayedCall(1000, () => { if (this.feedbackText) this.feedbackText.destroy(); this.generateBossProblem(); }); }
        } else {
            btn.setTexture('boss-wrong'); this.correctAnswers = 0; this.counterText.setText(`Правильных ответов: ${this.correctAnswers}/${this.requiredAnswers}`);
            this.answerButtons.forEach(b => { if (parseInt(b.text.text) === this.currentBossProblem.answer) b.button.setTexture('boss-correct'); });
            this.feedbackText = this.add.text(400, 520, 'Неправильно! Начинаем заново... 🔄', { fontSize: '20px', fill: '#e74c3c' }).setOrigin(0.5);
            this.time.delayedCall(2000, () => { if (this.feedbackText) this.feedbackText.destroy(); this.generateBossProblem(); });
        }
    }
}