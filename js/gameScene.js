class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.slimes = [];
        this.currentProblem = null;
        this.answerButtons = [];
        this.slimeSpeed = 50;
        this.heroMessage = null;
        this.warningShown = false;
    }

    preload() {
        // Создаем текстуры для игры
        this.createColorTexture('game-bg', 0x1a5276);
        this.createColorTexture('hero-character', 0xe74c3c);
        this.createColorTexture('slime-enemy', 0x2ecc71);
        this.createColorTexture('answer-button', 0x3498db);
        this.createColorTexture('answer-correct', 0x27ae60);
        this.createColorTexture('answer-wrong', 0xe74c3c);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);

        if (key === 'game-bg') {
            graphics.fillRect(0, 0, 800, 600);
        } else if (key === 'hero-character') {
            graphics.fillRect(0, 0, 60, 80);
        } else if (key === 'slime-enemy') {
            graphics.fillCircle(32, 32, 32);
        } else {
            graphics.fillRoundedRect(0, 0, 120, 50, 10);
        }

        graphics.generateTexture(key,
            key === 'game-bg' ? 800 : (key === 'hero-character' ? 60 : 120),
            key === 'game-bg' ? 600 : (key === 'hero-character' ? 80 : 50)
        );
        graphics.destroy();
    }

    create() {
        console.log('Starting level', gameSettings.currentLevel);

        // Фон
        this.add.image(400, 300, 'game-bg');

        // Отображение уровня и счета (улучшенная видимость)
        this.levelText = this.add.text(20, 20, `Уровень: ${gameSettings.currentLevel}`, {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa',
            padding: { left: 15, right: 15, top: 8, bottom: 8 },
            stroke: '#000',
            strokeThickness: 3
        });

        this.scoreText = this.add.text(20, 60, `Счёт: ${gameSettings.score}`, {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa',
            padding: { left: 15, right: 15, top: 8, bottom: 8 },
            stroke: '#000',
            strokeThickness: 3
        });

        this.livesText = this.add.text(20, 100, `Жизни: ${gameSettings.lives}`, {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa',
            padding: { left: 15, right: 15, top: 8, bottom: 8 },
            stroke: '#000',
            strokeThickness: 3
        });

        // Герой
        this.hero = this.physics.add.sprite(100, 300, 'hero-character');
        this.hero.setCollideWorldBounds(true);

        // Генерация математической задачи
        this.generateMathProblem();

        // Запуск появления слизней
        this.startSlimeSpawning();

        // Обработчик столкновений
        this.physics.add.overlap(this.hero, this.slimes, this.heroHit, null, this);
    }

    generateMathProblem() {
        // Очистка предыдущих кнопок
        this.answerButtons.forEach(button => {
            if (button.button) button.button.destroy();
            if (button.text) button.text.destroy();
        });
        this.answerButtons = [];

        if (this.problemText) {
            this.problemText.destroy();
        }

        // Генерация задачи
        const problemTypes = [];
        if (gameSettings.addition) problemTypes.push('addition');
        if (gameSettings.subtraction) problemTypes.push('subtraction');
        if (gameSettings.multiplication) problemTypes.push('multiplication');

        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        let a, b, answer;

        switch (type) {
            case 'addition':
                a = Phaser.Math.Between(1, 10 + gameSettings.currentLevel * 2);
                b = Phaser.Math.Between(1, 10 + gameSettings.currentLevel * 2);
                answer = a + b;
                this.currentProblem = { question: `${a} + ${b} = ?`, answer: answer };
                break;
            case 'subtraction':
                a = Phaser.Math.Between(5, 15 + gameSettings.currentLevel * 2);
                b = Phaser.Math.Between(1, a);
                answer = a - b;
                this.currentProblem = { question: `${a} - ${b} = ?`, answer: answer };
                break;
            case 'multiplication':
                a = Phaser.Math.Between(2, 6 + gameSettings.currentLevel);
                b = Phaser.Math.Between(2, 6 + gameSettings.currentLevel);
                answer = a * b;
                this.currentProblem = { question: `${a} × ${b} = ?`, answer: answer };
                break;
        }

        // Отображение вопроса (улучшенная видимость)
        this.problemText = this.add.text(400, 500, this.currentProblem.question, {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000cc',
            padding: { x: 25, y: 15 },
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Генерация вариантов ответов
        const answers = [this.currentProblem.answer];
        while (answers.length < 3) {
            let wrongAnswer;
            if (this.currentProblem.answer > 10) {
                wrongAnswer = this.currentProblem.answer + Phaser.Math.Between(-5, 5);
            } else {
                wrongAnswer = this.currentProblem.answer + Phaser.Math.Between(-3, 3);
            }

            if (wrongAnswer !== this.currentProblem.answer && !answers.includes(wrongAnswer) && wrongAnswer > 0) {
                answers.push(wrongAnswer);
            }
        }

        // Перемешивание ответов
        Phaser.Utils.Array.Shuffle(answers);

        // Создание кнопок ответов
        answers.forEach((answer, index) => {
            const button = this.add.image(300 + index * 150, 550, 'answer-button')
                .setInteractive({ useHandCursor: true });

            const buttonText = this.add.text(300 + index * 150, 550, answer.toString(), {
                fontSize: '24px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.checkAnswer(answer, button, buttonText);
            });

            this.answerButtons.push({ button, text: buttonText });
        });
    }

    // ... остальные методы остаются без изменений ...
    checkAnswer(selectedAnswer, button, buttonText) {
        // Блокируем все кнопки после ответа
        this.answerButtons.forEach(btn => {
            btn.button.disableInteractive();
        });

        if (selectedAnswer === this.currentProblem.answer) {
            // Правильный ответ
            button.setTexture('answer-correct');
            buttonText.setStyle({ fill: '#ffffff' });

            // Уничтожение первого слизня
            if (this.slimes.length > 0) {
                const slime = this.slimes[0];
                slime.destroy();
                this.slimes.shift();
                gameSettings.score += 10;
                this.scoreText.setText(`Счёт: ${gameSettings.score}`);

                // Анимация уничтожения
                this.tweens.add({
                    targets: slime,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2'
                });
            }

            // Обновление задачи
            this.time.delayedCall(800, () => {
                this.generateMathProblem();
                this.showHeroMessage('Молодец! 👍');
            });

        } else {
            // Неправильный ответ
            button.setTexture('answer-wrong');
            buttonText.setStyle({ fill: '#ffffff' });

            // Подсветка правильного ответа
            this.answerButtons.forEach(btn => {
                if (parseInt(btn.text.text) === this.currentProblem.answer) {
                    btn.button.setTexture('answer-correct');
                }
            });

            this.showHeroMessage('Попробуй ещё! 💪');

            this.time.delayedCall(1500, () => {
                this.generateMathProblem();
            });
        }
    }

    startSlimeSpawning() {
        const slimeCount = this.getSlimeCountForLevel();
        this.slimesToSpawn = slimeCount;
        this.slimesSpawned = 0;

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.slimesSpawned < this.slimesToSpawn) {
                    this.spawnSlime();
                    this.slimesSpawned++;
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnSlime() {
        const y = Phaser.Math.Between(150, 450);
        const slime = this.physics.add.sprite(850, y, 'slime-enemy')
            .setScale(0.8)
            .setTint(this.getRandomSlimeColor());

        slime.setVelocityX(-this.slimeSpeed);
        this.slimes.push(slime);

        // Анимация появления
        slime.setAlpha(0);
        this.tweens.add({
            targets: slime,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }

    getSlimeCountForLevel() {
        switch (gameSettings.currentLevel) {
            case 1: return 3;
            case 2: return 4;
            case 3: return 5;
            case 4: return 6;
            default: return 7;
        }
    }

    getRandomSlimeColor() {
        const colors = [0xff6b9d, 0x74b9ff, 0x55efc4, 0xfdcb6e, 0xa29bfe];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    heroHit(hero, slime) {
        slime.destroy();
        this.slimes = this.slimes.filter(s => s !== slime);

        gameSettings.lives--;
        this.livesText.setText(`Жизни: ${gameSettings.lives}`);

        // Анимация получения урона
        this.tweens.add({
            targets: hero,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 2
        });

        if (gameSettings.lives <= 0) {
            this.gameOver();
        } else {
            this.showHeroMessage('Ай! Больно! 😫');
        }
    }

    gameOver() {
        this.showHeroMessage('Меня победили... 💀');

        this.time.delayedCall(2000, () => {
            this.scene.start('RescueMiniGame');
        });
    }

    showHeroMessage(message) {
        if (this.heroMessage) {
            this.heroMessage.destroy();
        }

        this.heroMessage = this.add.text(100, 200, message, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000cc',
            padding: { x: 15, y: 8 },
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            if (this.heroMessage) {
                this.heroMessage.destroy();
                this.heroMessage = null;
            }
        });
    }

    update() {
        // Проверка победы на уровне
        if (this.slimes.length === 0 && this.slimesSpawned >= this.slimesToSpawn) {
            this.levelComplete();
        }

        // Предупреждения о приближении слизней
        const closestSlime = this.slimes[0];
        if (closestSlime && closestSlime.x < 300 && !this.warningShown) {
            this.showHeroMessage('Они близко! Быстрее! 🚨');
            this.warningShown = true;
        }

        // Удаление слизней вышедших за левую границу
        this.slimes.forEach((slime, index) => {
            if (slime.x < -50) {
                slime.destroy();
                this.slimes.splice(index, 1);
            }
        });
    }

    levelComplete() {
        gameSettings.currentLevel++;
        this.showHeroMessage('Уровень пройден! 🎉');

        if (gameSettings.currentLevel > 4) {
            this.time.delayedCall(2000, () => {
                this.scene.start('BossScene');
            });
        } else {
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
    }
}