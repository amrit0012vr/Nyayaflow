# Contributing to NyayaFlow

Thank you for your interest in contributing to **NyayaFlow**, an open-source judicial decision-support platform designed for the Indian judiciary!

---

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone contributing to open-source justice technology.

---

## Development Setup

### Prerequisites
- **Python 3.12** (Mandated per OPS-01; do not use experimental versions like 3.15).
- **Node.js 18+** & npm
- **Git**

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/nyayaflow/nyayaflow.git
cd nyayaflow

# Create Python 3.12 virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run database migrations and seed demo data
python scripts/seed_demo_data.py

# Run backend test suite (55 tests)
pytest backend/tests
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
npm test
```

---

## Coding Standards

1. **Zero Fabrication:**
   All metrics, citations, and benchmarks displayed in UI or documentation must derive directly from evaluation scripts (`scripts/run_eval.py`) or verified official statistics (`data/stats/backlog_stats.json`).
2. **Backend Authority:**
   All permissions and data scoping (`visible_cases`) must be strictly enforced on backend FastAPI endpoints; frontend guards exist for user experience, not security enforcement.
3. **Relative Paths:**
   Never commit machine-specific paths (e.g., `D:\bhusan\`); use relative paths throughout code and documentation.
4. **TypeScript Strictness:**
   Ensure zero compiler errors with `npm run build` prior to submitting pull requests.

---

## Submitting Pull Requests
1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit changes with clear, descriptive commit messages.
3. Verify that all 55 backend tests and frontend Vitest suites pass.
4. Submit your pull request against the `main` branch.

