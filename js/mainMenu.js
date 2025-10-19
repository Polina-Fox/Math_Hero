class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // �������� ��������
        this.load.image('background', 'assets/images/background.png');
        this.load.image('hero', 'assets/images/hero.png');
        this.load.image('slime', 'assets/images/slime.png');
        this.load.audio('bgMusic', 'assets/audio/bg_music.mp3');
    }

    create() {
        // ���
        this.add.image(400, 300, 'background');

        // ���������
        this.add.text(400, 100, '�������������� �����', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // ������� �����
        this.add.image(200, 400, 'hero').setScale(0.7);

        // ������
        this.add.image(600, 450, 'slime').setTint(0xff69b4).setScale(0.8);
        this.add.image(650, 400, 'slime').setTint(0x00ff00).setScale(0.8);
        this.add.image(550, 350, 'slime').setTint(0x4169e1).setScale(0.8);

        // ������ ����
        const playButton = this.createButton(400, 250, '������', 'Settings');
        this.createButton(400, 320, '��� ������', () => this.showInstructions());
        this.createButton(400, 390, '���������', () => this.showSettings());

        // ������� ������
        if (!this.sound.get('bgMusic')) {
            this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
            this.bgMusic.play();
        }
    }

    createButton(x, y, text, target) {
        const button = this.add.rectangle(x, y, 300, 60, 0x4a4a9f)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        const buttonText = this.add.text(x, y, text, {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setFillStyle(0x6a6abf);
            buttonText.setScale(1.1);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x4a4a9f);
            buttonText.setScale(1);
        });

        button.on('pointerdown', () => {
            if (typeof target === 'string') {
                this.scene.start(target);
            } else {
                target();
            }
        });

        return button;
    }

    showInstructions() {
        const instructions = [
            '������ ����� �������� �������!',
            '����� �������������� �������',
            '������� ���������� ����� �� ��� ���������',
            '�� ��� ������� ��������� �� �����!'
        ];

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillRect(100, 150, 600, 300);

        instructions.forEach((line, index) => {
            this.add.text(400, 200 + index * 40, line, {
                fontSize: '20px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });

        const closeButton = this.createButton(400, 400, '�������', () => {
            graphics.destroy();
            closeButton.destroy();
            instructions.forEach(text => text.destroy());
        });
    }

    showSettings() {
        // ������� ��������� ���������
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillRect(100, 150, 600, 300);

        this.add.text(400, 180, '��������� ���������', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        const closeButton = this.createButton(400, 400, '�������', () => {
            graphics.destroy();
            closeButton.destroy();
        });
    }
}
