class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.slimes = [];
        this.currentProblem = null;
        this.answerButtons = [];
        this.slimeSpeed = 50;
    }

    preload() {
        this.load.image('gameBackground', 'assets/images/background.png');
        this.load.image('hero', 'assets/images/hero.png');
        this.load.image('slime', 'assets/images/slime.png');
        this.load.audio('shoot', 'assets/audio/shoot.wav');
        this.load.audio('bubble', 'assets/audio/bubble.wav');
    }

    create() {
        // Фон
        this.add.image(400, 300, 'gameBackground');

        // Отображение уровня и счета
        this.add.text(20, 20, `Уровень: ${gameSettings.currentLevel}`, {
            fontSize: '20px',
            fill: '#fff'
        });

        this.scoreText = this.add.text(20, 50, `Счёт: ${gameSettings.score}`, {
            fontSize: '20px',
            fill: '#fff'
        });

        this.livesText = this.add.text(20, 80, `Жизни: ${gameSettings.lives}`, {
            fontSize: '20px',
            fill: '#fff'
        });

        // Герой
        this.hero = this.physics.add.sprite(100, 300, 'hero').setScale(0.8);

        // Генерация математической задачи
        this.generateMathProblem();

        // Запуск появления слизней
        this.startSlimeSpawning();

        // Обработчик столкновений
        this.physics.add.overlap(this.hero, this.slimes, this.heroHit, null, this);
    }

    generateMathProblem() {
        // Очистка предыдущих кнопок
        this.answerButtons.forEach(button => button.destroy());
        this.answerButtons = [];

        // Генерация задачи
        const problemTypes = [];
        if (gameSettings.addition) problemTypes.push('addition');
        if (gameSettings.subtraction) problemTypes.push('subtraction');
        if (gameSettings.multiplication) problemTypes.push('multiplication');

        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        let a, b, answer;

        switch (type) {
            case 'addition':
                a = Phaser.Math.Between(1, 10);
                b = Phaser.Math.Between(1, 10);
                answer = a + b;
                this.currentProblem = { question: `${a} + ${b} = ?`, answer: answer };
                break;
            case 'subtraction':
                a = Phaser.Math.Between(5, 15);
                b = Phaser.Math.Between(1, a);
                answer = a - b;
                this.currentProblem = { question: `${a} - ${b} = ?`, answer: answer };
                break;
            case 'multiplication':
                a = Phaser.Math.Between(2, 6);
                b = Phaser.Math.Between(2, 6);
                answer = a * b;
                this.currentProblem = { question: `${a} × ${b} = ?`, answer: answer };
                break;
        }

        // Отображение вопроса
        this.problemText = this.add.text(400, 500, this.currentProblem.question, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        // Генерация вариантов ответов
        const answers = [this.currentProblem.answer];
        while (answers.length < 3) {
            const wrongAnswer = this.currentProblem.answer + Phaser.Math.Between(-5, 5);
            if (wrongAnswer !== this.currentProblem.answer && !answers.includes(wrongAnswer) && wrongAnswer > 0) {
                answers.push(wrongAnswer);
            }
        }

        // Перемешивание ответов
        Phaser.Utils.Array.Shuffle(answers);

        // Создание кнопок ответов
        answers.forEach((answer, index) => {
            const button = this.add.rectangle(300 + index * 150, 550, 120, 50, 0x4a4a9f)
                .setInteractive()
                .setStrokeStyle(2, 0xffffff);

            const buttonText = this.add.text(300 + index * 150, 550, answer.toString(), {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.checkAnswer(answer, button);
            });

            this.answerButtons.push(button);
            this.answerButtons.push(buttonText);
        });
    }

    checkAnswer(selectedAnswer, button) {
        if (selectedAnswer === this.currentProblem.answer) {
            // Правильный ответ
            button.setFillStyle(0x00ff00);
            this.sound.play('bubble');

            // Уничтожение первого слизня
            if (this.slimes.length > 0) {
                const slime = this.slimes[0];
                slime.destroy();
                this.slimes.shift();
                gameSettings.score += 10;
                this.scoreText.setText(`Счёт: ${gameSettings.score}`);
            }

            // Обновление задачи
            this.time.delayedCall(500, () => {
                this.generateMathProblem();
                this.showHeroMessage('Молодец!');
            });

        } else {
            // Неправильный ответ
            button.setFillStyle(0xff0000);
            this.showHeroMessage('Попробуй ещё!');

            this.time.delayedCall(1000, () => {
                this.generateMathProblem();
            });
        }
    }

    startSlimeSpawning() {
        const slimeCount = this.getSlimeCountForLevel();

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.slimes.length < slimeCount) {
                    this.spawnSlime();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnSlime() {
        const slime = this.physics.add.sprite(850, Phaser.Math.Between(150, 450), 'slime')
            .setScale(0.7)
            .setTint(this.getRandomSlimeColor());

        slime.setVelocityX(-this.slimeSpeed);
        this.slimes.push(slime);
    }

    getSlimeCountForLevel() {
        switch (gameSettings.currentLevel) {
            case 1: case 2: return 5;
            case 3: case 4: return 8;
            case 5: return 5; // Босс-уровень
            default: return 10;
        }
    }

    getRandomSlimeColor() {
        const colors = [0xff69b4, 0x00ff00, 0x4169e1, 0xffff00, 0xffa500];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    heroHit(hero, slime) {
        slime.destroy();
        this.slimes = this.slimes.filter(s => s !== slime);

        gameSettings.lives--;
        this.livesText.setText(`Жизни: ${gameSettings.lives}`);

        if (gameSettings.lives <= 0) {
            this.gameOver();
        } else {
            this.showHeroMessage('Ай! Больно!');
        }
    }

    gameOver() {
        this.showHeroMessage('Меня победили...');

        this.time.delayedCall(2000, () => {
            this.scene.start('RescueMiniGame');
        });
    }

    showHeroMessage(message) {
        if (this.heroMessage) {
            this.heroMessage.destroy();
        }

        this.heroMessage = this.add.text(100, 200, message, {
            fontSize: '18px',
            fill: '#fff',
            fontFamily: 'Arial',
            backgroundColor: '#000000aa',
            padding: { x: 5, y: 2 }
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
        if (this.slimes.length === 0 && this.getSlimeCountForLevel() === 0) {
            this.levelComplete();
        }

        // Предупреждения о приближении слизней
        const closestSlime = this.slimes[0];
        if (closestSlime && closestSlime.x < 300 && !this.warningShown) {
            this.showHeroMessage('Они близко! Быстрее!');
            this.warningShown = true;
        }
    }

    levelComplete() {
        gameSettings.currentLevel++;

        if (gameSettings.currentLevel === 5) {
            this.scene.start('BossScene');
        } else {
            this.showHeroMessage('Уровень пройден!');
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
    }
}