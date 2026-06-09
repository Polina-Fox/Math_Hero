class FinalCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalCutscene' });
    }

    create() {
        // Слайды: картинка + соответствующий аудиоключ
        const slides = [
            { imageKey: 'final1', voiceKey: 'finalVoice1' },
            { imageKey: 'final2', voiceKey: 'finalVoice2' }
        ];
        let currentSlide = 0;
        let currentVoice = null;

        // Фон первого слайда
        const bg = this.add.image(400, 300, slides[currentSlide].imageKey)
            .setOrigin(0.5)
            .setDisplaySize(800, 600);

        if (!this.textures.exists(slides[currentSlide].imageKey)) {
            bg.setVisible(false);
            this.add.rectangle(400, 300, 800, 600, 0x2c3e50);
        }

        // Функция запуска озвучки для текущего слайда
        const playVoice = (index) => {
            if (currentVoice && currentVoice.isPlaying) {
                currentVoice.stop();
            }
            if (index < slides.length) {
                try {
                    currentVoice = this.sound.add(slides[index].voiceKey, { volume: 0.8 });
                    currentVoice.play();
                    currentVoice.on('complete', () => {
                        // Когда аудио закончилось, переключаем на следующий слайд или Victory
                        if (index === 0) {
                            // переключаем на второй слайд
                            currentSlide = 1;
                            bg.setTexture(slides[currentSlide].imageKey);
                            if (!this.textures.exists(slides[currentSlide].imageKey)) {
                                bg.setVisible(false);
                            } else {
                                bg.setVisible(true);
                            }
                            playVoice(1);
                        } else {
                            // это было второе аудио – идём на Victory
                            this.scene.start('Victory');
                        }
                    });
                } catch (e) {
                    console.log('Ошибка загрузки озвучки:', slides[index].voiceKey);
                    // если аудио не загрузилось, всё равно переходим дальше по таймеру
                    if (index === 0) {
                        this.time.delayedCall(7000, () => {
                            currentSlide = 1;
                            bg.setTexture(slides[currentSlide].imageKey);
                            if (!this.textures.exists(slides[currentSlide].imageKey)) bg.setVisible(false);
                            else bg.setVisible(true);
                            playVoice(1);
                        });
                    } else {
                        this.time.delayedCall(7000, () => this.scene.start('Victory'));
                    }
                }
            }
        };

        // Запускаем первый слайд и первую озвучку
        playVoice(0);

        // Возможность пропустить кликом (переход сразу на Victory)
        this.input.on('pointerdown', () => {
            if (currentVoice && currentVoice.isPlaying) currentVoice.stop();
            this.scene.start('Victory');
        });
    }
}