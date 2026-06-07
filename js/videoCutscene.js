class VideoCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'VideoCutscene' });
    }

    create() {
        const { videoKey, nextScene } = this.scene.settings.data;

        // Проверяем наличие видео в кэше видео Phaser
        if (!this.cache.video.exists(videoKey)) {
            console.warn(`Видео ${videoKey} не найдено в кэше. Пропускаем.`);
            this.scene.start(nextScene || 'MainMenu');
            return;
        }

        try {
            const video = this.add.video(400, 300, videoKey);
            video.setDisplaySize(800, 600);
            video.setOrigin(0.5);

            video.on('error', (err) => {
                console.warn('Ошибка воспроизведения видео:', videoKey, err);
                video.stop();
                this.scene.start(nextScene || 'MainMenu');
            });

            video.on('complete', () => {
                this.scene.start(nextScene || 'MainMenu');
            });

            this.input.on('pointerdown', () => {
                video.stop();
                this.scene.start(nextScene || 'MainMenu');
            });

            video.play();
        } catch (e) {
            console.warn('Не удалось создать видео:', videoKey, e);
            this.scene.start(nextScene || 'MainMenu');
        }
    }
}