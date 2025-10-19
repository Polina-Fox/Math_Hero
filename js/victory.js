class Victory extends Phaser.Scene {
    constructor() {
        super('Victory');
    }

    create() {
        this.add.image(400, 300, 'background');

        // Поздравление
        this.add.text(400, 150, 'ПОБЕДА!', {
            fontSize: '64px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(400, 250, 'Ты помог герою добраться домой!', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.add.text(400, 300, `Итоговый счёт: ${gameSettings.score}`, {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Салют из конфетти
        this.createConfetti();

        // Кнопка возврата в меню
        const menuButton = this.add.rectangle(400, 400, 300, 60, 0x4a4a9f)
            .setInteractive()
            .setStrokeStyle(2, 0xffffff);

        const menuText = this.add.text(400, 400, 'В главное меню', {
            fontSize: '28px',
            fill: '#fff'
        }).setOrigin(0.5);

        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // Воспроизведение победной музыки
        this.sound.play('victory', { volume: 0.7 });
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = this.add.rectangle(
                Phaser.Math.Between(100, 700),
                Phaser.Math.Between(100, 500),
                10, 10,
                Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff])
            );

            this.tweens.add({
                targets: confetti,
                y: 600,
                rotation: Math.PI * 2,
                duration: Phaser.Math.Between(1000, 3000),
                ease: 'Power2'
            });
        }
    }
}