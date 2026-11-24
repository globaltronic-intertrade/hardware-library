# CONTEXT.md — glossary

Project vocabulary only. One canonical word per concept; the losers are listed under _Avoid_.

**Device**:
One hardware product that has its own page in the library — a board, a sensor or a module. One folder = one Device. _Avoid_: product, item, part, สินค้า (in file/field names)

**Category**:
The top-level folder a Device lives in: `boards/`, `sensors/` or `modules/`. A Device belongs to exactly one Category. _Avoid_: type, group

**Interface**:
The bus or signal type a Device uses to talk to another Device (e.g. `i2c`, `spi`, `uart`, `rs485`, `analog`, `digital`, `1-wire`). A Device lists every Interface it supports; index pages also group Devices by Interface. Logic voltage is a separate field, not an Interface. _Avoid_: port, protocol, bus (in field names)

**Capability**:
Something a Device can measure or do (e.g. `temperature`, `humidity`, `wifi`, `relay`). A Device lists every Capability it has; index pages group Devices by Capability, so a temperature + humidity sensor appears under both. _Avoid_: tag, sub-category, หมวดย่อย, feature

**Vocabulary**:
The single allowed list of Capability and Interface values with their Thai labels, kept in `vocabulary.yml`. A new value is added there first, in the same PR. _Avoid_: tag list, taxonomy

**Status**:
How far a Device page can be trusted: `draft` (not yet tested by the team), `tested` (wired and run on real hardware at least once), `deprecated` (no longer used or sold; page kept, points to a replacement). _Avoid_: state, verified, archived

**Example**:
Working source code plus wiring for one Device on one specific board, stored in `examples/<board>/` inside the Device folder. A `tested` sensor or module has at least one Example. _Avoid_: sample, demo, snippet

**Recipe**:
An application that combines several Devices (e.g. ESP32 + soil-moisture sensor + relay for watering), stored in `recipes/<name>/` and linking to every Device it uses. Never names a customer. _Avoid_: project, application, use case (as folder names)
