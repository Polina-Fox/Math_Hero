class Settings extends Phaser.Scene {
    constructor() {
        super({ key: 'Settings' });
    }

    create() {
        console.log('Settings scene created');

        this.add.rectangle(400, 300, 800, 600, 0x4488aa);

        this.add.text(400, 100, 'Настройки игры', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Простая кнопка назад
        const backButton = this.add.rectangle(400, 400, 200, 50, 0xff6b6b)
            .setInteractive();

        const backText = this.add.text(400, 400, 'Назад', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}