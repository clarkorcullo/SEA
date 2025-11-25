# 📁 Project Structure Guide

_Last refreshed: November 2025_

The Social Engineering Awareness Program follows a layered Flask architecture with SQLAlchemy models, a comprehensive service layer, and Bootstrap templates. This document reflects the **current** repository layout so new contributors aren’t misled by legacy files.

---

## 📂 Root Snapshot

```
CapstoneProject_ProtTypeBackup10/
├── app.py
├── config.py
├── manage.py
├── requirements.txt
├── runtime.txt
├── Procfile
│
├── business_services/
├── data_models/
├── helper_utilities/
├── templates/
├── static/
├── content_seed/
├── learning_modules/
│   ├── assessment/
│   ├── Documents/
│   └── Visual_Aid/
│
├── instance/
├── docs & guides (*.md / *.txt)
└── operational scripts (check_db.py, check_modules_json.py, migrate_production_database.py, etc.)
```

**Key files**
- `app.py` – 1.2k-line Flask entry point with routes, dependency wiring, logging, and error handlers.
- `config.py` – Environment-specific configuration (database URLs, session/security flags, logging).
- `manage.py` – CLI for database resets, admin creation, and content import/export.
- `requirements.txt` + `runtime.txt` + `Procfile` – Deployment trio for Render/Gunicorn.

---

## 🧠 Layered Architecture

| Layer | Location | Responsibilities |
| --- | --- | --- |
| Presentation | `templates/`, `static/` | Bootstrap UI, JS helpers, certificate/assessment pages, error views. |
| Services | `business_services/` | Business logic for users, modules, progress, assessments, simulations, analytics. |
| Data Models | `data_models/` | SQLAlchemy ORM models (`user_models.py`, `content_models.py`, `progress_models.py`, etc.). |
| Utilities | `helper_utilities/` | Constants, validators, formatters, persistence helpers. |
| Content Assets | `content_seed/`, `learning_modules/Documents`, `learning_modules/Visual_Aid` | JSON seed data plus supporting imagery, certificates, infographics. |
| Instance Data | `instance/` | Local SQLite DB; production uses PostgreSQL via `DATABASE_URL`. |

---

## 📚 Educational Content & Assets

- `content_seed/modules.json` – Canonical source for lesson copy, module metadata, and knowledge-check content. Import helpers push this into the database.
- `learning_modules/assessment/final_assessment_questions.py` – Structured definition of the 25-question final assessment used by `assessment_service`.
- `learning_modules/Documents/` – Slide decks, certificate templates, and visual references embedded in templates.
- `learning_modules/Visual_Aid/` – Per-module infographics and simulation screenshots.

> ⚠️ Earlier iterations stored lessons in `learning_modules/module1.py`, etc. Those files were removed; rely on the JSON seed + database exports instead.

---

## ⚙️ Business & Data Layers

### `business_services/`
- `user_service.py` – Registration, authentication glue with Flask-Login, profile updates.
- `module_service.py` & `module_manager_service.py` – Curriculum orchestration, sequential unlocking.
- `assessment_service.py` – Knowledge-check delivery, scoring, and persistence.
- `simulation_service.py` – Scenario definitions and scoring helpers (pairs with JS to render interactive flows).
- `progress_service.py` & `analytics_service.py` – Aggregated metrics for dashboards/admin views.

### `data_models/`
- `base_models.py` – SQLAlchemy base class plus mixins for timestamps and serialization.
- `user_models.py` – `User`, `PasswordResetToken`, profile picture storage helpers.
- `content_models.py` – `Module`, `ContentSection`, reflections, and supporting relationships.
- `progress_models.py` – `ModuleProgress`, `AssessmentResult`, `SimulationResult`.
- `assessment_models.py` – Normalized schema for question banks and answer keys.

---

## 🎨 Frontend Structure

- `templates/base.html` – Layout shell, navigation, toasts, modal containers.
- Feature templates: `dashboard.html`, `module.html`, `assessment_simple.html`, `final_assessment_simple.html`, `simulation_simple.html`, `profile.html`, `certificate.html`, etc.
- Auth/templates: `login.html`, `register.html`, `forgot_password.html`, `reset_password.html`.
- Error pages: `404.html`, `500.html`.
- `static/js/error-handler.js`, `static/js/modal-system.js` – Client-side helpers for centralized error reporting and modals.
- `static/profile_pictures/`, `static/MMDCLogo.png`, `static/securitybackground.mp4`, etc. supply imagery across the UI.

---

## 🛠️ Utilities & Supporting Scripts

- `helper_utilities/constants.py` – Application-wide knobs (score thresholds, pagination, award text).
- `helper_utilities/validators.py` – Email/password regexes, form validation, sanitization helpers.
- `helper_utilities/database_persistence.py` – Import/export helpers for module JSON.
- Stand-alone scripts (`check_db.py`, `check_modules_json.py`, `migrate_production_database.py`) aid local troubleshooting and production migrations.

---

## 🚀 Developer Workflow

1. **Set up environment**
   ```bash
   pip install -r requirements.txt
   python manage.py reset_database  # optional
   python app.py
   ```
2. **Modify content** by editing `content_seed/modules.json` (then run the import helper) or adjusting DB data via admin utilities.
3. **Update business rules** inside the relevant `business_services/*.py` file; keep routes in `app.py` thin.
4. **Adjust UI** by editing templates/static assets. Follow `VIDEO_FORMAT_STANDARDS.md` for embedded media.
5. **Persist assets** by adding files to `learning_modules/Documents` or `learning_modules/Visual_Aid` and referencing them in templates/business logic.
6. **Deploy** by pushing to `main`; Render picks up the new commit using the `Procfile` command.

---

## 🧭 Quick Reference

- **Key routes:** `/`, `/login`, `/register`, `/dashboard`, `/module/<int:id>`, `/assessment/<int:id>`, `/simulation/<type>`, `/final-assessment`, `/profile`, `/health`.
- **Management commands:** `python manage.py reset_database`, `python manage.py import-content`, `python.manage.py export-content`, `python manage.py create_admin <username> <email> <password>`.
- **Security controls:** PBKDF2 hashing via Werkzeug, session cookies with `HttpOnly`, `Secure`, `SameSite` flags (configured in `config.py`), rotating log handler in `app.py`.

---

Keeping this file in sync with the working tree prevents stale guidance and speeds up onboarding. Update it whenever you add/remove top-level directories, change the content ingestion pipeline, or move major assets.
