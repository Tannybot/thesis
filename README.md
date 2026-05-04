# 🐄 QR Code-Based Livestock Monitoring and Traceability System

A production-ready, full-stack system for livestock tracking, health monitoring, and supply chain traceability using QR codes.

## 🏗️ System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   React Web      │     │   Flutter Mobile   │     │   FastAPI Backend    │
│   (Vite + TS)    │────▶│   (Dart + Hive)    │────▶│   (Python 3)        │
│   Port: 5173     │     │   QR Scanner       │     │   Port: 8000        │
└────────┬─────────┘     └────────┬───────────┘     └────────┬────────────┘
         │                        │                          │
         └────────────────────────┼──────────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │   SQLite / PG   │
                          │   Database      │
                          └────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** (backend)
- **Node.js 18+** (frontend)
- **Flutter SDK 3.2+** (mobile, optional)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The web app will be available at `http://localhost:5173`.

### 3. Free Local AI Model Setup

The AI insight feature uses Ollama locally, so no paid API key is required.

```bash
# Install Ollama from https://ollama.com, then pull the default model
ollama pull llama3.2:3b

# Ollama runs at http://localhost:11434 by default
```

Optional backend `.env` overrides:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT_SECONDS=60
```

Use the lower-right `AI` assistant inside the web app to ask questions about livestock, health, treatment, vaccination, and traceability records.

### 4. Mobile Setup (Optional)

```bash
cd mobile

# Get dependencies
flutter pub get

# Run on a connected device/emulator
flutter run
```

## 📋 Login Credentials

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@livestock.com    | admin123   |
| Farmer | farmer@livestock.com   | farmer123  |
| Farmer | maria@livestock.com    | maria123   |

## 🧱 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend  | React 19, Vite 8, TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| Backend   | Python 3, FastAPI, SQLAlchemy, Pydantic, JWT Auth |
| Mobile    | Flutter/Dart, Hive, mobile_scanner, Dio |
| Database  | SQLite (dev) / PostgreSQL (prod) |
| Infra     | Docker, Docker Compose |

## 📦 Project Structure

```
Thesis_model/
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── main.py       # Entry point
│   │   ├── config.py     # Settings
│   │   ├── database.py   # SQLAlchemy setup
│   │   ├── models/       # ORM models (8 tables)
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/    # Auth + RBAC
│   │   └── utils/        # Security helpers
│   ├── seed.py           # Sample data
│   └── requirements.txt
├── frontend/             # React Web App
│   ├── src/
│   │   ├── pages/        # Route pages
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Auth context
│   │   ├── lib/          # API client
│   │   └── types/        # TypeScript types
│   └── package.json
├── mobile/               # Flutter App
│   ├── lib/
│   │   ├── screens/      # App screens
│   │   ├── services/     # API + Sync
│   │   ├── models/       # Data models
│   │   └── providers/    # State management
│   └── pubspec.yaml
├── docker-compose.yml
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/animals/` | List animals |
| POST | `/api/animals/` | Register animal |
| POST | `/api/animals/batch` | Batch register |
| GET | `/api/animals/{id}` | Animal detail |
| GET | `/api/animals/uid/{uid}` | Get by UID (QR scan) |
| GET/POST | `/api/health-records/` | Health records |
| GET/POST | `/api/treatments/` | Treatments |
| GET/POST | `/api/vaccinations/` | Vaccinations |
| GET/POST | `/api/movements/` | Supply chain |
| GET | `/api/movements/timeline/{id}` | Full traceability |
| GET | `/api/qr-codes/{id}` | QR code image |
| GET | `/api/dashboard/stats` | Analytics |

Full interactive docs: `http://localhost:8000/docs`

## 🔐 Security

- **JWT Authentication** with access + refresh tokens
- **bcrypt** password hashing (via passlib)
- **Role-Based Access Control** (Admin / User)
- Protected routes on both frontend and backend
- CORS configured for frontend origin

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## 📄 License

MIT License — Built for academic/capstone purposes.
