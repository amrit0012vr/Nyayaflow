# Accessibility Statement — NyayaFlow Judicial Decision-Support Portal

**NyayaFlow** is committed to ensuring digital accessibility for people of all abilities, including citizens, judicial officers, advocates, and registry staff. We continually improve the user experience for everyone and apply relevant accessibility standards aligned with the **Guidelines for Indian Government Websites (GIGW 3.0)** and the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**.

---

## 1. Conformance Status
The NyayaFlow portal partially conforms to **WCAG 2.1 Level AA** and **GIGW 3.0 standards**. "Partially conformant" means that while key accessibility criteria have been implemented, verified, and automated, some edge cases (such as scanned PDF attachments deposited by external police/litigant parties) may require OCR processing before full screen reader interpretation.

---

## 2. Key Accessibility Features Implemented

### 2.1 Navigation & Structure
- **Skip to Main Content Link:** Top-level hidden link (`#main-content`) instantly accessible via initial keyboard `Tab` navigation.
- **Landmarks:** Strictly organized using semantic HTML5 landmarks (`<header>`, `<nav aria-label="...">`, `<main id="main-content">`, `<aside>`, `<footer>`).
- **One `<h1>` Per Page:** Strict hierarchy with single primary heading per route accented with a high-contrast saffron underline.
- **Logical Tab Order & Focus Trapping:** Modal dialogs (`role="dialog"`, `aria-modal="true"`) trap keyboard focus and dismiss upon pressing `Escape`, returning focus to the activating element.

### 2.2 Text Size & Zoom
- **Interactive Font Resizing:** Utility bar controls (`A-` at 87.5%, `A` at 100%, `A+` at 125%) that adjust the root `rem` font scale and persist in `localStorage`.
- **200% Zoom Compatibility:** Layout reflows smoothly up to 200% viewport zoom without loss of content or horizontal window scrolling (large data tables provide dedicated within-container horizontal scrollbars).

### 2.3 Contrast & Visual Presentation
- **Standard Light Portal Palette:** WCAG AA compliant text-to-background contrast ratios exceeding 4.5:1 for body copy and 3.0:1 for large text.
  - Primary Navy `#0B2A5B` on White: **11.4:1 contrast ratio**.
  - Text `#1A1A1A` on Surface `#F4F6FA`: **14.2:1 contrast ratio**.
  - Saffron `#FF9933` used strictly as non-text decorative accents or borders.
- **High-Contrast Theme:** Toggleable via utility bar (`[data-theme="contrast"]`), applying a pure black background (`#000000`), bright yellow accents (`#FFD700`), and pure white text (`#FFFFFF`) with 7:1+ contrast.
- **Dual Focus Ring:** Prominent `:focus-visible` dual ring (`3px` saffron + `5px` navy outline) ensuring focus is never lost against either light or dark backgrounds.
- **Non-Color Reliance:** Triage tiers, judicial review statuses, and urgent flags always combine distinct icons, bold descriptive text, and color.

### 2.4 Forms & Error Identification
- **Associated Labels & Legends:** All form controls feature explicit `<label htmlFor="...">` and `<fieldset>` groupings.
- **Live Error Summaries:** Submission errors trigger an accessible `role="alert"` summary block at the top of the form with programmatic focus management.
- **Input Guidance:** Clear `aria-describedby` hints and mandatory field legends (`* mandatory fields`).

### 2.5 Multi-Lingual Inclusivity
- **Bilingual Interface:** Supports English, Hindi (हिन्दी), and Odia (ଓଡ଼ିଆ).
- **Dynamic Language Declaration:** Root `<html lang="...">` attribute updates synchronously when switching languages.
- **Self-Hosted Offline Typography:** Bundles Noto Sans, Noto Sans Devanagari, and Noto Sans Oriya locally to eliminate CDN latency, third-party tracking, and offline breakage.

---

## 3. Assessment & Verification Methodology

The portal was assessed using:
1. **Automated Testing (`axe-core`):** Integrated into the Vitest automated test pipeline (`A11yAxe.test.tsx`), verifying 0 critical or serious WCAG 2.1 AA violations on primary portal routes.
2. **Keyboard-Only Operation:** Complete navigation of login, cause-list browsing, bench brief modal inspection, and legal aid chat executed without a mouse.
3. **Screen Reader Evaluation:** Smoke-tested using NVDA on Chromium and VoiceOver on Safari.
4. **Contrast Color Audit:** Verified using WCAG 2.1 color contrast formulas.

---

## 4. Known Limitations & Ongoing Work
- **Scanned Legacy Documents:** Court records deposited as raw bitmap scans may lack OCR text layers. Ongoing pipeline upgrades integrate Tesseract OCR.
- **Hindi & Odia Machine Translations:** Machine-drafted localized UI strings have been marked for native-speaker legal review (`docs/i18n-review.md`).

---

## 5. Feedback & Contact
We welcome feedback on the accessibility of NyayaFlow. If you encounter accessibility barriers, please contact our team:
- **Email:** `accessibility@nyayaflow.internal`
- **Repository Issues:** [NyayaFlow GitHub Issues](https://github.com/amrit0012vr/Nyayaflow)
