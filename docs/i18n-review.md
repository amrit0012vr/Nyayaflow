# Internationalization (i18n) Review Audit & Native-Speaker Verification Queue

**Date:** 12 November 2026  
**Supported Locales:**
- `en`: English (Source / Reference Locale)
- `hi`: Hindi (हिन्दी)
- `or`: Odia (ଓଡ଼ିଆ)

---

## 1. Statutory Context & Legal Terminology Guidelines
Legal terminology in Indian judicial portals must adhere strictly to statutory vocabulary established under:
1. **The Constitution of India** (आधिकारिक राजभाषा संस्करण).
2. **The Bharatiya Nagarik Suraksha Sanhita, 2023 / CrPC, 1973**.
3. **The Legal Services Authorities Act, 1987** (राष्ट्रीय विधिक सेवा प्राधिकरण शब्दावली).

Machine-drafted phrases must not use colloquial idioms for statutory legal statuses (e.g., "उपभोक्ता" vs "वादी / नागरिक", "हस्तांतरण" vs "स्थानांतरण", "जमानत याचिका").

---

## 2. Review Status of Translation Keys

Every machine-drafted string in `src/locales/hi.json` and `src/locales/or.json` is audited below:

| Key | English (`en`) | Hindi (`hi`) | Odia (`or`) | Review Status | Notes |
|---|---|---|---|---|---|
| `skip_to_main` | Skip to main content | मुख्य सामग्री पर जाएँ | ମୁଖ୍ୟ ବିଷୟବସ୍ତୁକୁ ଯାଆନ୍ତୁ | **Verified** | Standard GIGW phrasing |
| `screen_reader` | Screen Reader Access | स्क्रीन रीडर एक्सेस | ସ୍କ୍ରିନ୍ ରିଡର୍ ଆକ୍ସେସ୍ | **Verified** | Standard GIGW phrasing |
| `home` | Home | मुखपृष्ठ | ମୂଳପୃଷ୍ଠା | **Verified** | Standard |
| `user_login` | User Login | उपयोगकर्ता लॉगिन | ଉପଯୋଗକର୍ତ୍ତା ଲଗ୍ ଇନ୍ | **Verified** | Formal |
| `select_category` | Select your user category | अपनी उपयोगकर्ता श्रेणी चुनें | ଆପଣଙ୍କ ଉପଯୋଗକର୍ତ୍ତା ବର୍ଗ ବାଛନ୍ତୁ | **Verified** | Non-persona wording |
| `judge` | Judge / Bench | न्यायाधीश / पीठ | ବିଚାରପତି / ପୀଠ | **Verified** | Statutory judicial title |
| `clerk` | Court Registry Clerk | न्यायालय रजिस्ट्री लिपिक | ନ୍ୟାୟାଳୟ ରେଜିଷ୍ଟ୍ରି କିରାଣୀ | **needs_review** | Verify registry clerk title |
| `lawyer` | Advocate / Legal Counsel | अधिवक्ता / विधिक परामर्शदाता | ଓକିଲ / ଆଇନଜୀବୀ | **Verified** | Advocates Act, 1961 |
| `police` | Police / Investigating Officer | पुलिस / जांच अधिकारी | ପୋଲିସ / ତଦନ୍ତକାରୀ ଅଧିକାରୀ | **Verified** | CrPC / BNSS standard |
| `citizen` | Citizen / Litigant | नागरिक / वादी | ନାଗରିକ / ମୁକଦ୍ଦମାକାରୀ | **Verified** | Plain legal language |
| `auditor` | Auditor / Vigilance | लेखा परीक्षक / सतर्कता | ହିସାବ ନିରୀକ୍ଷକ / ସତର୍କତା | **needs_review** | High Court vigilance terminology |
| `prototype_notice` | Prototype built for the Bharat Agentic-AI Hackathon 2026. This is not an official Government of India or court website. | भारत एजेंटिक-एआई हैकाथॉन 2026 के लिए बनाया गया प्रोटोटाइप। यह भारत सरकार या किसी न्यायालय की आधिकारिक वेबसाइट नहीं है। | ଭାରତ ଏଜେଣ୍ଟିକ୍-ଏଆଇ ହ୍ୟାକାଥନ୍ 2026 ପାଇଁ ପ୍ରସ୍ତୁତ ପ୍ରୋଟୋଟାଇପ୍। ଏହା ଭାରତ ସରକାର କିମ୍ବା କୌଣସି ନ୍ୟାୟାଳୟର ଆଧିକାରିକ ୱେବସାଇଟ୍ ନୁହେଁ। | **Verified** | Mandatory disclaimer |
| `demo_mode_notice` | Demo mode: Synthetic case data only. | डेमो मोड: केवल सिंथेटिक मामला डेटा। | ଡେମୋ ମୋଡ୍: କେବଳ କୃତ୍ରିମ ତଥ୍ୟ। | **needs_review** | Plain language review |
| `email` | Email | ईमेल | ଇମେଲ୍ | **Verified** | Technical term |
| `password` | Password | पासवर्ड | ପାସୱାର୍ଡ | **Verified** | Technical term |
| `login` | Login | लॉगिन करें | ଲଗ୍ ଇନ୍ | **Verified** | Standard action |
| `logout` | Logout | लॉगआउट | ଲଗ୍ ଆଉଟ୍ | **Verified** | Standard action |

---

## 3. Native Speaker Sign-off Protocol
Before production pilot deployment across state subordinate courts, all keys marked `needs_review` must be signed off by a certified legal translator or designated State Legal Services Authority (SLSA) officer.
