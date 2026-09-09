# GearOne - Sistema de Gestão de Eventos e Insumos

Aplicação full-stack com React + TypeScript frontend e Node.js/Express backend, containerizada com Docker e orquestrada com Docker Compose.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                │
│                   (localhost:80, :443)                  │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐          ┌─────▼──────┐
    │Frontend │          │  Backend   │
    │ (3000)  │          │  (3001)    │
    └─────────┘          └─────┬──────┘
                               │
                   ┌───────────┼───────────┐
                   │           │           │
              ┌────▼──┐  ┌─────▼──┐  ┌───▼────┐
              │Postgres│  │ Redis  │  │Volumes │
              │(5432)  │  │(6379)  │  │        │
              └────────┘  └────────┘  └────────┘
```

## Estrutura de Pastas

```
Projeto_01/
├── src/                          # Frontend React
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── models/
│   ├── App.tsx
│   └── index.tsx
├── backend/                       # Backend Node.js
│   ├── src/
│   │   ├── server.ts
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── nginx/                         # Nginx configuration
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
├── Dockerfile                     # Frontend Docker image
├── docker-compose.yml             # Full stack orchestration
├── .env.example                   # Environment template
└── package.json                   # Frontend dependencies
```

## Pré-requisitos

- Docker & Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Git

## Instalação

### 1. Clonar o repositório

```bash
git clone <repo-url>
cd Projeto_01
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env` conforme necessário:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3000
DB_HOST=postgres
DB_PASSWORD=postgres123
JWT_SECRET=your-secret-key-change-in-production
```

## Desenvolvimento Local

### Sem Docker

```bash
# Terminal 1: Frontend
npm install
npm start  # http://localhost:3002

# Terminal 2: Backend
cd backend
npm install
npm run dev  # http://localhost:3001/api

# Terminal 3: PostgreSQL (necessário)
docker run -d --name gearone-postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=gearone_db \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 4: Redis (opcional)
docker run -d --name gearone-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Com Docker (Recomendado)

```bash
# Build e inicie todos os serviços
docker-compose up -d

# Verifique status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down
```

**URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Nginx: http://localhost (porta 80)

## API Endpoints

### Authentication

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@gearone.com",
  "password": "admin123"
}

# Response
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "usuario": {
      "id": "1",
      "email": "admin@gearone.com",
      "nome": "Administrador",
      "perfil": "ADMIN"
    }
  }
}

# Refresh Token
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Events

```bash
# List events
GET /api/eventos
Authorization: Bearer <token>

# Create event
POST /api/eventos
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Evento 1",
  "dataInicio": "2026-07-15T00:00:00Z",
  "dataFim": "2026-07-16T00:00:00Z",
  "local": "São Paulo",
  "publicoTotal": 500
}

# Get event
GET /api/eventos/:id
Authorization: Bearer <token>
```

## Demo Users

| Email | Senha | Role |
|-------|-------|------|
| admin@gearone.com | admin123 | ADMIN |
| coordenador@gearone.com | coord123 | COORDENADOR |

## Testes

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# API integration tests
npm run test:integration
```

## Deployment

### Production Docker Build

```bash
# Build images
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Environment Variables (Production)

```env
NODE_ENV=production
JWT_SECRET=<strong-random-key>
JWT_REFRESH_SECRET=<strong-random-key>
DB_PASSWORD=<strong-password>
CORS_ORIGIN=https://yourdomain.com
```

### Scaling

```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Load balancing handled by Nginx
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Nginx health
curl http://localhost/health

# Database health
docker-compose exec postgres pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Metrics

- CPU/Memory: `docker stats`
- Network: `docker network inspect gearone-network`
- Volume space: `docker volume inspect <volume-name>`

## Troubleshooting

### Port already in use

```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Docker
docker-compose down -v
```

### Database connection error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### CORS errors

Verifique se `CORS_ORIGIN` no `.env` corresponde à URL do frontend.

### Build errors

```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## CI/CD

Exemplo GitHub Actions: `.github/workflows/deploy.yml`

## Segurança

- ✅ HTTPS ready (Nginx config included)
- ✅ CORS configured
- ✅ Rate limiting on API
- ✅ Helmet.js for security headers
- ✅ JWT authentication
- ✅ Environment variable secrets
- ✅ Health checks
- ⚠️ TODO: Database encryption
- ⚠️ TODO: API key management
- ⚠️ TODO: WAF rules

## Performance

- PostgreSQL indexes: TBD
- Redis caching: Configured
- Nginx compression: gzip enabled
- Frontend optimization: React code splitting

## Roadmap

- [ ] Implementar endpoints para todas as entidades
- [ ] Integrar banco de dados real
- [ ] Adicionar autenticação OAuth2
- [ ] Implementar paginação e filtros
- [ ] Adicionar file uploads (S3/MinIO)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Análises e relatórios
- [ ] Admin dashboard

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Proprietário - Todos os direitos reservados

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato com o time de desenvolvimento.
