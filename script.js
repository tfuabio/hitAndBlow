// ゲームの状態を管理するクラス
class HitAndBlowGame {
    constructor() {
        this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        this.answer = this.generateAnswer();
        this.currentSlot = null;
        this.history = [];
        
        this.initializeGame();
    }

    // ランダムな答えを生成
    generateAnswer() {
        const shuffled = [...this.colors].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 4);
    }

    // 初期設定
    initializeGame() {
        // 色選択用のパレット設定
        const palette = document.querySelector('.color-palette');
        this.colors.forEach(color => {
            const btn = palette.querySelector(`button[style*="${color}"]`);
            btn.addEventListener('click', () => this.selectColor(color));
        });

        // 入力スロットの設定
        const slots = document.querySelectorAll('.input-area .color-slot');
        slots.forEach(slot => {
            slot.addEventListener('click', () => this.setCurrentSlot(slot));
        });

        // チェックボタンの設定
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.addEventListener('click', () => this.checkAnswer());
    }

    // 色を選択したときの処理
    selectColor(color) {
        if (this.currentSlot) {
            this.currentSlot.style.backgroundColor = color;
            // 選択後、枠線を元に戻してフォーカスを解除
            this.currentSlot.style.border = '2px solid #ccc';
            this.currentSlot = null;
        }
    }

    // スロットを選択したときの処理
    setCurrentSlot(slot) {
        // 前に選択していたスロットの枠線を元に戻す
        const allSlots = document.querySelectorAll('.input-area .color-slot');
        allSlots.forEach(s => s.style.border = '2px solid #ccc');

        // 新しく選択したスロットの枠線を変更
        this.currentSlot = slot;
        slot.style.border = '3px solid #000';
        // 選択中のスロットを目立たせるためにbox-shadowを追加
        slot.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    }

    // 入力された色を取得
    getCurrentColors() {
        const slots = document.querySelectorAll('.input-area .color-slot');
        return Array.from(slots).map(slot => slot.style.backgroundColor);
    }

    // 16進数カラーコードをRGB形式に変換
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // 色を比較
    compareColors(color1, color2) {
        if (!color1 || !color2) return false;
        return color1.replace(/\s/g, '') === color2.replace(/\s/g, '');
    }

    // HITとBLOWを計算
    calculateResult(currentColors) {
        let hit = 0;
        let blow = 0;
        const usedAnswer = new Set();
        const usedGuess = new Set();

        // 答えの色をRGB形式に変換
        const rgbAnswer = this.answer.map(color => this.hexToRgb(color));

        // HIT（位置と色が一致）をカウント
        for (let i = 0; i < 4; i++) {
            if (this.compareColors(currentColors[i], rgbAnswer[i])) {
                hit++;
                usedAnswer.add(i);
                usedGuess.add(i);
            }
        }

        // BLOW（色のみ一致）をカウント
        for (let i = 0; i < 4; i++) {
            if (usedGuess.has(i)) continue;
            
            for (let j = 0; j < 4; j++) {
                if (usedAnswer.has(j)) continue;
                
                if (this.compareColors(currentColors[i], rgbAnswer[j])) {
                    blow++;
                    usedAnswer.add(j);
                    break;
                }
            }
        }

        return { hit, blow };
    }

    // 履歴に追加
    addToHistory(colors, result) {
        const historyArea = document.querySelector('.history-area');
        const historyRow = document.createElement('div');
        historyRow.className = 'history-row';
        
        const historyColors = document.createElement('div');
        historyColors.className = 'history-colors';
        
        colors.forEach(color => {
            const slot = document.createElement('div');
            slot.className = 'color-slot';
            slot.style.backgroundColor = color;
            historyColors.appendChild(slot);
        });

        const historyResult = document.createElement('div');
        historyResult.className = 'history-result';
        historyResult.innerHTML = `
            <span>HIT: ${result.hit}</span>
            <span>BLOW: ${result.blow}</span>
        `;

        historyRow.appendChild(historyColors);
        historyRow.appendChild(historyResult);
        historyArea.insertBefore(historyRow, historyArea.firstChild);
    }

    // 答え合わせ
    checkAnswer() {
        const currentColors = this.getCurrentColors();
        
        // 全てのスロットが埋まっているか確認
        if (currentColors.some(color => !color || color === 'rgb(255, 255, 255)')) {
            alert('全ての色を選択してください');
            return;
        }

        const result = this.calculateResult(currentColors);
        
        // 結果を表示
        document.querySelector('.hit').textContent = `HIT: ${result.hit}`;
        document.querySelector('.blow').textContent = `BLOW: ${result.blow}`;
        
        // 履歴に追加
        this.addToHistory(currentColors, result);

        // クリアした場合
        if (result.hit === 4) {
            alert('おめでとうございます！クリアです！');
            if (confirm('もう一度プレイしますか？')) {
                location.reload();
            }
        }
    }
}

// ゲーム開始
const game = new HitAndBlowGame();