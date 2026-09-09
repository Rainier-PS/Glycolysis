# Glycolysis Project - MASTER AI Documentation

---

## AI Handoff Header

| Field | Value |
|---|---|
| **Project Name** | Glycolysis - Interactive 3D Molecular Viewer |
| **Project Purpose** | Educational web visualization of the glycolysis metabolic pathway using interactive 3D molecular models |
| **Project Type** | Static educational website with a Cloudflare Worker API (no build step) |
| **Primary Audience** | Advanced high-school and introductory-university students with zero prior biology knowledge |
| **Educational Level** | High-school to introductory-university (conceptual, zero prior knowledge assumed) |
| **Primary Technologies** | HTML, CSS, vanilla JavaScript, 3Dmol.js (WebGL molecular renderer) |
| **Architecture** | Landing page with 3D viewer + separate interactive narrated story page |
| **Canonical Production Entry Points** | `index.html` (main), `story/index.html` (story) |
| **Canonical Master Document** | `docs/MASTER.md` |
| **Current Project Status** | Major revision: 10-beat conceptual story, quiz system, signed downloadable results, verification, mailto teacher sharing, curated 9-molecule homepage viewer |
| **Last Verified Date** | 2026-09-09 |
| **Scientific Scope** | Ten enzyme-catalyzed reactions of glycolysis, from glucose to pyruvate, in the cytosol |
| **Technical Scope** | HTML/CSS/JS with local 3Dmol.js vendor library, PubChem-derived SDF molecular assets, and a Cloudflare Worker API |

**This project is:**
- An educational visualization of glycolysis
- A 3D molecular viewer for glycolysis intermediates and cofactors
- A narrated conceptual story with quiz checkpoints and result sharing

**This project is NOT:**
- A medical diagnostic system
- A clinical simulator
- A forensic identification system
- A quantitative whole-cell simulation
- A molecular dynamics simulation
- A claim of exact cellular spatial organization
- A real-time metabolic flux model

---

## Table of Contents

1. [AI Operating Instructions](#1-ai-operating-instructions)
2. [Project Purpose and Educational Model](#2-project-purpose-and-educational-model)
3. [Complete Scientific Reference](#3-complete-scientific-reference)
4. [Stoichiometry and Accounting](#4-stoichiometry-and-accounting)
5. [ATP and NADH Conceptual Model](#5-atp-and-nadh-conceptual-model)
6. [Complete Molecular Asset Catalog](#6-complete-molecular-asset-catalog)
7. [Molecular Source-of-Truth Policy](#7-molecular-source-of-truth-policy)
8. [3Dmol.js Architecture](#8-3dmoljs-architecture)
9. [Complete Project File Map](#9-complete-project-file-map)
10. [Main Page Implementation](#10-main-page-implementation)
11. [Story Page Implementation](#11-story-page-implementation)
12. [Complete Story Scene Catalog](#12-complete-story-scene-catalog)
13. [Complete State Model](#13-complete-state-model)
14. [Asynchronous Safety and Race Conditions](#14-asynchronous-safety-and-race-conditions)
15. [Narration System](#15-narration-system)
16. [Accessibility Specification](#16-accessibility-specification)
17. [Keyboard Interaction Reference](#17-keyboard-interaction-reference)
18. [Responsive Design](#18-responsive-design)
19. [Design System](#19-design-system)
20. [Border-Radius and Visual-Consistency Rules](#20-border-radius-and-visual-consistency-rules)
21. [SEO Specification](#21-seo-specification)
22. [Legal and Attribution Model](#22-legal-and-attribution-model)
23. [Third-Party Dependencies](#23-third-party-dependencies)
24. [Network and Offline Behavior](#24-network-and-offline-behavior)
25. [Performance Architecture](#25-performance-architecture)
26. [Error and Fallback Model](#26-error-and-fallback-model)
27. [Data Flow](#27-data-flow)
28. [Main ↔ Story Navigation](#28-main--story-navigation)
29. [Asset Directory Reference](#29-asset-directory-reference)
30. [Quarantine / Historical Files](#30-quarantine--historical-files)
31. [Molecular Asset Acquisition Workflow](#31-molecular-asset-acquisition-workflow)
32. [Scientific Integrity Rules](#32-scientific-integrity-rules)
33. [Content Style Guide](#33-content-style-guide)
34. [No-Emoji Policy](#34-no-emoji-policy)
35. [No-Source-Comments Policy](#35-no-source-comments-policy)
36. [Complete Function/API Reference](#36-complete-functionapi-reference)
37. [Complete DOM/Selector Reference](#37-complete-domselector-reference)
38. [CSS Architecture](#38-css-architecture)
39. [Animation Architecture](#39-animation-architecture)
40. [Reduced-Motion Model](#40-reduced-motion-model)
41. [Visibility / Background Tab Behavior](#41-visibility--background-tab-behavior)
42. [Loading Lifecycle](#42-loading-lifecycle)
43. [Testing and QA](#43-testing-and-qa)
44. [Known Limitations](#44-known-limitations)
45. [Current Known Issues](#45-current-known-issues)
46. [Future Extension Guide](#46-future-extension-guide)
47. [Change-Safety Matrix](#47-change-safety-matrix)
48. [Do-Not-Break Contract](#48-do-not-break-contract)
49. [Decision History](#49-decision-history)
50. [Historical / Migration Context](#50-historical--migration-context)
51. [Documentation Map](#51-documentation-map)
52. [Master Document Maintenance Rule](#52-master-document-maintenance-rule)
53. [Documentation Accuracy Requirement](#53-documentation-accuracy-requirement)

---

## 1. AI Operating Instructions

### 1.1 Source Hierarchy

When working on this project, use the following authority hierarchy:

1. **Current production source code** - `index.html`, `src/viewer.js`, `src/init.js`, `styles/landing.css`, `story/index.html`, `story/story.js`, `story/story.css`, legal pages, `robots.txt`, `sitemap.xml`
2. **Actual molecular SDF/data assets** - `molecules/**/*.sdf`
3. **Actual manifests/configuration/tooling** - `glycolysis_molecular_asset_pack/manifest.json`, `glycolysis_molecular_asset_pack/download_pubchem_assets.py`
4. **`docs/MASTER.md`** - This document
5. **Specialized project documentation** - `docs/project.md`, `docs/story-page.md`
6. **Historical material referenced in earlier revisions** - `quarantine/glycolysis_story.html` (not present in the current repository tree)
7. **General assumptions** - Never rely on these alone

**Rule:** Implementation should never be inferred solely from documentation when the source is available.

### 1.2 Do Not Infer Implementation

A future AI working on this project must:

- Do not assume undocumented functions exist
- Do not assume documented behavior is implemented
- Inspect relevant source before modifying it
- Do not invent dependencies
- Do not invent URLs
- Do not invent SEO metadata
- Do not invent Google Search Console verification tokens
- Do not invent molecular coordinates
- Do not fabricate scientific values
- Do not claim accessibility conformance without actual evaluation
- Do not claim runtime testing without actually performing it

### 1.3 Modification Philosophy

This project follows a **surgical modification** philosophy:

- Preserve mature functionality
- Avoid unnecessary rewrites
- Preserve visual language (cinematic, dark, editorial)
- Preserve scientific accuracy
- Preserve molecular source data (SDF files)
- Avoid introducing unnecessary dependencies
- Keep main viewer and story architecturally separate
- Avoid changing behavior unrelated to the requested task
- Verify changes against the project's invariants (Section 48)

### 1.4 Documentation Maintenance

Update `docs/MASTER.md` when any of the following change:

- New molecule added or molecule changed
- PubChem CID changed
- SDF file changed
- Reaction changed or equation changed
- Story scene added, removed, or changed
- File structure changed
- Dependency changed
- Keyboard interaction changed
- Accessibility behavior changed
- Navigation changed
- SEO metadata changed
- Design tokens changed
- Deployment model changed
- Performance architecture changed
- Legal attribution changed
- Known limitations changed

---

## 2. Project Purpose and Educational Model

### What Is Glycolysis?

Glycolysis is a metabolic pathway that converts one molecule of glucose (a six-carbon sugar) into two molecules of pyruvate (a three-carbon α-keto acid). It occurs in the **cytosol** of virtually all living cells and is one of the most ancient and universal metabolic pathways.

The pathway consists of **ten enzyme-catalyzed reactions** divided into two phases:

- **Energy Investment Phase (Reactions 1–5):** Two ATP molecules are consumed to phosphorylate and rearrange glucose, preparing it for cleavage into two three-carbon fragments.
- **Energy Payoff Phase (Reactions 6–10):** Four ATP molecules are produced by substrate-level phosphorylation, and two NADH molecules are generated by reduction of NAD⁺.

**Net yield per glucose:** 2 ATP, 2 NADH, 2 pyruvate.

### What the Website Teaches

The website teaches glycolysis through two complementary experiences:

1. **Main Molecular Viewer** (`index.html`): An interactive 3D molecular viewer where users can inspect all 15 glycolysis intermediates and cofactors in ball-and-stick representation with CPK atom colors.

2. **Interactive Story** (`story/index.html`): A cinematic, narrated conceptual story that walks through glycolysis in 10 meaningful beats, with quiz checkpoints, signed downloadable results, verification, and optional teacher email composition.

### Intended Narrative Progression (Story)

The story follows a conceptual 10-beat narrative progression:

```
1. THE CELL - cinematic whole-cell context
2. ENTER THE CYTOSOL - where glycolysis happens
3. GLUCOSE + ATP INVESTMENT - starting molecule and energy input
4. SECOND ATP + FRUCTOSE-1,6-BISPHOSPHATE - preparation for splitting
5. THE SPLIT - 6C → 2 x 3C molecules
6. NAD+ BECOMES NADH - electron transfer
7. THE PAYOFF - ATP is generated
8. PYRUVATE - final product
9. THE ACCOUNTING - net yield summary
10. WHAT THIS MEANS - broader context

Quiz checkpoints appear after beats 3, 4, 5, 6, and 7.
```

### Relationship Between Molecular Visualization and Biochemical Pathway

The 3D molecular visualizations show **actual PubChem 3D conformer records** - real atomic coordinates from a validated chemical database. These are not artistic approximations. The visualization is **ball-and-stick** with **CPK/Jmol atom colors**, providing a scientifically grounded representation of each molecule's structure.

The pathway narrative contextualizes these structures within the biochemical logic of glycolysis, explaining what happens at each step, why it matters, and how the molecules relate to each other.

---

## 3. Complete Scientific Reference

### 3.1 Glycolysis Overview

| Property | Value |
|---|---|
| **Cellular location** | Cytosol |
| **Pathway purpose** | Extract usable chemical energy from glucose |
| **Substrate** | β-D-Glucopyranose (glucose) |
| **Primary products** | 2 Pyruvate |
| **Energy products** | 2 ATP (net), 2 NADH |
| **Phases** | Energy Investment (steps 1–5), Energy Payoff (steps 6–10) |
| **ATP role** | Phosphoryl-group donor (investment); product of substrate-level phosphorylation (payoff) |
| **ADP role** | Phosphoryl-group acceptor (payoff); product of ATP donation (investment) |
| **NAD⁺ role** | Electron acceptor in reaction 6 |
| **NADH role** | Reduced electron carrier; carries high-energy electrons |
| **Substrate-level phosphorylation** | Direct transfer of phosphoryl group from intermediate to ADP (reactions 7, 10) |
| **Pyruvate formation** | Final product; entry point to pyruvate dehydrogenase (aerobic) or lactate dehydrogenase (anaerobic) |
| **Relationship to downstream metabolism** | Pyruvate enters mitochondria for oxidative decarboxylation (aerobic) or is reduced to lactate (anaerobic fermentation regenerates NAD⁺) |

### 3.2 All Ten Reactions

#### Reaction 1 - Hexokinase

| Field | Value |
|---|---|
| **Step** | 1 |
| **Phase** | Energy Investment |
| **Enzyme** | Hexokinase (EC 2.7.1.1) |
| **Substrate(s)** | Glucose + ATP |
| **Product(s)** | Glucose-6-phosphate + ADP |
| **Reversibility** | Effectively irreversible under cellular conditions |
| **ATP change** | −1 |
| **NADH change** | 0 |
| **Reaction type** | Phosphoryl transfer |
| **Equation (as displayed)** | `Glucose + ATP → Glucose-6-phosphate + ADP` |
| **Molecular assets** | `glucose`, `atp` → `glucose-6-phosphate`, `adp` |
| **Educational purpose** | First irreversible step; traps glucose in cell; raises free-energy state |
| **Caveat** | Phosphorylation adds negative charge, reducing membrane permeability |

#### Reaction 2 - Phosphoglucose Isomerase

| Field | Value |
|---|---|
| **Step** | 2 |
| **Phase** | Energy Investment |
| **Enzyme** | Phosphoglucose isomerase (EC 5.3.1.9) |
| **Substrate(s)** | Glucose-6-phosphate |
| **Product(s)** | Fructose-6-phosphate |
| **Reversibility** | Reversible |
| **ATP change** | 0 |
| **NADH change** | 0 |
| **Reaction type** | Aldose-ketose isomerization |
| **Equation (as displayed)** | `Glucose-6-phosphate ⇌ Fructose-6-phosphate` |
| **Molecular assets** | `glucose-6-phosphate` → `fructose-6-phosphate` |
| **Educational purpose** | Rearranges carbonyl from C1 to C2; prepares for symmetrical cleavage |

#### Reaction 3 - Phosphofructokinase-1 (PFK-1)

| Field | Value |
|---|---|
| **Step** | 3 |
| **Phase** | Energy Investment |
| **Enzyme** | Phosphofructokinase-1 (EC 2.7.1.11) |
| **Substrate(s)** | Fructose-6-phosphate + ATP |
| **Product(s)** | Fructose-1,6-bisphosphate + ADP |
| **Reversibility** | Strongly irreversible - committed step |
| **ATP change** | −1 |
| **NADH change** | 0 |
| **Reaction type** | Phosphoryl transfer |
| **Equation (as displayed)** | `Fructose-6-phosphate + ATP → Fructose-1,6-bisphosphate + ADP` |
| **Molecular assets** | `fructose-6-phosphate`, `atp` → `fructose-1-6-bisphosphate`, `adp` |
| **Educational purpose** | Major committed and rate-controlling step; allosteric regulation point |

#### Reaction 4 - Aldolase

| Field | Value |
|---|---|
| **Step** | 4 |
| **Phase** | Energy Investment |
| **Enzyme** | Aldolase (EC 4.1.2.13) |
| **Substrate(s)** | Fructose-1,6-bisphosphate |
| **Product(s)** | DHAP + Glyceraldehyde-3-phosphate (G3P) |
| **Reversibility** | Reversible |
| **ATP change** | 0 |
| **NADH change** | 0 |
| **Reaction type** | Aldol cleavage |
| **Equation (as displayed)** | `Fructose-1,6-bisphosphate ⇌ DHAP + G3P` |
| **Molecular assets** | `fructose-1-6-bisphosphate` → `dhap`, `glyceraldehyde-3-phosphate` |
| **Educational purpose** | Key cleavage: 6C → two 3C molecules; only G3P continues directly |

#### Reaction 5 - Triose Phosphate Isomerase

| Field | Value |
|---|---|
| **Step** | 5 |
| **Phase** | Energy Investment |
| **Enzyme** | Triose phosphate isomerase (EC 5.3.1.1) |
| **Substrate(s)** | DHAP |
| **Product(s)** | G3P |
| **Reversibility** | Reversible |
| **ATP change** | 0 |
| **NADH change** | 0 |
| **Reaction type** | Triose phosphate isomerization |
| **Equation (as displayed)** | `DHAP ⇌ G3P` |
| **Molecular assets** | `dhap` → `glyceraldehyde-3-phosphate` |
| **Educational purpose** | Completes investment phase; from here every reaction occurs twice per glucose |

#### Reaction 6 - Glyceraldehyde-3-Phosphate Dehydrogenase

| Field | Value |
|---|---|
| **Step** | 6 |
| **Phase** | Energy Payoff |
| **Enzyme** | Glyceraldehyde-3-phosphate dehydrogenase (EC 1.2.1.12) |
| **Substrate(s)** | G3P + NAD⁺ + Pᵢ |
| **Product(s)** | 1,3-Bisphosphoglycerate + NADH + H⁺ |
| **Reversibility** | Reversible |
| **ATP change** | 0 |
| **NADH change** | +1 (per G3P; +2 per glucose) |
| **Reaction type** | Oxidation coupled to phosphorylation |
| **Equation (as displayed)** | `G3P + Pi + NAD⁺ ⇌ 1,3-BPG + NADH + H⁺` |
| **Molecular assets** | `glyceraldehyde-3-phosphate`, `nad-plus` → `1-3-bisphosphoglycerate`, `nadh` |
| **Educational purpose** | Only oxidation step; NAD⁺ → NADH; inorganic Pᵢ incorporated without ATP |

#### Reaction 7 - Phosphoglycerate Kinase

| Field | Value |
|---|---|
| **Step** | 7 |
| **Phase** | Energy Payoff |
| **Enzyme** | Phosphoglycerate kinase (EC 2.7.2.3) |
| **Substrate(s)** | 1,3-BPG + ADP |
| **Product(s)** | 3-Phosphoglycerate + ATP |
| **Reversibility** | Reversible |
| **ATP change** | +1 (per 1,3-BPG; +2 per glucose) |
| **NADH change** | 0 |
| **Reaction type** | Substrate-level phosphorylation |
| **Equation (as displayed)** | `1,3-BPG + ADP ⇌ 3-Phosphoglycerate + ATP` |
| **Molecular assets** | `1-3-bisphosphoglycerate`, `adp` → `3-phosphoglycerate`, `atp` |
| **Educational purpose** | First substrate-level phosphorylation; begins repaying ATP investment |

#### Reaction 8 - Phosphoglycerate Mutase

| Field | Value |
|---|---|
| **Step** | 8 |
| **Phase** | Energy Payoff |
| **Enzyme** | Phosphoglycerate mutase (EC 5.4.2.11) |
| **Substrate(s)** | 3-Phosphoglycerate |
| **Product(s)** | 2-Phosphoglycerate |
| **Reversibility** | Reversible |
| **ATP change** | 0 |
| **NADH change** | 0 |
| **Reaction type** | Intramolecular phosphate transfer |
| **Equation (as displayed)** | `3-Phosphoglycerate ⇌ 2-Phosphoglycerate` |
| **Molecular assets** | `3-phosphoglycerate` → `2-phosphoglycerate` |
| **Educational purpose** | Repositions phosphate from C3 to C2; prepares for dehydration |

#### Reaction 9 - Enolase

| Field | Value |
|---|---|
| **Step** | 9 |
| **Phase** | Energy Payoff |
| **Enzyme** | Enolase (EC 4.2.1.11) |
| **Substrate(s)** | 2-Phosphoglycerate |
| **Product(s)** | Phosphoenolpyruvate (PEP) + H₂O |
| **Reversibility** | Reversible; requires Mg²⁺ |
| **ATP change** | 0 |
| **NADH change** | 0 |
| **Reaction type** | Dehydration |
| **Equation (as displayed)** | `2-Phosphoglycerate ⇌ PEP + H₂O` |
| **Molecular assets** | `2-phosphoglycerate` → `phosphoenolpyruvate` |
| **Educational purpose** | Creates high-energy enol phosphate (PEP) via dehydration |

#### Reaction 10 - Pyruvate Kinase

| Field | Value |
|---|---|
| **Step** | 10 |
| **Phase** | Energy Payoff |
| **Enzyme** | Pyruvate kinase (EC 2.7.1.40) |
| **Substrate(s)** | PEP + ADP |
| **Product(s)** | Pyruvate + ATP |
| **Reversibility** | Strongly irreversible |
| **ATP change** | +1 (per PEP; +2 per glucose) |
| **NADH change** | 0 |
| **Reaction type** | Substrate-level phosphorylation |
| **Equation (as displayed)** | `PEP + ADP → Pyruvate + ATP` |
| **Molecular assets** | `phosphoenolpyruvate`, `adp` → `pyruvate`, `atp` |
| **Educational purpose** | Final ATP-producing step; tautomerization of enol pyruvate drives reaction forward |

---

## 4. Stoichiometry and Accounting

### Per-Glucose Accounting

| Species | Consumed | Produced | Net |
|---|---|---|---|
| Glucose | 1 | 0 | −1 |
| ATP | 2 | 4 | **+2** |
| NAD⁺ | 2 | 0 | −2 |
| NADH | 0 | 2 | **+2** |
| Pyruvate | 0 | 2 | **+2** |
| Pᵢ | 0 | 0 | (incorporated in reaction 6; recycled) |
| H⁺ | 0 | 2 | +2 |
| H₂O | 0 | 2 | +2 |

### Overall Equation (as displayed by the website)

```
Glucose + 2 NAD⁺ + 2 ADP + 2 Pᵢ → 2 Pyruvate + 2 NADH + 2 H⁺ + 2 ATP + 2 H₂O
```

This exact equation is defined in `src/main.js` as the constant `NET_EQUATION`.

The story page displays the same equation in the `showOverallEquation()` function with an additional note: *"Exact proton and water terms vary between biochemical conventions. The key net products are 2 pyruvate, 2 ATP, and 2 NADH per glucose."*

### Why Two Three-Carbon Products

After the aldolase cleavage (reaction 4) and triose phosphate isomerization (reaction 5), one glucose yields **two molecules of glyceraldehyde-3-phosphate (G3P)**. From reaction 6 onward, every reaction occurs **twice per glucose**. This is why the payoff phase produces 4 ATP (2 per G3P × 2) and 2 NADH (1 per G3P × 2), but the investment phase consumed only 2 ATP, yielding a net of +2 ATP.

---

## 5. ATP and NADH Conceptual Model

### ATP Presentation

The website presents ATP as the cell's central chemical energy-transfer molecule. The story page includes a dedicated ATP explanation scene (`atp-explain`) that explains:

- ATP = adenosine triphosphate (three phosphate groups)
- Cells use ATP to drive energetically unfavorable reactions
- In glycolysis, ATP donates phosphoryl groups to sugar intermediates (reactions 1, 3)
- This is distinct from general ATP hydrolysis

The story page displays the general ATP hydrolysis concept:
```
ATP + H₂O → ADP + Pᵢ (general ATP hydrolysis concept, not a glycolysis reaction)
```

This is explicitly labeled as a general concept, **not** one of the ten glycolytic reactions. The actual glycolytic ATP-consuming reactions are reaction 1 (hexokinase) and reaction 3 (PFK-1).

### NAD⁺/NADH Presentation

- NAD⁺ is presented as an oxidized electron carrier
- In reaction 6, NAD⁺ accepts electrons and is reduced to NADH
- NADH is a reduced electron carrier carrying high-energy electrons
- NAD⁺ must be regenerated for glycolysis to continue
- Under aerobic conditions: NADH contributes electrons to mitochondrial respiration
- Under anaerobic conditions: fermentation regenerates NAD⁺

### Substrate-Level Phosphorylation

Reactions 7 and 10 produce ATP by direct phosphoryl-group transfer from metabolic intermediates (1,3-BPG and PEP) to ADP. This is explicitly distinguished from oxidative phosphorylation.

---

## 6. Complete Molecular Asset Catalog

All 15 molecular assets with verified data from the actual codebase:

| # | Internal Key | Display Name (main.js) | Display Name (story.js) | Formula | PubChem CID | SDF Path | Pathway Role |
|---|---|---|---|---|---|---|---|
| 1 | `glucose` | β-D-glucopyranose | β-D-Glucopyranose | C₆H₁₂O₆ | 64689 | `molecules/glucose/glucose.sdf` | Substrate |
| 2 | `glucose-6-phosphate` | β-D-glucose 6-phosphate(2−) | Glucose-6-phosphate | C₆H₁₁O₉P²⁻ | 21604865 | `molecules/glucose-6-phosphate/glucose-6-phosphate.sdf` | Phase I intermediate |
| 3 | `fructose-6-phosphate` | β-D-fructofuranose 6-phosphate(2−) | Fructose-6-phosphate | C₆H₁₁O₉P²⁻ | 21604863 | `molecules/fructose-6-phosphate/fructose-6-phosphate.sdf` | Phase I intermediate |
| 4 | `fructose-1-6-bisphosphate` | D-fructose-1,6-bisphosphate | Fructose-1,6-bisphosphate | C₆H₁₄O₁₂P₂ | 172313 | `molecules/fructose-1-6-bisphosphate/fructose-1-6-bisphosphate.sdf` | Phase I intermediate |
| 5 | `dhap` | Dihydroxyacetone phosphate | DHAP | C₃H₇O₆P | 668 | `molecules/dhap/dhap.sdf` | Phase I product |
| 6 | `glyceraldehyde-3-phosphate` | D-glyceraldehyde 3-phosphate(2−) | Glyceraldehyde-3-P | C₃H₅O₆P²⁻ | 24794350 | `molecules/glyceraldehyde-3-phosphate/glyceraldehyde-3-phosphate.sdf` | Phase I→II transition |
| 7 | `1-3-bisphosphoglycerate` | D-1,3-bisphosphoglycerate | 1,3-Bisphosphoglycerate | C₃H₆O₁₀P₂²⁻ | 44472828 | `molecules/1-3-bisphosphoglycerate/1-3-bisphosphoglycerate.sdf` | Phase II intermediate |
| 8 | `3-phosphoglycerate` | 3-phosphoglycerate | 3-Phosphoglycerate | C₃H₇O₇P | 724 | `molecules/3-phosphoglycerate/3-phosphoglycerate.sdf` | Phase II intermediate |
| 9 | `2-phosphoglycerate` | 2-phosphoglycerate | 2-Phosphoglycerate | C₃H₇O₇P | 59 | `molecules/2-phosphoglycerate/2-phosphoglycerate.sdf` | Phase II intermediate |
| 10 | `phosphoenolpyruvate` | Phosphoenolpyruvate | Phosphoenolpyruvate | C₃H₅O₆P | 1005 | `molecules/phosphoenolpyruvate/phosphoenolpyruvate.sdf` | Phase II intermediate |
| 11 | `pyruvate` | Pyruvate(−) | Pyruvate | C₃H₃O₃⁻ | 107735 | `molecules/pyruvate/pyruvate.sdf` | Product |
| 12 | `atp` | ATP(4−) | ATP | C₁₀H₁₂N₅O₁₃P₃⁴⁻ | 5461108 | `molecules/atp/atp.sdf` | Cofactor |
| 13 | `adp` | ADP(3−) | ADP | C₁₀H₁₂N₅O₁₀P₂³⁻ | 7058055 | `molecules/adp/adp.sdf` | Cofactor |
| 14 | `nad-plus` | β-NAD⁺ | β-NAD⁺ | C₂₁H₂₇N₇O₁₄P₂⁺ | 925 | `molecules/nad-plus/nad-plus.sdf` | Cofactor |
| 15 | `nadh` | NADH | NADH | C₂₁H₂₉N₇O₁₄P₂ | 439153 | `molecules/nadh/nadh.sdf` | Cofactor |

### Key Naming Differences Between Pages

The landing page `MOLECULES` array in `src/viewer.js` uses long-form display names (e.g., "β-D-glucopyranose"). The `main.js` `MOLECULE_ASSETS` array (retained extension base, not loaded by any page) uses the same long-form names and adds CIDs. The `story.js` `MOL` object uses compact display names (e.g., "Glucose-6-phosphate" instead of "β-D-glucose 6-phosphate(2−)") and adds a `desc` field for screen readers. All three reference the **same SDF files** and **same PubChem CIDs**.

### Molecular Representation

- **Rendering:** Ball-and-stick
- **Color scheme:** Jmol/CPK
- **Hydrogen default:** Hidden (heavy atoms only)
- **Hydrogen toggle:** Optional H spheres visible
- **Ionic state:** Represented in formula (e.g., 2−, 4−, +) - these are representative physiological forms
- **Source-of-truth:** PubChem 3D conformer SDF records

---

## 7. Molecular Source-of-Truth Policy

### Scientific Molecular Data (Authoritative)

The following properties are determined by the SDF files and must not be altered by UI code:

- Atomic coordinates (x, y, z positions)
- Atom identities (element symbols)
- Bond connectivity
- Stereochemistry
- Molecular identity
- Ionic state (as encoded in the SDF)

### Rendering Metadata (Not Authoritative for Chemistry)

The following are UI/rendering concerns and do not change chemical structure:

- Atom colors (Jmol/CPK colorscheme)
- Sphere scales (C: 0.28, O: 0.32, N: 0.30, P: 0.36, H: 0.22)
- Stick radii (C/O/N: 0.07, P: 0.08, H: 0.06)
- Background color (`0x07090c` on main, `0x090B0F` on story)
- Camera zoom, rotation, spin
- Visibility (hydrogen toggle)
- UI labels, transitions, overlays

### Consequences

- **Changing an SDF file** changes the actual molecular structure - this is a scientific change requiring review
- **Changing rendering metadata** changes visual appearance only - this is a cosmetic change
- **Never** describe renderer configuration changes as if they change chemical structure
- **Never** use AI-generated molecular coordinates to replace validated PubChem structures

---

## 8. 3Dmol.js Architecture

| Property | Value |
|---|---|
| **Library** | 3Dmol.js |
| **Version** | Not explicitly pinned; local minified copy |
| **Local path** | `vendor/3dmol/3Dmol-min.js` |
| **Loaded by** | Main page (`<script src="vendor/3dmol/3Dmol-min.js">`), Story page (`<script src="../vendor/3dmol/3Dmol-min.js">`) |
| **Global** | `$3Dmol` |

### Viewer Initialization

**Main page (`init` in `src/viewer.js`):**
```javascript
viewer = $3Dmol.createViewer(container, { backgroundColor: 0x050709, antialias: true, disableFog: true });
```

**Main page (`MolViewer` in `src/main.js`, retained extension base not loaded by any page):**
```javascript
const viewer = $3Dmol.createViewer(container, {
  backgroundColor: 0x090B0F,
  antialias: true,
  disableFog: true
});
```

**Story page:**
```javascript
viewer = $3Dmol.createViewer('molViewer', {
  backgroundColor: BG,
  antialias: true,
  disableFog: true
});
```

### SDF Loading

SDF files are loaded via `fetch()` from relative paths, then parsed by 3Dmol:
```javascript
viewer.addModel(sdfText, 'sdf');
```

### Style Configuration

All three viewers use identical atom styling:

| Element | Sphere Scale | Stick Radius | Colorscheme |
|---|---|---|---|
| C | 0.28 | 0.07 | Jmol |
| O | 0.32 | 0.07 | Jmol |
| N | 0.30 | 0.07 | Jmol |
| P | 0.36 | 0.08 | Jmol |
| H (shown) | 0.22 | 0.06 | Jmol |
| H (hidden) | - | - | `{hidden: true}` |

### Rotation

Rotation uses `viewer.spin('y', 0.25)` for auto-rotation and `viewer.spin(false)` to stop. This is a 3Dmol.js built-in feature.

### Caching

SDF text is cached in memory:
- Main page (`src/viewer.js`): `sdfCache` object with in-flight dedup via `sdfPending`
- Main page `MolViewer` (`src/main.js`): `MolViewer.sdfCache` object (retained extension base)
- Story page: `sdfCache` object with in-flight dedup via `sdfLoading` and failure retry

Once loaded, SDF text is never re-fetched. A failed fetch is retried on the next request on the story page and on the landing page.

### Error Handling

If 3Dmol.js fails to load:
- Main page (`src/viewer.js`): shows "Molecular renderer unavailable." in the container with `role="alert"`
- Main page `MolViewer` (extension base): shows error message in container
- Story page: `initViewer()` catches exception and sets `viewer = null`

If SDF fails to load:
- Main page (`src/viewer.js`): resolves `null`; `display()` keeps the previous molecule
- Main page `MolViewer` (extension base): returns `false`, shows error in container
- Story page: shows `#molFallback` overlay with molecule info; documentary continues

---

## 9. Complete Project File Map

```
├── index.html                   Landing page (HTML structure; external CSS/JS + inline hero SVG)
├── privacy.html                 Privacy policy
├── terms.html                   Terms of use
├── accessibility.html           Accessibility statement
├── sitemap.xml                  XML sitemap
├── robots.txt                   Robots directives
├── src/
│   ├── viewer.js                3Dmol viewer wrapper + molecule data (MOLECULES array)
│   ├── init.js                  DOM wiring: grid builder, controls, keyboard nav
│   └── main.js                  Full pathway page JS (retained extension base; not loaded)
├── styles/
│   ├── landing.css              Landing page styles
│   ├── legal.css                Shared legal page styles
│   └── main.css                 Full pathway page CSS (retained extension base; not loaded)
├── story/
│   ├── index.html               Interactive story HTML
│   ├── story.js                 Story JavaScript (IIFE, scenes, narration, viewer, quiz, results, email)
│   ├── story.css                Story CSS (cinematic fullscreen layout, quiz, results, email)
│   └── questions.js             Quiz question data module
├── molecules/                   15 canonical SDF molecular assets
│   ├── glucose/glucose.sdf
│   ├── glucose-6-phosphate/glucose-6-phosphate.sdf
│   ├── fructose-6-phosphate/fructose-6-phosphate.sdf
│   ├── fructose-1-6-bisphosphate/fructose-1-6-bisphosphate.sdf
│   ├── dhap/dhap.sdf
│   ├── glyceraldehyde-3-phosphate/glyceraldehyde-3-phosphate.sdf
│   ├── 1-3-bisphosphoglycerate/1-3-bisphosphoglycerate.sdf
│   ├── 3-phosphoglycerate/3-phosphoglycerate.sdf
│   ├── 2-phosphoglycerate/2-phosphoglycerate.sdf
│   ├── phosphoenolpyruvate/phosphoenolpyruvate.sdf
│   ├── pyruvate/pyruvate.sdf
│   ├── atp/atp.sdf
│   ├── adp/adp.sdf
│   ├── nad-plus/nad-plus.sdf
│   └── nadh/nadh.sdf
├── vendor/
│   └── 3dmol/
│       └── 3Dmol-min.js         Shared 3Dmol.js library (single canonical copy)
├── public/                    Deployed static copy served by the Worker
├── verify.html                Teacher verification page source
├── worker/
│   ├── index.js               Worker API and asset routing
│   └── SETUP.md               Deployment and verification setup
└── docs/
    ├── project.md               Human-facing project architecture doc
    ├── story-page.md            Story-specific documentation
    └── MASTER.md                This file - canonical AI-facing reference
```

### File Ownership

| File | Purpose | Type |
|---|---|---|
| `index.html` | Landing page with 3D molecular viewer | Production |
| `src/viewer.js` | 3Dmol viewer wrapper + molecule data (MOLECULES array) | Production |
| `src/init.js` | DOM wiring: grid builder, controls, keyboard nav | Production |
| `src/main.js` | Full pathway page JS (`MolViewer`, `App`, `PATHWAY_STEPS`) - retained extension base, not loaded by any page | Extension base |
| `styles/landing.css` | Landing page styles | Production |
| `styles/legal.css` | Shared legal page styles | Production |
| `styles/main.css` | Full pathway page CSS design system - retained extension base, not loaded by any page | Extension base |
| `story/index.html` | Interactive story page | Production |
| `story/story.js` | Story JavaScript (IIFE, `scenes`, narration, viewer, quiz, results, download, mailto) | Source |
| `story/story.css` | Story CSS (cinematic fullscreen, quiz, results, email, download) | Source |
| `story/questions.js` | Quiz question data module | Production |
| `molecules/**/*.sdf` | Canonical molecular geometry data | Production data |
| `vendor/3dmol/3Dmol-min.js` | 3Dmol.js molecular renderer | Vendor |
| `docs/project.md` | Project architecture documentation | Documentation |
| `docs/story-page.md` | Story-specific documentation | Documentation |
| `docs/MASTER.md` | This file | Documentation |
| `public/` | Deployed static copy served by the Worker | Deployment |
| `verify.html` | Teacher verification page source | Source |
| `worker/index.js` | Signed-result API and asset routing | Production |
| `worker/SETUP.md` | Deployment and verification setup | Documentation |
| `quarantine/glycolysis_story.html` | Pre-extraction single-file story - referenced by earlier revisions, not present in the current tree | Historical |
| `glycolysis_molecular_asset_pack/` | Asset download/management tooling - referenced by earlier revisions, not present in the current tree | Tooling |

---

## 10. Main Page Implementation

### Files

- `index.html` - HTML structure with external `styles/landing.css`, `vendor/3dmol/3Dmol-min.js`, `src/viewer.js`, and `src/init.js` (plus an inline decorative hero SVG)
- `src/viewer.js` - `GlycolysisViewer` module: `MOLECULES` data, SDF fetch/cache, viewer lifecycle, style application
- `src/init.js` - DOM wiring: grid builder, control buttons, radiogroup semantics, keyboard navigation
- `styles/landing.css` - Design system, component styles, responsive rules

`src/main.js` and `styles/main.css` are a retained extension base for a scrollable pathway page; they are not loaded by any page and reference DOM (`#reactionScenes`, `#pathwayNav`) that no page provides.

### HTML Structure

```
<body>
  <a class="skip-link">          Skip to viewer → #viewerSection
  <section class="hero">         Full-viewport hero with decorative molecule SVG
    <div class="hero-molecule">  Decorative molecule SVG
    <div class="hero-content">   Title, lede, story CTA link, scroll cue
  <section id="viewerSection">   Viewer section (skip-link target)
    <div class="viewer-inner">
      <div class="viewer-sidebar"> Heading + subtitle
        <div id="molGrid">       15 molecule radio buttons (built by init.js)
      <div class="viewer-main">
        <div class="viewer-canvas-wrap">
          <div id="viewerInfo">   aria-live info bar (placeholder/name/formula)
          <div id="viewer3d">     3Dmol canvas
          <div class="mol-legend"> Atom color legend
          <div class="viewer-controls"> AUTO / H / RESET buttons
  <footer class="site-footer">   Brand, explore/legal/about links, copyright
```

### Data Architecture

- `MOLECULES` array (`src/viewer.js`): 15 molecule definitions with `key`, `name`, `formula`, `category` (complete asset library)
- `CURATED` array (`src/viewer.js`): 9 key molecule definitions for the homepage viewer (glucose, G6P, FBP, G3P, NAD+, NADH, ATP, ADP, pyruvate)
- `MOLECULE_ASSETS` array (`src/main.js`, extension base): 15 molecule definitions with `key`, `name`, `formula`, `cid`
- `PATHWAY_STEPS` array (`src/main.js`, extension base): 10 reaction definitions with enzyme, equation, explanation, molecules
- `NET_EQUATION` string (`src/main.js`, extension base): Overall glycolysis equation

### Visualization Architecture

- Single `$3Dmol.createViewer` instance created lazily on first molecule selection (`V.init('viewer3d')`)
- SDF fetched on demand, cached in `sdfCache` with in-flight dedup via `sdfPending`
- `applyStyle()` configures CPK ball-and-stick rendering
- `display(key)` removes all models, adds the new model, applies style, zooms, renders
- `selectMolecule(key)` (init.js) orchestrates viewer init, radiogroup state, info bar, and display

### State Management

- `currentKey`: Currently displayed molecule key (viewer.js)
- `autoRotate`: Boolean, auto-rotation state (viewer.js)
- `showHydrogens`: Boolean, hydrogen visibility (viewer.js)
- `reducedMotion`: Boolean from `prefers-reduced-motion` (viewer.js)
- `sdfCache` / `sdfPending`: SDF text cache and in-flight fetch dedup (viewer.js)
- `initialized`: Whether the viewer has been created (init.js)
- No scene state (landing page is not scene-based)

### Event Handling

- Molecule button clicks → `selectMolecule(key)`
- Grid keyboard navigation (Arrow keys, j/k, Home, End) with roving tabindex
- Button clicks: rotate toggle, hydrogen toggle, reset view

---

## 11. Story Page Implementation

### Files

- `story/index.html` - HTML structure, references `story.css` and `story.js`
- `story/story.js` - IIFE containing all story logic
- `story/story.css` - Fullscreen cinematic layout

### Page Architecture

The story page is a **single fullscreen cinematic experience**. The entire `<body>` is the documentary container. There is no scrolling - scenes transition via fade overlays and molecular model changes. The story now includes quiz checkpoints, a results screen, signed downloadable results, verification, and local email-app composition.

### DOM Structure

```
<body>
  <a class="skip-link">           Skip to main content → #mainContent
  <div id="srLive">               aria-live="polite" narrative announcements
  <div id="srMolDesc">            role="img" dynamic molecule description
  <div id="loadingScreen">        Full-screen loading overlay
  <div id="mainContent">
    <div id="viewport">           Fullscreen 3Dmol container
      <div id="molViewer">        3Dmol canvas
    <div id="molFade">            Molecule transition fade overlay
    <div id="molFallback">        Fallback when molecule fails to load
    <canvas id="atmosphere">      2D canvas cell atmosphere animation
    <div id="fadeOverlay">        Phase-transition fade overlay
    <div id="sceneLabel">         Phase label (top-left)
    <div id="stepCounter">        Reaction counter (top-right)
    <div id="molLabel">           Molecule name + formula (top-center)
    <div id="narrationControls">  VIEWER link + NARRATION toggle
    <div id="enzymeLabel">        Enzyme name + reaction (left-center)
    <div id="viewerToolbar">      AUTO / H / RESET buttons
    <div id="deepDetail">         Deeper-detail caption text
    <div id="caption">            Main caption text
    <div id="sceneControls">      Countdown + BACK/STAY/NEXT buttons
    <div id="accounting">         ATP/NADH accounting display
    <div id="overallEquation">    Overall glycolysis equation
    <div id="legend">             Atom color legend
    <div id="molecularCaveat">    "Representative ionic form" note
    <div id="loadingIndicator">   "preparing molecular structure" text
```

### Scene Data Model

Each scene in the `scenes` array has:

| Property | Type | Purpose |
|---|---|---|
| `id` | string | Unique scene identifier |
| `phase` | string | `intro`, `investment`, `payoff`, `accounting`, `downstream`, `finale` |
| `molecule` | string|null | Key from `MOL` object, or null |
| `camera` | object|null | `{zoom, spin, speed}` or null |
| `captions` | array | `[{text, duration, deep}]` |
| `enzyme` | string|null | Enzyme name for reaction scenes |
| `reaction` | string|null | Reaction equation string |
| `reactionNumber` | number|null | Step number (1–10) |
| `perReaction` | object|null | `{ATP, NADH}` changes per reaction |
| `timesPerGlucose` | number | How many times this reaction occurs per glucose |
| `accounting` | object|null | `{invested, produced, nadh, showNet}` |
| `atmosphere` | string|null | `'cell'`, `'approach'`, `'membrane'`, `'cytosol'` |
| `preloads` | array|null | Molecule keys to preload |
| `autoAdvanceDelay` | number | ms before auto-advance (default 5000) |
| `showEquation` | boolean | Whether to show overall equation |
| `fadeToBlack` | boolean | Whether to fade to black at end |

### Scene Transitions

`transitionToScene(index, immediate)` orchestrates:
1. Guard against concurrent transitions (`transitioning` flag)
2. Increment `sceneToken` to invalidate stale operations
3. Cancel countdown, clear captions, stop narration
4. Phase-change detection → fade overlay if needed
5. Update UI labels (phase, step counter, molecule, enzyme)
6. Show/hide accounting, equation, atmosphere
7. Load molecule via `showMolecule()` (with `molTransitionSeq` protection)
8. Apply camera config (zoom, spin)
9. Show/hide UI elements (molLabel, legend, viewerToolbar, etc.)
10. Start caption/narration sequence (with `narrationSeqToken` protection)
11. After captions complete → show scene controls → start countdown → auto-advance

### Auto-Advance

After all captions for a scene finish playing, a countdown timer starts (default 5 seconds). The countdown is displayed as "NEXT SCENE IN X". When it reaches 0, the next scene loads automatically. The user can:
- Press **STAY** to cancel auto-advance
- Press **NEXT** to skip ahead immediately
- Press **BACK** to go to the previous scene

### Quiz System

Quiz checkpoints appear after certain story beats. When a quiz triggers:
1. Narration stops; auto-advance pauses
2. A quiz overlay appears with the question and 4 options
3. The learner selects an answer
4. The answer locks; correct/incorrect state is shown
5. An explanation is displayed
6. The learner clicks CONTINUE to return to the story

Quiz data is loaded from `story/questions.js` (external data module). Quiz rendering logic is in `story/story.js`.

### Results Screen

After the final beat, a results screen shows:
- Score (e.g., 4 / 5)
- Percentage (e.g., 80%)
- Question-by-question review with learner's answer, correct answer, and explanation
- Actions: REVIEW STORY, REVIEW QUESTIONS, DOWNLOAD RESULTS, EMAIL RESULTS TO TEACHER

### Teacher Email

A required email form collects teacher name, teacher email, and student name. The form:
- Validates all inputs (trimmed, length-limited, email format, all required)
- Uses textContent for DOM insertion (no innerHTML for user input)
- Sanitizes input (control characters stripped, length-limited to 200 chars)
- Opens the student's local email app with a prefilled `mailto:` message after creating a signed result
- Handles errors gracefully

The message includes the score, completion date, answer summary, verification code, and verification link. The student may attach the downloaded HTML report manually. No email provider is required.

### Anti-Cheat System

The Worker creates signed result records to prevent edited scores from appearing valid:

1. The browser submits answer indexes and a student name to `/api/create-result`
2. The Worker computes correctness from its fixed answer key
3. The Worker signs the result with `RESULT_SIGNING_SECRET` and stores it in `QUIZ_SESSION_KV`
4. `/api/verify-result` recomputes the signature before returning a valid record
5. Result creation and verification have separate KV-backed rate limits
6. Result records expire after one year

The downloaded HTML and mailto message are editable presentation copies. The online verification record is authoritative. This system verifies result integrity, but does not prove who completed the quiz because result creation is a public browser API.

### Tab Change Detection

The quiz monitors browser tab focus to detect cheating:

1. Before the story begins, a "Quiz Integrity Notice" overlay explains the monitoring rules
2. When the student leaves the tab, a warning overlay appears with a live timer
3. When the student returns after 5+ seconds, a reason input modal appears
4. If the student is away for more than 5 minutes, the quiz auto-restarts from the beginning
5. All tab changes are logged with timestamps, duration, and reasons
6. The current mailto message includes the verification link, but does not send tab logs through a server email provider

This prevents:
- Looking up answers on another tab or window
- Using external resources during the quiz
- Leaving the quiz unattended for extended periods

### Result Security

- The signing secret never reaches the browser
- The score is calculated from the server's canonical answer key
- Verification returns only records with a valid signature
- Inputs are bounded and escaped before display

---

## 12. Complete Story Scene Catalog

**Total scenes: 10 conceptual beats**

| # | ID | Phase | Molecule | Atmosphere | Quiz | Purpose |
|---|---|---|---|---|---|---|
| 0 | `cell` | intro | - | cell | - | Every living cell needs energy |
| 1 | `cytosol` | intro | - | cytosol | - | Glycolysis in the cytosol; ten-reaction pathway |
| 2 | `glucose` | intro | glucose | - | Q1 | Glucose + ATP as energy-transfer molecule |
| 3 | `investment` | investment | g6p | - | Q2 | ATP investment; glucose → G6P → F6P → FBP |
| 4 | `split` | investment | fbp | - | Q3 | Six-carbon split into two three-carbon G3P |
| 5 | `nad-phase` | payoff | g3p | - | Q4 | NAD+ → NADH electron transfer |
| 6 | `payoff` | payoff | bpg13 | - | Q5 | ATP generation via substrate-level phosphorylation |
| 7 | `pyruvate` | accounting | pyruvate | - | - | Two pyruvate molecules formed |
| 8 | `accounting` | accounting | - | - | - | Net yield: 2 ATP, 2 NADH, 2 pyruvate |
| 9 | `finale` | finale | - | cytosol | - | Broader metabolic context; results screen |

---

## 13. Complete State Model

### Story Page State Variables

| Variable | File | Type | Purpose | Initial | Changed By | Depends On |
|---|---|---|---|---|---|---|
| `sceneToken` | `story.js` | number | Prevents stale scene transitions | `0` | `transitionToScene()` | - |
| `narrationSeqToken` | `story.js` | number | Prevents stale narration callbacks | `0` | `stopNarration()`, `playCaptions()` | - |
| `molTransitionSeq` | `story.js` | number | Prevents stale molecule transitions | `0` | `showMolecule()` | - |
| `firstSceneReady` | `story.js` | boolean | Loading screen dismissed | `false` | `transitionToScene(0)` | - |
| `currentSceneIndex` | `story.js` | number | Active scene index | `-1` | `transitionToScene()` | - |
| `transitioning` | `story.js` | boolean | Prevents concurrent transitions | `false` | `transitionToScene()` | - |
| `countdownTimer` | `story.js` | number|null | Auto-advance interval ID | `null` | `startCountdown()`, `cancelCountdown()` | - |
| `countdownValue` | `story.js` | number | Current countdown seconds | `0` | `startCountdown()` | - |
| `autoAdvanceActive` | `story.js` | boolean | Whether auto-advance is enabled | `true` | STAY button, `transitionToScene()` | - |
| `rotating` | `story.js` | boolean | Auto-rotation state | `true` | AUTO button, R key | - |
| `hydrogens` | `story.js` | boolean | Hydrogen visibility | `false` | H button, H key | - |
| `currentMolKey` | `story.js` | string|null | Currently displayed molecule key | `null` | `showMolecule()`, `clearMolecule()` | - |
| `narrationEnabled` | `story.js` | boolean | Narration on/off | `true` | NARRATION button, N key | - |
| `narrationVolume` | `story.js` | number | Narration volume | `0.8` | - | - |
| `currentUtterance` | `story.js` | SpeechSynthesisUtterance|null | Current speech utterance | `null` | `speakNarration()`, `stopNarration()` | - |
| `cachedVoice` | `story.js` | SpeechSynthesisVoice|null | Preferred narration voice | `null` | `pickNarratorVoice()` | - |
| `atmosphereState` | `story.js` | string|null | Atmosphere visualization state | `null` | `transitionToScene()` | - |
| `atmosphereTargetAlpha` | `story.js` | number | Target atmosphere opacity | `0` | `transitionToScene()` | - |
| `atmosphereAlpha` | `story.js` | number | Current atmosphere opacity | `0` | `drawAtmosphere()` | - |
| `atmosphereAnimating` | `story.js` | boolean | Whether atmosphere animation is running | `false` | `startAtmosphereAnimation()` | - |
| `particles` | `story.js` | array | Atmosphere particle positions | `[]` | `initParticles()` | - |
| `sdfCache` | `story.js` | object | Cached SDF text by key | `{}` | `loadSDF()` | - |
| `sdfLoading` | `story.js` | object | In-flight SDF fetch promises | `{}` | `loadSDF()` | - |
| `sdfFailed` | `story.js` | object | Keys whose last fetch failed (skipped by `preload()` to avoid retry loops; explicit `showMolecule()` loads still retry) | `{}` | `loadSDF()` | - |
| `currentCaptionIndex` | `story.js` | number | Current caption in sequence | `-1` | `playCaptions()` | - |
| `captionsComplete` | `story.js` | boolean | All captions done | `false` | `playCaptions()`, `clearCaptions()` | - |
| `PREFERS_REDUCED` | `story.js` | boolean | Reduced motion preference | `matchMedia(...)` | - | Browser setting |
| `quizAnswers` | `story.js` | object | Quiz answers keyed by question ID | `{}` | `showQuiz()` | - |
| `quizLocked` | `story.js` | object | Whether each question answer is locked | `{}` | `showQuiz()` | - |
| `quizScore` | `story.js` | number | Number of correct answers | `0` | `showQuiz()` | - |
| `quizCompleted` | `story.js` | number | Number of questions answered | `0` | `showQuiz()` | - |
| `quizActive` | `story.js` | boolean | Whether quiz overlay is visible | `false` | `showQuiz()` | - |

### Main Page State Variables

| Variable | File | Type | Purpose |
|---|---|---|---|
| `currentKey` | `src/viewer.js` | string|null | Currently displayed molecule key |
| `autoRotate` | `src/viewer.js` | boolean | Auto-rotation on/off |
| `showHydrogens` | `src/viewer.js` | boolean | Hydrogen visibility |
| `reducedMotion` | `src/viewer.js` | boolean | Reduced motion preference |
| `sdfCache` | `src/viewer.js` | object | Cached SDF text |
| `sdfPending` | `src/viewer.js` | object | In-flight SDF fetch dedup |
| `initialized` | `src/init.js` | boolean | Whether the viewer has been created |
| `MolViewer.viewers` | `main.js` (extension base) | object | Viewer state keyed by container ID |
| `MolViewer.sdfCache` | `main.js` (extension base) | object | Cached SDF text |
| `MolViewer.reducedMotion` | `main.js` (extension base) | boolean | Reduced motion preference |
| `App.activeReaction` | `main.js` (extension base) | number | Active reaction index (for nav) |

---

## 14. Asynchronous Safety and Race Conditions

### 14.1 Scene Sequencing - `sceneToken`

**Purpose:** Prevents stale asynchronous scene operations from mutating current scene state.

**Mechanism:** Each call to `transitionToScene()` increments `sceneToken`. After any `await` point, the code checks `if (token !== sceneToken)` and aborts if the token has changed (meaning a newer scene transition has started).

**Failure mode without it:** If a user rapidly clicks NEXT, multiple `transitionToScene()` calls could interleave. A slow molecule load from scene 3 could overwrite the viewer state of scene 5.

**Protected operations:** Molecule loading, caption playback, countdown start, UI updates.

### 14.2 Molecule Transitions - `molTransitionSeq`

**Purpose:** Prevents stale delayed callbacks from modifying current molecule state.

**Mechanism:** Each call to `showMolecule()` increments `molTransitionSeq` and captures the value as `myMolSeq`. After any async step (fetch, fade-in timeout), the code checks `if (myMolSeq !== molTransitionSeq)` and aborts if the token has changed.

**Failure mode without it:** A slow SDF load for molecule A could complete after the user has already navigated to molecule B, overwriting B's rendering with A's data, or incorrectly resetting opacity/rotation.

**Protected operations:** Model loading, fade-in/out, style application, rotation start, `currentMolKey` update, `updateMolAria()`.

### 14.3 Narration - `narrationSeqToken`

**Purpose:** Prevents stale speech synthesis callbacks from affecting current narration.

**Mechanism:** Each call to `stopNarration()` or `playCaptions()` increments `narrationSeqToken`. The `speakNarration()` function receives the current `seq` value and checks it in `onend`, `onerror`, and catch blocks before invoking the `onEnd` callback.

**Failure mode without it:** If narration is stopped and restarted quickly, an `onend` callback from the old utterance could advance captions in the wrong scene, skip a caption, or trigger auto-advance at the wrong time.

**Protected operations:** Caption advancement, auto-advance trigger, UI state updates.

---

## 15. Narration System

### Web Speech API Usage

- API: `window.speechSynthesis` / `SpeechSynthesisUtterance`
- Rate: `0.88`
- Pitch: `1.0`
- Volume: `0.8`
- Language: `en-US`

### Voice Discovery

```javascript
const p = [
  'Google UK English Female',
  'Google UK English Male',
  'Samantha',
  'Karen',
  'Daniel',
  'Microsoft Zira',
  'Microsoft David'
];
```

The system iterates this preference list and picks the first voice whose `name` includes one of these strings. If none match, it falls back to the first English voice (`lang.startsWith('en')`). If no English voice is found, narration returns `null` and falls back to timed caption display.

### Voice Caching

`cachedVoice` stores the result of `pickNarratorVoice()`. It is recalculated when `speechSynthesis.onvoiceschanged` fires.

### Utterance Lifecycle

1. If an existing `currentUtterance` exists, `speechSynthesis.cancel()` is called
2. New `SpeechSynthesisUtterance` is created with the text
3. Voice, rate, pitch, volume, language are set
4. `onend` and `onerror` clear `currentUtterance` and invoke callback (with token check)
5. `speechSynthesis.speak(u)` is called in a try/catch

### Narration Toggle

- NARRATION button or N key toggles `narrationEnabled`
- When disabled: `stopNarration()` is called, captions advance by timed delay instead
- When re-enabled: subsequent scenes use speech narration

### Browser/OS Variability

- Voice availability varies significantly by browser and OS
- Some browsers may not have any English voices
- Speech synthesis may be unavailable entirely (falls back to timed captions)
- Rate/pitch/volume behavior varies by implementation

---

## 16. Accessibility Specification

### Semantic HTML

- `<main id="mainContent">` on the story page and legal pages; `<section id="viewerSection">` as the landing-page main region (landing page has no `<main>` wrapper - the viewer section carries `aria-labelledby`)
- `<section>` with `aria-labelledby` for major sections
- `<footer role="contentinfo">` on main page and legal pages
- `<h1>` for page title, `<h2>` for section headings
- Skip link: to `#viewerSection` on the landing page; to `#mainContent` on story and legal pages

### Landmarks

| Main Page | Story Page |
|---|---|
| `<section class="hero" aria-labelledby="hero-title">` | `<div id="mainContent" role="main">` |
| `<section id="viewerSection">` (skip-link target) | - |
| `<footer role="contentinfo">` | - |

### Heading Hierarchy

**Main page:** h1 (`#hero-title`) → h2 (`#viewer-heading`)
**Story page:** No heading hierarchy (cinematic fullscreen)

### ARIA Attributes

| Element | ARIA | Page |
|---|---|---|
| `#srLive` | `aria-live="polite"`, `aria-atomic="true"`, `role="status"` | Story |
| `#srMolDesc` | `role="img"` | Story |
| `#viewport` | `aria-label`, `aria-describedby="srMolDesc"` | Story |
| `#countdownText` | `role="timer"`, `aria-label` | Story |
| `.mol-btn` (radio buttons) | `role="radio"`, `aria-checked`, `aria-label`, roving `tabindex` | Main |
| `#molGrid` | `role="radiogroup"`, `aria-label` | Main |
| `#btnToggleSpin` / `#btnRotate` | `aria-pressed` | Main / Story |
| `#btnToggleH` / `#btnHydrogen` | `aria-pressed` | Main / Story |
| `#btnNarration` | `aria-pressed` | Story |
| `.viewer-controls` / `#viewerToolbar` / `#narrationControls` | `role="toolbar"`, `aria-label` | Main / Story |
| `.hero` | `aria-labelledby="hero-title"` | Main |
| `#viewer3d` / `#viewport` | `aria-label` | Main / Story |
| `.mol-legend` / `#legend` | `role="img"`, `aria-label` | Main / Story |
| `#loadingScreen` | `role="status"`, `aria-live="polite"`, `aria-label` | Story |
| `#narrationControls` | `role="toolbar"`, `aria-label` | Story |
| `.site-footer` | `role="contentinfo"` | Main |
| `#accounting` / `#overallEquation` | `aria-label` | Story |

### Keyboard Interaction

Both pages support full keyboard navigation (see Section 17).

### Touch Targets

Primary interactive controls provide minimum 44px touch targets (`min-height: 44px`): `.vc-btn`, `.mol-btn`, `.sctrl`, `.nar-btn`, `.back-link`, `.footer-mini a`. The story page auxiliary toolbar buttons (`.vtb`, about 32px tall) are keyboard-operable but below 44px; the molecular caveat is hidden on small screens.

### Reduced Motion

- `prefers-reduced-motion: reduce` detected via `window.matchMedia`
- CSS: All animations/transitions suppressed to `0.01ms`
- JS (main): `reducedMotion` flag in `src/viewer.js`; auto-rotation defaults off and spin is never started
- JS (story): `PREFERS_REDUCED` flag; particles reduced (20 vs 60); transition waits capped at 50ms; fade transitions suppressed

### Screen-Reader Behavior

- Main page: `#viewerInfo` (`aria-live="polite"`) presents the selected molecule name and formula; radio buttons announce selection via `aria-checked`
- Story page: `#srLive` announces captions as they appear
- Story page: `#srMolDesc` provides detailed molecule description for 3D viewer

### Contrast

- Primary text: `#F3F5F7` on `#090B0F` - high contrast
- Accent: `#D7FF5F` on `#090B0F` - high contrast
- Muted text: `#98A1AD` on `#090B0F` - meets 4.5:1 for normal text and is the minimum-contrast color used for UI text
- Story `--faint` token is aliased to `#98A1AD` so no story UI text falls below 4.5:1

### Limitations

- Formal WCAG 2.2 AA conformance has **not** been verified by formal evaluation
- Story page has limited heading hierarchy (cinematic design)
- 3D molecular viewer is inherently visual; `#srMolDesc` provides text alternative
- Countdown timer uses `role="timer"` but not `aria-live` (intentional to avoid screen-reader spam)
- Story auxiliary toolbar buttons (`.vtb`) are below 44px touch-target guidance

---

## 17. Keyboard Interaction Reference

### Main Page

| Key | Action | Context |
|---|---|---|
| Tab | Enter molecule grid (focus lands on selected molecule) | Molecule grid |
| Arrow Right / Down / j | Next molecule (focus + select) | When focus is in molecule grid |
| Arrow Left / Up / k | Previous molecule (focus + select) | When focus is in molecule grid |
| Home | First molecule | When focus is in molecule grid |
| End | Last molecule | When focus is in molecule grid |
| Enter / Space | Activate focused molecule or button | Standard button activation |

The molecule grid is a radio group with roving tabindex: one button has `tabindex="0"`, the rest `tabindex="-1"`.

### Story Page

| Key | Action | Notes |
|---|---|---|
| Arrow Right | Next scene | Cancels countdown |
| Space | Next scene | Cancels countdown |
| Arrow Left | Previous scene | - |
| N | Toggle narration | Not with Ctrl/Meta/Alt |
| R | Toggle auto-rotation | Not with Ctrl/Meta/Alt |
| H | Toggle hydrogen atoms | Not with Ctrl/Meta/Alt |
| S | Stay on scene (cancel auto-advance) | Not with Ctrl/Meta/Alt |
| Escape | Stop narration | - |

**Exception:** Keyboard shortcuts are disabled when focus is inside `<input>` or `<textarea>` elements, and letter shortcuts are ignored when Ctrl, Meta, or Alt is held (story page check: `e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'`, plus `e.ctrlKey || e.metaKey || e.altKey` guards).

---

## 18. Responsive Design

### Main Page Breakpoints

| Breakpoint | Layout Changes |
|---|---|
| `≤ 1100px` | Narrower hero copy; smaller/quieter decorative molecule |
| `≤ 1023px` | Single-column viewer layout; 5-column molecule grid (no inner scroll) |
| `≤ 768px` | Reduced padding; 3-column molecule grid; smaller legend; single-column footer |
| `≤ 480px` | Smaller legend; stacked footer bottom; same 3-column molecule grid |
| `≤ 430px` | Compact hero spacing; decorative molecule hidden |

### Story Page Breakpoints

| Breakpoint | Changes |
|---|---|
| `> 768px` | Full layout |
| `≤ 768px` | Repositioned labels; smaller fonts; hidden molecular caveat; adjusted deep detail position |

### Safe-Area Handling

Story page uses `env(safe-area-inset-*)` for loading screen padding and scene controls bottom positioning.

---

## 19. Design System

### CSS Custom Properties

### CSS Custom Properties (active stylesheets)

| Token | Value | Stylesheet |
|---|---|---|
| `--bg` | `#050709` | landing.css, legal.css |
| `--bg` | `#090B0F` | story.css (and main.css, extension base) |
| `--text` | `#f2f3f4` | landing.css, legal.css |
| `--text` | `#F3F5F7` | story.css (and main.css, extension base) |
| `--muted` | `#a0a6ae` | landing.css, legal.css |
| `--muted` | `#98A1AD` | story.css |
| `--faint` | `#98A1AD` (aliased to `--muted` for contrast) | story.css |
| `--accent` | `#c6ff2e` | landing.css, legal.css |
| `--accent` | `#D7FF5F` | story.css (and main.css, extension base) |
| `--line` | `#252a2f` | landing.css, legal.css |
| `--border` | `rgba(255,255,255,0.08)` | story.css |
| `--radius` | `6px` | landing.css, legal.css |
| `--font` / `--display` | `'Inter'` / `'Space Grotesk','Inter'` | story.css |
| `--ease`, `--ease-out`, `--ease-in-out` | cubic-bezier curves | story.css |

### CSS Custom Properties (main.css, extension base - not loaded)

| Token | Value |
|---|---|
| `--bg-surface` | `#11151B` |
| `--bg-elevated` | `#1a1f28` |
| `--text-secondary` | `#98A1AD` |
| `--text-muted` | `#5A636E` |
| `--accent-dim` | `rgba(215,255,95,0.15)` |
| `--font-display` / `--font-body` / `--font-mono` | Inter / Inter / SF Mono stack |
| `--space-xs` … `--space-2xl` | 4 / 8 / 16 / 32 / 64 / 128 px |
| `--focus-ring` / `--focus-ring-offset` | `var(--accent)` / `3px` |
| `--radius-sm` / `--radius-md` / `--radius-lg` | 4 / 6 / 8 px |

### Typography

- **Body:** Inter, 300–700 weights, loaded from Google Fonts
- **Display (story):** Space Grotesk, 300–700 weights, loaded from Google Fonts
- **Mono:** SF Mono / Fira Code / Fira Mono / Roboto Mono

### Colors

- **Background:** Near-black (`#090B0F`)
- **Primary text:** Near-white (`#F3F5F7`)
- **Accent:** Acid green (`#D7FF5F`)
- **Muted:** Gray-blue (`#98A1AD`)
- **Borders:** White at 8–15% opacity

### Visual Philosophy

- **Cinematic:** Full-viewport scenes, fade transitions, atmospheric canvas
- **Scientific:** CPK atom colors, accurate molecular structures, PubChem data
- **Editorial:** Large typography, generous whitespace, restrained palette
- **Dark:** Near-black background throughout
- **Premium:** Subtle borders, backdrop blur, careful spacing
- **Non-cartoon:** No playful/childish visual elements
- **Non-generic dashboard:** Not a data-grid UI; immersive experience

---

## 20. Border-Radius and Visual-Consistency Rules

### Canonical Radius Values (active stylesheets)

| Component | Radius | Source |
|---|---|---|
| `--radius` (token) | `6px` | landing.css, legal.css |
| `.mol-btn` | `8px` | landing.css |
| `.story-link` | `var(--radius)` = 6px | landing.css |
| `.vc-btn` | `var(--radius)` = 6px | landing.css |
| `.viewer-canvas-wrap` | `10px` | landing.css |
| `.mol-legend` | `8px` | landing.css |
| `.sctrl` (story) | `6px` | story.css |
| `.vtb` (story) | `6px` | story.css |
| `.nar-btn` (story) | `6px` | story.css |
| `.skip-link` | `var(--radius)` = 6px | landing.css, legal.css (story keeps rectangular) |

The retained `styles/main.css` extension base defines `--radius-sm`/`--radius-md`/`--radius-lg` (4/6/8 px) for future pathway-page components.

---

## 21. SEO Specification

### Main Page (`index.html`)

| Element | Value | Status |
|---|---|---|
| `<title>` | `Glycolysis \| Interactive 3D Molecular Viewer` | Implemented |
| `<meta name="description">` | `An interactive molecular lecture exploring glycolysis from glucose to pyruvate.` | Implemented |
| `<link rel="canonical">` | `https://glycolysis-project.example/` | **Placeholder** - replace with production URL |
| `<meta name="google-site-verification">` | `REPLACE_WITH_GOOGLE_VERIFICATION_TOKEN` | **Placeholder** |
| `og:type` | `website` | Implemented |
| `og:title` | `Glycolysis \| Interactive 3D Molecular Viewer` | Implemented |
| `og:description` | `Explore glycolysis through an interactive 3D molecular viewer with all 15 pathway intermediates and cofactors.` | Implemented |
| `og:url` | `https://glycolysis-project.example/` | **Placeholder** - replace with production URL |
| `og:image` | not present | **Not configured** - no social preview image |
| `twitter:card` | `summary_large_image` | Implemented |
| `twitter:title` | `Glycolysis \| Interactive 3D Molecular Viewer` | Implemented |
| `twitter:description` | `Explore all 15 glycolysis intermediates and cofactors in interactive 3D.` | Implemented |
| `twitter:image` | `""` (empty) | **Not configured** |
| JSON-LD | `WebApplication` schema | Implemented |

### Story Page (`story/index.html`)

| Element | Value | Status |
|---|---|---|
| `<title>` | `Glycolysis \| An Interactive Molecular Journey` | Implemented |
| `<meta name="description">` | `Explore glycolysis through an interactive molecular journey from glucose to pyruvate, with clear explanations of ATP, NADH, enzymes, and the ten reactions of the pathway.` | Implemented |

### Not Yet Configured

- Production domain (canonical URL, OG URL, JSON-LD URL, robots.txt sitemap line, and sitemap.xml all use the `glycolysis-project.example` placeholder)
- Google Search Console verification (placeholder token)
- Production social preview image (no `og:image` tag present)
- Structured data on story page

**Important:** The Google Search Console verification token must come from Google Search Console and must never be fabricated. The `REPLACE_WITH_GOOGLE_VERIFICATION_TOKEN` placeholder must be replaced with the actual token at deployment time.

**Important:** Do not hard-code localhost as a production canonical URL. Do not invent production domains.

---

## 22. Legal and Attribution Model

### Copyright Footer

Main page footer:
```
© 2026 Glycolysis Interactive. Educational use only.
```

Legal pages footer:
```
© 2026 Glycolysis Interactive
```

### Scientific Attribution

- Molecular structures are sourced from **PubChem 3D conformer records** (NCBI/NLM/NIH)
- Each molecule's PubChem CID is documented in the codebase

### Third-Party Attribution

| Dependency | Attribution |
|---|---|
| 3Dmol.js | Open-source molecular viewer (3dmol.org) |
| Inter font | Google Fonts (SIL Open Font License) |
| Space Grotesk font | Google Fonts (SIL Open Font License) |
| PubChem | NCBI/NLM/NIH public database |

### Distinction

The **copyright notice** (legal ownership) is distinct from **scientific/data attribution** ( PubChem source acknowledgment). They are not combined into misleading wording.

---

## 23. Third-Party Dependencies

| Dependency | Version | Purpose | Local/Remote | License | Source |
|---|---|---|---|---|---|
| 3Dmol.js | Not pinned | 3D molecular WebGL renderer | Local (`vendor/3dmol/3Dmol-min.js`) | ISC | 3dmol.org |
| Inter | Variable weight | Body + display font | Remote (Google Fonts) | SIL OFL | fonts.google.com |
| Space Grotesk | Variable weight | Story display font | Remote (Google Fonts) | SIL OFL | fonts.google.com |

**No build tools, bundlers, package managers, or frameworks are used.** The project is plain HTML/CSS/JS.

---

## 24. Network and Offline Behavior

### External Resource Requests

| Resource | Path/URL | Purpose | Required? | Fallback |
|---|---|---|---|---|
| 3Dmol.js | `vendor/3dmol/3Dmol-min.js` | Molecular renderer | **Yes** - core functionality | Error message in viewer |
| Inter font | `fonts.googleapis.com` | Typography | No - system font fallback | `-apple-system, BlinkMacSystemFont, ...` |
| Space Grotesk font | `fonts.googleapis.com` | Story typography | No - falls back to Inter | Inter fallback chain |
| Molecular SDFs | `molecules/**/*.sdf` | Molecular geometry | **Yes** - for each molecule | `#molFallback` overlay (story) / previous molecule retained (main) |

### Offline Status

- **Partially offline:** The application works offline **only if** 3Dmol.js and all SDF files have been previously cached by the browser
- Fonts fall back to system fonts if unavailable
- The project is **not fully self-contained** due to Google Fonts dependency, but fonts are non-critical

---

## 25. Performance Architecture

### 3Dmol Loading

- 3Dmol.js is loaded synchronously via `<script>` tag
- No lazy loading or async loading of the library

### SDF Loading

- SDFs are loaded on demand via `fetch()`
- Cached in memory (`sdfCache` object) after first load, with in-flight dedup (`sdfPending` on the landing page, `sdfLoading` on the story page)
- Story page preloads upcoming molecules via `preload()` function
- Story preloads: `['glucose', 'atp', 'adp', 'g6p', 'f6p', 'fbp', 'dhap', 'g3p']` at init

### Rendering

- Single 3Dmol viewer instance per page
- `viewer.removeAllModels()` → `viewer.addModel()` → `applyStyle()` → `viewer.zoomTo()` → `viewer.render()`
- Auto-rotation via `viewer.spin('y', 0.25)`

### Visibility Handling

- `visibilitychange` event stops narration, atmosphere animation, and rotation when tab is hidden
- Resumes rotation when tab becomes visible (story page)

### Mobile Optimization

- `viewport-fit=cover` with safe-area insets (story page)
- `-webkit-tap-highlight-color: transparent` on interactive elements (story page)
- `touch-action: none` on 3D canvases so gestures rotate the molecule instead of scrolling
- Responsive grids sized for narrow viewports (3–5 columns for the molecule selector)

No localStorage is used by the current codebase.

### Expensive Operations

- SDF fetch + parse (network-bound, but cached)
- WebGL rendering (GPU-bound)
- Atmosphere canvas animation (CPU-bound, 60 particles at 60fps)
- Speech synthesis (OS-bound)

### Core Web Vitals

Not measured. Do not claim specific LCP/INP/CLS values.

---

## 26. Error and Fallback Model

### 3Dmol Unavailable

| Page | Behavior |
|---|---|
| Main (`src/viewer.js`) | Shows "Molecular renderer unavailable." in the container with `role="alert"`; buttons remain inert |
| Main (MolViewer, extension base) | Shows error message in container: "Molecular renderer unavailable. 3Dmol.js failed to load." |
| Story | `initViewer()` catches; `viewer = null`; all molecule operations become no-ops |

### SDF Unavailable / Malformed

| Page | Behavior |
|---|---|
| Main (`src/viewer.js`) | `loadSDF` resolves `null`; `display()` keeps the previously rendered molecule |
| Main (MolViewer, extension base) | Shows error in container: "Molecular structure unavailable / Could not load {key}" |
| Story | `#molFallback` overlay shows molecule name, formula, description; documentary continues with captions |

### Speech Synthesis Unavailable

| Behavior |
|---|
| Falls back to timed caption display using `c.duration` values |
| Narration button still functional (toggles between timed and speech modes) |

### No Suitable Voice

| Behavior |
|---|
| `pickNarratorVoice()` returns `null` |
| `speakNarration()` falls back to timed captions |

### Interrupted Narration

| Behavior |
|---|
| `speechSynthesis.cancel()` called on scene transition |
| `currentUtterance` cleared |
| `narrationSeqToken` incremented to invalidate stale callbacks |

### Visibility Changes

| Behavior |
|---|
| Narration stopped |
| Atmosphere animation paused |
| Rotation paused |
| Resumes when tab becomes visible |

---

## 27. Data Flow

### Molecular Data Flow (Main Page)

```
SDF file on disk
  → fetch("molecules/{key}/{key}.sdf")
    → sdfCache[key] = text
      → viewer.addModel(text, "sdf")
        → applyStyle() [CPK ball-and-stick]
          → viewer.zoomTo() → viewer.zoom(0.92)
            → viewer.render()
              → viewer.spin("y", 0.25) [if rotating]
                → WebGL canvas displayed
```

### Molecular Data Flow (Story Page)

```
SDF file on disk
  → fetch(mol.path)
    → sdfCache[key] = text
      → molTransitionSeq guard
        → molFade opacity → 1 (fade to bg)
          → viewer.removeAllModels()
            → viewer.addModel(text, "sdf")
              → applyStyle()
                → viewer.zoomTo() → viewer.zoom(0.92)
                  → viewer.render()
                    → setTimeout (300ms)
                      → molFade opacity → 0 (reveal molecule)
                        → viewer.spin("y", 0.25) [if rotating]
                          → currentMolKey = key
                            → updateMolAria(key)
```

### Story Scene Flow

```
transitionToScene(index)
  → sceneToken++ (invalidate stale ops)
  → cancel countdown, clear captions, stop narration
  → phase change? → fade overlay
  → update UI labels (phase, step, molecule, enzyme)
  → show/hide accounting, equation, atmosphere
  → showMolecule(molecule) [async, with molTransitionSeq guard]
  → transitionCamera(config)
  → show/hide UI elements
  → preload upcoming molecules
  → playCaptions(scene.captions) [async, with narrationSeqToken guard]
    → speakNarration(text) or setTimeout
      → caption complete → next caption or onDone
        → onDone: show scene controls → start countdown → auto-advance
```

---

## 28. Main ↔ Story Navigation

### Main → Story

1. **Hero CTA:** `<a href="story/index.html" class="story-link">Enter the Story</a>`

### Story → Main

1. **Navigation controls:** HOME button (`#btnHome`) links to `../index.html`

### Footer

The main page footer contains legal/informational links only. It does NOT include a Story link - the hero CTA serves as the primary story entry point.

### Path Resolution

- Main page to story: `story/index.html` (relative)
- Story page to main: `../index.html` (relative)

### Local Development

Both pages work when served from any static HTTP server rooted at the project root.

### Production Deployment

Both pages must be deployed with the same relative directory structure. The project root is the production root.

---

## 29. Asset Directory Reference

| Directory | Purpose | Runtime? |
|---|---|---|
| `molecules/` | Canonical SDF molecular data (15 molecules) | Yes - fetched by both pages |
| `vendor/3dmol/` | 3Dmol.js library | Yes - loaded by both pages |
| `src/` | Main page JavaScript | Yes - loaded by main page |
| `styles/` | Main page CSS | Yes - loaded by main page |
| `story/` | Story page files | Yes - story page |
| `docs/` | Documentation | No |
| `quarantine/` | Historical rollback files | No |
| `glycolysis_molecular_asset_pack/` | Asset download/management tooling | No |

---

## 30. Quarantine / Historical Files

### `quarantine/glycolysis_story.html`

- **What it is:** The original single-file story implementation (HTML + inline CSS + inline JS in one file)
- **Why it exists:** Retained as a rollback/reference copy until the extracted story was validated
- **Production references:** None - production loads from `story/`
- **Should it be edited:** No - it is historical material
- **Removal conditions:** Can be removed after confirming: story scenes work, molecules load, narration functions, responsive behavior is confirmed, accessibility controls work, and navigation in both directions is verified
- **Key difference from production:** In quarantine, molecule paths use `../glycolysis/assets/molecules/` (relative to quarantine/); in production, they use `../molecules/` (relative to story/)

---

## 31. Molecular Asset Acquisition Workflow

### Process

1. **PubChem source:** Each molecule is identified by PubChem CID
2. **3D conformer record type:** SDF format, `record_type=3d`
3. **Download:** `python download_pubchem_assets.py` fetches from PubChem REST API
4. **Rate limiting:** 0.25s sleep between requests
5. **Local storage:** `glycolysis_molecular_asset_pack/molecules/{key}/{key}.sdf`
6. **Production deployment:** Copy to `molecules/{key}/{key}.sdf`
7. **Validation:** Verify downloaded SDF starts with `$$$$` header

### Manifest

`glycolysis_molecular_asset_pack/manifest.json` contains the canonical list of all 15 molecules with:
- `key`, `name`, `formula`, `pubchem_cid`
- `source` (PubChem compound URL)
- `sdf_3d` (PubChem REST API URL)
- `notes`

### Rules

- AI-generated molecular coordinates must **never** replace validated PubChem structures
- PubChem records should be re-verified before final publication if protonation state matters
- The exact PubChem records are the geometry source of truth

---

## 32. Scientific Integrity Rules

1. **Never invent molecular coordinates.** Always use PubChem 3D conformer SDF records.
2. **Never casually change stereochemistry.** Stereochemistry is encoded in the SDF and must be preserved.
3. **Never substitute a chemically different species** because the name is similar.
4. **Never silently change ionic state.** The ionic state (e.g., 2−, 4−, +) is part of the molecular identity.
5. **Never add/remove phosphate groups as decorative elements.** Phosphate groups are chemically significant.
6. **Never alter molecular connectivity** merely for visual appearance.
7. **Do not use misleading literal atom-transfer animations** unless scientifically justified.
8. **Distinguish general biochemical concepts** (e.g., ATP hydrolysis) **from actual glycolytic reactions.**
9. **Preserve reaction stoichiometry.** The 10-reaction sequence must remain correct.
10. **Preserve enzyme identities.** Each enzyme name and EC number must remain accurate.
11. **Preserve glycolytic directionality/reversibility.** Irreversible vs reversible designations must remain correct.
12. **Preserve per-glucose accounting.** Net yield: +2 ATP, +2 NADH, 2 pyruvate.
13. **Preserve the project's biochemical conventions.** Unicode symbols, notation style.
14. **Treat molecular SDF data as scientific source-of-truth.** Not the renderer configuration.

---

## 33. Content Style Guide

### Terminology

| Term | Usage |
|---|---|
| "cytosol" | Use for the location of glycolysis (not "cytoplasm") |
| "glycolysis" | Lowercase unless starting a sentence |
| "ATP" / "ADP" | Uppercase, no periods |
| "NAD⁺" / "NADH" | Unicode superscript for charge |
| "Pᵢ" | Unicode subscript i for inorganic phosphate |
| "H⁺" | Unicode superscript for proton |
| "H₂O" | Unicode subscript for water |
| "PEP" | Abbreviation for phosphoenolpyruvate |
| "G3P" | Abbreviation for glyceraldehyde-3-phosphate |
| "DHAP" | Abbreviation for dihydroxyacetone phosphate |
| "1,3-BPG" | Abbreviation for 1,3-bisphosphoglycerate |

### Reaction Arrows

- Forward: `→` (Unicode U+2192)
- Reversible: `⇌` (Unicode U+21CC)

### Scientific Unicode

Scientific Unicode characters (subscripts, superscripts, arrows, Greek letters) are **acceptable and expected**. They should **not** be treated as emoji.

---

## 34. No-Emoji Policy

- **No emoji in UI** - anywhere in the user interface
- **No emoji in first-party source comments** - HTML, CSS, JS
- **No emoji used as navigation icons** - use semantic/iconographic HTML/CSS mechanisms instead
- HTML entities like `&larr;`, `&rarr;`, `&hellip;` are acceptable and used (e.g., `← BACK`, `NEXT →`, `Preparing your journey…`)

---

## 35. No-Source-Comments Policy

- **First-party HTML/CSS/JS should contain no source comments**
- This applies to `index.html`, `src/main.js`, `styles/main.css`, `story/index.html`, `story/story.js`, `story/story.css`
- **Do not modify third-party libraries** (e.g., `3Dmol-min.js`) to satisfy this policy
- This policy is in effect in the current codebase - all first-party files are comment-free

---

## 36. Complete Function/API Reference

### `src/viewer.js` (production landing-page module, exposed as `window.GlycolysisViewer`)

#### `loadSDF(key)` (internal)
- **Purpose:** Fetch and cache SDF file with in-flight dedup
- **Parameters:** `key` (string) - molecule key
- **Returns:** Promise<string|null> - SDF text or null on failure

#### `init(containerId)`
- **Purpose:** Create the 3Dmol viewer inside the container
- **Parameters:** `containerId` (string) - DOM element ID
- **Returns:** boolean - whether the viewer was created
- **Side effects:** Shows `role="alert"` error if `$3Dmol` is unavailable

#### `applyStyle()` (internal)
- **Purpose:** Apply CPK ball-and-stick styling per element

#### `display(key)`
- **Purpose:** Load and display a molecule
- **Parameters:** `key` (string)
- **Returns:** Promise<boolean> - success/failure
- **Side effects:** Keeps the previous molecule rendered on failure

#### `toggleHydrogens()`
- **Purpose:** Toggle hydrogen atom visibility
- **Returns:** boolean - new hydrogen state

#### `toggleAutoRotate()`
- **Purpose:** Toggle auto-rotation (respects reduced motion)
- **Returns:** boolean - new rotation state

#### `resetView()`
- **Purpose:** Reset camera to default zoom/orientation

#### `getCurrentMolecule()`
- **Purpose:** Return the molecule definition currently displayed, or null

### `src/init.js` (production landing-page wiring)

#### `setActive(key)` (internal)
- **Purpose:** Update radiogroup state - `aria-checked` and roving tabindex

#### `selectMolecule(key)` (internal)
- **Purpose:** Lazy-init viewer, sync radio state, update info bar, display molecule

#### Grid `keydown` handler
- **Purpose:** Arrow/j/k/Home/End navigation with focus + selection

### `src/main.js` (retained extension base - not loaded by any page)

#### `MolViewer.loadSDF(key)`
- **Purpose:** Fetch and cache SDF file for a molecule
- **Parameters:** `key` (string) - molecule key
- **Returns:** Promise<string|null> - SDF text or null on failure
- **Side effects:** Caches in `MolViewer.sdfCache`

#### `MolViewer.create(containerId)`
- **Purpose:** Create a 3Dmol viewer instance
- **Parameters:** `containerId` (string) - DOM element ID
- **Returns:** State object or null
- **Side effects:** Creates viewer, stores in `MolViewer.viewers`

#### `MolViewer.applyStyle(state)`
- **Purpose:** Apply CPK ball-and-stick styling to viewer
- **Parameters:** `state` - viewer state object
- **Side effects:** Modifies viewer style

#### `MolViewer.display(containerId, moleculeKey)`
- **Purpose:** Load and display a molecule in a viewer
- **Parameters:** `containerId` (string), `moleculeKey` (string)
- **Returns:** Promise<boolean> - success/failure
- **Side effects:** Updates viewer, shows error on failure

#### `MolViewer.toggleHydrogens(containerId)`
- **Purpose:** Toggle hydrogen atom visibility
- **Returns:** boolean - new hydrogen state

#### `MolViewer.toggleAutoRotate(containerId)`
- **Purpose:** Toggle auto-rotation
- **Returns:** boolean - new rotation state

#### `MolViewer.resetView(containerId)`
- **Purpose:** Reset camera to default zoom/orientation

#### `MolViewer.pauseRotation(containerId)` / `MolViewer.resumeRotation(containerId)`
- **Purpose:** Pause/resume rotation (used by visibility handler)

#### `App.init()`
- **Purpose:** Initialize the extension-base application
- **Side effects:** Calls `MolViewer.init()`, builds pathway nav, sets up observers, builds reaction scenes, inits standalone viewers

#### `App.buildReactionScenes()`
- **Purpose:** Dynamically generate reaction scene sections from `PATHWAY_STEPS`
- **Side effects:** Creates DOM elements in `#reactionScenes` (no page currently provides this node)

#### `App.setupKeyboardNav()`
- **Purpose:** Keyboard navigation for pathway nav (ArrowDown/j, ArrowUp/k)

### `story/story.js`

#### `loadSDF(key)`
- **Purpose:** Fetch and cache SDF file (with dedup and failure tracking)
- **Parameters:** `key` (string)
- **Returns:** Promise<string|null>
- **Race protection:** Uses `sdfLoading` to deduplicate concurrent requests

#### `preload(keys)`
- **Purpose:** Preemptively load SDF files
- **Parameters:** `keys` (string[]) - molecule keys

#### `showMolecule(key)`
- **Purpose:** Transition the viewer to display a new molecule
- **Parameters:** `key` (string)
- **Returns:** Promise<void>
- **Race protection:** `molTransitionSeq` token; checks at multiple async points

#### `updateMolAria(key)`
- **Purpose:** Update screen-reader molecule description
- **Parameters:** `key` (string|null)
- **Side effects:** Sets `#srMolDesc` text content

#### `showMolFallback(mol)`
- **Purpose:** Show fallback UI when molecule fails to load
- **Parameters:** `mol` - molecule definition object

#### `clearMolecule()`
- **Purpose:** Remove all models from viewer, clear molecule state

#### `speakNarration(text, onEnd, seq)`
- **Purpose:** Speak text using Web Speech API
- **Parameters:** `text` (string), `onEnd` (function), `seq` (number - narration sequence token)
- **Race protection:** Checks `seq === narrationSeqToken` in onend, onerror, catch

#### `stopNarration()`
- **Purpose:** Cancel current narration, increment sequence token

#### `playCaptions(captions, onDone, seq)`
- **Purpose:** Play a sequence of captions with optional narration
- **Parameters:** `captions` (array), `onDone` (function), `seq` (number)
- **Race protection:** Checks both `narrationSeqToken` and `sceneToken`

#### `transitionToScene(index, immediate)`
- **Purpose:** Transition to a new story scene
- **Parameters:** `index` (number), `immediate` (boolean)
- **Race protection:** `sceneToken`, `transitioning` flag, multiple token checks after awaits

#### `startCountdown(delay, onFire)`
- **Purpose:** Start auto-advance countdown
- **Parameters:** `delay` (number ms), `onFire` (function)

#### `cancelCountdown()`
- **Purpose:** Cancel auto-advance countdown

#### `showAccounting(acc)` / `showReactionAccounting(pr, times)`
- **Purpose:** Display ATP/NADH accounting in UI

#### `showOverallEquation()`
- **Purpose:** Display overall glycolysis equation

#### `transitionCamera(config)`
- **Purpose:** Apply camera zoom/spin configuration to viewport

#### `pickNarratorVoice()`
- **Purpose:** Select preferred English voice from available system voices
- **Returns:** SpeechSynthesisVoice or null

#### `setupControls()`
- **Purpose:** Wire up all button click and keyboard event handlers

#### `setupNarrationControls()`
- **Purpose:** Wire up narration toggle button

#### `init()`
- **Purpose:** Initialize the story page (resize atmosphere, init particles, init viewer, setup controls, preload molecules, start scene 0)

---

## 37. Complete DOM/Selector Reference

### Main Page

| Selector | Element | Purpose | File |
|---|---|---|---|
| `#viewerSection` | `<section>` | Viewer section, skip-link target | index.html |
| `#hero-title` | `<h1>` | Page title | index.html |
| `#viewer-heading` | `<h2>` | Viewer section heading | index.html |
| `#molGrid` | `<div>` | Molecule radiogroup (buttons built by init.js) | index.html |
| `#viewerInfo` | `<div>` | `aria-live="polite"` info bar | index.html |
| `#viewerPlaceholder` | `<span>` | Pre-selection hint text | index.html |
| `#viewerName` | `<span>` | Molecule name | index.html |
| `#viewerFormula` | `<span>` | Molecule formula | index.html |
| `#viewer3d` | `<div>` | 3Dmol viewer container | index.html |
| `#btnToggleSpin` | `<button>` | Toggle auto rotation | index.html |
| `#btnToggleH` | `<button>` | Toggle hydrogen visibility | index.html |
| `#btnReset` | `<button>` | Reset camera view | index.html |
| `#pathwayNav` | (dynamic, main.js extension base) | Pathway navigation dots | main.js |

### Story Page

| Selector | Element | Purpose | File |
|---|---|---|---|
| `#srLive` | `<div>` | `aria-live="polite"` narrative announcements | story/index.html |
| `#srMolDesc` | `<div>` | `role="img"` molecule description | story/index.html |
| `#loadingScreen` | `<div>` | Full-screen loading overlay | story/index.html |
| `#mainContent` | `<div>` | Main content area | story/index.html |
| `#viewport` | `<div>` | Fullscreen 3Dmol container | story/index.html |
| `#molViewer` | `<div>` | 3Dmol canvas container | story/index.html |
| `#molFade` | `<div>` | Molecule transition fade overlay | story/index.html |
| `#molFallback` | `<div>` | Fallback for failed molecule loads | story/index.html |
| `#molFallbackText` | `<div>` | Fallback text content | story/index.html |
| `#atmosphere` | `<canvas>` | 2D cell atmosphere animation | story/index.html |
| `#fadeOverlay` | `<div>` | Phase-transition fade overlay | story/index.html |
| `#sceneLabel` | `<div>` | Phase label (top-left) | story/index.html |
| `#stepCounter` | `<div>` | Reaction counter (top-right) | story/index.html |
| `#molLabel` | `<div>` | Molecule name + formula (top-center) | story/index.html |
| `#molLabelName` | `<div>` | Molecule name text | story/index.html |
| `#molLabelFormula` | `<div>` | Molecule formula text | story/index.html |
| `#narrationControls` | `<div>` | VIEWER link + NARRATION toggle | story/index.html |
| `#btnNarration` | `<button>` | Toggle narration | story/index.html |
| `#enzymeLabel` | `<div>` | Enzyme name + reaction (left-center) | story/index.html |
| `#enzymeName` | `<div>` | Enzyme name text | story/index.html |
| `#enzymeReaction` | `<div>` | Enzyme reaction text | story/index.html |
| `#viewerToolbar` | `<div>` | AUTO / H / RESET buttons | story/index.html |
| `#btnRotate` | `<button>` | Toggle auto rotation | story/index.html |
| `#btnHydrogen` | `<button>` | Toggle hydrogen atoms | story/index.html |
| `#btnReset` | `<button>` | Reset camera view | story/index.html |
| `#deepDetail` | `<div>` | Deeper-detail caption area | story/index.html |
| `#deepDetailLabel` | `<div>` | "DEEPER DETAIL" label | story/index.html |
| `#deepDetailText` | `<div>` | Deeper-detail text | story/index.html |
| `#caption` | `<div>` | Main caption container | story/index.html |
| `#captionText` | `<div>` | Main caption text | story/index.html |
| `#sceneControls` | `<div>` | Countdown + navigation buttons | story/index.html |
| `#countdownText` | `<div>` | `role="timer"` countdown display | story/index.html |
| `#navRow` | `<div>` | BACK / STAY / NEXT button row | story/index.html |
| `#btnPrev` | `<button>` | Previous scene | story/index.html |
| `#btnStay` | `<button>` | Stay on scene (cancel auto-advance) | story/index.html |
| `#btnNext` | `<button>` | Next scene | story/index.html |
| `#accounting` | `<div>` | ATP/NADH accounting display | story/index.html |
| `#overallEquation` | `<div>` | Overall glycolysis equation | story/index.html |
| `#legend` | `<div>` | Atom color legend | story/index.html |
| `#molecularCaveat` | `<div>` | "Representative ionic form" note | story/index.html |
| `#loadingIndicator` | `<div>` | "preparing molecular structure" text | story/index.html |
| `#quizOverlay` | `<div>` | Quiz checkpoint overlay (dialog) | story/index.html |
| `#quizContainer` | `<div>` | Quiz content container | story/index.html |
| `#quizQuestionText` | `<div>` | Quiz question text | story/index.html |
| `#quizOptions` | `<div>` | Quiz answer options (radiogroup) | story/index.html |
| `#quizFeedback` | `<div>` | Quiz feedback area (aria-live) | story/index.html |
| `#quizFeedbackText` | `<div>` | Quiz feedback text content | story/index.html |
| `#quizContinue` | `<button>` | Quiz continue button | story/index.html |
| `#quizProgress` | `<div>` | Quiz progress indicator | story/index.html |
| `#quizProgressText` | `<span>` | Quiz progress text | story/index.html |
| `#resultsOverlay` | `<div>` | Results screen overlay (dialog) | story/index.html |
| `#resultsContainer` | `<div>` | Results content container | story/index.html |
| `#resultsScore` | `<div>` | Score display (e.g., 4 / 5) | story/index.html |
| `#resultsPercentage` | `<div>` | Percentage display (e.g., 80%) | story/index.html |
| `#resultsReview` | `<div>` | Question review list | story/index.html |
| `#resultsStoryBtn` | `<button>` | Review story action | story/index.html |
| `#resultsQuestionsBtn` | `<button>` | Review questions action | story/index.html |
| `#resultsEmailBtn` | `<button>` | Email results action | story/index.html |
| `#emailOverlay` | `<div>` | Email form overlay (dialog) | story/index.html |
| `#emailContainer` | `<div>` | Email form container | story/index.html |
| `#emailForm` | `<form>` | Email form | story/index.html |
| `#emailTeacherName` | `<input>` | Teacher name input | story/index.html |
| `#emailTeacherEmail` | `<input>` | Teacher email input | story/index.html |
| `#emailStudentName` | `<input>` | Student name input (optional) | story/index.html |
| `#emailSend` | `<button>` | Send/open email button | story/index.html |
| `#emailCancel` | `<button>` | Cancel email button | story/index.html |
| `#emailNote` | `<p>` | Email instructions text | story/index.html |
| `#emailError` | `<div>` | Email validation error (role=alert) | story/index.html |

---

## 38. CSS Architecture

### File Ownership

| File | Scope |
|---|---|
| `styles/landing.css` | Landing page hero, viewer, footer, responsive (production) |
| `styles/legal.css` | Shared legal page styles (production) |
| `styles/main.css` | Full pathway page design system (retained extension base, not loaded) |
| `story/story.css` | Story page fullscreen cinematic layout |

### Landing Page CSS (`landing.css`)

- CSS custom properties (`:root`)
- Reset rules and `.skip-link` (visible on focus)
- Hero section (`.hero`, `.hero-molecule`, `.hero-content`, `.eyebrow`, `h1`, `.description`, `.story-link`, `.scroll-cue`, `.page-context`)
- Viewer (`.viewer-section`, `.viewer-inner`, `.viewer-sidebar`, `.mol-btn-grid`, `.mol-btn`, `.viewer-canvas-wrap`, `#viewer3d`, `.viewer-info-bar`, `.viewer-controls`, `.vc-btn`)
- Legend (`.mol-legend`, `.mol-legend-item`, `.mol-legend-tip`)
- Viewer error (`.mol-viewer-error`)
- Footer (`.site-footer`, `.footer-top`, `.footer-col`, `.footer-bottom`)
- Scrollbar (`.mol-btn-grid` webkit styles)
- Responsive: 1100px, 1023px, 768px, 480px, 430px
- `prefers-reduced-motion` suppression for transitions and hover transforms

### Legal Pages CSS (`legal.css`)

- CSS custom properties (`:root`)
- Reset, `.skip-link`, focus-visible, link styles
- Header (`.page-header`, `.back-link`, `.page-title`, `.page-updated`)
- Content typography (`.content h2/p/ul/li/code`)
- Mini footer (`.footer-mini`)
- Responsive: 768px, 480px; `prefers-reduced-motion`

### Main Page External CSS (`main.css`, extension base - not loaded)

- CSS custom properties (extended set)
- Reset rules
- `.sr-only`, `.skip-link`, focus-visible
- `body.reduced-motion` class
- Typography utilities (`.text-kicker`, `.text-label`, `.text-body`)
- Navigation (`.site-nav`, `.nav-logo`, `.nav-links`)
- Hero section
- Scroll sections
- Molecule viewer (`.mol-viewer`, `.mol-controls`, `.mol-btn`)
- Pathway navigation (`.pathway-nav`)
- Reaction scenes (`.reaction-scene`, `.reaction-info-side`, `.reaction-step-num`, etc.)
- Accounting (`.accounting-section`, `.accounting-grid`, `.accounting-card`)
- Summary section
- References section
- Footer
- Fade animations (`.fade-in`, `.fade-in-left`, `.fade-in-right`)
- Error states (`.mol-error`)
- Loading states (`.mol-loading`)
- Responsive: 1023px, 480px
- Print styles
- Scrollbar

### Story CSS (`story.css`)

- CSS custom properties
- Reset rules
- `.sr-only`, `.skip-link`, focus-visible
- Loading screen (`#loadingScreen`)
- Viewport (`#viewport`, `#molViewer`, `#molFade`)
- Atmosphere canvas (`#atmosphere`)
- Fade overlay (`#fadeOverlay`)
- Scene label, step counter, molecule label
- Enzyme label
- Accounting display
- Overall equation
- Legend
- Caption system (`#caption`, `#captionText`, `#deepDetail`)
- Scene controls (`#sceneControls`, `#countdownText`, `.sctrl`)
- Viewer toolbar (`.vtb`)
- Narration controls (`.nar-btn`)
- Molecular caveat
- Fallback (`#molFallback`)
- Loading indicator
- Scrollbar (hidden)
- `prefers-reduced-motion`
- Responsive: 768px

---

## 39. Animation Architecture

| Animation | Element | Implementation | Trigger | Duration | Reduced Motion |
|---|---|---|---|---|---|
| Molecule fade | `#molFade` | CSS transition `opacity .3s` | Molecule change | 300ms | 10ms |
| Phase fade | `#fadeOverlay` | CSS transition `opacity .8s` | Phase change | 800ms | Suppressed |
| Loading dots | `.loader-dots span` | CSS `@keyframes lp` | Loading | 1.2s infinite | Suppressed |
| Molecule rotation | 3Dmol viewer | `viewer.spin('y', .25)` | Scene with spin config / AUTO toggle | Continuous | Disabled |
| Atmosphere particles | `#atmosphere` canvas | JS `requestAnimationFrame` | Atmosphere scenes | Continuous | Reduced (20 particles) |
| Fade-in elements | `.fade-in`, `.fade-in-left`, `.fade-in-right` | IntersectionObserver + CSS transition | Scroll into view | 800ms | Instant (main.css extension base) |
| Viewport transform | `#viewport` | CSS transition `transform 1.8s` | Camera config | 1.8s | 0.01s |
| Caption reveal | `#captionText` | CSS transition `opacity .4s, transform .4s` | Caption show | 400ms | Instant |
| UI visibility | Various `.visible` class toggles | CSS transition `opacity .6s` (+ `visibility` on `#viewerToolbar`) | Scene state | 600ms | Instant |
| Link/button transitions | `.story-link`, `.mol-btn`, `.vc-btn`, `.sctrl`, `.nar-btn` | CSS transitions | Hover/focus | 180–250ms | Suppressed (landing/legal) |

---

## 40. Reduced-Motion Model

### Detection

```javascript
const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### CSS Behavior

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

### JavaScript Behavior (Main)

- `reducedMotion` flag in `src/viewer.js` (and `MolViewer.reducedMotion` in the main.js extension base)
- Auto-rotation defaults off and `viewer.spin()` is never started when reduced motion is preferred
- The `body.reduced-motion` class is only added by the main.js extension base

### JavaScript Behavior (Story)

- `PREFERS_REDUCED` flag
- Atmosphere particles reduced: 20 (vs 60 normal)
- Transition waits capped at 50ms
- Viewport transform transition suppressed
- Caption text shown immediately (no fade)
- Loading screen transition suppressed
- Molecule fade transition suppressed

### Principle

Reduced motion reduces **non-essential motion** without removing necessary information or functionality. All content, navigation, and controls remain fully functional.

---

## 41. Visibility / Background Tab Behavior

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopNarration();
    atmosphereAnimating = false;
    if (viewer) viewer.spin(false);
  } else {
    if (viewer && rotating) viewer.spin('y', 0.25);
  }
});
```

**When tab becomes hidden:**
- Narration is stopped
- Atmosphere animation is paused
- Molecular rotation is paused
- WebGL rendering stops (browser handles this)

**When tab becomes visible:**
- Rotation resumes (if `rotating` is true)
- Narration does **not** auto-resume (user must restart)

**Why:** Conserves CPU/GPU resources; prevents narration from playing while user is on another tab; prevents animation from accumulating while hidden.

---

## 42. Loading Lifecycle

### Main Page

```
HTML parse
  → CSS loaded (styles/landing.css)
  → 3Dmol.js loaded (vendor/3dmol/3Dmol-min.js)
  → src/viewer.js executes - exposes window.GlycolysisViewer
  → src/init.js executes
    → Molecule radio buttons built from MOLECULES array
    → Event listeners attached (buttons, grid keydown)
    → selectMolecule('glucose') called
      → V.init('viewer3d') - $3Dmol.createViewer created lazily
      → fetch molecules/glucose/glucose.sdf
        → sdfCache["glucose"] = text
        → viewer.removeAllModels() → viewer.addModel(text, "sdf")
        → applyStyle()
        → viewer.zoomTo() → viewer.zoom(0.92)
        → viewer.render()
        → viewer.spin("y", 0.25) (unless reduced motion)
      → viewerInfo bar shows name + formula
```

### Story Page

```
HTML parse
  → CSS loaded (story.css)
  → 3Dmol.js loaded (../vendor/3dmol/3Dmol-min.js)
  → Google Fonts loaded (Inter, Space Grotesk)
  → Loading screen visible
  → story.js IIFE executes
    → resizeAtmosphere(), initParticles()
    → initViewer() - creates 3Dmol viewer
    → setupControls() - wires buttons + keyboard
    → setupNarrationControls() - wires narration toggle
    → preload(['glucose', 'atp', 'adp', 'g6p', 'f6p', 'fbp', 'dhap', 'g3p'])
    → wait(800ms)
    → transitionToScene(0, true)
      → First scene loads
        → dismissLoadingScreen() - fade out loading overlay
        → wait(1000ms)
        → showMolecule('atp') for scene 5 (preloaded)
        → playCaptions → speakNarration or timed display
        → After captions: show scene controls → start countdown
```

---

## 43. Testing and QA

### 43.1 Static QA

| Check | Method | Status (2026-09-06) |
|---|---|---|
| Broken paths | Verify all `fetch()` paths resolve to actual files | Pass |
| Missing assets | Verify all 15 SDF files exist | Pass |
| Duplicate dependencies | Only one copy of 3Dmol.js (`vendor/3dmol/`) | Pass |
| First-party comments | Grep for `//` and `/*` in first-party files | Pass (vendor license header excluded by policy) |
| Emoji | Grep for emoji characters in UI strings | Pass |
| localhost references | Grep for `localhost` in all files | Pass |
| Accessibility attributes | Verify ARIA attributes present | Pass (static check) |
| SEO metadata | Verify title, description, OG tags | Pass (placeholders documented) |
| Dead links | Verify `href` targets exist | Pass |
| Debug logging | Grep for `console.log` in production | Pass |
| Duplicate molecular assets | Verify only one `molecules/` directory exists and SDF paths resolve | Pass |

### 43.2 Runtime QA

| Scenario | Priority |
|---|---|
| Desktop browser | High |
| Tablet browser | Medium |
| Mobile browser | High |
| Narrow mobile (< 360px) | Medium |
| Touch interaction | High |
| Keyboard navigation | High |
| Narration (story) | High |
| Rapid scene transitions (story) | Medium |
| Reset view (main) | Low |
| Rotation toggle | Medium |
| Hydrogen toggle | Medium |
| Loading failures (network) | Medium |
| Reduced motion | Medium |
| Tab visibility changes | Low |
| Browser zoom | Low |
| WebGL support | High |

**Important:** Runtime/browser/device testing has **not** been performed as part of this documentation task. Do not claim runtime testing occurred unless it actually occurred.

---

## 44. Known Limitations

1. **Molecular conformers:** SDF files represent single 3D conformers, not the full conformational ensemble. Real molecules are dynamic.
2. **3D rendering:** WebGL-based rendering is limited by GPU capabilities and browser implementation.
3. **Cellular visualization:** The atmosphere canvas is a schematic 2D overlay, not a scale-accurate cell model.
4. **Scientific abstraction:** The pathway is presented without consideration of compartmentalization, enzyme kinetics, or metabolite concentrations.
5. **Web Speech API:** Narration quality and voice availability vary significantly by browser and OS.
6. **Browser compatibility:** Tested conceptually but not across all browsers.
7. **Offline behavior:** Depends on browser caching of local files; not guaranteed.
8. **SEO:** Production domain, social images, and Search Console verification not yet configured.
9. **Accessibility testing:** No formal WCAG evaluation has been conducted.
10. **Performance testing:** No Core Web Vitals measurements have been taken.
11. **Responsive testing:** Not verified on all device sizes.
12. **Asset provenance:** Molecular structures are from PubChem 3D conformers; exact protonation states may vary with pH.
13. **Educational simplification:** Some biochemical nuances (allosteric regulation details, isoform differences) are mentioned but not visualized.
14. **Story linearity:** The story follows a fixed linear sequence; there is no click-to-jump or chapter navigation.

---

## 45. Current Known Issues

| Issue | Severity | File | Description | Workaround | Status |
|---|---|---|---|---|---|
| Production domain not configured | Medium | index.html, robots.txt, sitemap.xml | Canonical URL, OG URL, JSON-LD URL, sitemap all use the `glycolysis-project.example` placeholder | Set at deployment | Open |
| Google Search Console placeholder | Low | index.html | Verification token is placeholder text | Replace with actual token at deployment | Open |
| No social preview image | Low | index.html | No `og:image` tag | Create image, add tag at deployment | Open |
| Story page not runtime-tested | Medium | story/ | Browser validation of extracted story not yet performed | Test across browsers | Open |
| main.js/main.css extension base references absent DOM | Low | src/main.js, styles/main.css | `#reactionScenes`/`#pathwayNav` exist on no page; script logs errors if loaded as-is | Keep unloaded or wire up a page first | Open (accepted) |

---

## 46. Future Extension Guide

### Adding a New Molecule

1. Obtain SDF from PubChem (CID → 3D conformer record)
2. Place SDF at `molecules/{key}/{key}.sdf`
3. Add entry to `MOLECULES` array in `src/viewer.js`
4. Add entry to `MOL` in `story/story.js`
5. If the extension base is ever wired up, add entries to `MOLECULE_ASSETS` in `src/main.js` and `glycolysis_molecular_asset_pack/manifest.json`
6. Reference molecule key in relevant scenes/story data
7. **Scientific review:** Verify molecular identity, CID, formula, ionic state
8. **Accessibility review:** Add screen-reader description in story `MOL` entry
9. **Runtime testing:** Verify molecule renders correctly, loads without error

### Adding a New Story Scene

1. Add scene object to `scenes` array in `story/story.js`
2. Include: `id`, `phase`, `molecule`, `camera`, `captions`, `enzyme`, `reaction`, `perReaction`, `timesPerGlucose`, `accounting`, `atmosphere`, `preloads`, `autoAdvanceDelay`
3. Insert at correct position in sequence
4. **Scientific review:** Verify reaction content, equation, enzyme name
5. **Accessibility review:** Ensure captions are meaningful; molecule description exists
6. **Runtime testing:** Verify scene loads, transitions, narration, auto-advance

### Adding a New Reaction

1. Add entry to `PATHWAY_STEPS` in `src/main.js`
2. Add scene(s) to `scenes` array in `story/story.js`
3. Update overall accounting if stoichiometry changes
4. **Scientific review:** Mandatory - enzyme, equation, reversibility, stoichiometry
5. **Accessibility review:** Ensure reaction description is in `sr-only` content
6. **Runtime testing:** Verify main page reaction scene and story scene

### Adding a New UI Control

1. Add HTML element to appropriate page
2. Add CSS styles
3. Add event listener in JS
4. Add keyboard shortcut if applicable
5. Add `aria-label` and `aria-pressed` (if toggle) or radiogroup semantics (if exclusive selection)
6. Provide a 44px touch target for primary controls
7. If the control starts hidden, hide it with `visibility` (or the `.visible` pattern) so it is never focusable while invisible
8. **Accessibility review:** Verify focus order, keyboard operability

### Adding a New Dependency

1. Verify no existing dependency serves the same purpose
2. Add to `vendor/` directory (self-hosted)
3. Reference from HTML `<script>` or `<link>`
4. Update `docs/MASTER.md` dependency table
5. **Review license compatibility**
6. **Runtime testing:** Verify no regressions

---

## 47. Change-Safety Matrix

| Change | Risk | Likely Files | Scientific Review | Accessibility Review | Runtime QA |
|---|---|---|---|---|---|
| CSS spacing/color | Low | CSS files | No | Yes (contrast) | Yes |
| New molecule | High | assets + JS (3 files) | **Yes** | Yes | Yes |
| New reaction | Very High | main.js + story.js | **Yes** | Yes | Yes |
| Change SDF file | Very High | molecular asset | **Yes** | Yes | Yes |
| New dependency | Medium–High | HTML + vendor | Maybe | Yes | Yes |
| New story scene | High | story.js | Usually | Yes | Yes |
| Change keyboard shortcut | Medium | JS | No | **Yes** | Yes |
| Change narration text | Medium | story.js | No | No | Yes |
| Change scene order | High | story.js | Maybe | No | Yes |
| SEO metadata | Low | HTML | No | No | No |
| Change design tokens | Medium | CSS | No | Yes (contrast) | Yes |
| Change loading behavior | Medium | JS | No | No | Yes |
| Change async safety tokens | **Very High** | JS | No | No | **Yes** |

---

## 48. Do-Not-Break Contract

### Architecture

- Main viewer and story remain separate pages
- Shared molecular assets remain shared (single canonical copy)
- Do not collapse the architecture into one monolithic page
- Do not add a build step or framework

### Scientific

- Ten-step glycolysis sequence remains correct
- Molecular source data (SDF) remains authoritative
- Stereochemistry remains correct
- Ionic states are not silently changed
- Stoichiometry remains correct (+2 ATP, +2 NADH, 2 pyruvate per glucose)
- Enzyme identities and EC numbers remain correct
- Overall equation remains correct
- Reversibility designations remain correct

### Accessibility

- Keyboard controls remain functional
- Dynamic molecule description (`#srMolDesc`) remains available
- Narration does not trap interaction
- Reduced-motion behavior remains
- Focus remains visible and usable
- Skip links remain functional

### Asynchronous Safety

- `sceneToken` remains protected
- `molTransitionSeq` remains protected
- `narrationSeqToken` remains protected

### UX

- Main → Story remains discoverable (hero CTA + footer)
- Story → Main remains available (VIEWER link)
- No dead-end pages
- No emoji anywhere
- No accidental generic dashboard redesign

### Performance

- Preserve visibility handling
- Preserve SDF caching
- Preserve appropriate preloading
- Avoid unnecessary continuous rendering
- Preserve local molecular assets

---

## 49. Decision History

| Decision | Rationale |
|---|---|
| Story split from main viewer | Architectural separation of concerns: interactive explorer vs linear documentary |
| Molecular assets are local | Offline capability, reproducibility, no external dependency for core content |
| 3Dmol.js is used | Mature, open-source WebGL molecular renderer with SDF support |
| PubChem-derived structures | Authoritative, validated molecular geometry from public database |
| Molecular geometry is not AI-generated | Scientific integrity; PubChem records are vetted experimental/computational data |
| Design is cinematic/editorial | Educational immersion; avoids generic dashboard aesthetic |
| Emoji are prohibited | Professional, accessible, cross-platform consistent |
| First-party source comments are prohibited | Clean codebase; documentation lives in docs/ |
| Async token protection exists | Prevents race conditions from rapid user interaction |
| Two separate CSS/JS systems | Landing page and story page each own their stylesheet and script - evolved from quarantine extraction |
| Google Fonts loaded remotely | Typography quality; system font fallback for offline |
| `#countdownText` uses `role="timer"` not `aria-live` | Avoids screen-reader spam from frequent countdown updates |

---

## 50. Historical / Migration Context

### Evolution

```
1. Single-file story (quarantine/glycolysis_story.html)
   → All HTML, CSS, JS, and molecular logic in one file
   → 3Dmol referenced via vendor/3dmol/3Dmol-min.js

2. Hardened single-file story
   → Added async safety tokens, fallback handling, accessibility

3. Split into HTML/CSS/JS (story/)
   → index.html, story.js, story.css
   → 3Dmol referenced via ../vendor/3dmol/3Dmol-min.js
   → Molecule paths changed to ../molecules/

4. Integrated with main viewer
   → Added VIEWER link in narration controls
   → Added hero CTA and footer link from main page
```

### Canonical Current Files

- `story/index.html` - Production story HTML
- `story/story.js` - Production story JavaScript
- `story/story.css` - Production story CSS

### Historical Files

- `quarantine/glycolysis_story.html` - Original single-file implementation

---

## 51. Documentation Map

| Document | Purpose | Scope |
|---|---|---|
| `docs/MASTER.md` | Canonical comprehensive AI-facing project reference | Everything |
| `docs/project.md` | Human-facing project architecture documentation | Architecture, structure, development |
| `docs/story-page.md` | Story-specific implementation documentation | Story page only |

### Consistency Rules

- `MASTER.md` is the comprehensive source
- `project.md` remains project-architecture focused
- `story-page.md` remains story focused
- None of the documents should contain materially false implementation claims
- Do not duplicate `MASTER.md` into the specialized documents

---

## 52. Master Document Maintenance Rule

Whenever the project changes, ask:

- Did the change affect architecture?
- Did the change affect file paths?
- Did the change affect molecule data?
- Did the change affect PubChem CIDs?
- Did the change affect reactions or equations?
- Did the change affect scenes?
- Did the change affect UI?
- Did the change affect accessibility?
- Did the change affect keyboard controls?
- Did the change affect narration?
- Did the change affect dependencies?
- Did the change affect SEO?
- Did the change affect performance?
- Did the change affect legal attribution?
- Did the change affect navigation?
- Did the change affect loading behavior?
- Did the change affect fallback behavior?
- Did the change affect known limitations?
- Did the change affect testing status?

**If yes to any, update `docs/MASTER.md`.**

The master document must never become a historical description of an older implementation.

---

## 53. Documentation Accuracy Requirement

Before considering this document complete, the following were cross-checked against the actual codebase:

| Item | Verified |
|---|---|
| Filenames | Yes |
| Paths | Yes |
| Function names | Yes |
| Variable names | Yes |
| DOM IDs | Yes |
| CSS classes | Yes |
| Molecule keys | Yes - all 15 verified |
| PubChem CIDs | Yes - all 15 verified |
| Molecular asset paths | Yes |
| Reaction equations | Yes - all 10 verified |
| Enzyme names | Yes - all 10 verified |
| Scene count | Yes - 10 scenes verified |
| Scene IDs | Yes - all 10 verified |
| Keyboard shortcuts | Yes |
| ARIA attributes | Yes |
| Dependency paths | Yes |
| Navigation paths | Yes |
| SEO metadata | Yes |
| CSS breakpoints | Yes |
| Design tokens | Yes |
| Loading behavior | Yes |
| Narration behavior | Yes |
| Fallback behavior | Yes |
| Caching behavior | Yes |
| Reduced-motion behavior | Yes |

---

*This document is the canonical AI-facing reference for the Glycolysis project. It was created by inspecting the actual codebase on 2026-09-04 and re-verified against the current repository state on 2026-09-06.*
