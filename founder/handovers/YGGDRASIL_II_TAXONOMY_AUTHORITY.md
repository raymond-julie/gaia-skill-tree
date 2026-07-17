# Yggdrasil II — Taxonomy Resolution Authority (Build-Time Cut)

**Status:** Ratified 2026-07-18 (founder: Marcus Tiongson). Lands inside EPIC #1002 before `dev/yggdrasil-ii-staging` → `main` (PR #1185).
**Root issues closed:** #1228, #1229, #1230, #1231 (design-framed cluster) + #1220–#1225 (dry-run sweep) + finishes #998.
**Integration branch:** `dev/yggdrasil-ii-staging`. All feature branches PR into it, never `main`.

---

## 1. The problem (verified on staging, 3 scouts, 2026-07-18)

Yggdrasil II's design chose **read-time branch derivation** — the `skill-semantics.js` header enforces it as rubric E1: *"branch MUST be derived at read-time — NEVER from a stored branch/tier field."* That choice forces the derivation logic to physically exist in every runtime that renders, hand-kept identical. It isn't. There are **FOUR resolvers with no shared code path**, already structurally drifted:

| # | Resolver | Location | Reads | Output | Note |
|---|---|---|---|---|---|
| 1 | JS `computeBranch(node, effRank)` | `docs/js/skill-semantics.js` | `type==='basic'`, `suiteComponents`, `effRank ?? level` | `standard\|suite\|unique` + rank words | declared "single source of truth" |
| 2 | JS `resolveSemantics(node, effRank, metaIsYggI)` | `docs/js/world-tree-layout.js:356-413` | same predicate + `metaIsYggI` fork | `{hemisphere, coreness, isUnique, isSuite, glyph, boughGroup}` | **no rank ladder; extra Ygg-I fork #1 lacks** |
| 3 | Python `computeBranch(named, genericSkillMap)` | `src/gaia_cli/trustMagnitude.py:1283-1310` | `suiteComponents` + rank; **never `type`** | branch string | diverges from #1 (ignores `type`) |
| 4 | Python `rank_word(level, branch)` | `src/gaia_cli/formatting.py:384-401` | `meta.LEVEL_LABELS_SUITE` + hardcoded UNIQUE | rank word | 4th copy of the ladder |

Plus stale Ygg-I enum code in `scripts/generateProjections.py` (`get_tier_symbol`, `_build_skill_display` branch on `type == 'ultimate'/'unique'/'extra'` — matches ZERO nodes post-#997).

**Read order in #1 (must be preserved when porting):**
1. `type === 'basic' && rank >= 4 && !hasSuiteComponents` → `unique`
2. `hasSuiteComponents` → `suite`
3. else → `standard`

**Rank ladders (canonical, from #1):**
- SHARED: `{0 Basic, 1 Awakened, 2 Named, 3 Evolved}`
- SUITE: `{4 Extra, 5 Ultimate, 6 Apex}`
- UNIQUE: `{4 Unique, 5 Unique Ultimate, 6 Unique Impossible}`
- BANNED anywhere: `Transcendent`, `Hardened` (enforced by `check_rank_vocabulary.py`).

## 2. The decision

Reverse rubric E1. **One build-time authority resolves branch/rank/medallion; consumers read the resolved field; all four resolvers are deleted.**

- **Authority module:** `src/gaia_cli/taxonomy.py` (new). Exposes:
  - `normalize(entry, metaEpoch)` — the ONLY meta-version-aware code. Ygg I/II/III forks live here and nowhere else. Maps any-era shape → one canonical internal shape.
  - `resolveDisplayBranch(normalized) -> 'standard'|'suite'|'unique'` — the single branch resolver (port #1's read-order exactly).
  - `rankWord(level, branch)` / `rankLabel(level, branch)` — the single ladder.
  - `medallion(branch, rank)` — resolved art token.
  - Gating (`passesApexGate`) STAYS in `trustMagnitude.py` — scout confirmed it is already display-independent (1/10 difficulty; do NOT merge it into the display resolver). This is the deliberate "branch-for-display vs branch-for-gating" split.

- **Emission home:** the **named index** — `registry/named-skills.json` → `docs/graph/named/index.json`. This is where `suiteComponents` + per-variant `level` co-exist (they are NOT on `gaia.json` generic nodes) and is the same source the three SSR generators already read. Resolving here collapses the frontend AND SSR resolvers at once.

- **Backwards-compat:** by construction. A Ygg I `type:'ultimate'` node and a Ygg II `type:'fusion'` node both pass through `normalize()` to one shape; everything downstream is meta-version-blind. Ygg III = edit `normalize()` + the ladder table, regenerate, done. One file, one runtime.

## 3. Phases (each = one feature branch → staging)

### Phase 1 — Authority module + contract test (`cli/ygg2-taxonomy-authority`)
- Write `src/gaia_cli/taxonomy.py` with `normalize`/`resolveDisplayBranch`/`rankWord`/`rankLabel`/`medallion`. Port the agreed logic from resolvers #1 and #3; unit-test BOTH Ygg I and Ygg II input shapes.
- **Contract test** (`tests/test_taxonomy_contract.py`): for every node/named entry on staging, assert `taxonomy.resolveDisplayBranch` == JS `computeBranch` == Python `trustMagnitude.computeBranch` == `resolveSemantics` isUnique/isSuite. This makes the *current* four-way drift a RED build and guarantees the port is faithful before anything is deleted. (Node the JS side via a small harness or a golden-file dump — do not hand-transcribe.)
- Nothing consumes the module yet. Pure add + test.

### Phase 2 — Emit resolved fields (`cli/ygg2-emit-resolved`)
- Thread `taxonomy.py` through the build so `docs/graph/named/index.json` carries resolved `branch`/`rank`/`rankWord`/`medallion` per variant; also thread `suiteComponents` into the index (closes #1229).
- **HONOR #798:** every step that does `rmtree(committed Class S) + copytree(from gitignored Class P)` must replicate `build_badges`' count-drop abort guard (`scripts/build_docs.py:1112-1152`). Steps missing it: `build_api_projection`, `build_profile_pages`, `build_og_cards`, `build_trending`. Add a sanity floor before any new resolved artifact goes through the swap.
- Full `gaia dev docs` regen; commit Class S (`docs/graph/*`) + source in the same PR (Guard E).
- On Windows: `PYTHONPATH=./src python -m gaia_cli dev docs`; prefix `PYTHONIOENCODING=utf-8` for validators (cp1252 glyph crash).

### Phase 3 — Collapse consumers + rewind #1227 (`design/ygg2-consumers-resolved`)
- Repoint the 3 SSR generators (`generateBadges.py` skill_branch, `generateOgCards.py` og_branch, `generateProfilePages.py` skill_branch) to read the resolved field from the index; delete their local branch derivation and the `trustMagnitude.computeBranch` + `formatting.rank_word` duplication.
- Repoint JS consumers to read resolved fields, then **DELETE** `skill-semantics.js::computeBranch`, the branch predicate + ladder in `resolveSemantics`. Consumer rewire list (staging-verified): `plaque.js` (L71,78,172), `named-skills.js` (L190-191,572,655,732), `skill-explorer.js` (31 sites: L1316,1362-1369,1421,1523,1568,1589,2237,2506), `skill-graph.js` (L1734 via nodeMeta.glyph).
- **Rewind #1227:** cherry-pick the SURVIVES set onto this base — `332736ab0` (D12 badges words, clean), `55a62ac13` (D15 prev-week, clean), `e31f58077` (D6/D8 plaque, clean), re-strip live.js (`a9f4e3124`, mechanical), hand-port the ~30-line gold-★ block from `4801e0c13` into the new graph renderer (shares file with the deleted D9 derivation). DISCARD `c0def6d62` (D9), and the derivation halves of `04d6114d6` (D14) + `3555c40da` (D74) — the resolved field replaces them.

### Phase 4 — Close-out (`review/meta/ygg2-closeout` or as needed)
- #1000 (agent skills alignment). Full regen. Green staging (validate, rank-vocab, timelines, schema lockstep). Mark PR #1185 ready; merge to main with a **merge commit** (never squash a `dev/*`→`main` EPIC PR).

## 4. Hard constraints (do not violate)
- **Class P vs S:** `docs/graph/*` is tracked Class S served by Pages; `registry/gaia.json` etc. is gitignored Class P. New resolved fields MUST be emitted by `syncDocsGraphAssets.py` into Class S, not left at Class P (Guard E won't catch a Class-P-only field; the phase-1 contract test must).
- **#798 wipe-guard** on every destructive swap (see Phase 2).
- **Programmatic-first:** any registry mutation via `gaia dev` verbs, never hand-edits.
- **No `type ===` / branch-word literals outside `taxonomy.py`** after phase 3 — add a CI grep guard (reuse the guard-topology muscle) so a future meta can't re-scatter derivation.
- **Token duplication** (`generateCssTokens.py:189` evidence_colors vs `formatting.py:148` GRADE_COLORS) — genuine parallel table; fold into the same source while in `formatting.py`.

## 5. Scout evidence (ground truth, 2026-07-18)
- No node in `docs/graph/gaia.json` (243 nodes) carries `branch`/`rank`/`medallion`/`suiteComponents` today — all raw `type` (130 fusion / 113 basic) + `namedMaxLevel`.
- `passesApexGate` (`trustMagnitude.py:1247`) is display-independent — split is trivial.
- The four resolvers agree functionally on Ygg II *now* but read different fields (drift already present).
- #1227 diff is ~99% regenerated artifact (~34k lines); only ~476 hand-authored lines, ~50 of which survive the rewind.
