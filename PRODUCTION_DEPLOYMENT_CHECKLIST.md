# 🚀 Production Deployment Checklist

Use this playbook before every push to Render (or any production target) to ensure the Social Engineering Awareness Program ships safely.

---

## ✅ Pre-Deployment

1. **Code hygiene**
   - [ ] All work committed & pushed to `main`
   - [ ] `git status` clean
   - [ ] Lints/tests (manual or automated) pass for touched areas

2. **Secrets & config**
   - [ ] `.env` / Render environment variables updated (SECRET_KEY, DATABASE_URL, MAIL settings, etc.)
   - [ ] Admin credentials rotated if shared with new personnel
   - [ ] Feature flags match release plan (see `config.py` / `helper_utilities/constants.py`)

3. **Dependencies & build**
   - [ ] `requirements.txt` refreshed (`pip freeze` after upgrades)
   - [ ] `runtime.txt` still matches desired Python version
   - [ ] `Procfile` still reflects gunicorn command (`--workers`, timeouts, etc.)

4. **Database readiness**
   - [ ] PostgreSQL service healthy (Render dashboard)
   - [ ] `DATABASE_URL` uses `postgresql://...` with `sslmode=require`
   - [ ] Pending migrations applied locally (if schema changes occurred)
   - [ ] Content seed (`content_seed/modules.json`) validated via `python manage.py check-content` or import dry run

---

## ⚙️ Deployment Configuration Checklist

| Area | What to confirm |
| --- | --- |
| **Render Service** | Auto-deploy from `main`, correct region, health check path `/health`, plan size appropriate for traffic. |
| **Gunicorn** | `--workers 2` (512 MB) or adjust per plan, `--timeout 120`, `--max-requests 1000 --max-requests-jitter 100`. |
| **Session Security** | `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY`, `SESSION_COOKIE_SAMESITE` set via `config.py`. |
| **Logging** | Log level (INFO/DEBUG) set via env var; log retention monitored (Render log stream + `app.log`). |
| **Backups** | Database snapshot schedule enabled; `instance/` ignored from Git to avoid leaking local DBs. |

---

## 🧪 Functional Verification (Staging or Local Smoke Test)

1. **Authentication & profile**
   - [ ] Register + login flow works, including email/password validation.
   - [ ] Profile update + avatar upload succeed; certificate generation enforces real-name requirement.

2. **Learning journey**
   - [ ] Module access respects sequential unlocking rules.
   - [ ] Module completion + progress bars update (Not Started → In Progress → Completed).
   - [ ] Reflections save and render without XSS warnings.

3. **Assessments & simulations**
   - [ ] Knowledge checks score correctly; explanations display.
   - [ ] Final assessment can be started, submitted, and reviewed; pass/fail thresholds enforce retake logic.
   - [ ] Simulation flows render scenarios and scoring feedback without console errors.

4. **Admin / analytics (if enabled)**
   - [ ] Admin dashboard loads, charts render, and filters behave.
   - [ ] User search/reset-password features respond without 5xx errors.

5. **Health & security**
   - [ ] `/health` returns `{"status": "healthy"}` (plus DB status).
   - [ ] No secrets present in templates or logs.

Document any deviations in RELEASE_NOTES.md (if used) before pushing.

---

## 📦 Deploy & Post-Deploy

1. **Trigger deploy**
   - Push to `main` or hit “Deploy latest commit” in Render.
   - Watch build logs for dependency or compile errors.

2. **Smoke test in production**
   - Open the public URL, perform login, load dashboard, open at least one module, and complete a sample quiz.
   - Confirm final assessment, profile update, and certificate generation still work on live data.
   - Check admin panel (if accessible) for regressions.

3. **Monitoring**
   - Observe Render metrics (CPU, RAM, response times) for at least 15 minutes.
   - Tail logs for ERROR/WARNING entries (`render logs` or `heroku logs` equivalent).
   - Verify uptime monitor or health-check service reports green status.

4. **Stakeholder communication**
   - Post release summary in team channel (include commit range, notable changes, and verification status).
   - Update DOCUMENTATION.md / CHANGELOG.md if new features require user guidance.

---

## 🔁 Rollback & Contingency

1. **When to roll back**
   - Critical path broken (login, module access, assessment submission).
   - Security regression or data integrity issue.
   - Sustained error rate or performance degradation > 5 minutes.

2. **How to roll back**
   - Redeploy last known-good commit (`git push origin <sha>:main` or Render rollback button).
   - If schema changes were applied, run the corresponding downgrade or restore from snapshot.
   - Communicate downtime + remediation steps to stakeholders.

3. **Post-mortem**
   - Capture root cause, mitigation, and follow-up tasks (tests, feature flags, monitoring improvements).

---

## 📞 Quick Reference

- **Repository:** https://github.com/clarkorcullo/SEA  
- **Production URL:** https://mmdcsea.onrender.com  
- **Health Check:** https://mmdcsea.onrender.com/health  
- **Support Contacts:** Capstone engineering team, MMDC mentors

Keep this checklist updated as infrastructure or workflows change so deployments stay predictable and auditable. Happy shipping! 🚀

