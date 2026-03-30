# ESP32 溫濕度感測器與 Live Dashboard 專案開發日誌

**日期**：2026-03-30
**專案**：AIOT HW1

---

## 階段一：架構規劃與可行性評估
*   **需求釐清**：使用者希望建立一個能接收 ESP32 (DHT11) 溫濕度資料的後台，要求使用 Python Flask 框架與 SQLite 資料庫。同時詢問能否發佈在 GitHub 上作為 Live Demo，並需要具備能透過週期函數自動生成虛擬資料的測試模式。
*   **技術決策**：向使用者說明 GitHub Pages 僅能代管前端靜態資源，不支援執行 Python 後端系統與 SQLite。因此決定先建立一個包含「模擬資料背景執行緒」的完整本機 Flask 應用程式，未來若要實際上線可轉移至 Render 等免費伺服器。

## 階段二：Flask 後端與資料庫開發 (`esp32_backend/`)
*   **資料庫層 (`database.py`)**：
    *   使用 `sqlite3` 建立 `sensor_data` 資料表。
    *   實作 `init_db()`、`insert_data()` 以及 `get_latest_data()` 等核心方法來儲存與讀取記錄。
*   **API 與伺服器層 (`app.py`)**：
    *   開發 `/api/update` 端點接收來自硬體的 `GET` 請求。
    *   開發 `/api/data` 供前端輪詢拉取歷史紀錄。
    *   實作背景執行緒 (Background Thread) 與 Sine/Cosine 週期函數，搭配 `/api/simulation/toggle` API 來隨時動態開關模擬數據產生的 Live Demo 狀態。
    *   *除錯紀錄*：測試時發現 Port `5000` 被作業系統佔用 (macOS AirPlay Receiver)，遂將 Flask 運行通訊埠更改為 **`5001`** 以確保穩定啟動。

## 階段三：現代化前端網頁實作
*   **UI/UX 設計 (`index.html`, `style.css`)**：
    *   採用了深色模式 (Dark Theme)、玻璃擬物化 (Glassmorphism) 以及動態背景漸層特效。
    *   使用 Google 字體 (Inter) 與簡潔的卡片化佈局來清晰呈現即時溫濕度。
*   **動態圖表與資料綁定 (`app.js`)**：
    *   導入 `Chart.js` 繪製響應式的雙 Y 軸折線圖，平滑顯示溫度 (紅) 與濕度 (藍)。
    *   使用 JS `setInterval` 每 2 秒固定呼叫 `/api/data` 動態刷新畫面數字與圖表。

## 階段四：ESP32 韌體程式碼整合 (`esp32_sensor/`)
*   **程式碼審查與重整**：
    *   將使用者提供的無副檔名 `esp32` 原始碼整理進正確的資料夾結構 `esp32_sensor.ino`，以符合 Arduino IDE 的編譯規範。
*   **端點對接修改**：
    *   根據後端最新的狀態，將程式碼中的 `SERVER_PORT` 正確修改為 `5001`。
    *   將 HTTP GET 請求的 URL 路徑更新為對齊 Flask 所開放的正確格式：`/api/update?temp={val}&hum={val}`。

## 階段五：文件化
*   **README 撰寫**：
    *   完成專案的主 `README.md`，清楚標示兩個專案資料夾的架構、啟動指南、以及詳細的 API Endpoint 說明文件，確保專案具備高度可維護性。

---
**總結**：專案順利完成，不僅擁有能串接 ESP32 真實硬體的能力，同時也能直接透過介面展示精美的自動化 Live Demo 圖表。
