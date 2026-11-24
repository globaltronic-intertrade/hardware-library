# AGENTS.md — hardware-library

Public knowledge base of the boards, sensors and modules the Globaltronic Intertrade team has used:
specs, pins, wiring, usage, applications and minimal working code. Content is Thai with English
technical terms; file/folder names and this file are English.

- Human guide + layout: [README.md](README.md) · Rules for adding / editing / deleting:
  [CONTRIBUTING.md](CONTRIBUTING.md) · Vocabulary (Device, Category, Capability, Interface, Status,
  Example, Recipe): [CONTEXT.md](CONTEXT.md) · Decisions: `docs/adr/`

## Commands

- `bun install` — once
- `bun run index` — validate every Device/Recipe page and regenerate the index pages
- `bun run verify` — the gate (index check + `prettier --check`); CI runs the same

## Conventions

- One Device = one folder `boards|sensors|modules/<slug>/` with `README.md` whose YAML frontmatter
  is the single source of truth; start from `templates/device/README.md`.
- `capabilities` / `interfaces` values must exist in `vocabulary.yml`; add new values there first.
- Never hand-edit generated files: `boards|sensors|modules|recipes/README.md`, `indexes/*.md`.
- `status: tested` only after real-hardware testing, with at least one `examples/<board-slug>/`.
- Removal = `status: deprecated` + `replaced_by`; real deletion only for duplicates or unfixable
  errors.
- PUBLIC repo: no customer names/sites, prices, credentials (`xxxxxxxx` placeholders), internal
  IPs, or copied datasheet content (link instead) — see `docs/adr/0001-*`.
- Every change goes through a PR; self-merge allowed after CI is green.
