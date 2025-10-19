class RescueMiniGame extends Phaser.Scene {
    constructor() {
        super('RescueMiniGame');
    }

    create() {
        this.add.image(400, 300, 'background');

        this.add.text(400, 100, '����� �����!', {
            fontSize: '36px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.add.text(400, 150, '������� �� ����� �� ������� �� 1 �� 9 �� 10 ������!', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.currentNumber = 1;
        this.timeLeft = 10;
        this.numbers = [];

        this.startMiniGame();
    }

    startMiniGame() {
        // �������� �����
        for (let i = 1; i <= 9; i++) {
            const number = this.add.text(
                Phaser.Math.Between(100, 700),
                Phaser.Math.Between(200, 500),
                i.toString(),
                {
                    fontSize: '32px',
                    fill: '#fff',
                    backgroundColor: '#000000aa',
                    padding: { x: 10, y: 5 }
                }
            ).setInteractive();

            number.on('pointerdown', () => {
                this.handleNumberClick(number, i);
            });

            this.numbers.push(number);
        }

        // ������
        this.timerText = this.add.text(400, 550, `�����: ${this.timeLeft}`, {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    handleNumberClick(number, value) {
        if (value === this.currentNumber) {
            number.setStyle({ fill: '#00ff00' });
            number.disableInteractive();
            this.currentNumber++;

            if (this.currentNumber > 9) {
                this.miniGameSuccess();
            }
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(`�����: ${this.timeLeft}`);

        if (this.timeLeft <= 0) {
            this.miniGameFail();
        }
    }

    miniGameSuccess() {
        this.timer.remove();
        this.add.text(400, 50, '�����! ���� �����!', {
            fontSize: '24px',
            fill: '#00ff00'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            gameSettings.lives = 3;
            this.scene.start('GameScene');
        });
    }

    miniGameFail() {
        this.timer.remove();
        this.add.text(400, 50, '����� �����! �� ����� ��� ��������!', {
            fontSize: '24px',
            fill: '#ff4444'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            gameSettings.lives = 3;
            this.scene.start('GameScene');
        });
    }
}

class MagicPauseMiniGame extends Phaser.Scene {
    constructor() {
        super('MagicPauseMiniGame');
    }

    create() {
        // ���������� ���������� �����
        this.add.text(400, 300, '���������� ����� - � ����������', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.scene.start('GameScene');
        });
    }
}