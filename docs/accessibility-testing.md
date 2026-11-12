# Accessibility Testing Report & Verification Protocol

**Date:** 12 November 2026  
**Audited Targets:** `/login`, `/citizen`, `/citizen/chat`, `/citizen/eligibility`, `/cases`, `/cases/:id`, `/schedule`, `/audit`  
**Standard:** WCAG 2.1 Level AA & Guidelines for Indian Government Websites (GIGW 3.0)  

---

## 1. Automated Axe-Core Audit Results

Automated axe-core accessibility tests are executed in Vitest via `src/tests/A11yAxe.test.tsx`.

| Component / Route | Critical Violations | Serious Violations | Minor / Moderate Warnings | Pass / Fail |
|---|---|---|---|---|
| `UtilityBar` | 0 | 0 | 0 | **PASS** |
| `LoginPage` | 0 | 0 | 0 | **PASS** |
| `NoticeBanner` & Shell | 0 | 0 | 0 | **PASS** |
| `CategoryTile` Radio Group | 0 | 0 | 0 | **PASS** |
| `JudgeCauseList` & Dialog | 0 | 0 | 0 | **PASS** |
| `CitizenHome` & Chat | 0 | 0 | 0 | **PASS** |

### Verified Axe Rules
- `color-contrast`: Passed (all foreground text meets ≥ 4.5:1 ratio against background).
- `button-name`: Passed (all interactive buttons, icon buttons, and show/hide toggles possess non-empty accessible names).
- `aria-roles`: Passed (proper semantic roles: `radiogroup`, `radio`, `dialog`, `status`, `alert`).
- `aria-required-children` / `aria-required-parent`: Passed on all category tiles and data tables.
- `label`: Passed (every form control has an explicit, programmatically linked `<label htmlFor="...">`).
- `landmark-one-main`: Passed (single `<main id="main-content">` landmark per layout).

---

## 2. Keyboard Navigation Test Checklist

| Verification Task | Expected Behaviour | Result |
|---|---|---|
| **Tab sequence starts at skip link** | First `Tab` reveals visible skip link (`#main-content`) | **PASS** |
| **Category tile selection** | Space / Enter activates tile; arrow keys navigate radiogroup | **PASS** |
| **Credential form accessibility** | Disabled until tile chosen; announced via `aria-live="polite"` | **PASS** |
| **Password reveal toggle** | Toggle button can be focused and activated via keyboard | **PASS** |
| **Modal Dialog Escape key** | Pressing `Esc` dismisses Bench Brief dialog and restores focus | **PASS** |
| **No keyboard trap** | Focus can tab forwards and backwards through all panels | **PASS** |

---

## 3. Screen Reader Smoke Testing Protocol

### Configuration
- **Screen Reader:** NVDA 2024.1
- **Browser:** Google Chrome 130 / Microsoft Edge 130 (Windows 11)
- **Speech Synthesizer:** Windows OneCore English (India) & Hindi

### Test Observations
1. **Login Flow:**
   - Radiogroup is announced: *"User category, radiogroup, 6 items. Step 1: Select your user category. Judge / Bench, radio button, not checked, 1 of 6."*
   - Selection announcement: *"Judge / Bench, radio button, checked, 1 of 6."*
   - Step 2 live region announcement: *"Logging in as: Judge / Bench."*
2. **Cause List & Cause Docket:**
   - Triage chip announces both priority tier and numerical score: *"Critical Tier, 85 out of 100."*
   - In custody indicator announces clearly: *"Undertrial in custody, active."*
3. **Bench Brief Modal:**
   - Dialog announces title and description upon activation. Focus lands within the dialog container.

---

## 4. Visual Contrast & Color-Blindness Checks

- **Protanopia & Deuteranopia Simulation:**
  - Status tiers rely on icons + bold text: Critical has a triangle warning icon, High has a clock icon, Normal has a check icon.
  - Saffron `#FF9933` is paired with navy borders and never used as thin text on light backgrounds.
- **Tritanopia Simulation:**
  - Navy `#0B2A5B` and pure black `#1A1A1A` maintain distinct luminescence from surface panels.
