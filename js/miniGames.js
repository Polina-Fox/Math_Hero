class RescueMiniGame extends Phaser.Scene {
    constructor() {
        super({ key: 'RescueMiniGame' });
        this.currentNumber = 1;
        this.timeLeft = 15;
        this.numbers = [];
        this.gameEnded = false;
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
        this.gameEnded = false;
        this.currentNumber = 1;
        this.timeLeft = 15;
        this.numbers = [];

        // Радостный фон
        this.cameras.main.setBackgroundColor('#f0f3bd');

        this.add.text(400, 50, '🌟 СПАСИ ДРУГА! 🌟', {
            fontSize: '38px', fill: '#ff6b6b', fontFamily: 'Arial', stroke: '#fff', strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(400, 105, 'Нажимай на числа по порядку от 1 до 9', {
            fontSize: '22px', fill: '#2c3e50', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(400, 145, 'У тебя есть 15 секунд! ⏰', {
            fontSize: '20px', fill: '#e74c3c', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            if (!this.gameEnded) {
                this.startMiniGame();
            }
        });
    }

    startMiniGame() {
        const positions = [];
        for (let i = 1; i <= 9; i++) {
            let x, y;
            let attempts = 0;
            do {
                x = Phaser.Math.Between(100, 700);
                y = Phaser.Math.Between(200, 480);
                attempts++;
            } while (this.isOverlapping(x, y, positions) && attempts < 50);

            positions.push({ x, y });

            // Радостные цвета шариков
            const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x6ab04c, 0xeb4d4b, 0x30336b, 0x22a6b3, 0xbe2edd];
            const bubble = this.add.image(x, y, 'number-bubble')
                .setInteractive({ useHandCursor: true })
                .setTint(colors[i - 1])
                .setData('value', i);

            const numberText = this.add.text(x, y, i.toString(), {
                fontSize: '24px', fill: '#fff', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5, 0.5);

            bubble.on('pointerdown', () => {
                this.handleNumberClick(bubble, numberText, i);
            });

            this.numbers.push({ bubble: bubble, text: numberText, value: i });
        }

        this.timerText = this.add.text(400, 560, `Время: ${this.timeLeft} сек`, {
            fontSize: '26px', fill: '#fff', fontFamily: 'Arial', backgroundColor: '#00000066', padding: { x: 15, y: 5 }
        }).setOrigin(0.5);

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    isOverlapping(x, y, positions) {
        for (const pos of positions) {
            if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 70) return true;
        }
        return false;
    }

    handleNumberClick(bubble, text, value) {
        if (this.gameEnded) return;

        if (value === this.currentNumber) {
            bubble.setTexture('number-correct');
            text.setStyle({ fill: '#fff' });
            bubble.disableInteractive();
            this.currentNumber++;

            this.tweens.add({
                targets: [bubble, text],
                scaleX: 1.3, scaleY: 1.3, duration: 200, yoyo: true
            });

            if (this.currentNumber > 9) {
                this.miniGameSuccess();
            }
        }
    }

    updateTimer() {
        if (this.gameEnded) return;
        this.timeLeft--;
        this.timerText.setText(`Время: ${this.timeLeft} сек`);

        if (this.timeLeft <= 5) {
            this.timerText.setStyle({ fill: '#ff0000' });
        }

        if (this.timeLeft <= 0) {
            this.miniGameFail();
        }
    }

    miniGameSuccess() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        if (this.timer) this.timer.remove();

        this.add.rectangle(400, 300, 500, 180, 0x000000, 0.7).setDepth(5);
        this.add.text(400, 270, '🎉 УСПЕХ! 🎉', {
            fontSize: '36px', fill: '#f1c40f', fontFamily: 'Arial', fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(6);
        this.add.text(400, 330, 'Друг спасён! Герой возвращается в бой! ⚔️', {
            fontSize: '20px', fill: '#ecf0f1', fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(6);

        this.time.delayedCall(2000, () => {
            gameSettings.lives = 3;
            this.scene.start('GameScene');
        });
    }

    miniGameFail() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        if (this.timer) this.timer.remove();

        const panel = this.add.image(400, 300, 'panel').setDepth(10);
        this.add.text(400, 230, 'Время вышло!\nУстал? Хочешь продолжить?', {
            fontSize: '26px', fill: '#fff', fontFamily: 'Arial', align: 'center',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(11);

        const yesBtn = this.add.text(250, 360, 'Да, ещё раз!', {
            fontSize: '26px', fill: '#2ecc71', backgroundColor: '#00000088', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);

        const noBtn = this.add.text(550, 360, 'Выход в меню', {
            fontSize: '26px', fill: '#e74c3c', backgroundColor: '#00000088', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);

        yesBtn.on('pointerdown', () => this.scene.restart());
        noBtn.on('pointerdown', () => {
            gameSettings.lives = 3;
            this.scene.start('MainMenu');
        });
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
        this.createColorTexture('pause-bg', 0x6c5ce7);
        this.createColorTexture('cloud', 0xdfe6e9);
        this.createColorTexture('cloud-correct', 0x00b894);
        this.createColorTexture('cloud-wrong', 0xd63031);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        if (key === 'pause-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else if (key.startsWith('cloud')) {
            graphics.fillRoundedRect(0, 0, 100, 60, 15);
        }
        graphics.generateTexture(key, key === 'pause-bg' ? 800 : 100, key === 'pause-bg' ? 600 : 60);
        graphics.destroy();
    }

    create() {
        this.gameEnded = false;
        this.canClick = true;
        this.currentIndex = 0;
        this.clouds = [];

        this.add.image(400, 300, 'pause-bg');

        this.add.text(400, 60, 'МАГИЧЕСКАЯ ПАУЗА', {
            fontSize: '36px', fill: '#f1c40f', fontFamily: 'Arial',
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(400, 110, 'Собери последний пример по порядку!', {
            fontSize: '20px', fill: '#ecf0f1', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const lastQ = gameSettings.lastQuestion;
        if (!lastQ || typeof lastQ !== 'string') {
            gameSettings.lastQuestion = '2 + 2 = ?';
            gameSettings.lastAnswer = 4;
        }
        const parts = gameSettings.lastQuestion.split(' ');
        const a = parts[0];
        const op = parts[1];
        const b = parts[2];
        const answer = gameSettings.lastAnswer.toString();

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
        this.clouds.forEach(c => {
            if (c.cloud) c.cloud.destroy();
            if (c.text) c.text.destroy();
        });
        this.clouds = [];
        this.currentIndex = 0;
        this.canClick = true;

        const positions = [];
        elements.forEach((element) => {
            let x, y, attempts = 0;
            do {
                x = Phaser.Math.Between(150, 650);
                y = Phaser.Math.Between(180, 480);
                attempts++;
            } while (this.isOverlapping(x, y, positions) && attempts < 50);
            positions.push({ x, y });

            const cloud = this.add.image(x, y, 'cloud')
                .setInteractive({ useHandCursor: true });
            const text = this.add.text(x, y, element, {
                fontSize: '24px', fill: '#2d3436', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5, 0.5);

            cloud.on('pointerdown', () => this.onCloudClick(cloud, text, element));
            this.clouds.push({ cloud, text, value: element });
        });
    }

    isOverlapping(x, y, positions) {
        for (const pos of positions) {
            if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 80) return true;
        }
        return false;
    }

    onCloudClick(cloud, text, value) {
        if (!this.canClick || this.gameEnded) return;

        const expected = this.expectedOrder[this.currentIndex];
        const isAccepted = expected.accepts.includes(value);

        if (isAccepted) {
            cloud.setTexture('cloud-correct');
            text.setStyle({ fill: '#ffffff' });
            cloud.disableInteractive();
            this.currentIndex++;

            if (this.currentIndex === this.expectedOrder.length) {
                this.gameEnded = true;
                this.canClick = false;
                gameSettings.shield = true;
                this.statusText.setText('Магический щит получен! 🛡️');
                this.time.delayedCall(2000, () => {
                    this.scene.start('GameScene');
                });
            } else {
                this.statusText.setText(`Дальше: ${this.expectedOrder[this.currentIndex].value}`);
            }
        } else {
            this.canClick = false;
            cloud.setTexture('cloud-wrong');
            text.setStyle({ fill: '#ffffff' });

            this.clouds.forEach(c => {
                if (c.value === expected.accepts[0]) {
                    c.cloud.setTexture('cloud-correct');
                }
                c.cloud.disableInteractive();
            });

            this.showRetryDialog('Ошибка! Попробуем снова?');
        }
    }

    showRetryDialog(message) {
        const panel = this.add.image(400, 300, 'panel').setDepth(10);
        this.add.text(400, 240, message, {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', align: 'center',
            stroke: '#000', strokeThickness: 3
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
        this.createColorTexture('training-bg', 0x2d3436);
        this.createColorTexture('player', 0xfdcb6e);
        this.createColorTexture('coin', 0xf1c40f);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        if (key === 'training-bg') graphics.fillRect(0, 0, 800, 600);
        else if (key === 'player') graphics.fillCircle(16, 16, 16);
        else if (key === 'coin') graphics.fillCircle(12, 12, 12);
        graphics.generateTexture(key, key === 'training-bg' ? 800 : (key === 'player' ? 32 : 24),
            key === 'training-bg' ? 600 : (key === 'player' ? 32 : 24));
        graphics.destroy();
    }

    create() {
        this.gameEnded = false;
        this.collectedSum = 0;
        this.targetSum = gameSettings.lastAnswer || 8;

        // Радостный фон
        this.cameras.main.setBackgroundColor('#dff9fb');

        this.add.text(400, 35, '✨ СЕКРЕТНАЯ ТРЕНИРОВКА ✨', {
            fontSize: '32px', fill: '#6c5ce7', fontFamily: 'Arial', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5);
        this.add.text(400, 75, `Собери монетки, чтобы получить ровно ${this.targetSum}`, {
            fontSize: '20px', fill: '#2d3436', fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(400, 100, 'Управляй: стрелки / WASD или мышью/пальцем', {
            fontSize: '14px', fill: '#636e72', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.player = this.physics.add.sprite(400, 480, 'player').setCollideWorldBounds(true);
        this.createWalls();
        this.createCoins();
        this.physics.add.overlap(this.player, this.numbersGroup, this.collectCoin, null, this);

        this.sumText = this.add.text(400, 560, `Собрано: 0 / ${this.targetSum}`, {
            fontSize: '24px', fill: '#2d3436', fontFamily: 'Arial', fontWeight: 'bold',
            backgroundColor: '#ffffffaa', padding: { x: 15, y: 5 }
        }).setOrigin(0.5);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey('W'),
            down: this.input.keyboard.addKey('S'),
            left: this.input.keyboard.addKey('A'),
            right: this.input.keyboard.addKey('D')
        };

        this.input.on('pointermove', (pointer) => {
            if (!this.gameEnded) {
                this.physics.moveTo(this.player, pointer.x, pointer.y, 200);
            }
        });

        this.time.delayedCall(30000, () => {
            if (!this.gameEnded) this.finish(false);
        });
    }

    createWalls() {
        this.walls = this.physics.add.staticGroup();
        const wallData = [
            [200, 120, 400, 20], [200, 550, 400, 20],
            [50, 250, 20, 250], [750, 250, 20, 250],
            [400, 300, 20, 200], [300, 400, 200, 20]
        ];
        wallData.forEach(([x, y, w, h]) => {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xdfe6e9);
            graphics.fillRect(0, 0, w, h);
            graphics.generateTexture('wall_' + x + y, w, h);
            graphics.destroy();
            this.walls.create(x + w / 2, y + h / 2, 'wall_' + x + y).setImmovable(true).refreshBody();
        });
        this.physics.add.collider(this.player, this.walls);
    }

    createCoins() {
        this.numbersGroup = this.physics.add.group();
        let remaining = this.targetSum;
        const coins = [];
        while (remaining > 0) {
            const val = Math.min(remaining, Phaser.Math.Between(1, Math.min(10, remaining)));
            coins.push(val);
            remaining -= val;
        }
        coins.push(Phaser.Math.Between(1, 10), Phaser.Math.Between(1, 10));
        Phaser.Utils.Array.Shuffle(coins);

        const coinColors = [0xf1c40f, 0xe67e22, 0xe74c3c, 0x2ecc71, 0x3498db, 0x9b59b6];
        coins.forEach(val => {
            const x = Phaser.Math.Between(120, 680), y = Phaser.Math.Between(180, 480);
            const coin = this.numbersGroup.create(x, y, 'coin').setScale(1.5);
            coin.setTint(Phaser.Math.RND.pick(coinColors));
            coin.value = val;
            this.add.text(x, y, val.toString(), {
                fontSize: '16px', fill: '#000', fontFamily: 'Arial', fontWeight: 'bold'
            }).setOrigin(0.5, 0.5);
        });
    }

    collectCoin(player, coin) {
        if (this.gameEnded) return;
        this.collectedSum += coin.value;
        this.sumText.setText(`Собрано: ${this.collectedSum} / ${this.targetSum}`);
        coin.destroy();

        if (this.collectedSum === this.targetSum) {
            this.finish(true);
        } else if (this.collectedSum > this.targetSum) {
            this.finish(false);
        }
    }

    finish(success) {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.physics.pause();
        this.time.removeAllEvents();

        if (success) {
            gameSettings.bonusLife = true;
            this.showMessageAndReturn('❤️ +1 жизнь на следующем уровне! ❤️', 0x00b894);
        } else {
            const panel = this.add.image(400, 300, 'panel').setDepth(10);
            this.add.text(400, 230, 'Не получилось!\nХочешь попробовать снова?', {
                fontSize: '26px', fill: '#fff', fontFamily: 'Arial', align: 'center',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(11);

            const yesBtn = this.add.text(250, 360, 'Да, попробовать!', {
                fontSize: '26px', fill: '#2ecc71', backgroundColor: '#00000088', padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);

            const noBtn = this.add.text(550, 360, 'Выход в меню', {
                fontSize: '26px', fill: '#e74c3c', backgroundColor: '#00000088', padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);

            yesBtn.on('pointerdown', () => this.scene.restart());
            noBtn.on('pointerdown', () => this.scene.start('MainMenu'));
        }
    }

    showMessageAndReturn(msg, color) {
        this.add.rectangle(400, 300, 600, 200, 0x000000, 0.85).setDepth(10);
        this.add.text(400, 300, msg, {
            fontSize: '28px', fill: '#fff', fontFamily: 'Arial', align: 'center'
        }).setOrigin(0.5).setDepth(11);
        this.time.delayedCall(2000, () => {
            this.scene.start('GameScene');
        });
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