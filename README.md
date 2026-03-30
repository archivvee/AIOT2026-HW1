# AIOT HW1: ESP32 溫濕度感測器與 Flask 即時儀表板

# Demo
https://archivvee.github.io/AIOT2026-HW1/github_pages_demo/

這個專案包含兩個主要部分：
1. **esp32_sensor**: ESP32 感測器的 C++ (Arduino) 程式碼，負責讀取 DHT11 溫濕度感測器的資料，並透過 HTTP GET 請求傳送給後端。
2. **esp32_backend**: 使用 Python Flask 與 SQLite 建構的伺服器與現代化網頁儀表板，用來接收、儲存與視覺化歷史資料。

## 專案目錄結構

```text
HW1/
├── README.md
├── esp32_sensor/
│   └── esp32_sensor.ino   # ESP32 與 DHT11 韌體程式碼
└── esp32_backend/
    ├── app.py             # Flask 伺服器與 API 端點主程式
    ├── database.py        # SQLite 資料庫建立與操作模組
    ├── sensor_data.db     # 用來儲存溫濕度的資料庫檔案 (運行後自動產生)
    ├── static/
    │   ├── css/style.css  # 網頁樣式 (深色模式、玻璃擬物化設計)
    │   └── js/app.js      # 處理資料自動刷新與 Chart.js 動態繪圖
    └── templates/
        └── index.html     # 儀表板 HTML 結構
```

## 功能特色
* **即時資料視覺化**：透過 Chart.js 於網頁上平滑滾動顯示感測器的溫度與濕度變化。
* **SQLite 持久化儲存**：所有的真實與測試資料都會忠實記錄在 `sensor_data.db` 資料庫。
* **隨機模擬模式 (Live Demo)**：如果暫時沒有硬體設備，網頁控制台提供「Enable Simulation」按鈕，開啟後伺服器會在背景每 2 秒透過週期函數 (Sine/Cosine) 自動注入模擬資料。
* **現代化 UI**：為資料展示設計了具備動態漸層背景與質感極佳的深色 UI。

## 快速開始

### 1. 啟動 Flask 後台伺服器

1. 打開終端機，進入 `esp32_backend` 資料夾：
   ```bash
   cd esp32_backend
   ```
2. 安裝必要的 Python 套件：
   ```bash
   pip install flask
   ```
3. 啟動應用程式：
   ```bash
   python app.py
   ```
   *伺服器將會啟動在開發機的 `5001` 通訊埠。你可以透過瀏覽器前往 `http://localhost:5001`  進入即時儀表板。*

### 2. 設定 ESP32 感測器

1. 使用 Arduino IDE 開啟 `esp32_sensor/esp32_sensor.ino`。
2. 請確保你已經在 Arduino IDE 內安裝了 `SimpleDHT` 函式庫以支援 DHT11。
3. 根據你的環境，修改程式碼頂端的這三個變數：
   ```cpp
   const char* WIFI_SSID     = "你的 WiFi 名稱";
   const char* WIFI_PASSWORD = "你的 WiFi 密碼";
   const char* SERVER_IP     = "你的電腦區域網路 IP"; 
   ```
4. 將 ESP32 與 DHT11 (Data 腳位接至 Pin 4) 正確連接後，編譯並上傳韌體。
5. 開啟序列埠監控視窗 (Baud rate 設定 115200) 確認它順利連上 WiFi，並開始每 10 秒發送資料到 Flask 後台伺服器。

## RESTful API 路由參考

如果你想自己用 Postman 或瀏覽器測試後端的 API：

* **寫入新資料** (Method: `GET`)
  `http://<SERVER_IP>:5001/api/update?temp={數值}&hum={數值}`
* **獲取繪圖用歷史資料** (Method: `GET`)
  `http://<SERVER_IP>:5001/api/data`
* **後端模擬器開關控制** (Method: `POST`)
  `http://<SERVER_IP>:5001/api/simulation/toggle`
