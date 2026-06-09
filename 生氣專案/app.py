# ==================== Flask 考卷批改遊戲後端 ====================
# 此檔案為考卷批改遊戲的 Flask 後端
# 功能：管理考卷圖片、記錄遊戲進度、提供 API 路由給前端

from flask import Flask, render_template, jsonify, request

# ==================== Flask 應用初始化 ====================
app = Flask(__name__)

# ==================== 考卷資料庫與進度管理 ====================
# 考卷圖片檔名陣列（放在 static/ 資料夾中）
# 注意：你需要在 static/ 資料夾中放置對應的圖片檔案
PAPERS = ['paper1.jpg', 'paper2.jpg', 'paper3.jpg', 'paper4.jpg']

# 目前的批改進度（使用索引值，-1 表示尚未開始遊戲）
current_paper_index = -1


# ==================== 路由設計 ====================

@app.route('/')
def index():
    """
    【主路由】
    功能：渲染首頁 (index.html)
    回傳：HTML 網頁內容
    """
    return render_template('index.html')


@app.route('/get_next_paper', methods=['POST', 'GET'])
def get_next_paper():
    """
    【取得下一張考卷路由】
    功能：當玩家點擊「下一張」按鈕時，後端負責更新進度並回傳下一張考卷資訊
    
    請求方式：POST 或 GET
    
    回傳 JSON 格式：
    {
        "paper_url": "/static/paper2.jpg",  # 考卷圖片的 URL 路徑
        "current": 2,                       # 目前是第幾張
        "total": 3,                         # 總共有幾張
        "game_over": false                  # 遊戲是否結束
    }
    
    或當遊戲結束時：
    {
        "game_over": true,
        "message": "遊戲結束"
    }
    """
    global current_paper_index
    
    # 進度加一
    current_paper_index += 1
    
    # 計算總考卷數量
    total_papers = len(PAPERS)
    
    # 檢查是否遊戲結束（所有考卷已批改完）
    if current_paper_index >= total_papers:
        return jsonify({
            'game_over': True,
            'message': '遊戲結束'
        })
    
    # 取得目前考卷的 URL 路徑
    paper_url = f'/static/{PAPERS[current_paper_index]}'
    
    # 回傳考卷資訊與進度
    return jsonify({
        'paper_url': paper_url,           # 考卷圖片路徑
        'current': current_paper_index + 1,  # 目前是第幾張（從 1 開始計數）
        'total': total_papers,              # 總共考卷數
        'game_over': False                 # 遊戲未結束
    })


@app.route('/reset', methods=['POST'])
def reset_game():
    """
    【重置遊戲路由（可選）】
    功能：若需要重新開始遊戲，可呼叫此路由重置進度
    回傳：確認訊息 JSON
    """
    global current_paper_index
    current_paper_index = -1
    return jsonify({'message': '遊戲已重置'})


# ==================== 伺服器啟動 ====================
if __name__ == '__main__':
    # debug=True：啟用偵錯模式，代碼修改後會自動重載
    # host='127.0.0.1'：只允許本地訪問
    # port=5000：伺服器運行在 5000 埠
    app.run(debug=True, host='127.0.0.1', port=5000)
