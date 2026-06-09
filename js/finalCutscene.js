class FinalCutscene extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalCutscene' });
    }

    create() {
        // Два слайда
        const slides = [
            { imageKey: 'final1' },   // Слизнеус в тюрьме
            { imageKey: 'final2' }    // Герой с семьёй
        ];
        let currentSlide = 0;

        // Фон первого слайда
        const bg = this.add.image(400, 300, slides[currentSlide].imageKey)
            .setOrigin(0.5)
            .setDisplaySize(800, 600);

        // Если текстуры нет, заменяем цветным прямоугольником
        if (!this.textures.exists(slides[currentSlide].imageKey)) {
            bg.setVisible(false);
            this.add.rectangle(400, 300, 800, 600, 0x2c3e50);
        }

        // Запускаем озвучку
        let voice = null;
        try {
            voice = this.sound.add('finalVoice', { volume: 0.8 });
            voice.play();
        } catch (e) {
            console.log('Финальная озвучка не найдена');
        }

        // Переключение на второй слайд через 7 секунд
        const switchToSecond = () => {
            currentSlide++;
            if (currentSlide < slides.length) {
                bg.setTexture(slides[currentSlide].imageKey);
                if (!this.textures.exists(slides[currentSlide].imageKey)) {
                    bg.setVisible(false);
                } else {
                    bg.setVisible(true);
                }
            }
        };
        this.time.delayedCall(7000, switchToSecond);

        // Переход на Victory после окончания озвучки или через 15 секунд
        const goToVictory = () => {
            if (voice && voice.isPlaying) voice.stop();
            this.scene.start('Victory');
        };

        if (voice) {
            voice.on('complete', goToVictory);
        } else {
            this.time.delayedCall(15000, goToVictory);
        }

        // Таймаут на случай, если аудио не запустилось
        this.time.delayedCall(15000, () => {
            if (voice && !voice.isPlaying && !voice.isPaused) goToVictory();
        });

        // Возможность пропустить кликом
        this.input.on('pointerdown', goToVictory);
    }
}