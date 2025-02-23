// ゲームの状態を管理するクラス
class HitAndBlowGame {
    constructor() {
        this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        this.answer = this.generateAnswer();
        this.currentSlot = null;
        this.history = [];
        this.maxAttempts = 8;  // 最大チャレンジ回数
        this.currentAttempt = 0;  // 現在のチャレンジ回数
        
        this.initializeGame();
        this.initializeHistoryArea(); // 履歴エリアの初期化を追加
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

        // 最初のスロットを選択状態にする
        this.setCurrentSlot(slots[0]);
    }

    // 履歴エリアの初期化メソッドを追加
    initializeHistoryArea() {
        const historyArea = document.querySelector('.history-area');
        historyArea.innerHTML = ''; // 既存の内容をクリア

        // 8行分の空の履歴行を作成
        for (let i = 0; i < this.maxAttempts; i++) {
            const historyRow = document.createElement('div');
            historyRow.className = 'history-row';
            historyRow.dataset.row = i; // 行番号を保存
            
            const historyColors = document.createElement('div');
            historyColors.className = 'history-colors';
            
            // 4つの空のカラースロットを作成
            for (let j = 0; j < 4; j++) {
                const slot = document.createElement('div');
                slot.className = 'color-slot';
                historyColors.appendChild(slot);
            }

            const historyResult = document.createElement('div');
            historyResult.className = 'history-result';
            historyResult.innerHTML = `
                <span>HIT: 0</span>
                <span>BLOW: 0</span>
            `;

            historyRow.appendChild(historyColors);
            historyRow.appendChild(historyResult);
            historyArea.appendChild(historyRow);
        }
    }

    // 色を選択したときの処理
    selectColor(color) {
        if (this.currentSlot) {
            this.currentSlot.style.backgroundColor = color;
            // 選択後、枠線を元に戻す
            this.currentSlot.style.border = '2px solid #ccc';
            this.currentSlot.style.boxShadow = 'none';

            // 次のスロットを探して選択
            const slots = Array.from(document.querySelectorAll('.input-area .color-slot'));
            const currentIndex = slots.indexOf(this.currentSlot);
            
            // 次のスロットが存在する場合、そこにフォーカスを移動
            if (currentIndex < slots.length - 1) {
                this.setCurrentSlot(slots[currentIndex + 1]);
            } else {
                this.currentSlot = null;
            }
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

    // 履歴の更新メソッドを修正
    addToHistory(colors, result) {
        const historyRow = document.querySelector(`.history-row[data-row="${this.currentAttempt - 1}"]`);
        const colorSlots = historyRow.querySelectorAll('.color-slot');
        
        // 色を設定
        colorSlots.forEach((slot, index) => {
            slot.style.backgroundColor = colors[index];
        });

        // 結果を更新
        const historyResult = historyRow.querySelector('.history-result');
        historyResult.innerHTML = `
            <span>HIT: ${result.hit}</span>
            <span>BLOW: ${result.blow}</span>
        `;
    }

    // 入力をリセット
    resetInput() {
        const slots = document.querySelectorAll('.input-area .color-slot');
        slots.forEach(slot => {
            slot.style.backgroundColor = '';
            slot.style.border = '2px solid #ccc';
            slot.style.boxShadow = 'none';
        });
        // 最初のスロットを選択状態にする
        this.setCurrentSlot(slots[0]);
    }

    // 答え合わせ
    checkAnswer() {
        const currentColors = this.getCurrentColors();
        
        // 全てのスロットが埋まっているか確認
        if (currentColors.some(color => !color || color === 'rgb(255, 255, 255)')) {
            alert('全ての色を選択してください');
            return;
        }

        this.currentAttempt++;  // チャレンジ回数をカウントアップ
        const result = this.calculateResult(currentColors);
        
        // 結果を表示
        document.querySelector('.hit').textContent = `HIT: ${result.hit}`;
        document.querySelector('.blow').textContent = `BLOW: ${result.blow}`;
        
        // 履歴に追加
        this.addToHistory(currentColors, result);

        // 残りチャレンジ回数を表示
        const remainingAttempts = this.maxAttempts - this.currentAttempt;
        document.querySelector('.hit').textContent = `HIT: ${result.hit} (残り${remainingAttempts}回)`;

        // クリアまたはゲームオーバー判定
        if (result.hit === 4) {
            alert('おめでとうございます！クリアです！');
            this.showAnswer();
            if (confirm('もう一度プレイしますか？')) {
                location.reload();
            }
        } else if (this.currentAttempt >= this.maxAttempts) {
            alert('ゲームオーバー！8回のチャレンジが終了しました。');
            this.showAnswer();
            if (confirm('もう一度プレイしますか？')) {
                location.reload();
            }
        } else {
            // まだチャレンジ可能な場合は入力をリセット
            this.resetInput();
        }
    }

    // 正解を表示するメソッド
    showAnswer() {
        const answerColors = this.answer.map(color => this.hexToRgb(color));
        const message = '正解は:\n' + answerColors.map(color => {
            // RGB値を日本語の色名に変換（簡易版）
            if (color === 'rgb(255, 0, 0)') return '赤';
            if (color === 'rgb(0, 255, 0)') return '緑';
            if (color === 'rgb(0, 0, 255)') return '青';
            if (color === 'rgb(255, 255, 0)') return '黄';
            if (color === 'rgb(255, 0, 255)') return '紫';
            if (color === 'rgb(0, 255, 255)') return '水色';
            return color;
        }).join(', ');
        alert(message);
    }
}

// ゲーム開始
const game = new HitAndBlowGame();