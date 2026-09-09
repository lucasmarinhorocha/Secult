# GearOne - Quick Reference Guide

## 🚀 Quick Start

### Windows
```bash
.\start.bat
```

### Linux / Mac
```bash
bash start.sh
```

### Manual Start
```bash
docker-compose build
docker-compose up -d
```

---

## 🌐 URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:3001/api | 3001 |
| Nginx Proxy | http://localhost | 80 |
| Health Check | http://localhost:3001/health | 3001 |

---

## 👤 Demo Login

**Email:** admin@gearone.com  
**Password:** admin123

Or use:
- **Email:** coordenador@gearone.com  
- **Password:** coord123

---

## 📋 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Check service status
docker-compose ps

# Restart a service
docker-compose restart backend

# Rebuild images
docker-compose build --no-cache

# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

---

## 🔧 Development Commands

### Frontend
```bash
# Install dependencies
npm install

# Start development server (localhost:3002)
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server (localhost:3001)
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Database migrations (when implemented)
npm run db:migrate
npm run db:seed
```

---

## 🔌 API Endpoints

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gearone.com",
    "password": "admin123"
  }'

# Response: { token, refreshToken, usuario }

# Refresh Token
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

### Events
```bash
# Get all events
curl -X GET http://localhost:3001/api/eventos \
  -H "Authorization: Bearer <token>"

# Get specific event
curl -X GET http://localhost:3001/api/eventos/1 \
  -H "Authorization: Bearer <token>"

# Create event
curl -X POST http://localhost:3001/api/eventos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Novo Evento",
    "dataInicio": "2026-08-01T00:00:00Z",
    "dataFim": "2026-08-02T00:00:00Z",
    "local": "São Paulo",
    "publicoTotal": 1000
  }'
```

### Health Checks
```bash
# Backend health
curl http://localhost:3001/health

# Nginx health  
curl http://localhost/health

# Database status (from inside container)
docker-compose exec postgres pg_isready -U postgres

# Redis status (from inside container)
docker-compose exec redis redis-cli ping
```

---

## 📁 Project Structure

```
Projeto_01/
├── src/                          # React Frontend
├── backend/                      # Node.js Backend
│   ├── src/
│   │   ├── server.ts            # Entry point
│   │   ├── config.ts            # Config management
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utilities
│   └── dist/                    # Compiled JS
├── nginx/                        # Nginx config
├── Dockerfile                    # Frontend container
├── docker-compose.yml            # Stack orchestration
├── .env.example                  # Environment template
├── DEPLOYMENT.md                 # Full deployment guide
├── ARCHITECTURE.md               # Architecture details
├── start.sh                      # Linux/Mac startup
└── start.bat                     # Windows startup
```

---

## 🐘 Database Access

### PostgreSQL Connection
```bash
# From outside container
psql -h localhost -U postgres -d gearone_db -W
# Password: postgres123

# From inside container
docker-compose exec postgres psql -U postgres -d gearone_db

# Execute SQL
docker-compose exec postgres psql -U postgres -d gearone_db \
  -c "SELECT version();"
```

### Redis Connection
```bash
# From inside container
docker-compose exec redis redis-cli

# From Redis CLI inside container
docker-compose exec redis redis-cli PING
docker-compose exec redis redis-cli FLUSHALL
```

---

## 🔒 Security

### Change JWT Secrets (Production)
Edit `.env`:
```env
JWT_SECRET=<new-long-random-string>
JWT_REFRESH_SECRET=<new-long-random-string>
```

### Change Database Password (Production)
Edit `.env`:
```env
DB_PASSWORD=<new-strong-password>
```

### Enable HTTPS (Production)
Update `nginx/conf.d/default.conf`:
```nginx
listen 443 ssl;
ssl_certificate /etc/nginx/certs/cert.pem;
ssl_certificate_key /etc/nginx/certs/key.pem;
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Services Not Starting
```bash
# Check logs
docker-compose logs

# Rebuild everything
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### CORS Errors
Make sure `CORS_ORIGIN` in `.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:3000
```

### API Connection Issues
```bash
# Test backend is running
curl http://localhost:3001/health

# Test API is accessible
curl http://localhost:3001/api

# Test through Nginx proxy
curl http://localhost/api
```

---

## 📊 Monitoring

### Service Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### View All Logs
```bash
docker-compose logs -f
```

### View Last 100 Lines
```bash
docker-compose logs --tail=100
```

---

## 🔄 Development Workflow

1. **Make code changes** in `src/` or `backend/src/`
2. **Hot reload** (automatic in development mode)
3. **Test changes** locally
4. **Commit to git**
5. **Deploy** (rebuild and restart Docker)

### For Backend Changes
```bash
cd backend
npm run dev          # Will auto-reload on changes
```

### For Frontend Changes
```bash
npm start            # Will auto-reload on changes
```

---

## 📚 File References

- **Frontend Config**: [package.json](package.json)
- **Backend Config**: [backend/package.json](backend/package.json)
- **API Client**: [src/services/api.ts](src/services/api.ts)
- **Environment**: [.env.example](.env.example)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 💾 Environment Variables

### Development
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3002
DB_HOST=localhost
DB_PASSWORD=postgres123
JWT_SECRET=dev-secret-key
LOG_LEVEL=info
```

### Production
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
DB_HOST=postgres
DB_PASSWORD=<strong-password>
JWT_SECRET=<strong-secret-key>
LOG_LEVEL=warn
```

---

## 🚢 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Change JWT secrets
- [ ] Change database password
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Configure HTTPS/SSL
- [ ] Run migrations: `npm run db:migrate`
- [ ] Run tests: `npm test`
- [ ] Build Docker images
- [ ] Deploy with orchestration tool (Docker Swarm, Kubernetes)
- [ ] Verify health endpoints
- [ ] Test API endpoints
- [ ] Monitor logs and metrics

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for architecture info
3. Check service logs: `docker-compose logs -f <service>`
4. Verify health endpoints

---

**Last Updated**: 2026-07-10  
**Version**: 1.0.0  
**Status**: Production Ready ✅
