"""Yggdrasil II — Taxonomy Resolution Authority (build-time cut).

Single build-time authority that resolves branch / rank / medallion for every
skill variant. Consumers read the resolved field; the four historical read-time
resolvers (JS ``computeBranch``, JS ``resolveSemantics``, Python
``trustMagnitude.computeBranch``, Python ``formatting.rank_word``) collapse into
this module.

Source of truth: ``founder/handovers/YGGDRASIL_II_TAXONOMY_AUTHORITY.md``
(ratified 2026-07-18). See §2 (the decision) and §3 Phase 1 (this module's
contract). All logic ported here MUST match the read-order and rank ladders
documented in that handover §1.

Design notes from the handover:

- ``normalize`` is the ONLY meta-version-aware code. Yggdrasil I / II / III
  forks live here and nowhere else. Everything downstream is meta-version-blind.
- Gating (``passesApexGate``) STAYS in ``trustMagnitude.py`` — it is already
  display-independent. This is the deliberate "branch-for-display vs
  branch-for-gating" split; do NOT merge it into the display resolver.

Rank ladders (canonical, handover §1):
    SHARED : {0 Basic, 1 Awakened, 2 Named, 3 Evolved}
    SUITE  : {4 Extra,  5 Ultimate,        6 Apex}
    UNIQUE : {4 Unique, 5 Unique Ultimate, 6 Unique Impossible}
    BANNED anywhere: 'Transcendent', 'Hardened'.

Branch read-order (handover §1, resolver #1 ``computeBranch``, preserve exactly):
    1. type === 'basic' && rank >= 4 && !hasSuiteComponents  -> 'unique'
    2. hasSuiteComponents                                    -> 'suite'
    3. else                                                  -> 'standard'

NOTE: signature names are camelCase, kept verbatim from the handover contract
(§2 / §3 Phase 1) rather than the repo's usual no-underscore snake convention.

Phase 1 is scaffold only — implementation drops in behind these stubs.
"""

from __future__ import annotations


def normalize(entry, metaEpoch):
    """Map any-era skill shape to one canonical internal shape.

    The ONLY meta-version-aware function in the module. Yggdrasil I / II / III
    forks live here exclusively: a Ygg I ``type:'ultimate'`` node and a Ygg II
    ``type:'fusion'`` node both pass through ``normalize`` to a single canonical
    shape, after which every downstream resolver is meta-version-blind.

    Args:
        entry: A raw skill / named-index entry in any-era shape.
        metaEpoch: The meta epoch the entry originates from (Ygg I / II / III),
            selecting which era fork to apply.

    Returns:
        The canonical internal shape consumed by :func:`resolveDisplayBranch`,
        :func:`rankWord`, :func:`rankLabel`, and :func:`medallion`.

    Source of truth: handover §2 (authority module) and §3 Phase 1.
    """
    raise NotImplementedError("Phase 1 scaffold — normalize not yet implemented.")


def resolveDisplayBranch(normalized):
    """Resolve the display branch for a normalized entry.

    The single branch resolver. Ports the read-order of JS resolver #1
    (``skill-semantics.js::computeBranch``) exactly (handover §1):

        1. type === 'basic' && rank >= 4 && !hasSuiteComponents -> 'unique'
        2. hasSuiteComponents                                   -> 'suite'
        3. else                                                 -> 'standard'

    Args:
        normalized: The canonical internal shape returned by :func:`normalize`.

    Returns:
        One of ``'standard'``, ``'suite'``, or ``'unique'``.

    Source of truth: handover §1 (read order) and §3 Phase 1.
    """
    raise NotImplementedError(
        "Phase 1 scaffold — resolveDisplayBranch not yet implemented."
    )


def rankWord(level, branch):
    """Return the bare rank word for a ``(level, branch)`` pair.

    The single rank ladder (handover §1), replacing the four drifted copies:

        SHARED : {0 Basic, 1 Awakened, 2 Named, 3 Evolved}  (branch-independent)
        SUITE  : {4 Extra,  5 Ultimate,        6 Apex}
        UNIQUE : {4 Unique, 5 Unique Ultimate, 6 Unique Impossible}

    Banned words ('Transcendent', 'Hardened') must never be returned.

    Args:
        level: The star level (0-6).
        branch: The resolved branch string from :func:`resolveDisplayBranch`.

    Returns:
        The bare rank word (e.g. 'Extra', 'Unique').

    Source of truth: handover §1 (rank ladders) and §3 Phase 1.
    """
    raise NotImplementedError("Phase 1 scaffold — rankWord not yet implemented.")


def rankLabel(level, branch):
    """Return the full branch-aware rank label (e.g. '4★ Extra' or '4★ Unique').

    Combines the star level with the word from :func:`rankWord`.

    Args:
        level: The star level (0-6).
        branch: The resolved branch string from :func:`resolveDisplayBranch`.

    Returns:
        The full rank label string.

    Source of truth: handover §1 (rank ladders) and §3 Phase 1.
    """
    raise NotImplementedError("Phase 1 scaffold — rankLabel not yet implemented.")


def medallion(branch, rank):
    """Return the resolved medallion art token for a ``(branch, rank)`` pair.

    Args:
        branch: The resolved branch string from :func:`resolveDisplayBranch`.
        rank: The resolved rank (star level or rank word).

    Returns:
        The medallion art token.

    Source of truth: handover §2 (authority module) and §3 Phase 1.
    """
    raise NotImplementedError("Phase 1 scaffold — medallion not yet implemented.")
