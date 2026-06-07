class IntroCutscene extends Phaser.Scene {
    constructor() { super({ key: 'IntroCutscene' }); }

    create() {
        const slides = [
            {
                imageKey: 'intro1',
                text: 'Злой волшебник Слизнеус наслал на деревню полчища слизней.\nГерой спешит домой, но враги преграждают путь.',
                duration: 8000  
            },
            {
                imageKey: 'intro2',
                text: 'Чтобы победить слизней, нужно решать математические примеры.\nКаждый правильный ответ уничтожает одного монстра!',
                duration: 8000
            },
            {
                imageKey: 'intro3',
                text: 'Помоги герою добраться до дома и спасти деревню!',
                duration: 5000
            }
        ];

        let current = 0;
        const bgRect = this.add.rectangle(400, 300, 800, 600, 0x2c3e50).setOrigin(0.5);
        const slideImage = this.add.image(400, 300, slides[current].imageKey)
            .setOrigin(0.5)
            .setDisplaySize(800, 600);

        if (!this.textures.exists(slides[current].imageKey)) {
            slideImage.setVisible(false);
        }

        const text = this.add.text(400, 500, slides[current].text, {
            fontSize: '22px', fill: '#ecf0f1', fontFamily: 'Arial', align: 'center',
            wordWrap: { width: 700 }, stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        // Запускаем озвучку один раз
        try {
            const voice = this.sound.add('voiceFull', { volume: 0.8 });
            voice.play();
        } catch (e) {
            console.log('Voice file not found', e);
        }

        const nextSlide = () => {
            current++;
            if (current < slides.length) {
                slideImage.setTexture(slides[current].imageKey);
                if (!this.textures.exists(slides[current].imageKey)) {
                    slideImage.setVisible(false);
                } else {
                    slideImage.setVisible(true);
                }
                text.setText(slides[current].text);
            } else {
                this.scene.start('MainMenu');
            }
        };

        // Автоматическое переключение с разной длительностью
        let timer = this.time.addEvent({
            delay: slides[0].duration,
            callback: () => {
                current++;
                if (current < slides.length) {
                    slideImage.setTexture(slides[current].imageKey);
                    if (!this.textures.exists(slides[current].imageKey)) {
                        slideImage.setVisible(false);
                    } else {
                        slideImage.setVisible(true);
                    }
                    text.setText(slides[current].text);
                    timer.reset({ delay: slides[current].duration, callback: timer.callback, loop: false });
                } else {
                    this.scene.start('MainMenu');
                }
            },
            loop: false
        });

        // Можно пропустить слайд кликом (при этом звук продолжит играть)
        this.input.on('pointerdown', () => {
            timer.remove(false);
            current++;
            if (current < slides.length) {
                slideImage.setTexture(slides[current].imageKey);
                if (!this.textures.exists(slides[current].imageKey)) {
                    slideImage.setVisible(false);
                } else {
                    slideImage.setVisible(true);
                }
                text.setText(slides[current].text);
                timer = this.time.addEvent({
                    delay: slides[current].duration,
                    callback: timer.callback,
                    loop: false
                });
            } else {
                this.scene.start('MainMenu');
            }
        });
    }
}