# Team Contribution & Development Guidelines
## AI-Powered Interactive Quantum Algorithm Learning Platform (SIH 2026)

---

## 1. Getting Started for Team Members

Welcome to the Gitwolves SIH 2026 Engineering Team! Follow these steps to set up your local development environment.

### Prerequisites
* **Python**: Version 3.10 or 3.11 (Python 3.11 recommended).
* **Node.js**: Version 20+ LTS and npm 10+.
* **Git**: Configured with your GitHub username and verified email.
* **Docker**: Docker Desktop or Docker Engine (optional for individual feature branches, mandatory for integration testing).

### Local Setup
```bash
# 1. Clone your fork or the repository
git clone https://github.com/saketsumanai/Quantum-Project.git
cd Quantum-Project

# 2. Checkout the integration branch
git checkout develop

# 3. Create your assigned feature branch (replace with your member branch)
# e.g., git checkout -b feature/member-1-frontend
git checkout -b feature/member-X-role

# 4. Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. Set up Frontend dependencies (when frontend directory is scaffolded)
cd frontend
npm install
cd ..

# 6. Copy local environment variables
cp .env.example .env
```

---

## 2. Code Quality & Formatting Standards

* **Python Backend**:
  * Formatter: `black` (line length 100).
  * Linter: `flake8` or `ruff`.
  * Type hints: Use standard Python typing annotations for all function signatures.
* **JavaScript / TypeScript Frontend**:
  * Formatter: `prettier`.
  * Linter: `eslint`.
* **Testing Requirement**:
  * Every new function in `backend/app/services/` must have a corresponding test in `tests/`.
  * Run tests before pushing:
    ```bash
    pytest tests/
    ```

---

## 3. Git Etiquette & Pull Requests

1. **Never commit directly to `main` or `develop`.** Always commit to your assigned `feature/member-X-*` branch.
2. **Commit Often with Conventional Commits**:
   * Format: `feat(scope): message` or `fix(scope): message`.
   * Examples:
     * `feat(circuit): add swap gate to canvas palette`
     * `fix(simulation): correct phase angle calculation on bloch sphere`
3. **Keep branches clean**: Pull the latest `develop` into your branch before opening a PR:
   ```bash
   git fetch origin
   git merge origin/develop
   ```
4. **Tag Team Members for Review**: Tag Saket (@saketsumanai) or relevant teammates for PR sign-off.
