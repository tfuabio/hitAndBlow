/**
 * ヒットアンドブローゲームの管理クラス
 */
class HitAndBlowGame {
    // 使用する色の配列
    static COLORS = [
        '#ff0000',  // 赤
        '#00ff00',  // 緑
        '#0000ff',  // 青
        '#ffff00',  // 黄
        '#ff00ff',  // 紫
        '#00ffff'   // 水色
    ];
    // 最大チャレンジ回数
    static MAX_ATTEMPTS = 8;

    constructor(stopwatch, option) {
        // ストップウォッチのインスタンス
        this.stopwatch = stopwatch;
        // ゲームオプション
        this.option = option;
        // 色選択用のパレットの要素を取得
        this.inputPalette = document.querySelector('.color-palette');
        // 入力スロットの要素を取得
        this.inputSlots = document.querySelectorAll('.input-area .color-slot');
        // 履歴エリアの要素を取得
        this.historyArea = document.querySelector('.history-area');
        // イベントリスナーの設定
        this.setupEventListeners();
    }

    // ゲームオプションの設定
    setOption(option) {
        this.option = option;
    }

    // 初期化処理
    init() {
        // 正解の色の配列
        this.answer = this.generateAnswer();
        // 現在選択されているスロット
        this.currentSlot = null;
        // 履歴の配列（各要素は { colors: [...], result: { hit, blow } } の形式）
        this.history = [];
        // 現在のチャレンジ回数
        this.currentAttempt = 0;
        // ストップウォッチのリセット
        if (this.stopwatch) {
            this.stopwatch.reset();
        }

        // 入力エリアの初期化
        {
            // 入力スロットをリセット
            this.inputSlots.forEach(slot => {
                slot.style.backgroundColor = '';
                slot.style.border = '2px solid #ccc';
                slot.style.boxShadow = 'none';
            });
    
            // 最初のスロットを選択状態にする
            this.setCurrentInputSlot(this.inputSlots[0]);
        }

        // 履歴エリアのHTMLを生成
        this.generateHistoryHTML();

        // チャレンジ回数に応じて履歴をフォーカス
        this.focusHistory();
    }

    // 履歴のフォーカス処理
    focusHistory() {
        const historyRows = this.historyArea.querySelectorAll('.history-row');
        historyRows.forEach(row => {
            const rowIndex = parseInt(row.dataset.row);
            if (rowIndex === this.currentAttempt) {
                row.classList.add('current');
            } else {
                row.classList.remove('current');
            }
        });
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

    // イベントリスナーの設定
    setupEventListeners() {
        // 色選択用のパレットのクリックイベント設定
        HitAndBlowGame.COLORS.forEach(color => {
            const btn = this.inputPalette.querySelector(`button[style*="${color}"]`);
            btn.addEventListener('click', () => this.selectColor(color));
        });
        // 入力スロットのクリックイベント設定
        this.inputSlots.forEach(slot => {
            slot.addEventListener('click', () => this.setCurrentInputSlot(slot));
        });
    }

    // 履歴エリアのHTML生成
    generateHistoryHTML() {
        this.historyArea.innerHTML = ''; // 既存の内容をクリア

        // MAX_ATTEMPTS行分の空の履歴行を作成
        for (let i = 0; i < HitAndBlowGame.MAX_ATTEMPTS; i++) {
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
            this.historyArea.appendChild(historyRow);
        }
    }

    // ランダムな答えを生成
    generateAnswer() {
        // 重複ありの場合は、COLORSからランダムに4つの色を選ぶ
        if (this.option === 'duplicate') {
            const answer = [];
            for (let i = 0; i < 4; i++) {
                const randomColor = HitAndBlowGame.COLORS[Math.floor(Math.random() * HitAndBlowGame.COLORS.length)];
                answer.push(randomColor);
            }
            return answer;
        }
        // 重複なしの場合は、COLORSからランダムに4つの色を選ぶ
        else if (this.option === 'unique') {
            const shuffled = [...HitAndBlowGame.COLORS].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 4);
        }
        // デフォルトは重複なし
        else {
            const shuffled = [...HitAndBlowGame.COLORS].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 4);
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
            const slots = Array.from(this.inputSlots);
            const currentIndex = slots.indexOf(this.currentSlot);
            
            // 次のスロットが存在する場合、そこにフォーカスを移動
            if (currentIndex < slots.length - 1) {
                this.setCurrentInputSlot(slots[currentIndex + 1]);
            } else {
                this.currentSlot = null;
            }
        }
    }

    // スロットを選択したときの処理
    setCurrentInputSlot(slot) {
        // 前に選択していたスロットの枠線を元に戻す
        this.inputSlots.forEach(s => s.style.border = '2px solid #ccc');

        // 新しく選択したスロットの枠線を変更
        this.currentSlot = slot;
        slot.style.border = '3px solid #000';
        // 選択中のスロットを目立たせるためにbox-shadowを追加
        slot.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
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

    // 答え合わせ
    checkAnswer() {
        // 現在の入力スロットの色を取得
        const inputColors = Array.from(this.inputSlots).map(slot => slot.style.backgroundColor);
        
        // 全てのスロットが埋まっているか確認
        if (inputColors.some(color => !color || color === 'rgb(255, 255, 255)')) {
            alert('全ての色を選択してください');
            return;
        }

        // チャレンジ回数をカウントアップ
        this.currentAttempt++;
        // HITとBLOWを計算
        const result = this.calculateResult(inputColors);
        // 履歴に追加
        this.addToHistory(inputColors, result);
        // チャレンジ回数に応じて履歴をフォーカス
        this.focusHistory();

        /**
         * クリアまたはゲームオーバー判定
         */
        // すべての色がHITの場合はゲームクリア
        if (result.hit === 4) {
            this.stop();
            alert('おめでとうございます！正解です！\n'
                + `チャレンジ回数: ${this.currentAttempt}\n`
                + `タイム: ${this.stopwatch ? this.stopwatch.display.textContent : 'N/A'}`);
            if (confirm('もう一度プレイしますか？')) {
                this.init();
                this.start();
            } else {
                showMenu();
            }
        }
        // チャレンジ回数が最大に達した場合のゲームオーバー判定
        else if (this.currentAttempt >= HitAndBlowGame.MAX_ATTEMPTS) {
            this.stop();
            alert('ゲームオーバー！8回のチャレンジが終了しました。'
                + `\n正解は: ${this.getAnswer()}\n`
                + `タイム: ${this.stopwatch ? this.stopwatch.display.textContent : 'N/A'}`
            );
            if (confirm('もう一度プレイしますか？')) {
                this.init();
                this.start();
            } else {
                showMenu();
            }
        }
        // まだチャレンジ可能な場合は入力をリセット
        else {
            const slots = document.querySelectorAll('.input-area .color-slot');
            slots.forEach(slot => {
                slot.style.backgroundColor = '';
                slot.style.border = '2px solid #ccc';
                slot.style.boxShadow = 'none';
            });
            // 最初のスロットを選択状態にする
            this.setCurrentInputSlot(slots[0]);
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

let game = null;

// メニュー画面：ゲーム開始ボタン押下
function pressStart() {
    // オプションの値を取得
    const option = document.getElementById('option').value;

    // ゲーム画面表示
    document.getElementById('menu-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // モード表示
    const modeElement = document.getElementById('mode');
    if (option === 'duplicate') {
        modeElement.textContent = '重複あり';
        modeElement.className = 'duplicate';
    } else if (option === 'unique') {
        modeElement.textContent = '重複なし';
        modeElement.className = 'unique';
    } else {
        modeElement.textContent = '重複なし';
        modeElement.className = 'unique';
    }

    // ゲーム開始
    if (game) {
        game.setOption(option);
    } else {
        const stopwatch = new StopWatch(document.getElementById("time"));
        game = new HitAndBlowGame(stopwatch, option);
    }
    game.init();
    game.start();
}

// ゲーム画面：メニューボタン押下
function pressMenu() {
    // ゲームを中止して良いか確認
    if (confirm('ゲームを中止してメニューに戻りますか？')) {
        // ゲーム停止
        if (game) {
            game.stop();
        }

        // メニュー画面表示
        showMenu();
    }
}

// メニュー画面表示処理
function showMenu() {
    // メニュー画面表示
    document.getElementById('menu-container').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
}

// ゲーム画面：チェックボタン押下
function check() {
    if (game) {
        game.checkAnswer();
    }
}

// オプション変更時の処理
document.getElementById('option').addEventListener('change', (event) => {
    const option = event.target.value;
    if (option === 'duplicate') {
        event.target.className = 'duplicate';
    } else if (option === 'unique') {
        event.target.className = 'unique';
    } else {
        event.target.className = 'unique';
    }
});
