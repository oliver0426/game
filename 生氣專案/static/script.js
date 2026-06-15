// ==================== 全域遊戲狀態 ====================
const gameState = {
    gameStarted: false,        // 遊戲是否已開始
    gameOver: false,           // 遊戲是否結束
    isDrawing: false,          // 滑鼠是否正在繪製
    currentPaperIndex: 0,      // 目前考卷索引（1-based）
    totalPapers: 0             // 總考卷數量
};

// ==================== DOM 元素引用 ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');          // Canvas 2D 繪圖上下文
const canvasWrapper = document.getElementById('canvasWrapper');
const nextButton = document.getElementById('nextButton');
const rulesModal = document.getElementById('rulesModal');
const gameOverModal = document.getElementById('gameOverModal');
const startButton = document.getElementById('startButton');
const progressBar = document.getElementById('progressBar');
const restartButton = document.getElementById('restartButton');

// ==================== 音樂與音效設定 ====================
const bgmAudio = new Audio('/resources/music/bgm.mp3');
bgmAudio.loop = true;
bgmAudio.volume = 0.3;
bgmAudio.preload = 'auto';

const writingAudio = new Audio('/resources/sfx/writing.wav');
writingAudio.loop = true;
writingAudio.volume = 0.7;
writingAudio.preload = 'auto';
let isWritingAudioPlaying = false;

// ==================== 頁面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 規則彈窗預設顯示，用戶點擊「開始遊戲」按鈕時開始遊戲
    startButton.addEventListener('click', startGame);

    // Canvas 滑鼠事件監聽器
    canvas.addEventListener('mousedown', startDrawing);    // 按下滑鼠
    canvas.addEventListener('mousemove', draw);            // 移動滑鼠
    canvas.addEventListener('mouseup', stopDrawing);       // 放開滑鼠
    canvas.addEventListener('mouseout', stopDrawing);      // 滑鼠離開 Canvas
    document.addEventListener('mouseup', stopDrawing);     // 處理滑鼠在 Canvas 外放開

    // 下一張按鈕事件監聽器
    nextButton.addEventListener('click', goToNextPaper);

    // 重新開始按鈕事件監聽器
    restartButton.addEventListener('click', restartGame);
});

// ==================== 開始遊戲函數 ====================
/**
 * 【startGame】
 * 功能：隱藏規則彈窗並向伺服器請求第一張考卷
 */
async function startGame() {
    // 隱藏規則彈窗
    rulesModal.style.display = 'none';
    gameState.gameStarted = true;

    // 開始背景音樂（在使用者互動後播放）
    playBgm();

    // 從伺服器取得第一張考卷
    await loadNextPaper();
}

function playBgm() {
    if (bgmAudio.paused) {
        bgmAudio.currentTime = 0;
        bgmAudio.play().catch(error => {
            console.warn('BGM 無法播放：', error);
        });
    }
}

function stopWritingAudio() {
    if (isWritingAudioPlaying) {
        writingAudio.pause();
        writingAudio.currentTime = 0;
        isWritingAudioPlaying = false;
    }
}

// ==================== 載入下一張考卷函數 ====================
/**
 * 【loadNextPaper】
 * 功能：向 Flask 後端發送 POST 請求，取得下一張考卷的資訊
 * 流程：
 *   1. 呼叫 /get_next_paper 路由
 *   2. 檢查遊戲是否結束
 *   3. 若未結束，載入圖片並顯示 Canvas 與按鈕
 */
async function loadNextPaper() {
    try {
        // 向後端發送請求
        const response = await fetch('/get_next_paper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 解析 JSON 回應
        const data = await response.json();

        // 【檢查遊戲是否結束】
        if (data.game_over) {
            endGame();
            return;
        }

        // 【更新遊戲狀態】
        gameState.currentPaperIndex = data.current;
        gameState.totalPapers = data.total;
        updateProgressBar();

        // 【載入考卷圖片到 Canvas】
        loadPaperImage(data.paper_url);

        // 【顯示遊戲元素】
        canvasWrapper.style.display = 'block';
        nextButton.style.display = 'block';

    } catch (error) {
        console.error('載入考卷失敗：', error);
        alert('無法連接伺服器，請刷新頁面重試。');
    }
}

// ==================== 載入考卷圖片函數 ====================
/**
 * 【loadPaperImage】
 * 功能：將考卷圖片載入到 Canvas 上
 * 參數：imageUrl - 圖片的 URL 路徑
 * 特效：
 *   - 重新觸發進場動畫（從右側滑入）
 *   - 若圖片載入失敗，顯示錯誤訊息
 */
function loadPaperImage(imageUrl) {
    const img = new Image();

    // 圖片載入成功時的回調函數
    img.onload = function() {
        // 【調整 Canvas 尺寸以適應圖片】
        canvas.width = img.width;
        canvas.height = img.height;

        // 【清空 Canvas 並繪製新圖片】
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // 【重新觸發進場動畫】
        // 移除動畫再重新添加，強制動畫重播
        canvasWrapper.style.animation = 'none';
        setTimeout(() => {
            canvasWrapper.style.animation = 'slideInFromRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, 10);
    };

    // 圖片載入失敗時的回調函數
    img.onerror = function() {
        console.error('考卷圖片載入失敗：' + imageUrl);
        
        // 設定 Canvas 預設尺寸
        canvas.width = 800;
        canvas.height = 600;

        // 繪製灰色背景
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製邊框
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

        // 繪製錯誤提示文字
        ctx.fillStyle = '#999';
        ctx.font = 'bold 28px Arial, 微軟正黑體';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❌ 考卷圖片載入失敗', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial, 微軟正黑體';
        ctx.fillStyle = '#bbb';
        ctx.fillText(`(請確認檔案：${imageUrl})`, canvas.width / 2, canvas.height / 2 + 40);
    };

    // 【開始載入圖片】
    img.src = imageUrl;
}

// ==================== 滑鼠繪製功能 ====================

/**
 * 【startDrawing】
 * 功能：當滑鼠按下時，開始記錄繪製路徑
 * 觸發條件：
 *   - 遊戲已開始
 *   - 遊戲未結束
 *   - 滑鼠左鍵按下
 */
function startDrawing(e) {
    // 只處理滑鼠左鍵按下
    if (e.button !== 0) return;
    if (!gameState.gameStarted || gameState.gameOver) return;

    gameState.isDrawing = true;

    // 【計算滑鼠相對於 Canvas 的座標】
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 【開始新的繪製路徑】
    ctx.beginPath();
    ctx.moveTo(x, y);

    // 開始寫字音效
    if (!isWritingAudioPlaying) {
        isWritingAudioPlaying = true;
        writingAudio.currentTime = 0;
        writingAudio.play().catch(error => {
            console.warn('寫字音效無法播放：', error);
        });
    }
}

/**
 * 【draw】
 * 功能：當滑鼠移動時，在 Canvas 上繪製紅色線條
 * 特性：
 *   - 線條顏色：紅色 (#FF0000)
 *   - 線條粗細：3 像素
 *   - 線條端點：圓形（lineCap: 'round'）
 *   - 線條接角：圓形（lineJoin: 'round'），使邊緣平滑
 */
function draw(e) {
    // 若未在繪製中或遊戲未開始，不進行繪製
    if (!gameState.isDrawing || !gameState.gameStarted || gameState.gameOver) return;

    // 【計算滑鼠相對於 Canvas 的座標】
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 【設定紅筆的繪製參數】
    ctx.strokeStyle = '#FF0000';      // 紅色
    ctx.lineWidth = 3;               // 3 像素粗細
    ctx.lineCap = 'round';           // 端點為圓形
    ctx.lineJoin = 'round';          // 接角為圓形（邊緣平滑）

    // 【繪製線段】
    ctx.lineTo(x, y);
    ctx.stroke();
}

/**
 * 【stopDrawing】
 * 功能：當滑鼠放開或離開 Canvas 時，停止繪製
 */
function stopDrawing() {
    gameState.isDrawing = false;
    ctx.closePath();
    stopWritingAudio();
}

// ==================== 下一張按鈕函數 ====================
/**
 * 【goToNextPaper】
 * 功能：點擊「下一張」按鈕時的處理函數
 * 流程：
 *   1. 清空 Canvas 上的紅筆痕跡
 *   2. 向伺服器請求下一張考卷
 */
async function goToNextPaper() {
    stopDrawing();
    // 【清空 Canvas 上的所有繪製痕跡】
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 【載入下一張考卷】
    await loadNextPaper();
}

// ==================== 更新進度條函數 ====================
/**
 * 【updateProgressBar】
 * 功能：更新頁面上的進度條顯示
 * 更新內容：「第 X 張 / 共 Y 張」
 */
function updateProgressBar() {
    document.getElementById('currentNumber').textContent = gameState.currentPaperIndex > 0 ? gameState.currentPaperIndex : '-';
    document.getElementById('totalNumber').textContent = gameState.totalPapers > 0 ? gameState.totalPapers : '-';
}

// ==================== 重新開始遊戲函數 ====================
/**
 * 【restartGame】
 * 功能：當使用者點擊重新開始時，呼叫後端重置進度並回到起始畫面
 */
async function restartGame() {
    try {
        await fetch('/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        stopDrawing();

        // 重置前端狀態
        gameState.gameStarted = false;
        gameState.gameOver = false;
        gameState.currentPaperIndex = 0;
        gameState.totalPapers = 0;
        updateProgressBar();

        // 隱藏遊戲畫面並顯示規則說明彈窗
        canvasWrapper.style.display = 'none';
        nextButton.style.display = 'none';
        gameOverModal.style.display = 'none';
        rulesModal.style.display = 'flex';

        // 清空 Canvas 內容
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error('重新開始遊戲失敗：', error);
        alert('無法重新開始遊戲，請稍後重試。');
    }
}

// ==================== 遊戲結束函數 ====================
/**
 * 【endGame】
 * 功能：當所有考卷批改完成時，結束遊戲
 * 動作：
 *   1. 設定遊戲狀態為結束
 *   2. 隱藏 Canvas 與下一張按鈕
 *   3. 顯示遊戲結束彈窗
 */
function endGame() {
    stopDrawing();

    // 【設定遊戲狀態】
    gameState.gameOver = true;

    // 【隱藏遊戲元素】
    canvasWrapper.style.display = 'none';
    nextButton.style.display = 'none';

    // 【顯示遊戲結束彈窗】
    gameOverModal.style.display = 'flex';
}
