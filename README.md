# Flashcards

一個使用 Go + Gin + SQLite 製作的單字卡練習網站，提供：
- 練習條件設定（每組數量、是否只看重要單字、起始 ID）
- 單字表格瀏覽（含翻頁）
- 測驗模式（會 / 不會 / 音標）

## 技術棧

- Backend: Go, Gin
- Database: SQLite（透過 GORM）
- Frontend: HTML / CSS / Vanilla JavaScript

## 專案結構

```text
cmd/
  app/
    app.go            # 入口，啟動 Gin server
  initDB/             # 目前為空
internal/
  database/
    database.go       # 資料庫初始化與查詢
  result/
    result.go         # /api/result handler
static/
  CSS/                # 樣式
  js/                 # 前端邏輯
  view/               # HTML 頁面
```

## 先決條件

1. 安裝 Go（建議使用 `go.mod` 指定版本，至少可編譯目前專案）。
2. 準備 SQLite 資料庫檔案（預設為專案根目錄 `database.db`）。

> 注意：後端啟動時會檢查資料庫檔案是否存在；若不存在，程式會直接結束。

## 快速開始

### 1) 下載依賴

```bash
go mod tidy
```

### 2) 建立環境變數

在專案根目錄建立 `.env`（可參考 `.env.sample`）：

```env
GIN_MODE=debug
PORT=8080
DATABASE_FILE=database.db
```

說明：
- `GIN_MODE`: `debug` 或 `release`（`test` 目前不支援）
- `PORT`: Web 服務埠號
- `DATABASE_FILE`: SQLite 檔案路徑（可用相對或絕對路徑）

### 3) 啟動服務

```bash
go run ./cmd/app
```

啟動後打開：

```text
http://localhost:8080
```

## 資料庫需求

查詢使用的資料表欄位如下（資料表名稱：`data`）：

- `id` (int)
- `word` (text)
- `value` (text)
- `symbol` (text)
- `important` (bool)
- `roots` (text)

可參考以下 SQLite 建表範例：

```sql
CREATE TABLE IF NOT EXISTS data (
  id INTEGER PRIMARY KEY,
  word TEXT NOT NULL,
  value TEXT NOT NULL,
  symbol TEXT,
  important BOOLEAN NOT NULL DEFAULT 0,
  roots TEXT
);
```

## 使用流程

1. 進入首頁 `/`
2. 設定：每組數量、Important 篩選、起始單字 ID
3. 點「開始練習」進入 `/result`
4. 在結果頁可：
   - 以表格查看資料與翻頁
   - 切換至測驗模式
   - 透過「不會」重複練習錯誤單字直到完成

## API

### `POST /api/result`

根據條件回傳單字資料陣列。

#### Request Body

```json
{
  "limit": 20,
  "important": false,
  "start": 1
}
```

- `limit`：回傳筆數，<= 0 時後端會改為 20
- `important`：`true` 只回傳重要單字；`false` 不篩選
- `start`：起始 ID，< 1 時後端會改為 1

#### Response 範例

```json
[
  {
    "id": 1,
    "word": "abandon",
    "value": "放棄",
    "symbol": "əˈbændən",
    "important": true,
    "roots": "a- + bandon"
  }
]
```

## 常見問題

- 看到 `Database file does not exist`
  - 請確認 `.env` 的 `DATABASE_FILE` 指向正確檔案，且檔案存在。
- 啟動後沒有資料
  - 請確認 `data` 表存在且有資料，欄位名稱符合上方需求。
