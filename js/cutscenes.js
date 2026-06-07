class IntroCutscene extends Phaser.Scene {
    constructor() { super({ key: 'IntroCutscene' }); }

    create() {
        const slides = [
            {
                imageKey: 'intro1',
                text: 'Злой волшебник Слизнеус наслал на деревню полчища слизней.\nГерой спешит домой, но враги преграждают путь.'
            },
            {
                imageKey: 'intro2',
                text: 'Чтобы победить слизней, нужно решать математические примеры.\nКаждый правильный ответ уничтожает одного монстра!'
            },
            {
                imageKey: 'intro3',
                text: 'Помоги герою добраться до дома и спасти деревню!'
            }
        ];
        let current = 0;

        // Фоновый прямоугольник (заглушка)
        const bgRect = this.add.rectangle(400, 300, 800, 600, 0x2c3e50).setOrigin(0.5);

        // Изображение слайда
        const slideImage = this.add.image(400, 300, slides[current].imageKey)
            .setOrigin(0.5)
            .setDisplaySize(800, 600);

        // Если текстура не загрузилась, скрываем изображение
        if (!this.textures.exists(slides[current].imageKey)) {
            slideImage.setVisible(false);
        }

        // Текст слайда
        const text = this.add.text(400, 500, slides[current].text, {
            fontSize: '22px', fill: '#ecf0f1', fontFamily: 'Arial', align: 'center',
            wordWrap: { width: 700 }, stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        const nextSlide = () => {
            current++;
            if (current < slides.length) {
                slideImage.setTexture(slides[current].imageKey);
                text.setText(slides[current].text);
                if (!this.textures.exists(slides[current].imageKey)) {
                    slideImage.setVisible(false);
                } else {
                    slideImage.setVisible(true);
                }
            } else {
                this.scene.start('MainMenu');
            }
        };

        this.time.addEvent({ delay: 5000, callback: nextSlide, loop: true });
        this.input.on('pointerdown', nextSlide);
    }
}