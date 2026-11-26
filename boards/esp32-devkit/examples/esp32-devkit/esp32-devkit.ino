// ESP32 DevKit — scan nearby Wi-Fi networks (Serial Monitor only)
//
// Library: WiFi (built into the esp32 core by Espressif, no install needed)
// Board:   ESP32 Dev Module (esp32 core by Espressif) — tested on ESP32 DevKit V1
// Output:  Serial Monitor 115200 baud, a new scan every 10 s
//
// Also blinks the on-board LED (GPIO2) once per scan so you can see the board is alive.

#include <WiFi.h>

const int LED_PIN = 2;                   // on-board blue LED on most ESP32 DevKit V1 boards
const uint32_t SCAN_INTERVAL_MS = 10000;

const char* authName(wifi_auth_mode_t mode) {
  switch (mode) {
    case WIFI_AUTH_OPEN: return "open";
    case WIFI_AUTH_WEP: return "WEP";
    case WIFI_AUTH_WPA_PSK: return "WPA";
    case WIFI_AUTH_WPA2_PSK: return "WPA2";
    case WIFI_AUTH_WPA_WPA2_PSK: return "WPA/WPA2";
    case WIFI_AUTH_WPA2_ENTERPRISE: return "WPA2-Ent";
    case WIFI_AUTH_WPA3_PSK: return "WPA3";
    case WIFI_AUTH_WPA2_WPA3_PSK: return "WPA2/WPA3";
    default: return "other";
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  WiFi.mode(WIFI_STA);   // station mode: scan only, does not connect
  WiFi.disconnect();
  delay(100);

  Serial.println("ESP32 Wi-Fi scanner ready");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("\nscanning...");
  int n = WiFi.scanNetworks();  // blocks ~2-4 s
  digitalWrite(LED_PIN, LOW);

  if (n <= 0) {
    Serial.println("no networks found");
  } else {
    Serial.printf("%d network(s) found\n", n);
    Serial.println(" #  RSSI  CH  SECURITY   SSID");
    for (int i = 0; i < n; i++) {
      String ssid = WiFi.SSID(i);
      if (ssid.length() == 0) ssid = "(hidden)";
      Serial.printf("%2d  %4d  %2d  %-9s  %s\n", i + 1, WiFi.RSSI(i), WiFi.channel(i),
                    authName(WiFi.encryptionType(i)), ssid.c_str());
    }
  }
  WiFi.scanDelete();  // free the result list

  delay(SCAN_INTERVAL_MS);
}
