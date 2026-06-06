class IntroCutscene extends Phaser.Scene {
    constructor() { super({ key: 'IntroCutscene' }); }

    create() {
        const slides = [
            {
                bg: 0x2c3e50,
                text: 'Злой волшебник Слизнеус наслал на деревню полчища слизней.\nГерой спешит домой, но враги преграждают путь.'
            },
            {
                bg: 0x34495e,
                text: 'Чтобы победить слизней, нужно решать математические примеры.\nКаждый правильный ответ уничтожает одного монстра!'
            },
            {
                bg: 0x2c3e50,
                text: 'Помоги герою добраться до дома и спасти деревню!'
            }
        ];
        let current = 0;

        const bg = this.add.rectangle(400, 300, 800, 600, slides[0].bg).setOrigin(0.5);
        const text = this.add.text(400, 300, slides[0].text, {
            fontSize: '22px', fill: '#ecf0f1', fontFamily: 'Arial', align: 'center',
            wordWrap: { width: 600 }, stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        const nextSlide = () => {
            current++;
            if (current < slides.length) {
                bg.setFillStyle(slides[current].bg);
                text.setText(slides[current].text);
            } else {
                this.scene.start('MainMenu');
            }
        };

        // Автоматическое переключение через 5 секунд или по клику
        this.time.addEvent({ delay: 5000, callback: nextSlide, loop: true });
        this.input.on('pointerdown', nextSlide);
    }
}