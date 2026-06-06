class RescueMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'RescueMiniGame' });
        this.currentNumber = 1;
        this.timeLeft = 15;
        this.numbers = [];
        this.gameEnded = false;
    }

    preload() {
        this.createColorTexture('rescue-bg', 0x27ae60); // ярко-зелёный
        this.createColorTexture('number-bubble', 0x3498db);
        this.createColorTexture('number-correct', 0xf1c40f);
        this.createColorTexture('particle-star', 0xffd700); // золотая звёздочка
    }

    createColorTexture(key, color) {
        const g = this.add.graphics();
        g.fillStyle(color);
        if (key === 'rescue-bg') g.fillRect(0, 0, 800, 600);
        else if (key === 'particle-star') {
            g.fillStyle(color);
            g.fillStar(5, 5, 5, 3);
        } else g.fillCircle(25, 25, 25);
        g.generateTexture(key, key === 'rescue-bg' ? 800 : 50, key === 'rescue-bg' ? 600 : 50);
        g.destroy();
    }

    create() {
        this.gameEnded = false;
        this.currentNumber = 1;
        this.timeLeft = 15;
        this.numbers = [];
        this.add.image(400, 300, 'rescue-bg');

        this.add.text(400, 50, 'СПАСИ ДРУГА!', {
            fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.add.text(400, 100, 'Нажимай на числа по порядку от 1 до 9', {
            fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(400, 140, 'У тебя есть 15 секунд! ⏰', {
            fontSize: '18px', fill: '#ffffff', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => { if (!this.gameEnded) this.startMiniGame(); });
    }

    startMiniGame() {
        const positions = [];
        for (let i = 1; i <= 9; i++) {
            let x, y, att = 0;
            do {
                x = Phaser.Math.Between(100, 700);
                y = Phaser.Math.Between(200, 480);
                att++;
            } while (this.isOverlapping(x, y, positions) && att < 50);
            positions.push({ x, y });

            const bubble = this.add.image(x, y, 'number-bubble')
                .setInteractive({ useHandCursor: true })
                .setData('value', i);
            const numberText = this.add.text(x, y, i.toString(), {
                fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5, 0.5);
            bubble.on('pointerdown', () => this.handleNumberClick(bubble, numberText, i));
            this.numbers.push({ bubble, text: numberText, value: i });
        }

        this.timerText = this.add.text(400, 560, `Время: ${this.timeLeft} сек`, {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial',
            backgroundColor: '#00000066', padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    isOverlapping(x, y, pos) {
        return pos.some(p => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 70);
    }

    handleNumberClick(bubble, text, value) {
        if (this.gameEnded) return;
        if (value === this.currentNumber) {
            bubble.setTexture('number-correct');
            text.setStyle({ fill: '#000' });
            bubble.disableInteractive();
            this.currentNumber++;
            this.tweens.add({ targets: [bubble, text], scale: 1.3, duration: 200, yoyo: true });
            if (this.currentNumber > 9) this.miniGameSuccess();
        }
    }

    updateTimer() {
        if (this.gameEnded) return;
        this.timeLeft--;
        this.timerText.setText(`Время: ${this.timeLeft} сек`);
        if (this.timeLeft <= 5) this.timerText.setStyle({ fill: '#e74c3c' });
        if (this.timeLeft <= 0) this.miniGameFail();
    }

    miniGameSuccess() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        if (this.timer) this.timer.remove();

        // Фейерверк
        for (let i = 0; i < 20; i++) {
            const star = this.add.image(400, 300, 'particle-star').setScale(0.5).setTint(Phaser.Math.RND.pick([0xff6b6b, 0xfeca57, 0x48dbfb]));
            this.tweens.add({
                targets: star, x: 400 + Phaser.Math.Between(-200, 200), y: Phaser.Math.Between(100, 500),
                alpha: 0, scale: 0, duration: 600, delay: Math.random() * 300, onComplete: () => star.destroy()
            });
        }

        const panel = this.add.image(400, 300, 'panel').setDepth(10);
        this.add.text(400, 280, 'Ты спас друга! 🎉', { fontSize: '28px', fill: '#f1c40f', fontFamily: 'Arial', fontWeight: 'bold' }).setOrigin(0.5).setDepth(11);
        this.add.text(400, 330, 'Герой возвращается в бой! ⚔️', { fontSize: '18px', fill: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5).setDepth(11);
        this.time.delayedCall(2000, () => { gameSettings.lives = 3; this.scene.start('GameScene'); });
    }

    miniGameFail() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        if (this.timer) this.timer.remove();

        const panel = this.add.image(400, 300, 'panel').setDepth(10);
        this.add.text(400, 240, 'Время вышло!\nУстал? Хочешь продолжить?', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', align: 'center', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);
        const yesBtn = this.add.text(250, 350, 'Да, попробовать ещё', {
            fontSize: '22px', fill: '#2ecc71', backgroundColor: '#00000088', padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
        const noBtn = this.add.text(550, 350, 'Нет, выйти в меню', {
            fontSize: '22px', fill: '#e74c3c', backgroundColor: '#00000088', padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
        yesBtn.on('pointerdown', () => this.scene.restart());
        noBtn.on('pointerdown', () => { gameSettings.lives = 3; this.scene.start('MainMenu'); });
    }
}

class MagicPauseMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MagicPauseMiniGame' });
        this.clouds = [];
        this.expectedOrder = [];
        this.currentIndex = 0;
        this.canClick = true;
        this.gameEnded = false;
        this.flexibleOrder = false;
    }

    preload() {
        // Текстуры создаются динамически
    }

    create() {
        this.gameEnded = false;
        this.canClick = true;
        this.currentIndex = 0;
        this.clouds = [];

        this.cameras.main.setBackgroundColor('#2c3e50');

        this.add.text(400, 60, 'МАГИЧЕСКАЯ ПАУЗА', {
            fontSize: '36px', fill: '#f1c40f', fontFamily: 'Arial', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.add.text(400, 110, 'Собери последний пример по порядку!', {
            fontSize: '20px', fill: '#ecf0f1', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const lastQ = gameSettings.lastQuestion || '2 + 2 = ?';
        const parts = lastQ.split(' ');
        const a = parts[0], op = parts[1], b = parts[2], answer = gameSettings.lastAnswer.toString();

        if (op === '+' || op === '×') {
            this.flexibleOrder = true;
            this.expectedOrder = [
                { value: a, type: 'number', accepts: [a, b] },
                { value: op, type: 'operator', accepts: [op] },
                { value: b, type: 'number', accepts: [a, b] },
                { value: '=', type: 'operator', accepts: ['='] },
                { value: answer, type: 'answer', accepts: [answer] }
            ];
        } else {
            this.flexibleOrder = false;
            this.expectedOrder = [
                { value: a, type: 'number', accepts: [a] },
                { value: op, type: 'operator', accepts: [op] },
                { value: b, type: 'number', accepts: [b] },
                { value: '=', type: 'operator', accepts: ['='] },
                { value: answer, type: 'answer', accepts: [answer] }
            ];
        }

        const allElements = [a, b, op, '=', answer];
        const distractors = ['7', '12', '-', '×', '4', '15'];
        Phaser.Utils.Array.Shuffle(distractors);
        allElements.push(distractors[0], distractors[1]);
        Phaser.Utils.Array.Shuffle(allElements);

        this.createClouds(allElements);

        this.statusText = this.add.text(400, 560, 'Нажми на первый элемент цепочки', {
            fontSize: '20px', fill: '#ffffff', backgroundColor: '#00000066', padding: { x: 10, y: 8 }
        }).setOrigin(0.5);
    }

    createClouds(elements) {
        this.clouds.forEach(c => { if (c.graphics) c.graphics.destroy(); if (c.text) c.text.destroy(); });
        this.clouds = [];
        this.currentIndex = 0;
        this.canClick = true;

        const positions = [];
        elements.forEach(element => {
            let x, y, att = 0;
            do {
                x = Phaser.Math.Between(150, 650);
                y = Phaser.Math.Between(180, 480);
                att++;
            } while (this.isOverlapping(x, y, positions) && att < 50);
            positions.push({ x, y });

            const graphics = this.add.graphics();
            graphics.fillStyle(0x34495e, 1);
            graphics.fillRoundedRect(x - 50, y - 30, 100, 60, 15);
            graphics.lineStyle(2, 0xf1c40f, 1);
            graphics.strokeRoundedRect(x - 50, y - 30, 100, 60, 15);
            graphics.setInteractive(new Phaser.Geom.Rectangle(x - 50, y - 30, 100, 60), Phaser.Geom.Rectangle.Contains);

            const text = this.add.text(x, y, element, {
                fontSize: '24px', fill: '#ecf0f1', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5, 0.5);

            graphics.on('pointerdown', () => this.onCloudClick(graphics, text, element));
            this.clouds.push({ graphics, text, value: element });
        });
    }

    isOverlapping(x, y, pos) {
        return pos.some(p => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 80);
    }

    onCloudClick(graphics, text, value) {
        if (!this.canClick || this.gameEnded) return;
        const expected = this.expectedOrder[this.currentIndex];
        if (expected.accepts.includes(value)) {
            // правильный выбор
            graphics.clear();
            graphics.fillStyle(0x00b894, 1);
            graphics.fillRoundedRect(graphics.input.hitArea.x, graphics.input.hitArea.y, 100, 60, 15);
            graphics.lineStyle(2, 0xf1c40f, 1);
            graphics.strokeRoundedRect(graphics.input.hitArea.x, graphics.input.hitArea.y, 100, 60, 15);
            text.setStyle({ fill: '#ffffff' });
            graphics.disableInteractive();
            this.currentIndex++;
            if (this.currentIndex === this.expectedOrder.length) {
                this.gameEnded = true;
                gameSettings.shield = true;
                this.statusText.setText('Магический щит получен! 🛡️');
                this.time.delayedCall(2000, () => this.scene.start('GameScene'));
            } else {
                this.statusText.setText(`Дальше: ${this.expectedOrder[this.currentIndex].value}`);
            }
        } else {
            this.canClick = false;
            graphics.clear();
            graphics.fillStyle(0xd63031, 1);
            graphics.fillRoundedRect(graphics.input.hitArea.x, graphics.input.hitArea.y, 100, 60, 15);
            text.setStyle({ fill: '#ffffff' });
            this.clouds.forEach(c => {
                if (c.value === expected.accepts[0]) {
                    c.graphics.clear();
                    c.graphics.fillStyle(0x00b894, 1);
                    c.graphics.fillRoundedRect(c.graphics.input.hitArea.x, c.graphics.input.hitArea.y, 100, 60, 15);
                }
                c.graphics.disableInteractive();
            });
            this.showRetryDialog('Ошибка! Попробуем снова?');
        }
    }

    showRetryDialog(message) {
        const panel = this.add.image(400, 300, 'panel').setDepth(10);
        this.add.text(400, 240, message, {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', align: 'center', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);
        const yesBtn = this.add.text(250, 350, 'Да, попробовать', {
            fontSize: '22px', fill: '#2ecc71', backgroundColor: '#00000088', padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
        const noBtn = this.add.text(550, 350, 'Нет, выйти в меню', {
            fontSize: '22px', fill: '#e74c3c', backgroundColor: '#00000088', padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
        yesBtn.on('pointerdown', () => this.scene.restart());
        noBtn.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}

class SecretTrainingMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SecretTrainingMiniGame' });
        this.player = null;
        this.collectedSum = 0;
        this.targetSum = gameSettings.lastAnswer || 8;
        this.gameEnded = false;
    }

    preload() {
        this.createColorTexture('training-bg', 0x1a1a2e);
        this.createColorTexture('player', 0xfdcb6e);
        this.createColorTexture('coin', 0xf1c40f);
    }

    createColorTexture(key, color) {
        const g = this.add.graphics();
        g.fillStyle(color);
        if (key === 'training-bg') g.fillRect(0, 0, 800, 600);
        else if (key === 'player') g.fillCircle(16, 16, 16);
        else g.fillCircle(12, 12, 12);
        g.generateTexture(key, key === 'training-bg' ? 800 : (key === 'player' ? 32 : 24), key === 'training-bg' ? 600 : (key === 'player' ? 32 : 24));
        g.destroy();
    }

    create() {
        this.gameEnded = false;
        this.collectedSum = 0;
        this.targetSum = gameSettings.lastAnswer || 8;
        this.add.image(400, 300, 'training-bg');

        // Звёзды на фоне (декор)
        for (let i = 0; i < 20; i++) {
            this.add.image(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'coin').setScale(0.3).setTint(0xf1c40f).setAlpha(0.3);
        }

        this.add.text(400, 35, 'СЕКРЕТНАЯ ТРЕНИРОВКА', {
            fontSize: '28px', fill: '#f1c40f', fontFamily: 'Arial', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);
        this.add.text(400, 70, `Собери числа, чтобы получить ровно ${this.targetSum}`, {
            fontSize: '18px', fill: '#ecf0f1', fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(400, 95, 'Управляй: стрелки / WASD или мышью/пальцем', {
            fontSize: '14px', fill: '#bdc3c7', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.player = this.physics.add.sprite(400, 480, 'player').setCollideWorldBounds(true);
        this.createWalls();
        this.createCoins();
        this.physics.add.overlap(this.player, this.numbersGroup, this.collectCoin, null, this);

        this.sumText = this.add.text(400, 560, `Собрано: 0 / ${this.targetSum}`, {
            fontSize: '22px', fill: '#f1c40f', fontFamily: 'Arial', fontWeight: 'bold', backgroundColor: '#00000066', padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'), down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'), right: this.input.keyboard.addKey('D')
        };
        this.input.on('pointermove', (pointer) => {
            if (!this.gameEnded) this.physics.moveTo(this.player, pointer.x, pointer.y, 200);
        });
        this.time.delayedCall(30000, () => { if (!this.gameEnded) this.finish(false); });
    }

    createWalls() {
        this.walls = this.physics.add.staticGroup();
        const wallData = [
            [200, 120, 400, 20], [200, 550, 400, 20],
            [50, 250, 20, 250], [750, 250, 20, 250],
            [400, 300, 20, 200], [300, 400, 200, 20]
        ];
        wallData.forEach(([x, y, w, h]) => {
            const g = this.add.graphics();
            g.fillStyle(0xbdc3c7);
            g.fillRect(0, 0, w, h);
            g.generateTexture('wall_' + x + y, w, h);
            g.destroy();
            this.walls.create(x + w / 2, y + h / 2, 'wall_' + x + y).setImmovable(true).refreshBody();
        });
        this.physics.add.collider(this.player, this.walls);
    }

    createCoins() {
        this.numbersGroup = this.physics.add.group();
        const coinPositions = [];
        let remaining = this.targetSum;
        const coins = [];
        while (remaining > 0) {
            const val = Math.min(remaining, Phaser.Math.Between(1, Math.min(10, remaining)));
            coins.push(val);
            remaining -= val;
        }
        coins.push(Phaser.Math.Between(1, 10), Phaser.Math.Between(1, 10));
        Phaser.Utils.Array.Shuffle(coins);

        coins.forEach(val => {
            let x, y, attempts = 0;
            do {
                x = Phaser.Math.Between(120, 680);
                y = Phaser.Math.Between(180, 480);
                attempts++;
            } while (attempts < 50 && this.isOverlapping(x, y, coinPositions));
            coinPositions.push({ x, y });

            const coin = this.numbersGroup.create(x, y, 'coin').setScale(1.5);
            coin.value = val;
            this.add.text(x, y, val.toString(), {
                fontSize: '14px', fill: '#000', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5, 0.5);
        });
    }

    isOverlapping(x, y, positions) {
        return positions.some(p => Phaser.Math.Distance.Between(x, y, p.x, p.y) < 70);
    }

    collectCoin(player, coin) {
        if (this.gameEnded) return;
        this.collectedSum += coin.value;
        this.sumText.setText(`Собрано: ${this.collectedSum} / ${this.targetSum}`);
        coin.destroy();
        if (this.collectedSum === this.targetSum) this.finish(true);
        else if (this.collectedSum > this.targetSum) this.finish(false);
    }

    finish(success) {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.physics.pause();
        this.time.removeAllEvents();

        if (success) {
            // Конфетти
            for (let i = 0; i < 15; i++) {
                const p = this.add.image(400, 300, 'coin').setScale(0.5).setTint(0xf1c40f);
                this.tweens.add({
                    targets: p, x: 400 + Phaser.Math.Between(-200, 200), y: Phaser.Math.Between(100, 500),
                    alpha: 0, scale: 0, duration: 600, delay: Math.random() * 300, onComplete: () => p.destroy()
                });
            }
            gameSettings.bonusLife = true;
            this.showMessageAndReturn('Великолепно! +1 жизнь! ❤️', 0x00b894);
        } else {
            const panel = this.add.image(400, 300, 'panel').setDepth(10);
            this.add.text(400, 240, 'Почти получилось!\nХочешь попробовать снова?', {
                fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', align: 'center', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(11);
            const yesBtn = this.add.text(250, 350, 'Да, попробовать', {
                fontSize: '22px', fill: '#2ecc71', backgroundColor: '#00000088', padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
            const noBtn = this.add.text(550, 350, 'Нет, выйти в меню', {
                fontSize: '22px', fill: '#e74c3c', backgroundColor: '#00000088', padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);
            yesBtn.on('pointerdown', () => this.scene.restart());
            noBtn.on('pointerdown', () => this.scene.start('MainMenu'));
        }
    }

    showMessageAndReturn(msg, color) {
        this.add.rectangle(400, 300, 600, 200, 0x000000, 0.85).setDepth(10);
        this.add.text(400, 300, msg, { fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', align: 'center' }).setOrigin(0.5).setDepth(11);
        this.time.delayedCall(2000, () => this.scene.start('GameScene'));
    }

    update() {
        if (this.gameEnded) return;
        const speed = 200;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown || this.wasd.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.wasd.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown || this.wasd.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown || this.wasd.down.isDown) this.player.setVelocityY(speed);
    }
}