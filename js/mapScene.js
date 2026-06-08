class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    create() {
        const { from, nextScene } = this.scene.settings.data;
        const totalPoints = 6;

        // Фон
        this.add.image(400, 300, 'bg-grass').setDisplaySize(800, 600).setAlpha(0.4);
        this.add.rectangle(400, 300, 700, 400, 0x000000, 0.5);

        // Заголовок (ВСЕГДА Verdana!)
        this.add.text(400, 50, 'ПУТЬ ГЕРОЯ', {
            fontSize: '32px',
            fill: '#f1c40f',
            fontFamily: 'Verdana, Arial, sans-serif',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Линия маршрута
        const startX = 100, endX = 700, y = 400;
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0xffffff, 0.8);
        graphics.beginPath();
        graphics.moveTo(startX, y);
        graphics.lineTo(endX, y);
        graphics.strokePath();

        // Точки (чекапоинты)
        const pointNames = ['Луг', 'Лес', 'Увядший лес', 'Пустыня', 'Перед битвой', 'Босс'];
        const step = (endX - startX) / (totalPoints - 1);

        for (let i = 1; i <= totalPoints; i++) {
            const px = startX + (i - 1) * step;
            const color = (i <= from) ? 0x27ae60 : (i === from + 1) ? 0xf1c40f : 0x7f8c8d;
            this.add.circle(px, y, 15, color).setStrokeStyle(3, 0x000000);

            // Подпись точки
            this.add.text(px, y + 30, pointNames[i - 1], {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Verdana, Arial, sans-serif',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);

            // Номер точки
            this.add.text(px, y, i.toString(), {
                fontSize: '16px',
                fill: '#000000',
                fontFamily: 'Verdana, Arial, sans-serif',
                fontWeight: 'bold'
            }).setOrigin(0.5);
        }

        // Герой на пройденной точке
        const heroX = startX + (from - 1) * step;
        const hero = this.add.sprite(heroX, y, 'hero_idle').setScale(1.2);

        // Анимация к следующей точке (если не босс)
        const nextPoint = from + 1;
        if (nextPoint <= totalPoints) {
            const targetX = startX + (nextPoint - 1) * step;
            this.tweens.add({
                targets: hero,
                x: targetX,
                duration: 1500,
                ease: 'Power2',
                onUpdate: () => {
                    const frame = Math.floor((hero.x / 10) % 4);
                    hero.setTexture(`hero_walk${frame}`);
                },
                onComplete: () => {
                    hero.setTexture('hero_idle');
                    this.time.delayedCall(500, () => {
                        this.scene.start(nextScene);
                    });
                }
            });
        } else {
            this.time.delayedCall(1000, () => {
                this.scene.start(nextScene);
            });
        }

        // Возможность пропустить кликом
        this.input.on('pointerdown', () => {
            this.scene.start(nextScene);
        });
    }
}