# Sensors — เซนเซอร์

<!-- สร้างอัตโนมัติด้วย `bun run index` ห้ามแก้ไฟล์นี้เอง แก้ที่ README.md ของแต่ละอุปกรณ์แทน -->

ทั้งหมด 1 รายการ · ค้นตาม Interface ดู [indexes/by-interface.md](../indexes/by-interface.md)

| อุปกรณ์ | สรุป | Capability | Interface | Logic | Status | ทดสอบกับ |
| --- | --- | --- | --- | --- | --- | --- |
| [RS485 Modbus Temperature & Humidity Sensor](../sensors/rs485-modbus-temp-humidity/) | เซนเซอร์อุณหภูมิและความชื้นแบบอุตสาหกรรม สื่อสารผ่าน RS485 (Modbus RTU) ต่อหลายตัวบนสายเส้นเดียวได้ (ทดสอบกับรุ่น VMS-300BYH-M) | temperature, humidity | rs485 | - | 🟢 tested | esp32-devkit |

## ตาม Capability

### อุณหภูมิ (`temperature`)

- [RS485 Modbus Temperature & Humidity Sensor](../sensors/rs485-modbus-temp-humidity/) — 🟢 tested

### ความชื้นในอากาศ (`humidity`)

- [RS485 Modbus Temperature & Humidity Sensor](../sensors/rs485-modbus-temp-humidity/) — 🟢 tested
