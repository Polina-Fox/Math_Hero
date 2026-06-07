class VideoCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'VideoCutscene' });
    }

    create() {
        const { videoKey, nextScene } = this.scene.settings.data;

        const video = this.add.video(400, 300, videoKey);
        video.setDisplaySize(800, 600);
        video.setOrigin(0.5);

        video.on('complete', () => {
            this.scene.start(nextScene || 'MainMenu');
        });

        this.input.on('pointerdown', () => {
            video.stop();
            this.scene.start(nextScene || 'MainMenu');
        });

        video.play();
    }
}