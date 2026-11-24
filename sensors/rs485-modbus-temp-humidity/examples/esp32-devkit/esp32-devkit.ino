// RS485 Modbus RTU temperature + humidity sensor → ESP32 (Serial Monitor only)
//
// Library: ModbusMaster (Doc Walker) — Arduino IDE: Library Manager → "ModbusMaster"
// Board:   ESP32 Dev Module (esp32 core by Espressif)
// Wiring:  see ../../README.md § การต่อสาย
//
// Register map assumed here (check your sensor's datasheet — models differ):
//   holding register 0 = humidity    × 10  (%RH)
//   holding register 1 = temperature × 10  (°C, signed)

#include <Arduino.h>
#include <ModbusMaster.h>

// ── settings ─────────────────────────────────────────────
const uint8_t SENSOR_ADDRESS = 1;        // Modbus slave address set on the sensor
const uint32_t BAUD_RATE = 9600;         // must match the sensor (often 4800 or 9600)
const uint32_t READ_INTERVAL_MS = 5000;  // keep ≥ 1 s; with several sensors leave ~3 s between them

const int PIN_RE_DE = 4;  // MAX485 DE + RE tied together
const int PIN_RX2 = 18;   // ← MAX485 RO
const int PIN_TX2 = 19;   // → MAX485 DI
// ─────────────────────────────────────────────────────────

ModbusMaster sensor;
uint32_t lastRead = 0;

void preTransmission() { digitalWrite(PIN_RE_DE, HIGH); }
void postTransmission() { digitalWrite(PIN_RE_DE, LOW); }

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RE_DE, OUTPUT);
  digitalWrite(PIN_RE_DE, LOW);

  Serial2.begin(BAUD_RATE, SERIAL_8N1, PIN_RX2, PIN_TX2);
  sensor.begin(SENSOR_ADDRESS, Serial2);
  sensor.preTransmission(preTransmission);
  sensor.postTransmission(postTransmission);

  Serial.println("RS485 temperature/humidity reader ready");
}

void loop() {
  if (millis() - lastRead < READ_INTERVAL_MS) return;
  lastRead = millis();

  // the bus occasionally drops a frame: retry up to 3 times
  uint8_t result = sensor.ku8MBInvalidSlaveID;
  for (int attempt = 0; attempt < 3; attempt++) {
    result = sensor.readHoldingRegisters(0, 2);
    if (result == sensor.ku8MBSuccess) break;
    delay(300);
  }

  if (result != sensor.ku8MBSuccess) {
    Serial.printf("read failed, Modbus error 0x%02X\n", result);
    return;
  }

  float humidity = sensor.getResponseBuffer(0) / 10.0;
  // temperature is a signed 16-bit value: cast before scaling or negatives read as ~6553 °C
  float temperature = (int16_t)sensor.getResponseBuffer(1) / 10.0;

  Serial.printf("humidity: %.1f %%RH | temperature: %.1f °C\n", humidity, temperature);
}
