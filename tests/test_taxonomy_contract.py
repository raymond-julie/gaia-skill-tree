"""Yggdrasil II — taxonomy resolution authority: four-way contract test.

Phase 1 contract (handover §3 Phase 1,
``founder/handovers/YGGDRASIL_II_TAXONOMY_AUTHORITY.md``):

    For every node / named entry on staging, assert that the resolved display
    branch agrees across all four historical resolvers:

        taxonomy.resolveDisplayBranch
            == JS computeBranch                     (docs/js/skill-semantics.js)
            == trustMagnitude.computeBranch         (src/gaia_cli/trustMagnitude.py)
            == resolveSemantics isUnique / isSuite  (docs/js/world-tree-layout.js)

This turns the *current* four-way drift into a RED build and guarantees the port
into ``taxonomy.py`` is faithful before any resolver is deleted (Phase 3).

The JS side must be driven via a small Node harness or a golden-file dump — do
NOT hand-transcribe the JS branch logic (handover §3 Phase 1).

Scaffold only: the assertions land with the Phase 1 implementation. The skip
below keeps CI green until then.
"""

import pytest


def test_taxonomy_four_way_contract():
    """Placeholder for the four-way cross-check across every staging node.

    See module docstring for the contract. Implementation lands with Phase 1;
    until then this is a scaffold and must not fail CI.
    """
    pytest.skip("Phase 1 implementation pending — scaffold only")
