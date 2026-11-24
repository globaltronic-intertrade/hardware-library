#!/usr/bin/env bun
// build-index.ts — validate every Device / Recipe page and (re)generate the index pages.
//
//   bun run index          validate + write the generated pages
//   bun run check:index    validate + fail if a generated page is out of date (CI)
//
// Source of truth = the YAML frontmatter at the top of each `<category>/<slug>/README.md`
// plus `vocabulary.yml`. Generated pages (never edit by hand): `boards|sensors|modules|recipes/README.md`
// and `indexes/*.md`. Rules behind the checks: CONTRIBUTING.md.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const CHECK = process.argv.includes("--check");
const DEVICE_CATEGORIES = ["boards", "sensors", "modules"] as const;
type Category = (typeof DEVICE_CATEGORIES)[number];
const STATUSES = ["draft", "tested", "deprecated"] as const;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VOLT = /^\d+(\.\d+)?v$/;

const CATEGORY_TITLE: Record<Category | "recipes", string> = {
  boards: "Boards — บอร์ด",
  sensors: "Sensors — เซนเซอร์",
  modules: "Modules — โมดูล",
  recipes: "Recipes — การประยุกต์ใช้",
};
const STATUS_LABEL: Record<string, string> = {
  tested: "🟢 tested",
  draft: "🟡 draft",
  deprecated: "⚪ deprecated",
};
const GENERATED =
  "<!-- สร้างอัตโนมัติด้วย `bun run index` ห้ามแก้ไฟล์นี้เอง แก้ที่ README.md ของแต่ละอุปกรณ์แทน -->";

interface Vocabulary {
  capabilities: Record<string, string>;
  interfaces: Record<string, string>;
}
interface Device {
  category: Category;
  slug: string;
  name: string;
  summary: string;
  status: string;
  capabilities: string[];
  interfaces: string[];
  logicVoltage: string[];
  replacedBy: string | null;
  examples: string[];
}
interface Recipe {
  slug: string;
  name: string;
  summary: string;
  status: string;
  devices: string[];
}

const errors: string[] = [];
const warnings: string[] = [];

const vocab = Bun.YAML.parse(readFileSync(join(ROOT, "vocabulary.yml"), "utf8")) as Vocabulary;

function subdirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => !n.startsWith(".") && statSync(join(dir, n)).isDirectory())
    .sort();
}

function frontmatter(file: string): Record<string, unknown> | null {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  try {
    return (Bun.YAML.parse(m[1]) ?? {}) as Record<string, unknown>;
  } catch (e) {
    errors.push(`${file}: YAML อ่านไม่ได้ — ${(e as Error).message}`);
    return {};
  }
}

function list(v: unknown): string[] {
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).map((x) => String(x).trim()).filter(Boolean);
}

function text(fm: Record<string, unknown>, key: string, where: string): string {
  const v = fm[key];
  if (v == null || String(v).trim() === "") {
    errors.push(`${where}: ต้องมี \`${key}\``);
    return "";
  }
  return String(v).trim();
}

function loadDevices(): Device[] {
  const out: Device[] = [];
  for (const category of DEVICE_CATEGORIES) {
    for (const slug of subdirs(join(ROOT, category))) {
      const where = `${category}/${slug}`;
      if (!SLUG.test(slug)) errors.push(`${where}: ชื่อโฟลเดอร์ต้องเป็น lowercase-kebab`);
      const readme = join(ROOT, category, slug, "README.md");
      if (!existsSync(readme)) {
        errors.push(`${where}: ไม่มี README.md`);
        continue;
      }
      const fm = frontmatter(readme);
      if (!fm) {
        errors.push(`${where}/README.md: ไม่มี frontmatter (ดู templates/device/README.md)`);
        continue;
      }
      const status = text(fm, "status", where);
      if (status && !STATUSES.includes(status as (typeof STATUSES)[number]))
        errors.push(`${where}: status ต้องเป็น ${STATUSES.join(" / ")}`);
      const capabilities = list(fm.capabilities);
      const interfaces = list(fm.interfaces);
      if (capabilities.length === 0) errors.push(`${where}: ต้องมี capabilities อย่างน้อย 1 ค่า`);
      if (interfaces.length === 0) errors.push(`${where}: ต้องมี interfaces อย่างน้อย 1 ค่า`);
      for (const c of capabilities)
        if (!(c in vocab.capabilities))
          errors.push(`${where}: capability "${c}" ไม่อยู่ใน vocabulary.yml`);
      for (const i of interfaces)
        if (!(i in vocab.interfaces))
          errors.push(`${where}: interface "${i}" ไม่อยู่ใน vocabulary.yml`);
      const logicVoltage = list(fm.logic_voltage).map((v) => v.toLowerCase());
      for (const v of logicVoltage)
        if (!VOLT.test(v)) errors.push(`${where}: logic_voltage "${v}" ต้องเขียนแบบ 3.3v / 5v`);
      const examples = subdirs(join(ROOT, category, slug, "examples"));
      if (status === "tested" && examples.length === 0)
        errors.push(`${where}: status tested ต้องมี Example อย่างน้อย 1 บอร์ดใน examples/`);
      const replacedRaw = fm.replaced_by == null ? "" : String(fm.replaced_by).trim();
      if (status === "deprecated" && replacedRaw === "")
        errors.push(`${where}: status deprecated ต้องใส่ replaced_by (slug ตัวแทน หรือ none)`);
      out.push({
        category,
        slug,
        name: text(fm, "name", where),
        summary: text(fm, "summary", where),
        status,
        capabilities,
        interfaces,
        logicVoltage,
        replacedBy: replacedRaw || null,
        examples,
      });
    }
  }
  return out;
}

function loadRecipes(known: Set<string>): Recipe[] {
  const out: Recipe[] = [];
  for (const slug of subdirs(join(ROOT, "recipes"))) {
    const where = `recipes/${slug}`;
    if (!SLUG.test(slug)) errors.push(`${where}: ชื่อโฟลเดอร์ต้องเป็น lowercase-kebab`);
    const readme = join(ROOT, "recipes", slug, "README.md");
    const fm = existsSync(readme) ? frontmatter(readme) : null;
    if (!fm) {
      errors.push(`${where}: ต้องมี README.md พร้อม frontmatter (ดู templates/recipe/README.md)`);
      continue;
    }
    const devices = list(fm.devices);
    if (devices.length < 2) errors.push(`${where}: Recipe ต้องใช้อุปกรณ์อย่างน้อย 2 ตัว`);
    for (const d of devices)
      if (!known.has(d)) errors.push(`${where}: ไม่มีอุปกรณ์ "${d}" ในคลัง (เพิ่มหน้าอุปกรณ์ก่อน)`);
    const status = text(fm, "status", where);
    if (status && !STATUSES.includes(status as (typeof STATUSES)[number]))
      errors.push(`${where}: status ต้องเป็น ${STATUSES.join(" / ")}`);
    out.push({
      slug,
      name: text(fm, "name", where),
      summary: text(fm, "summary", where),
      status,
      devices,
    });
  }
  return out;
}

const cell = (s: string) => s.replace(/\|/g, "\\|");
const statusOrder = (s: string) => ({ tested: 0, draft: 1, deprecated: 2 })[s] ?? 3;
const sortDevices = (a: Device, b: Device) =>
  statusOrder(a.status) - statusOrder(b.status) || a.name.localeCompare(b.name);

function deviceTable(devices: Device[], base: string): string[] {
  const rows = [
    "| อุปกรณ์ | สรุป | Capability | Interface | Logic | Status | ทดสอบกับ |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const d of devices) {
    const replaced =
      d.status === "deprecated" && d.replacedBy && d.replacedBy !== "none"
        ? ` → ใช้ \`${d.replacedBy}\``
        : "";
    rows.push(
      `| [${cell(d.name)}](${base}${d.category}/${d.slug}/) | ${cell(d.summary)} | ${d.capabilities.join(", ")} | ${d.interfaces.join(", ")} | ${d.logicVoltage.join(", ") || "-"} | ${STATUS_LABEL[d.status] ?? d.status}${replaced} | ${d.examples.join(", ") || "-"} |`,
    );
  }
  return rows;
}

function groupedSections(
  devices: Device[],
  key: "capabilities" | "interfaces",
  labels: Record<string, string>,
  base: string,
): string[] {
  const out: string[] = [];
  for (const [value, label] of Object.entries(labels)) {
    const hits = devices.filter((d) => d[key].includes(value)).sort(sortDevices);
    if (hits.length === 0) continue;
    out.push(`### ${label} (\`${value}\`)`, "");
    for (const d of hits)
      out.push(
        `- [${d.name}](${base}${d.category}/${d.slug}/) — ${STATUS_LABEL[d.status] ?? d.status}`,
      );
    out.push("");
  }
  return out;
}

function categoryPage(category: Category, devices: Device[]): string {
  const mine = devices.filter((d) => d.category === category).sort(sortDevices);
  const lines = [`# ${CATEGORY_TITLE[category]}`, "", GENERATED, ""];
  if (mine.length === 0) {
    lines.push("ยังไม่มีอุปกรณ์ในหมวดนี้ — วิธีเพิ่มดู [CONTRIBUTING.md](../CONTRIBUTING.md)", "");
    return lines.join("\n");
  }
  lines.push(
    `ทั้งหมด ${mine.length} รายการ · ค้นตาม Interface ดู [indexes/by-interface.md](../indexes/by-interface.md)`,
    "",
  );
  lines.push(...deviceTable(mine, "../"), "", "## ตาม Capability", "");
  lines.push(...groupedSections(mine, "capabilities", vocab.capabilities, "../"));
  return lines.join("\n").trimEnd() + "\n";
}

function recipesPage(recipes: Recipe[]): string {
  const lines = [`# ${CATEGORY_TITLE.recipes}`, "", GENERATED, ""];
  if (recipes.length === 0) {
    lines.push("ยังไม่มี Recipe — วิธีเพิ่มดู [CONTRIBUTING.md](../CONTRIBUTING.md)", "");
    return lines.join("\n");
  }
  lines.push("| Recipe | สรุป | อุปกรณ์ที่ใช้ | Status |", "| --- | --- | --- | --- |");
  for (const r of [...recipes].sort((a, b) => a.name.localeCompare(b.name)))
    lines.push(
      `| [${cell(r.name)}](./${r.slug}/) | ${cell(r.summary)} | ${r.devices.join(", ")} | ${STATUS_LABEL[r.status] ?? r.status} |`,
    );
  return lines.join("\n") + "\n";
}

function indexPage(
  title: string,
  intro: string,
  devices: Device[],
  key: "capabilities" | "interfaces",
  labels: Record<string, string>,
): string {
  const body = groupedSections(devices, key, labels, "../");
  const lines = [`# ${title}`, "", GENERATED, "", intro, ""];
  lines.push(...(body.length ? body : ["ยังไม่มีอุปกรณ์ในคลัง", ""]));
  return lines.join("\n").trimEnd() + "\n";
}

// ── run ────────────────────────────────────────────────────────────────────────────────
const devices = loadDevices();
const slugs = new Set<string>();
for (const d of devices) {
  if (slugs.has(d.slug)) errors.push(`${d.category}/${d.slug}: slug ซ้ำกับอุปกรณ์ในหมวดอื่น`);
  slugs.add(d.slug);
}
const boardSlugs = new Set(devices.filter((d) => d.category === "boards").map((d) => d.slug));
for (const d of devices) {
  if (d.replacedBy && d.replacedBy !== "none" && !slugs.has(d.replacedBy))
    errors.push(`${d.category}/${d.slug}: replaced_by "${d.replacedBy}" ไม่มีในคลัง`);
  for (const ex of d.examples)
    if (d.category !== "boards" && !boardSlugs.has(ex))
      warnings.push(`${d.category}/${d.slug}: examples/${ex} ยังไม่มีหน้าใน boards/ (ควรเพิ่มทีหลัง)`);
}
const recipes = loadRecipes(slugs);

const pages: Record<string, string> = {
  "indexes/by-capability.md": indexPage(
    "ค้นตาม Capability",
    "อุปกรณ์ทุกหมวดจัดกลุ่มตามสิ่งที่วัดหรือทำได้ อุปกรณ์ที่ทำได้หลายอย่างจะอยู่หลายหัวข้อ",
    devices,
    "capabilities",
    vocab.capabilities,
  ),
  "indexes/by-interface.md": indexPage(
    "ค้นตาม Interface",
    "อุปกรณ์ทุกหมวดจัดกลุ่มตามวิธีเชื่อมต่อ",
    devices,
    "interfaces",
    vocab.interfaces,
  ),
  "recipes/README.md": recipesPage(recipes),
};
for (const c of DEVICE_CATEGORIES) pages[`${c}/README.md`] = categoryPage(c, devices);

for (const w of warnings) console.warn(`⚠️  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`❌ ${e}`);
  console.error(`\n${errors.length} error(s) — แก้ตามข้อความด้านบน (กติกา: CONTRIBUTING.md)`);
  process.exit(1);
}

const stale: string[] = [];
for (const [rel, content] of Object.entries(pages)) {
  const file = join(ROOT, rel);
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (current === content) continue;
  if (CHECK) stale.push(rel);
  else writeFileSync(file, content);
}
if (stale.length) {
  console.error(
    `❌ index ไม่ตรงกับข้อมูล: ${stale.join(", ")}\n   รัน \`bun run index\` แล้ว commit ไฟล์ที่เปลี่ยน`,
  );
  process.exit(1);
}
console.log(
  `✅ ${devices.length} device(s), ${recipes.length} recipe(s)${CHECK ? " — index up to date" : " — index written"}`,
);
