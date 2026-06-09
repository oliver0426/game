# 📋 考卷批改遊戲 - Flask + Canvas 專案

完整的 Flask 後端 + HTML5 Canvas 前端遊戲，允許使用者在考卷圖片上進行紅筆批改。

## 📁 專案結構

```
生氣專案/
├── app.py                    # Flask 後端應用程式
├── templates/
│   └── index.html           # 前端網頁（HTML + CSS + JavaScript）
├── static/
│   ├── paper1.jpg          # 考卷圖片 1
│   ├── paper2.jpg          # 考卷圖片 2
│   └── paper3.jpg          # 考卷圖片 3
└── README.md               # 此檔案
```

## 🚀 快速開始

### 1️⃣ 安裝 Python 依賴

首先確保你已安裝 Python 3.7 以上版本。然後在專案資料夾中執行：

```bash
# Windows PowerShell 或 CMD
pip install flask

# 或使用 pip3
pip3 install flask
```

### 2️⃣ 準備考卷圖片

1. 建立 `static/` 資料夾（已經存在）
2. 將你的考卷圖片放入 `static/` 資料夾中
3. 確保圖片名稱為：`paper1.jpg`, `paper2.jpg`, `paper3.jpg`

**支援的圖片格式**：JPG, PNG, GIF, WebP 等常見格式

**臨時測試方法**（無需實際圖片）：
- 如果暫時沒有圖片，可以使用任何圖片替代，或自行建立簡單的 JPG/PNG 檔案放在 `static/` 目錄中

### 3️⃣ 運行 Flask 應用

在專案資料夾中執行：

```bash
# Windows PowerShell
python app.py

# 或
python3 app.py
```

你應該看到類似的輸出：
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### 4️⃣ 開啟遊戲

在瀏覽器中訪問：
```
http://127.0.0.1:5000
```

或按住 Ctrl 並點擊 Terminal 中的連結

## 🎮 遊戲操作說明

| 操作 | 功能 |
|------|------|
| 🖱️ **左鍵拖曳** | 用紅筆在考卷上批改、圈選 |
| ⏭️ **下一張按鈕** | 清除目前考卷的批改痕跡，載入下一張 |
| 📊 **進度條** | 顯示目前批改進度（第 X 張 / 共 Y 張） |

## 📋 核心功能說明

### 後端 (app.py)

- **`/` 路由**：載入主頁面 (index.html)
- **`/get_next_paper` 路由**：
  - 接收前端的請求
  - 自動更新考卷索引
  - 回傳下一張考卷的 URL、目前進度、總數以及遊戲是否結束
  - 回傳格式（JSON）：
    ```json
    {
      "paper_url": "/static/paper2.jpg",
      "current": 2,
      "total": 3,
      "game_over": false
    }
    ```

### 前端 (index.html)

#### Canvas 繪圖功能
- 滑鼠左鍵拖曳即可繪製紅色線條
- 線條粗細 3px，邊緣平滑
- 放開滑鼠或離開 Canvas 停止繪製

#### 動畫效果
- **進場動畫**：新考卷從頁面右側平滑滑入中央
- **慶祝動畫**：遊戲結束時顯示彈窗的彈出效果

#### 遊戲流程
1. 進入頁面時顯示規則說明彈窗
2. 點擊「開始遊戲」後隱藏彈窗
3. 從伺服器載入第一張考卷
4. 用紅筆在考卷上批改
5. 點擊「下一張」切換到下一張
6. 所有考卷批改完成後顯示結束彈窗

## ⚙️ 自訂設定

### 修改考卷數量

編輯 `app.py`，修改 `PAPERS` 列表：

```python
# 修改前（3 張考卷）
PAPERS = ['paper1.jpg', 'paper2.jpg', 'paper3.jpg']

# 修改後（5 張考卷）
PAPERS = ['paper1.jpg', 'paper2.jpg', 'paper3.jpg', 'paper4.jpg', 'paper5.jpg']
```

然後確保 `static/` 資料夾中有對應的圖片檔案

### 修改紅筆顏色

編輯 `templates/index.html`，搜尋 `ctx.strokeStyle = '#FF0000'` 這行，改為其他顏色代碼：

```javascript
// 改成綠色
ctx.strokeStyle = '#00FF00'

// 改成藍色
ctx.strokeStyle = '#0000FF'

// 改成黑色
ctx.strokeStyle = '#000000'
```

### 修改線條粗細

編輯 `templates/index.html`，搜尋 `ctx.lineWidth = 3`，改為其他數值（單位：像素）：

```javascript
ctx.lineWidth = 5   // 更粗
ctx.lineWidth = 1   // 更細
```

## 🐛 常見問題

### Q: 無法連接伺服器
**A**: 確保 Flask 應用正在執行，且瀏覽器訪問的是正確的 URL (`http://127.0.0.1:5000`)

### Q: 圖片無法載入
**A**: 
1. 確保圖片檔案在 `static/` 資料夾中
2. 確保圖片名稱與 `app.py` 中的 `PAPERS` 列表相符
3. 檢查檔案名稱的大小寫

### Q: 畫布很小或很大
**A**: Canvas 大小會自動適應圖片尺寸。若圖片尺寸過大，請縮放圖片後重新放置

### Q: 已批改的內容在切換考卷後仍然存在
**A**: 這是正常的 Canvas 功能限制。目前程式會在點擊「下一張」時清空 Canvas

## 📱 支援的瀏覽器

- Chrome / Chromium（推薦）
- Firefox
- Safari
- Edge

## 🎨 CSS 響應式設計

本專案包含響應式設計，支援：
- 📱 手機 (max-width: 768px)
- 💻 平板與桌面電腦

在小螢幕上，UI 元素會自動調整尺寸

## 📝 程式碼註解

所有程式碼都包含詳細的中文註解，便於理解和修改

## 🔄 版本歷史

- v1.0 (2026-05-27)：初始版本
  - Flask 後端基本功能
  - Canvas 繪圖功能
  - 遊戲進度管理
  - 響應式設計

## 📄 授權

此專案為教學用途，可自由修改和使用

---

**有任何問題或建議嗎？** 歡迎修改程式碼並自訂功能！

