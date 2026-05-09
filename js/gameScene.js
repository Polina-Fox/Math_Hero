class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.slimes = [];
        this.currentProblem = null;
        this.answerButtons = [];
        this.slimeSpeed = 50;
        this.heroMessage = null;
        this.warningShown = false;
        this.hasShield = false;
        this.easyStartActive = false;
        this.levelFinished = false;   // новый флаг для предотвращения двойного срабатывания
        this.baseSlimeSpeed = 50;     // для расчета динамической скорости
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
        console.log('=== STARTING LEVEL', gameSettings.currentLevel, '===');

        // Сброс критических флагов при каждом запуске сцены
        this.levelFinished = false;
        this.warningShown = false;

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

        // Применяем бонусы, если есть
        if (gameSettings.shield) {
            this.hasShield = true;
            gameSettings.shield = false;
            this.showHeroMessage('Волшебный щит активирован! 🛡️');
        } else {
            this.hasShield = false;
        }

        if (gameSettings.bonusLife) {
            gameSettings.lives += 1;
            gameSettings.bonusLife = false;
            this.livesText.setText(`Жизни: ${gameSettings.lives}`);
            this.showHeroMessage('+1 жизнь от секретной тренировки! ❤️');
        }

        if (gameSettings.easyStart) {
            this.easyStartActive = true;
            gameSettings.easyStart = false;
        } else {
            this.easyStartActive = false;
        }

        // Герой
        this.hero = this.physics.add.sprite(100, 300, 'hero-character');
        this.hero.setCollideWorldBounds(true);

        // Генерация математической задачи
        this.generateMathProblem();

        // Рассчитываем параметры сложности для текущего уровня
        this.slimeSpeed = this.baseSlimeSpeed + (gameSettings.currentLevel - 1) * 15; // 50, 65, 80, 95...
        this.spawnDelay = Math.max(800, 2000 - (gameSettings.currentLevel - 1) * 300); // 2000, 1700, 1400, 1100...

        console.log('Level params: speed=' + this.slimeSpeed + ', spawnDelay=' + this.spawnDelay + ', slimesToSpawn=' + this.getSlimeCountForLevel());

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

        // Если ни один тип не выбран – включаем сложение по умолчанию
        if (problemTypes.length === 0) problemTypes.push('addition');

        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        let a, b, answer;
        const lvl = gameSettings.currentLevel;

        switch (type) {
            case 'addition':
                if (lvl <= 2) {
                    a = Phaser.Math.Between(1, 8);
                    b = Phaser.Math.Between(1, 8);
                } else {
                    a = Phaser.Math.Between(1, 10 + lvl * 2);
                    b = Phaser.Math.Between(1, 10 + lvl * 2);
                }
                answer = a + b;
                this.currentProblem = { question: `${a} + ${b} = ?`, answer: answer };
                break;
            case 'subtraction':
                if (lvl <= 2) {
                    a = Phaser.Math.Between(3, 10);
                    b = Phaser.Math.Between(1, a);
                } else {
                    a = Phaser.Math.Between(5, 12 + lvl * 2);
                    b = Phaser.Math.Between(1, a);
                }
                answer = a - b;
                this.currentProblem = { question: `${a} - ${b} = ?`, answer: answer };
                break;
            case 'multiplication':
                if (lvl <= 2) {
                    a = Phaser.Math.Between(1, 5);
                    b = Phaser.Math.Between(1, 5);
                } else {
                    a = Phaser.Math.Between(2, 5 + lvl);
                    b = Phaser.Math.Between(2, 5 + lvl);
                }
                answer = a * b;
                this.currentProblem = { question: `${a} × ${b} = ?`, answer: answer };
                break;
        }

        // Сохраняем последний пример для мини-игр
        gameSettings.lastQuestion = this.currentProblem.question;
        gameSettings.lastAnswer = this.currentProblem.answer;

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
        // Защита: если мини-игра сделала запуск очень лёгким, но минимум 1 враг
        let slimeCount = this.getSlimeCountForLevel();
        if (this.easyStartActive) {
            slimeCount = Math.max(1, slimeCount - 2);
            console.log('Easy start: reduced slime count to', slimeCount);
        }
        this.slimesToSpawn = slimeCount;
        this.slimesSpawned = 0;

        // Очистка предыдущего таймера, если есть
        if (this.spawnTimer) this.spawnTimer.remove();

        this.spawnTimer = this.time.addEvent({
            delay: this.spawnDelay,
            callback: () => {
                if (!this.levelFinished && this.slimesSpawned < this.slimesToSpawn) {
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
            case 1: return 4;
            case 2: return 5;
            case 3: return 7;
            case 4: return 9;
            default: return 10;
        }
    }

    getRandomSlimeColor() {
        const colors = [0xff6b9d, 0x74b9ff, 0x55efc4, 0xfdcb6e, 0xa29bfe];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    heroHit(hero, slime) {
        if (this.levelFinished) return; // не обрабатываем столкновения после победы

        if (this.hasShield) {
            this.hasShield = false;
            slime.destroy();
            this.slimes = this.slimes.filter(s => s !== slime);
            this.showHeroMessage('Щит отразил атаку! ✨');
            return;
        }

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
        if (this.levelFinished) return;
        this.levelFinished = true; // предотвращаем дальнейшую логику
        this.showHeroMessage('Меня победили... 💀');

        this.time.delayedCall(2000, () => {
            const miniGames = ['RescueMiniGame', 'MagicPauseMiniGame', 'SecretTrainingMiniGame'];
            const chosen = Phaser.Math.RND.pick(miniGames);
            this.scene.start(chosen);
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
        // Если уровень уже завершён, выходим из update
        if (this.levelFinished) return;

        // Проверка победы на уровне: все слизни заспавнены и уничтожены
        if (this.slimes.length === 0 && this.slimesSpawned >= this.slimesToSpawn) {
            this.levelComplete();
        }

        // Предупреждения о приближении слизней
        const closestSlime = this.slimes[0];
        if (closestSlime && closestSlime.x < 300 && !this.warningShown) {
            this.showHeroMessage('Они близко! Быстрее! 🚨');
            this.warningShown = true;
        }

        // Удаление слизней, вышедших за левую границу (чтобы не занимали память)
        for (let i = this.slimes.length - 1; i >= 0; i--) {
            if (this.slimes[i].x < -50) {
                this.slimes[i].destroy();
                this.slimes.splice(i, 1);
            }
        }
    }

    levelComplete() {
        if (this.levelFinished) return;
        this.levelFinished = true;

        console.log('Level ' + gameSettings.currentLevel + ' complete!');

        gameSettings.currentLevel++;
        this.showHeroMessage('Уровень пройден! 🎉');

        if (gameSettings.currentLevel > 4) {
            console.log('Transition to BossScene');
            this.time.delayedCall(2000, () => {
                this.scene.start('BossScene');
            });
        } else {
            console.log('Next level will be ' + gameSettings.currentLevel);
            this.time.delayedCall(2000, () => {
                this.scene.restart();
            });
        }
    }
}