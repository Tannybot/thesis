# Free Deployment Guide: Vercel + Render + Supabase

Target architecture:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Supabase PostgreSQL
- Mobile app: Flutter build configured to call the deployed backend API

## 1. GitHub Auto Deployment

1. Push the repository to GitHub.
2. Vercel:
   - Import the GitHub repository.
   - Set root directory to `frontend`.
   - Vercel auto-deploys on every push.
3. Render:
   - Create a new Blueprint from `render.yaml`, or create a Web Service manually.
   - Set root directory to `backend`.
   - Render auto-deploys on every push.
4. Supabase:
   - Create a free project.
   - Copy the PostgreSQL connection string.
   - Use it as the backend `DATABASE_URL`.

## 2. Frontend on Vercel

Root directory:

```text
frontend
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Required Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

`frontend/vercel.json` handles React Router fallback routes, including:

```text
/trace/{animal_uid}
/animals/{id}
/login
```

## 3. Backend on Render

Root directory:

```text
backend
```

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w ${WEB_CONCURRENCY:-2} --bind 0.0.0.0:${PORT}
```

Required Render environment variables:

```env
APP_ENV=production
DEBUG=false
DATABASE_URL=<supabase-postgres-connection-string>
SECRET_KEY=<long-random-secret>
APP_URL=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
QR_BASE_URL=https://your-frontend.vercel.app
QR_CODE_BASE_URL=https://your-frontend.vercel.app/trace
RATE_LIMIT_ENABLED=true
GLOBAL_RATE_LIMIT_PER_MINUTE=100
LOGIN_RATE_LIMIT_PER_MINUTE=5
LOGIN_RATE_LIMIT_PER_HOUR=20
AUTH_RATE_LIMIT_PER_MINUTE=10
EXPENSIVE_RATE_LIMIT_PER_MINUTE=30
SAME_ENDPOINT_RATE_LIMIT_PER_MINUTE=45
MAX_REQUEST_BODY_BYTES=1048576
REQUEST_TIMEOUT_SECONDS=30
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_MINUTES=15
WEB_CONCURRENCY=2
AI_PROVIDER=ollama
OLLAMA_BASE_URL=
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT_SECONDS=60
```

Generate `SECRET_KEY` locally:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 4. Database on Supabase

Use Supabase PostgreSQL as the production database.

Recommended connection string:

```text
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

Use the Session Pooler URL if Supabase provides it. Render free instances sleep and reconnect often; pooling helps avoid connection issues.

The app creates tables on startup through SQLAlchemy:

```python
Base.metadata.create_all(bind=engine)
```

Optional first-time demo seed:

```bash
python seed.py
```

Do not run the seed script if production data already exists.

## 5. QR Codes

Production QR format:

```text
https://your-frontend.vercel.app/trace/{animal_uid}
```

Scan flow:

```text
Scan QR
-> opens Vercel frontend over HTTPS
-> frontend loads /trace/{animal_uid}
-> frontend calls Render backend /api/trace/{animal_uid}
-> backend validates the token
-> trace page displays animal information
```

After setting the final Vercel domain, regenerate QR codes:

```bash
cd backend
python regen_qrs.py
```

Important: Render free filesystem is ephemeral. QR images may be regenerated when requested, but printed QR codes remain valid because they store the stable Vercel `/trace/{animal_uid}` URL.

## 6. Mobile App

Update the mobile API base URL to the Render backend:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://your-backend.onrender.com/api
```

For iOS:

```bash
flutter build ios --release --dart-define=API_BASE_URL=https://your-backend.onrender.com/api
```

## 7. Security and Production Settings

- Never use localhost in production env vars.
- Keep `DEBUG=false`.
- Use HTTPS URLs only.
- Keep `SECRET_KEY` private.
- Use Supabase connection strings with `sslmode=require`.
- Restrict CORS to the Vercel domain.
- Keep backend rate limits enabled, and use Cloudflare or platform-level DDoS protection in front of production traffic when possible.
- Keep admin/user role permissions unchanged:
  - Admin monitors and reviews records.
  - Users register animals.
  - Backend blocks admin animal creation.
- Ollama AI guardrails remain enabled. If no hosted Ollama service is configured, AI will report unavailable instead of exposing internals.

## 8. Deployment Validation Checklist

Verify after deployment:

- Vercel frontend opens.
- Render `/api/health` returns healthy.
- Supabase tables are created.
- Login works.
- User registration works.
- User can add/register animals.
- Admin cannot add/register animals.
- Animal records load correctly.
- QR code image loads in the animal details page.
- QR scan opens `/trace/{animal_uid}` on Vercel.
- Invalid QR token shows `Animal record not found`.
- Health records and movement history display.
- AI assistant refuses source/schema/secret/internal requests.
- Mobile app can login and fetch animals using the Render backend URL.
- Layout works on mobile browser sizes.

## 9. Troubleshooting

Frontend cannot reach backend:

- Check `VITE_API_BASE_URL=https://your-backend.onrender.com/api`.
- Redeploy Vercel after changing env vars.
- Check Render service is awake and healthy.
- Check backend CORS includes the Vercel domain.

Backend cannot connect to database:

- Confirm `DATABASE_URL` is the Supabase PostgreSQL URL.
- Include `sslmode=require`.
- Prefer Supabase pooler URL.
- Check Supabase password encoding if it contains special characters.

QR opens Google or search results:

- The QR payload is not a URL. Regenerate QR codes after setting `QR_CODE_BASE_URL`.
- Confirm QR value starts with `https://your-frontend.vercel.app/trace/`.

QR opens frontend but no record appears:

- Confirm the animal UID exists in Supabase.
- Confirm `/api/trace/{animal_uid}` works on Render.
- Confirm `VITE_API_BASE_URL` points to the correct backend.

Render free service is slow:

- Free Render instances sleep when idle.
- First request may take 30-60 seconds.
- Use the health endpoint to wake the service before testing.

Images or generated QR files disappear:

- Render free filesystem is not persistent.
- Regenerate QR images as needed.
- For durable uploads, use Supabase Storage or another object storage service.
