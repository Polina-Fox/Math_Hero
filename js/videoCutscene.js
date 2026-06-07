class VideoCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'VideoCutscene' });
    }

    create() {
        const { videoKey, nextScene } = this.scene.settings.data;

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

        const startPlayback = () => {
            if (!video) return;
            video.setDisplaySize(800, 600);
            video.setOrigin(0.5);
            video.play();
        };

        // Ждём загрузку метаданных
        video.on('loadedmetadata', startPlayback);

        // Если метаданные уже загружены (readyState >= 1), запускаем сразу
        if (video.video && video.video.readyState >= 1) {
            startPlayback();
        }

        video.on('error', (err) => {
            console.warn('Ошибка воспроизведения видео:', videoKey, err);
            if (video) video.stop();
            this.scene.start(nextScene || 'MainMenu');
        });

        video.on('complete', () => {
            this.scene.start(nextScene || 'MainMenu');
        });

        // Возможность пропустить кликом
        this.input.on('pointerdown', () => {
            if (video && video.isPlaying()) {
                video.stop();
            }
            this.scene.start(nextScene || 'MainMenu');
        });
    }
}