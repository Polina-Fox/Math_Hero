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
        this.levelFinished = false;
        this.baseSlimeSpeed = 50;
        this.isPaused = false;
        this.pauseMenuElements = [];
    }

    preload() {
        this.createColorTexture('answer-button', 0x3498db);
        this.createColorTexture('answer-correct', 0x27ae60);
        this.createColorTexture('answer-wrong', 0xe74c3c);
    }

    createColorTexture(key, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillRoundedRect(0, 0, 120, 50, 10);
        graphics.generateTexture(key, 120, 50);
        graphics.destroy();
    }

    create() {
        // Полный сброс состояний
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }
        this.time.removeAllEvents();
        this.slimes.forEach(s => {
            if (s._parts) s._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
            if (s && s.destroy) s.destroy();
        });
        this.slimes = [];
        this.answerButtons = [];
        this.levelFinished = false;
        this.warningShown = false;
        this.isPaused = false;
        this.pauseMenuElements = [];

        const validLevels = [1, 2, 3, 4];
        if (!validLevels.includes(gameSettings.currentLevel)) {
            console.warn('Некорректный currentLevel =', gameSettings.currentLevel, '→ сброс на 1');
            gameSettings.currentLevel = 1;
        }

        console.log('=== Запущен уровень', gameSettings.currentLevel, '===');

        let bgKey = 'bg-grass';
        if (gameSettings.currentLevel >= 3 && gameSettings.currentLevel <= 4) {
            bgKey = 'bg-forest';
        } else if (gameSettings.currentLevel >= 5 && gameSettings.currentLevel <= 6) {
            bgKey = 'bg-fall';
        }
        this.add.image(400, 300, bgKey).setDisplaySize(800, 600);

        this.levelText = this.add.text(20, 20, `Уровень: ${gameSettings.currentLevel}`, {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa', padding: { left: 15, right: 15, top: 8, bottom: 8 },
            stroke: '#000', strokeThickness: 3
        });
        this.scoreText = this.add.text(20, 60, `Счёт: ${gameSettings.score}`, {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa', padding: { left: 15, right: 15, top: 8, bottom: 8 },
            stroke: '#000', strokeThickness: 3
        });
        this.livesText = this.add.text(20, 100, `Жизни: ${gameSettings.lives}`, {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000aa', padding: { left: 15, right: 15, top: 8, bottom: 8 },
            stroke: '#000', strokeThickness: 3
        });

        // Кнопка паузы (правый верхний угол, увеличена в 3 раза)
        this.pauseButton = this.add.image(760, 40, 'pause-button')
            .setInteractive({ useHandCursor: true })
            .setScale(0.45)
            .setDepth(100);

        this.pauseButton.on('pointerdown', () => {
            if (!this.isPaused) {
                this.pauseGame();
            }
        });

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

        this.hero = this.physics.add.sprite(100, 330, 'hero_idle');
        this.hero.setCollideWorldBounds(true);
        this.hero.body.setSize(this.hero.width * 0.6, this.hero.height * 0.8);

        this.slimeSpeed = this.baseSlimeSpeed + (gameSettings.currentLevel - 1) * 6;
        this.spawnDelay = Math.max(1100, 2000 - (gameSettings.currentLevel - 1) * 250);

        this.generateMathProblem();
        this.startSlimeSpawning();

        this.physics.add.overlap(this.hero, this.slimes, this.heroHit, null, this);
    }

    pauseGame() {
        if (this.isPaused) return;
        this.isPaused = true;

        // Останавливаем физику
        this.physics.pause();

        // Затемнённый фон
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)
            .setDepth(200)
            .setInteractive(); // блокируем клики под меню
        this.pauseMenuElements.push(overlay);

        // Заголовок паузы
        const pauseTitle = this.add.text(400, 150, 'ПАУЗА', {
            fontSize: '48px', fill: '#f1c40f', fontFamily: 'Arial, sans-serif',
            stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(201);
        this.pauseMenuElements.push(pauseTitle);

        // Кнопка "Продолжить"
        const resumeBtn = this.add.image(400, 280, 'resume-button')
            .setInteractive({ useHandCursor: true })
            .setScale(0.5)
            .setDepth(201);
        this.pauseMenuElements.push(resumeBtn);

        const resumeText = this.add.text(400, 320, 'ПРОДОЛЖИТЬ', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(202);
        this.pauseMenuElements.push(resumeText);

        resumeBtn.on('pointerover', () => {
            resumeBtn.setScale(0.55);
        });
        resumeBtn.on('pointerout', () => {
            resumeBtn.setScale(0.5);
        });
        resumeBtn.on('pointerdown', () => {
            this.resumeGame();
        });

        // Кнопка "В главное меню"
        const menuBtn = this.add.image(400, 400, 'menu-button')
            .setInteractive({ useHandCursor: true })
            .setScale(0.5)
            .setDepth(201);
        this.pauseMenuElements.push(menuBtn);

        const menuText = this.add.text(400, 440, 'ГЛАВНОЕ МЕНЮ', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(202);
        this.pauseMenuElements.push(menuText);

        menuBtn.on('pointerover', () => {
            menuBtn.setScale(0.55);
        });
        menuBtn.on('pointerout', () => {
            menuBtn.setScale(0.5);
        });
        menuBtn.on('pointerdown', () => {
            // Сбрасываем всё и возвращаемся в меню
            this.isPaused = false;
            this.pauseMenuElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
            this.pauseMenuElements = [];
            this.physics.resume();
            gameSettings.currentLevel = 1;
            gameSettings.score = 0;
            gameSettings.lives = 3;
            this.scene.start('MainMenu');
        });
    }

    resumeGame() {
        if (!this.isPaused) return;
        this.isPaused = false;

        // Удаляем элементы меню паузы
        this.pauseMenuElements.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.pauseMenuElements = [];

        // Возобновляем физику
        this.physics.resume();
    }

    generateMathProblem() {
        this.answerButtons.forEach(b => { if (b.button) b.button.destroy(); if (b.text) b.text.destroy(); });
        this.answerButtons = [];
        if (this.problemText) this.problemText.destroy();

        const types = [];
        if (gameSettings.addition) types.push('addition');
        if (gameSettings.subtraction) types.push('subtraction');
        if (gameSettings.multiplication) types.push('multiplication');
        if (types.length === 0) types.push('addition');

        const type = Phaser.Math.RND.pick(types);
        let a, b, answer;
        const lvl = gameSettings.currentLevel;

        switch (type) {
            case 'addition':
                a = Phaser.Math.Between(1, lvl <= 2 ? 8 : 10 + lvl * 2);
                b = Phaser.Math.Between(1, lvl <= 2 ? 8 : 10 + lvl * 2);
                answer = a + b;
                this.currentProblem = { question: `${a} + ${b} = ?`, answer };
                break;
            case 'subtraction':
                a = Phaser.Math.Between(lvl <= 2 ? 3 : 5, lvl <= 2 ? 10 : 12 + lvl * 2);
                b = Phaser.Math.Between(1, a);
                answer = a - b;
                this.currentProblem = { question: `${a} - ${b} = ?`, answer };
                break;
            case 'multiplication':
                a = Phaser.Math.Between(1, lvl <= 2 ? 5 : 5 + lvl);
                b = Phaser.Math.Between(1, lvl <= 2 ? 5 : 5 + lvl);
                answer = a * b;
                this.currentProblem = { question: `${a} × ${b} = ?`, answer };
                break;
        }

        gameSettings.lastQuestion = this.currentProblem.question;
        gameSettings.lastAnswer = this.currentProblem.answer;

        this.problemText = this.add.text(400, 475, this.currentProblem.question, {
            fontSize: '36px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000cc', padding: { x: 25, y: 15 },
            stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        const answers = [this.currentProblem.answer];
        while (answers.length < 3) {
            const wrong = this.currentProblem.answer + Phaser.Math.Between(-5, 5);
            if (wrong > 0 && !answers.includes(wrong)) answers.push(wrong);
        }
        Phaser.Utils.Array.Shuffle(answers);

        answers.forEach((ans, i) => {
            const x = 300 + i * 150, y = 550;
            const btn = this.add.image(x, y, 'answer-button').setInteractive({ useHandCursor: true });
            const txt = this.add.text(x, y, ans.toString(), {
                fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold', stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
            btn.on('pointerdown', () => this.checkAnswer(ans, btn, txt));
            this.answerButtons.push({ button: btn, text: txt });
        });
    }

    checkAnswer(selected, btn, txt) {
        if (this.isPaused || this.levelFinished) return;

        this.answerButtons.forEach(b => b.button.disableInteractive());
        if (selected === this.currentProblem.answer) {
            btn.setTexture('answer-correct');
            txt.setStyle({ fill: '#ffffff' });

            this.hero.setTexture('hero_cheer0');
            this.time.delayedCall(600, () => this.hero.setTexture('hero_idle'));

            if (this.slimes.length > 0) {
                const slimeIndex = this.slimes.findIndex(s => s.active);
                if (slimeIndex !== -1) {
                    const slime = this.slimes[slimeIndex];
                    if (slime._parts) slime._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
                    slime.destroy();
                    this.slimes.splice(slimeIndex, 1);
                    gameSettings.score += 10;
                    this.scoreText.setText(`Счёт: ${gameSettings.score}`);
                }
            }

            this.time.delayedCall(800, () => { this.generateMathProblem(); this.showHeroMessage('Молодец! 👍'); });
        } else {
            btn.setTexture('answer-wrong');
            txt.setStyle({ fill: '#ffffff' });

            this.hero.setTexture('hero_hurt');
            this.time.delayedCall(600, () => this.hero.setTexture('hero_idle'));

            this.answerButtons.forEach(b => {
                if (parseInt(b.text.text) === this.currentProblem.answer) b.button.setTexture('answer-correct');
            });
            this.showHeroMessage('Попробуй ещё! 💪');
            this.time.delayedCall(1500, () => this.generateMathProblem());
        }
    }

    startSlimeSpawning() {
        let slimeCount = this.getSlimeCountForLevel();
        if (this.easyStartActive) slimeCount = Math.max(1, slimeCount - 2);
        this.slimesToSpawn = slimeCount;
        this.slimesSpawned = 0;
        if (this.spawnTimer) this.spawnTimer.remove();
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnDelay,
            callback: () => {
                if (!this.levelFinished && !this.isPaused && this.slimesSpawned < this.slimesToSpawn) {
                    this.spawnSlime();
                    this.slimesSpawned++;
                }
            },
            loop: true
        });
    }

    spawnSlime() {
        const colors = ['blue', 'green', 'red'];
        const color = Phaser.Math.RND.pick(colors);
        const bodyVariant = Phaser.Math.RND.pick(['A', 'B', 'C', 'D', 'E', 'F']);
        const mouthVariant = Phaser.Math.RND.pick(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
        const hasNormalEye = (color === 'blue' || color === 'red');
        const useAngryEye = !hasNormalEye || Math.random() < 0.3;
        const eyeKey = useAngryEye ? `eye_angry_${color}` : `eye_${color}`;

        const bodyKey = `body_${color}${bodyVariant}`;
        const slime = this.physics.add.sprite(850, 0, bodyKey);
        slime.body.setSize(slime.width * 0.7, slime.height * 0.7);
        slime.setScale(0.75);

        const eye = this.add.image(slime.x, slime.y - 10, eyeKey).setScale(0.7);
        const mouth = this.add.image(slime.x, slime.y + 15, `mouth${mouthVariant}`).setScale(0.7);
        let antenna = null;
        if (Math.random() < 0.5) {
            antenna = this.add.image(slime.x, slime.y - 40, `detail_${color}_antenna_small`).setScale(0.6);
        }
        slime._parts = [eye, mouth, antenna].filter(p => p);

        slime.y = Phaser.Math.Clamp(this.hero.y + Phaser.Math.Between(-30, 30), 40, 560);
        slime.setVelocityX(-this.slimeSpeed);
        slime.setAlpha(0);
        this.tweens.add({ targets: slime, alpha: 1, duration: 500 });
        this.slimes.push(slime);
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

    heroHit(hero, slime) {
        if (this.levelFinished || this.isPaused || !slime.active) return;
        if (this.hasShield) {
            this.hasShield = false;
            if (slime._parts) slime._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
            slime.destroy();
            this.slimes = this.slimes.filter(s => s.active && s !== slime);
            this.showHeroMessage('Щит отразил атаку! ✨');
            return;
        }
        if (slime._parts) slime._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
        slime.destroy();
        this.slimes = this.slimes.filter(s => s.active && s !== slime);
        gameSettings.lives--;
        this.livesText.setText(`Жизни: ${gameSettings.lives}`);

        this.hero.setTexture('hero_hit');
        this.tweens.add({
            targets: hero, alpha: 0.5, duration: 200, yoyo: true, repeat: 2,
            onComplete: () => this.hero.setTexture('hero_idle')
        });

        if (gameSettings.lives <= 0) {
            this.hero.setTexture('hero_fallDown');
            this.gameOver();
        } else {
            this.showHeroMessage('Ай! Больно! 😫');
        }
    }

    gameOver() {
        if (this.levelFinished) return;
        this.levelFinished = true;

        this.slimes.forEach(s => {
            if (s._parts) s._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
            if (s && s.destroy) s.destroy();
        });
        this.slimes = [];
        this.slimesToSpawn = 0;
        this.slimesSpawned = 0;

        this.physics.pause();
        this.time.removeAllEvents();
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }

        this.hero.setTexture('hero_fallDown');
        this.showHeroMessage('Меня победили... 💀');
        this.time.delayedCall(2000, () => {
            const miniGames = ['RescueMiniGame', 'MagicPauseMiniGame', 'SecretTrainingMiniGame'];
            this.scene.start(Phaser.Math.RND.pick(miniGames));
        });
    }

    levelComplete() {
        if (this.levelFinished) return;
        this.levelFinished = true;

        if (gameSettings.currentLevel < 1 || gameSettings.currentLevel > 4) {
            gameSettings.currentLevel = 1;
        }

        this.slimes.forEach(s => {
            if (s._parts) s._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
            if (s && s.destroy) s.destroy();
        });
        this.slimes = [];
        this.slimesToSpawn = 0;
        this.slimesSpawned = 0;

        this.hero.setTexture('hero_cheer1');
        this.physics.pause();
        this.time.removeAllEvents();
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }

        gameSettings.currentLevel++;
        this.showHeroMessage('Уровень пройден! 🎉');
        this.time.delayedCall(2000, () => {
            if (gameSettings.currentLevel > 4) {
                this.scene.start('BossScene');
            } else {
                this.scene.start('GameScene');
            }
        });
    }

    showHeroMessage(msg) {
        if (this.heroMessage) this.heroMessage.destroy();
        this.heroMessage = this.add.text(this.hero.x + 40, this.hero.y - 50, msg, {
            fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial, sans-serif',
            backgroundColor: '#000000cc', padding: { x: 15, y: 8 },
            stroke: '#000', strokeThickness: 3,
            wordWrap: { width: 250 }
        }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            if (this.heroMessage) {
                this.heroMessage.destroy();
                this.heroMessage = null;
            }
        });
    }

    update() {
        if (this.levelFinished || this.isPaused) return;

        this.slimes.forEach(slime => {
            if (slime._parts && slime.active) {
                if (slime._parts[0]) { slime._parts[0].x = slime.x; slime._parts[0].y = slime.y - 10; }
                if (slime._parts[1]) { slime._parts[1].x = slime.x; slime._parts[1].y = slime.y + 15; }
                if (slime._parts[2]) { slime._parts[2].x = slime.x; slime._parts[2].y = slime.y - 40; }
            }
        });

        if (this.slimes.length === 0 && this.slimesSpawned >= this.slimesToSpawn) this.levelComplete();

        if (this.slimes[0] && this.slimes[0].x < 300 && !this.warningShown) {
            this.showHeroMessage('Они близко! Быстрее! 🚨');
            this.warningShown = true;
        }

        for (let i = this.slimes.length - 1; i >= 0; i--) {
            const slime = this.slimes[i];
            if (!slime.active || slime.x < -50) {
                if (slime._parts) slime._parts.forEach(p => { if (p && p.destroy) p.destroy(); });
                slime.destroy();
                this.slimes.splice(i, 1);
            }
        }
    }
}