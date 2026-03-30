#include <WiFi.h>
#include <HTTPClient.h>
#include <SimpleDHT.h>

// --- 設定區 ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // 替換為你的 WiFi 名稱
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // 替換為你的 WiFi 密碼
const char* SERVER_IP     = "192.168.x.xxx";          // 替換為你的電腦 IP
const int   SERVER_PORT   = 5001;                     // 我們 Flask 後台運行的通訊埠為 5001

// 硬體腳位設定
const int PIN_DHT11 = 4;
SimpleDHT11 dht11(PIN_DHT11);

// --- 函數宣告 ---
void connectToWiFi();
void sendDataToServer(byte temp, byte humd);

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    connectToWiFi();
}

void loop() {
    byte temperature = 0;
    byte humidity = 0;
    
    // 讀取傳感器數據
    int err = dht11.read(&temperature, &humidity, NULL);
    if (err != SimpleDHTErrSuccess) {
        Serial.printf("DHT11 讀取失敗, 錯誤代碼: %d\n", err);
        delay(2000);
        return;
    }

    Serial.printf("讀取成功: 溫度 %d °C, 濕度 %d %%\n", (int)temperature, (int)humidity);

    // 檢查連線並發送
    if (WiFi.status() == WL_CONNECTED) {
        sendDataToServer(temperature, humidity);
    } else {
        Serial.println("WiFi 連線中斷，嘗試重新連線...");
        connectToWiFi();
    }

    delay(10000); // 每 10 秒執行一次
}

// --- 功能實作 ---

void connectToWiFi() {
    Serial.print("正在連線至: ");
    Serial.println(WIFI_SSID);
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi 連線成功!");
        Serial.print("本地 IP 位址: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nWiFi 連線失敗，請檢查設定。");
    }
}

void sendDataToServer(byte temp, byte humd) {
    HTTPClient http;
    WiFiClient client; // 使用 WiFiClient 確保穩定性

    // 構建完整 URL: 更新為剛剛建立的 Flask 後台 /api/update 端點格式
    String url = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + 
                 "/api/update?temp=" + String((int)temp) + 
                 "&hum=" + String((int)humd);

    Serial.println("發送數據中...");
    
    // 初始化 HTTP 連線
    if (http.begin(client, url)) {
        int httpCode = http.GET();

        if (httpCode > 0) {
            Serial.printf("伺服器回應 [%d]: %s\n", httpCode, http.getString().c_str());
        } else {
            Serial.printf("發送失敗, 錯誤原因: %s\n", http.errorToString(httpCode).c_str());
        }
        http.end();
    } else {
        Serial.println("無法連接至伺服器路徑");
    }
}
