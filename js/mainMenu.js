showInstructions() {
    console.log('Showing instructions');

    // Очищаем предыдущие элементы если есть
    this.clearInstructionElements();

    // Затемнение фона
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
    this.instructionElements.push(overlay);

    // Панель инструкций (увеличиваем высоту для кнопки)
    const panel = this.add.rectangle(400, 300, 700, 520, 0x2c3e50);
    panel.setStrokeStyle(4, 0xf1c40f);
    this.instructionElements.push(panel);

    // Заголовок
    const title = this.add.text(400, 130, 'КАК ИГРАТЬ', {
        fontSize: '36px',
        fill: '#f1c40f',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        stroke: '#000',
        strokeThickness: 4
    }).setOrigin(0.5);
    this.instructionElements.push(title);

    // Текст инструкций
    const instructions = [
        '🎯 ЦЕЛЬ ИГРЫ:',
        'Помоги герою победить злых слизней!',
        'Решай математические примеры правильно.',
        '',
        '🎮 УПРАВЛЕНИЕ:',
        '• Кликай мышью на правильные ответы',
        '• На мобильных - касайся экрана',
        '• Защити героя от приближающихся слизней',
        '',
        '📚 МАТЕМАТИКА:',
        '• Сложение: 5 + 3 = 8',
        '• Вычитание: 10 - 4 = 6',
        '• Умножение: 3 × 4 = 12',
        '',
        '⭐ СИСТЕМА УРОВНЕЙ:',
        '• 4 уровня с увеличением сложности',
        '• Финальный босс-уровень',
        '• Мини-игры при проигрыше'
    ];

    instructions.forEach((line, index) => {
        const text = this.add.text(400, 170 + index * 22, line, {
            fontSize: '16px',
            fill: '#ecf0f1',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            backgroundColor: line.includes('🎯') || line.includes('🎮') ||
                line.includes('📚') || line.includes('⭐') ? '#00000044' : 'transparent',
            padding: { left: 5, right: 5, top: 2, bottom: 2 }
        }).setOrigin(0.5);
        this.instructionElements.push(text);
    });

    // Кнопка закрытия (опускаем на 5 строчек ниже)
    const closeButton = this.add.rectangle(400, 470, 200, 50, 0xe74c3c)
        .setInteractive({ useHandCursor: true });
    this.instructionElements.push(closeButton);

    const closeText = this.add.text(400, 470, 'ПОНЯТНО', {
        fontSize: '20px',
        fill: '#ffffff',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
    this.instructionElements.push(closeText);

    closeButton.on('pointerdown', () => {
        this.clearInstructionElements();
    });
}