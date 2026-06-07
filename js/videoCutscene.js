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

        let video = null;
        try {
            video = this.add.video(400, 300, videoKey);
        } catch (e) {
            console.warn('Ошибка создания видео:', videoKey, e);
            this.scene.start(nextScene || 'MainMenu');
            return;
        }

        if (!video) {
            console.warn('Не удалось создать объект видео для', videoKey);
            this.scene.start(nextScene || 'MainMenu');
            return;
        }

        // Устанавливаем размер только после загрузки метаданных
        video.on('loadedmetadata', () => {
            if (video) {
                video.setDisplaySize(800, 600);
            }
        });

        // Альтернативно можно задать размер сразу после старта воспроизведения
        video.on('play', () => {
            if (video && !video.displayWidth) {
                video.setDisplaySize(800, 600);
            }
        });

        video.on('error', (err) => {
            console.warn('Ошибка воспроизведения видео:', videoKey, err);
            if (video) video.stop();
            this.scene.start(nextScene || 'MainMenu');
        });

        video.on('complete', () => {
            this.scene.start(nextScene || 'MainMenu');
        });

        this.input.on('pointerdown', () => {
            if (video && video.isPlaying()) {
                video.stop();
            }
            this.scene.start(nextScene || 'MainMenu');
        });

        video.play();
    }
}