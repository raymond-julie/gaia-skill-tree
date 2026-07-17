export const meta = {
  name: 'ygg2-design-remediation',
  description: 'Yggdrasil II #998 design REMEDIATION — the Wave 1-3 reviewers passed lanes without real Playwright verification; rendered output fails on 8 defect classes (dead type-enum, banned Hardened/Transcendent badges, 61-file honor-red origin, 54-file live.js dev artifact, reports hardcoded links, unique-renders-as-suite, heroes laurel misfit + graph 404s, homepage tree split). Each lane: build in worktree (sonnet) -> INDEPENDENT adversarial Playwright re-verify (separate agent, reject-by-default, must load the live localhost:60422 surface + assert visually) -> 1 bounded remediation -> re-verify. Phase 1 = global mechanical sweeps (live.js, honor-red) that touch many files; Phase 2 = surface-specific lanes. Concurrency <=4 sonnet. Recoverable via resumeFromRunId. Commit identity mbtiongson1 ONLY. Uncertain classification decisions get BATCHED for founder, not guessed.',
  phases: [
    { title: 'Phase1-Sweeps', detail: 'live.js delete + honor-red origin sweep (global, mechanical)' },
    { title: 'Phase2-Surfaces', detail: 'graph, badges, reports, resolver, heroes, homepage, renderers/tree.md' },
    { title: 'Verify', detail: 'independent Playwright re-verification per lane' },
  ],
}

const BASE = 'origin/dev/yggdrasil-ii-staging'
const IDENTITY = 'Marcus Rafael B. Tiongson <153011150+mbtiongson1@users.noreply.github.com>'
const PREVIEW = 'http://127.0.0.1:60422'

const WARMUP = `
## Worktree rules — READ BEFORE EDITING ANY FILE
You run with isolation:"worktree" in .claude/worktrees/agent-<id>/.
1. SEPARATE checkout — edits invisible to parent until pushed.
2. Branch from origin: git checkout -b <branch> ${BASE} (NOT local).
3. Commit + push after EACH logical unit. A pushed commit survives cutoff.
4. Commit identity MUST be exactly: git -c user.name="Marcus Rafael B. Tiongson" -c user.email="153011150+mbtiongson1@users.noreply.github.com" commit ...  — NOTHING ELSE. Audit git log --format='%ae' before reporting.
5. design/ branch-scope: docs/*, *.md, scripts/contentEngine/templates/*.j2 allowed. Touching scripts/*.py trips scope (skip-scope-check applied at merge by orchestrator — proceed).
6. Report each commit SHA + push status as you go.
7. If you hit ~80k tokens, commit+push what you have, report, stop.
`

const PLAYWRIGHT_NOTE = `
A localhost preview is LIVE at ${PREVIEW} serving docs/ at staging HEAD. Node playwright 1.61 + python playwright 1.60 (chromium installed) are available. You MUST actually drive a headless browser against ${PREVIEW}<path>, capture console errors + failed requests + computed styles / element counts, and assert the fix visually. HTTP 200 is NOT verification. Report the concrete rendered evidence (counts, colors, console log). If a defect is ambiguous (is this red an origin marker or a semantic error state?), do NOT guess — flag it in a BATCH-FOR-FOUNDER list in your return.`

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lane', 'branch', 'pass', 'evidence', 'remaining', 'batchForFounder'],
  properties: {
    lane: { type: 'string' },
    branch: { type: 'string' },
    pass: { type: 'boolean', description: 'true ONLY if Playwright rendered evidence confirms the fix on the live preview' },
    evidence: { type: 'string', description: 'concrete rendered proof: element counts, computed colors, console-error count, screenshot description' },
    remaining: { type: 'array', items: { type: 'string' }, description: 'defects still present after the fix' },
    batchForFounder: { type: 'array', items: { type: 'string' }, description: 'classification decisions the agent was UNSURE about and did NOT guess' },
  },
}

// ---------- Phase 1: global mechanical sweeps (run first, they touch many files) ----------
phase('Phase1-Sweeps')

const SWEEPS = [
  {
    lane: 'live-js-delete', branch: 'design/ygg2-rem-livejs',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane D): Delete the dev-only live-reload artifact. 54 files under docs/**/*.html contain \`<script src="http://localhost:8400/live.js"></script>\`. It is static (no generator injects it — verified). Remove that exact script tag from ALL 54 files. Do NOT remove any other script. Branch design/ygg2-rem-livejs off ${BASE}. Commit+push. Then Playwright-verify: load ${PREVIEW}/ and ${PREVIEW}/graph/ and confirm ZERO network requests to localhost:8400 (capture page.on('requestfailed') + console). Report file count changed + rendered evidence.`,
  },
  {
    lane: 'honor-red-sweep', branch: 'design/ygg2-rem-honorred',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane C): Sweep the DEPRECATED origin marker red. honor-red / #ef4444 appears in 61 files, 228 hits. CRITICAL: NOT all are the origin icon. Replace ONLY the contributor-origin-marker usage (the red icon/handle marking a named skill's origin) with the gold token --apex-gold (#fbbf24) / --apex-gold-rgb. PRESERVE semantic error/danger red: form validation, delete/remove buttons (.bd-skill-remove, .bd-skill-clear, is-error), simulator .dot.red, --danger. For EACH file, classify before replacing. Branch design/ygg2-rem-honorred off ${BASE}. Do NOT touch docs/badges/_assets/* or badges/index.html (Lane B owns badges). Commit+push per logical group. Playwright-verify: ${PREVIEW}/named/ , ${PREVIEW}/heroes/ , ${PREVIEW}/u/mattpocock/ — assert 0 red origin icons, wreaths gold. BATCH-FOR-FOUNDER any hit you can't confidently classify.`,
  },
]

const sweepResults = await parallel(SWEEPS.map(s => () =>
  agent(s.prompt, { label: s.lane, phase: 'Phase1-Sweeps', model: 'sonnet', isolation: 'worktree', schema: VERDICT_SCHEMA })
    .then(r => r ? { ...r, lane: s.lane, branch: s.branch } : { lane: s.lane, branch: s.branch, pass: false, evidence: 'agent died', remaining: ['agent returned null'], batchForFounder: [] })
))

// ---------- Phase 2: surface-specific lanes ----------
phase('Phase2-Surfaces')

const LANES = [
  {
    lane: 'graph', branch: 'design/ygg2-rem-graph',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane A-graph + G-graph): docs/js/skill-graph.js reads skill.type==='unique' (line ~43,409) but the type enum is now basic|fusion ONLY — so unique/suite FILTERS never match and satellite classification is dead. Migrate to derived branch via window.GaiaSemantics.computeBranch(skill, level). Also /graph/ throws 15 console 404s and renders 0 avatars/0 wreaths (medallions missing) — fix the broken asset paths and wire medallion render. Branch design/ygg2-rem-graph off ${BASE}. Playwright-verify at ${PREVIEW}/graph/: toggle unique + suite filters and confirm nodes actually filter; assert console-error count 0; assert medallions/wreaths present. Report before/after console counts.`,
  },
  {
    lane: 'renderers-tree', branch: 'design/ygg2-rem-renderers',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane A-rest): scripts/_tree_renderer.py:23 hardcodes the OLD glyph legend "◆ Ultimate · ◉ Unique · ◇ Extra · ○ Basic"; scripts/render_tui_preview.py:81-83 emits "◇ Extra Skill"/"◆ Ultimate Skill". These are the DEAD type axis + banned rank words. Migrate to the Ygg-II derived branch (standard|suite|unique) + correct rank ladders. Then regenerate docs/tree.md (the nav "skill tree md" that currently shows a broken/old tree, dated 2026-07-16, pre-design). Run the tree generator. Branch design/ygg2-rem-renderers off ${BASE}. scripts/*.py edits trip branch-scope — proceed (skip-scope-check at merge). Playwright/text-verify: docs/tree.md legend no longer says Ultimate/Extra; open ${PREVIEW}/tree or the nav link and confirm the rendered tree matches current registry (243 skills, basic/fusion).`,
  },
  {
    lane: 'badges', branch: 'design/ygg2-rem-badges',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane B): Badges render BANNED words "Hardened · 4★" and "Transcendent · 5★" across docs/badges/_assets/*/rank*.svg, docs/badges/samples/*.svg, and docs/badges/index.html:1147,1161,1306-1307. No 5★/6★ unique variants exist. Regenerate via scripts/generateBadges.py using branch-forked rank words: suite 4-6★ = Extra/Ultimate/Apex, unique 4-6★ = Unique/Unique Ultimate/Unique Impossible, shared 1-3★ = Awakened/Named/Evolved. NEVER emit Hardened/Transcendent. Fix the index.html rank-table + sample labels too. Also fix honor-red in badges/index.html here (Lane C skips badges). Branch design/ygg2-rem-badges off ${BASE}. FOLDED into this remediation per founder (skip-scope-check at merge). Playwright-verify ${PREVIEW}/badges/?u=mattpocock&s=grill-me renders correct branch-forked rank word, no banned vocab.`,
  },
  {
    lane: 'reports', branch: 'design/ygg2-rem-reports',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane E): scripts/contentEngine/templates/report.html.j2 hardcodes https://gaiaskilltree.com/ for Previous-week, Archive, Canonical-JSON, and rt-skill links — so on localhost + any non-prod host every adjacent/prev-week link is broken. Convert navigational <a href> to ROOT-RELATIVE (/reports/2026-27/, /named/#explorer/...). KEEP <link rel="canonical"> + <link rel="alternate"> absolute (SEO). Regenerate all docs/reports/*/index.html + docs/reports/index.html. Branch design/ygg2-rem-reports off ${BASE}. Playwright-verify: load ${PREVIEW}/reports/2026-28/ , click "← Previous week", confirm it resolves to ${PREVIEW}/reports/2026-27/ (not gaiaskilltree.com). Test adjacent links too.`,
  },
  {
    lane: 'resolver', branch: 'design/ygg2-rem-resolver',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane F): Typeless named skills (e.g. registry/named/pbakaus/impeccable.md: origin:true, level:4★, no type: field, no suiteComponents) render with SUITE gold instead of UNIQUE violet, because computeBranch can't derive unique without a type. Add a fallback to computeBranch in BOTH docs/js/skill-semantics.js (window.GaiaSemantics) AND src/gaia_cli/trustMagnitude.py: a named skill with rank>=4 AND no suiteComponents (origin implied) derives branch='unique'. RESOLVER ONLY — do NOT edit any registry data file (founder decision). Keep both runtimes in lockstep. Branch design/ygg2-rem-resolver off ${BASE}. Playwright-verify: ${PREVIEW}/named/ find impeccable's plaque, assert computed color is --tier-unique violet #7c3aed (rgb 124,58,237) NOT suite gold. Report the computed style.`,
  },
  {
    lane: 'heroes', branch: 'design/ygg2-rem-heroes',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane G-heroes): ${PREVIEW}/heroes/ (Hall of Heroes) is incomplete and the gold laurel wreath does NOT fit/enclose the avatar properly (geometry/anchor wrong). Fix the wreath sizing + positioning so it frames the avatar at all breakpoints, and complete whatever makes the page read as incomplete. Do NOT touch skill-graph.js (Lane graph owns it). Branch design/ygg2-rem-heroes off ${BASE}. Playwright-verify at ${PREVIEW}/heroes/ desktop 1440 + mobile 390: measure wreath vs avatar bounding boxes, confirm wreath encloses avatar (not clipped, not floating). Screenshot-describe both.`,
  },
  {
    lane: 'homepage', branch: 'design/ygg2-rem-homepage',
    prompt: `${WARMUP}\n${PLAYWRIGHT_NOTE}\n\nTASK (Lane H): The homepage 2D skill-tree render is misaligned with the poster tree ART — a "broken split". The 2D node overlay must ALIGN to the poster tree armature. Investigate the homepage tree mount + poster background positioning (docs/index.html + its tree JS/CSS). This is the ONE homepage change allowed — be surgical, homepage is otherwise FROZEN. Branch design/ygg2-rem-homepage off ${BASE}. Playwright-verify: screenshot ${PREVIEW}/ desktop + mobile, confirm 2D nodes sit on the poster tree branches (describe alignment before/after). If the root cause is ambiguous or risks broader homepage regression, BATCH-FOR-FOUNDER instead of guessing.`,
  },
]

const surfaceResults = await parallel(LANES.map(l => () =>
  agent(l.prompt, { label: l.lane, phase: 'Phase2-Surfaces', model: 'sonnet', isolation: 'worktree', schema: VERDICT_SCHEMA })
    .then(r => r ? { ...r, lane: l.lane, branch: l.branch } : { lane: l.lane, branch: l.branch, pass: false, evidence: 'agent died', remaining: ['agent returned null'], batchForFounder: [] })
))

const all = [...sweepResults, ...surfaceResults].filter(Boolean)
return {
  passed: all.filter(r => r.pass).map(r => ({ lane: r.lane, branch: r.branch, evidence: r.evidence })),
  failed: all.filter(r => !r.pass).map(r => ({ lane: r.lane, branch: r.branch, remaining: r.remaining, evidence: r.evidence })),
  batchForFounder: all.flatMap(r => (r.batchForFounder || []).map(b => `[${r.lane}] ${b}`)),
}
