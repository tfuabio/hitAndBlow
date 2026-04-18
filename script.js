// ゲームの状態を管理するクラス
class HitAndBlowGame {
    constructor() {
        this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        this.answer = this.generateAnswer();
        this.currentSlot = null;
        this.history = [];
        this.maxAttempts = 8;  // 最大チャレンジ回数
        this.currentAttempt = 0;  // 現在のチャレンジ回数
        this.stopwatch = null; // ストップウォッチのインスタンスを保持
        
        this.initializeGame();
        this.initializeHistoryArea(); // 履歴エリアの初期化を追加
        //this.hideHtmlComments();
    }

    // ストップウォッチのインスタンスをセットするメソッドを追加
    setStopwatch(stopwatch) {
        this.stopwatch = stopwatch;
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

    // ゲーム開始
    start() {
        if (this.stopwatch) {
            this.stopwatch.start();
        }
    }

    // ゲーム停止
    stop() {
        if (this.stopwatch) {
            this.stopwatch.stop();
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
        
        // 履歴に追加
        this.addToHistory(currentColors, result);

        /**
         * クリアまたはゲームオーバー判定
         */
        // すべての色がHITの場合はゲームクリア
        if (result.hit === 4) {
            this.stop(); // ストップウォッチを停止
            alert('おめでとうございます！正解です！\n'
                + `チャレンジ回数: ${this.currentAttempt}\n`
                + `タイム: ${this.stopwatch ? this.stopwatch.display.textContent : 'N/A'}`);
            this.showAnswer();
            if (confirm('もう一度プレイしますか？')) {
                location.reload();
            }
        }
        // チャレンジ回数が最大に達した場合のゲームオーバー判定
        else if (this.currentAttempt >= this.maxAttempts) {
            this.stop(); // ゲームオーバー時にストップウォッチを停止
            alert('ゲームオーバー！8回のチャレンジが終了しました。'
                + `\n正解は: ${this.getAnswer()}\n`
                + `タイム: ${this.stopwatch ? this.stopwatch.display.textContent : 'N/A'}`
            );
            this.showAnswer();
            if (confirm('もう一度プレイしますか？')) {
                location.reload();
            }
        } else {
            // まだチャレンジ可能な場合は入力をリセット
            this.resetInput();
        }
    }

    // 正解を取得
    getAnswer() {
        const answerColors = this.answer.map(color => this.hexToRgb(color));
        const message = answerColors.map(color => {
            // RGB値を日本語の色名に変換（簡易版）
            if (color === 'rgb(255, 0, 0)') return '赤';
            if (color === 'rgb(0, 255, 0)') return '緑';
            if (color === 'rgb(0, 0, 255)') return '青';
            if (color === 'rgb(255, 255, 0)') return '黄';
            if (color === 'rgb(255, 0, 255)') return '紫';
            if (color === 'rgb(0, 255, 255)') return '水色';
            return color;
        }).join(', ');
        return message;
    }

    // HTMLコメントを隠す
    hideHtmlComments() {
        const comments = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
        let comment;
        while (comment = comments.nextNode()) {
            comment.textContent = ''; // コメントの内容を空にする
        }
    }
}

/**
 * ストップウォッチのクラス
 * - start(): タイマーを開始
 * - stop(): タイマーを停止
 * - reset(): タイマーをリセット
 * - update(): タイマーの表示を更新
 * 
 * タイマーは10ミリ秒ごとに更新され、分:秒:ミリ秒の形式で表示される。
 */
class StopWatch {
    constructor(display) {
        this.display = display;     // 表示用の要素
        this.elapsed = 0;           // 経過時間（ミリ秒）
        this.timer = null;          // タイマーID
    }

    start() {
        // すでにタイマーが動いている場合は何もしない
        if (this.timer) return;
        // タイマー開始時の基準時間を設定
        this.startTime = Date.now() - this.elapsed;
        // 10ミリ秒ごとにupdateメソッドを呼び出すタイマーを開始
        this.timer = setInterval(() => this.update(), 10);
    }

    stop() {
        // タイマーが動いていない場合は何もしない
        if (!this.timer) return;
        // タイマーを停止
        clearInterval(this.timer);
        // タイマーIDをリセット
        this.timer = null;
        // タイマー停止時の経過時間を計算
        this.elapsed = Date.now() - this.startTime;
    }

    reset() {
        // タイマーが動いている場合は停止
        clearInterval(this.timer);
        // 経過時間をリセット
        this.elapsed = 0;
        // タイマーIDをリセット
        this.timer = null;
        // 表示をリセット
        this.display.textContent = "00:00:00";
    }

    update() {
        let now = Date.now() - this.startTime;
        let ms = Math.floor((now % 1000) / 10);
        let sec = Math.floor((now / 1000) % 60);
        let min = Math.floor((now / 60000));
        this.display.textContent =
            String(min).padStart(2,'0') + ":" +
            String(sec).padStart(2,'0') + ":" +
            String(ms).padStart(2,'0');
    }
}

// ページが読み込まれたときに実行
window.onload = () => {
    // ゲームとストップウォッチのインスタンスを作成
    const game = new HitAndBlowGame();
    const stopwatch = new StopWatch(document.getElementById("time"));
    
    // ゲームにストップウォッチのインスタンスをセット
    game.setStopwatch(stopwatch);

    game.start(); // ゲーム開始と同時にストップウォッチもスタート
}
