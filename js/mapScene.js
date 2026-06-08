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

        // Флаг, чтобы не запустить воспроизведение дважды
        let playbackStarted = false;

        const startPlayback = () => {
            if (playbackStarted || !video) return;
            playbackStarted = true;
            video.setDisplaySize(800, 600);
            video.setOrigin(0.5);
            video.play();
        };

        // Ждём, когда видео будет готово к воспроизведению
        video.on('canplay', startPlayback);
        video.on('loadedmetadata', () => {
            // Если видео уже имеет размеры, пробуем запустить
            if (video.video && video.video.readyState >= 1) {
                startPlayback();
            }
        });

        // Если видео уже готово к моменту создания обработчиков
        if (video.video && video.video.readyState >= 3) {
            startPlayback();
        }

        // Таймаут: если через 3 секунды видео не начало играть, пропускаем
        this.time.delayedCall(3000, () => {
            if (!playbackStarted && video) {
                console.warn('Видео не начало играть за 3 секунды, пропускаем:', videoKey);
                video.stop();
                this.scene.start(nextScene || 'MainMenu');
            }
        });

        video.on('error', (err) => {
            console.warn('Ошибка воспроизведения видео:', videoKey, err);
            video.stop();
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