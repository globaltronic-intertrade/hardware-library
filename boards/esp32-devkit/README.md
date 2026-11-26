---
name: ESP32 DevKit V1 (ESP32-WROOM-32)
summary: บอร์ดไมโครคอนโทรลเลอร์ ESP32 มี Wi-Fi และ Bluetooth ในตัว 30 ขา ใช้กับ Arduino IDE ได้ เป็นบอร์ดหลักของทีมสำหรับงาน IoT
status: draft
capabilities: [wifi, bluetooth]
interfaces: [i2c, spi, uart, analog, digital, pwm, usb]
logic_voltage: [3.3v]
supply_voltage: 5V ผ่าน USB หรือขา VIN · ขา 3V3 จ่ายไฟให้เซนเซอร์ 3.3V
datasheet: https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf
replaced_by:
---

# ESP32 DevKit V1 (ESP32-WROOM-32)

> **สถานะ draft** — ยังต้องลองรันตัวอย่าง Wi-Fi scan กับบอร์ดจริงแล้วกรอกตาราง Examples ก่อนเปลี่ยนเป็น `tested`

## ลักษณะอุปกรณ์

- ชิป ESP32 (dual-core) บนโมดูล ESP32-WROOM-32 มี **Wi-Fi 2.4 GHz** และ **Bluetooth / BLE** ในตัว (ต่อ Wi-Fi 5 GHz ไม่ได้)
- บอร์ดแบบ 30 ขา มีชิปแปลง USB เป็น Serial (CP2102 หรือ CH340 แล้วแต่ล็อต) และไฟ LED สีน้ำเงินบนบอร์ดที่ GPIO2
- ขาสัญญาณทั้งหมดใช้ไฟ **3.3V** ห้ามป้อน 5V เข้าขา GPIO ตรงๆ
- สเปกเต็มดูที่ datasheet ในหัวกระดาษ

### รุ่นที่ทีมใช้: ESP32 USB Type-C 30 ขา

- บอร์ดแบบเดียวกับ DevKit V1 (ESP32-WROOM-32 · 30 ขา) แต่ใช้พอร์ต **USB Type-C** แทน Micro-USB ใช้จ่ายไฟและอัปโหลดโปรแกรม
- 520 KB SRAM · 4 MB Flash · ขาสัญญาณ 3.3V (มี LDO แปลงไฟ 5V จาก USB-C)
- ใน Arduino IDE เลือก **ESP32 Dev Module** เหมือนรุ่น Micro-USB ตำแหน่งขาเหมือนกัน
- ซื้อจาก [Global Byte — ESP32 USB Type-C](https://globalbyteshop.com/products/esp32-wifi-usb-type-c-board) (เลือกแบบ Type-C 30 Pin) · ร้านเดียวกันมีแบบ Type-C 38 ขา และแบบ Micro-USB 30 / 38 ขา ด้วย ซึ่งตำแหน่งขาต่างจากหน้านี้

## Pin / Port

| ขา                              | หน้าที่                               | หมายเหตุ                                           |
| ------------------------------- | ---------------------------------- | ------------------------------------------------- |
| VIN                             | รับไฟ 5V                            | หรือเสียบ USB อย่างใดอย่างหนึ่ง                         |
| 3V3                             | จ่ายไฟ 3.3V ให้เซนเซอร์               |                                                   |
| GND                             | กราวด์                              |                                                   |
| GPIO16 / GPIO17                 | UART2 (RX2 / TX2)                  | ใช้ต่อโมดูล RS485 / GPS ได้                           |
| GPIO21 / GPIO22                 | I2C (SDA / SCL) ค่าเริ่มต้นของ Arduino |                                                   |
| GPIO23 / 19 / 18 / 5            | SPI (MOSI / MISO / SCK / CS)       |                                                   |
| GPIO2                           | LED บนบอร์ด                         | เป็นขาที่ใช้ตอนบูตด้วย                                  |
| GPIO34 / 35 / 36 (VP) / 39 (VN) | **รับเข้าอย่างเดียว** (input only)     | ไม่มี pull-up ในตัว ส่งสัญญาณออกไม่ได้ → ใช้กับ DHT22 ไม่ได้ |
| GPIO0 / 2 / 12 / 15             | ขาที่ใช้ตอนบูต (strapping)             | หลีกเลี่ยงการต่ออุปกรณ์ที่ดึงขาเหล่านี้ตอนเปิดเครื่อง            |

ขาที่ใช้งานทั่วไปได้สบายใจ: GPIO4, 13, 14, 16–19, 21–23, 25–27, 32, 33

## การต่อสาย

ใช้สาย USB ที่ส่งข้อมูลได้ (Type-C หรือ Micro-USB ตามรุ่นบอร์ด) ไม่ใช่สายชาร์จอย่างเดียว ต่อเข้าคอมโดยตรง

## วิธีใช้งาน

1. Arduino IDE → Boards Manager → ติดตั้ง **esp32 by Espressif Systems**
2. ถ้าคอมไม่เห็นพอร์ต ติดตั้งไดรเวอร์ตามชิปบนบอร์ด (CP210x หรือ CH340)
3. เลือกบอร์ด **ESP32 Dev Module** และพอร์ต COM ที่ขึ้นว่า USB
4. เปิด [`examples/esp32-devkit/esp32-devkit.ino`](examples/esp32-devkit/esp32-devkit.ino) แล้วอัปโหลด (ไม่ต้องติดตั้ง library เพิ่ม)
5. Serial Monitor ที่ 115200 จะเห็นรายชื่อ Wi-Fi รอบตัว (ความแรงสัญญาณ RSSI · ช่อง · ระบบความปลอดภัย · ชื่อ) ทุก 10 วินาที และไฟ LED บนบอร์ดติดระหว่างสแกน

## Examples

| บอร์ด                   | โฟลเดอร์                                            | ทดสอบเมื่อ | ผู้ทดสอบ  |
| ---------------------- | -------------------------------------------------- | -------- | ------- |
| ESP32 USB Type-C 30 ขา | [`examples/esp32-devkit/`](examples/esp32-devkit/) | รอทดสอบ  | รอทดสอบ |

## การประยุกต์ใช้

- อ่านเซนเซอร์แล้วส่งขึ้น Google Sheet / dashboard ผ่าน Wi-Fi
- ต่อเซนเซอร์อุตสาหกรรมผ่าน RS485 ดู [RS485 Modbus Temperature & Humidity Sensor](../../sensors/rs485-modbus-temp-humidity/)
- ใช้ Wi-Fi scan เช็กความแรงสัญญาณก่อนติดตั้งอุปกรณ์จริงที่หน้างาน

## ปัญหาที่เจอ

| อาการ                                | สาเหตุ                   | วิธีแก้                              |
| ------------------------------------ | ----------------------- | --------------------------------- |
| อัปโหลดค้างที่ `Connecting....`          | บอร์ดไม่เข้าโหมดอัปโหลดเอง  | กดปุ่ม BOOT ค้างไว้จนเริ่มอัปโหลดแล้วปล่อย |
| เซนเซอร์ DHT22 ที่ขา 35 อ่านค่าไม่ได้ (nan) | GPIO34–39 รับเข้าอย่างเดียว | ย้ายไปขา GPIO4 (ทดสอบแล้วใช้ได้)      |
| ต่อ Wi-Fi ไม่ได้ ทั้งที่รหัสถูก               | Wi-Fi เป็น 5 GHz         | ใช้ Wi-Fi / ฮอตสปอต 2.4 GHz        |

## อ้างอิง

- [ESP32 Arduino core (Espressif)](https://github.com/espressif/arduino-esp32)
- [ESP32-WROOM-32 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf)
