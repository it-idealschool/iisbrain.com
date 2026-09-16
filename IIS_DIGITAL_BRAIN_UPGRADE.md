# IIS Digital Brain — Upgrade Notes

This version extends the existing AASR portal without replacing its design or existing staffing modules.

## Added modules

- Institutional Policies & Documents repository
- Document categories, lifecycle status, version, effective/review dates and approval activity
- Store item categories and inventory catalogue
- Stock balance, reorder level, unit cost and location tracking
- Staff item requests for catalogue and unlisted items
- Approval path: Staff → HOS → Facility Manager → Principal → Store issue
- Request decision history and stock issue transactions
- New staff, facility manager and store manager roles
- Responsive dashboards and workflow status presentation
- Advanced employee master profiles and annual leave entitlement
- Leave approval path: Staff → HOS → HR → Principal
- NOC, employment certificate, salary certificate, Qatar ID renewal and contract renewal requests
- HR service approval path: Staff → HR → Principal
- Academic-year appraisal records, performance scores, strengths, development areas and goals
- HR contract and Qatar ID expiry monitoring

## Local upgrade

### Backend

```bash
cd backend
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_roles
.venv/bin/python manage.py runserver
```

### Frontend

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api npm run dev
```

## Render deployment

1. Deploy the backend first and run `python manage.py migrate && python manage.py seed_roles`.
2. Keep the existing frontend `NEXT_PUBLIC_API_URL` pointed at the backend `/api` URL.
3. Set `CORS_ALLOWED_ORIGINS` to the comma-separated production frontend origins.
4. Keep `CORS_ALLOW_ALL_ORIGINS=False` in production.
5. Move from SQLite to managed PostgreSQL before entering live school records.
6. Configure persistent object storage for uploaded policy and school document files. Render's local disk is not suitable for permanent institutional documents unless a persistent disk is explicitly attached.
7. Assign workflow roles in Django Admin: `department_head`, `hr`, `facility_manager`, `principal`, and `store_manager`.

## Important production work remaining

- Configure PostgreSQL and automated encrypted backups.
- Configure private object storage and malware scanning for uploaded files.
- Add email/in-app notifications and escalation deadlines.
- Add department mapping between staff profiles and portal accounts.
- Add SSO/MFA, stricter role administration and production audit retention.
- Resolve the pre-existing frontend-wide ESLint errors. The new module files pass ESLint and the complete Next.js production build passes.
