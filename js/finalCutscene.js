class FinalCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalCutscene' });
    }

    create() {
        // Слайды: картинка, аудиоключ, текст субтитра
        const slides = [
            {
                imageKey: 'final1',
                voiceKey: 'finalVoice1',
                subtitle: 'Победа! Главный слизень повержен!\nЗлой колдун Слизнеус потерял свою силу.\nЖители деревни схватили его и посадили в темницу.'
            },
            {
                imageKey: 'final2',
                voiceKey: 'finalVoice2',
                subtitle: 'А наш герой наконец-то вернулся домой.\nРодители обняли его крепко-крепко.\nСпасибо тебе, дорогой друг!\nТы настоящий математический герой!'
            }
        ];
        let currentSlide = 0;
        let currentVoice = null;

        // Фон
        const bg = this.add.image(400, 300, slides[currentSlide].imageKey)
            .setOrigin(0.5)
            .setDisplaySize(800, 600);

        if (!this.textures.exists(slides[currentSlide].imageKey)) {
            bg.setVisible(false);
            this.add.rectangle(400, 300, 800, 600, 0x2c3e50);
        }

        // Субтитры (внизу экрана)
        const subtitleText = this.add.text(400, 550, slides[currentSlide].subtitle, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, Helvetica, sans-serif',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5).setDepth(100);

        // Функция запуска озвучки и смены слайдов
        const playVoice = (index) => {
            if (currentVoice && currentVoice.isPlaying) {
                currentVoice.stop();
            }
            if (index < slides.length) {
                // Обновляем субтитр
                subtitleText.setText(slides[index].subtitle);
                try {
                    currentVoice = this.sound.add(slides[index].voiceKey, { volume: 0.8 });
                    currentVoice.play();
                    currentVoice.on('complete', () => {
                        if (index === 0) {
                            // Переключаем на второй слайд
                            currentSlide = 1;
                            bg.setTexture(slides[currentSlide].imageKey);
                            if (!this.textures.exists(slides[currentSlide].imageKey)) {
                                bg.setVisible(false);
                            } else {
                                bg.setVisible(true);
                            }
                            playVoice(1);
                        } else {
                            // Конец, переходим на Victory
                            this.scene.start('Victory');
                        }
                    });
                } catch (e) {
                    console.log('Ошибка загрузки озвучки:', slides[index].voiceKey);
                    // Если аудио не загрузилось, всё равно переходим дальше по таймеру
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

        // Запускаем первый слайд
        playVoice(0);

        // Возможность пропустить кликом (сразу на Victory)
        this.input.on('pointerdown', () => {
            if (currentVoice && currentVoice.isPlaying) currentVoice.stop();
            this.scene.start('Victory');
        });
    }
}