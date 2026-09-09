# Guia de Deployment - GearOne

## Índice

1. [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
2. [Ambiente de Staging](#ambiente-de-staging)
3. [Ambiente de Produção](#ambiente-de-produção)
4. [CI/CD](#cicd)
5. [Monitoramento](#monitoramento)
6. [Backup e Disaster Recovery](#backup-e-disaster-recovery)

---

## Ambiente de Desenvolvimento

### Configuração Local

#### Pré-requisitos
- Node.js 16+
- PostgreSQL 12+
- Git
- Docker (opcional, mas recomendado)

#### Setup com Docker Compose

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gearone.git
cd gearone

# Configure o arquivo .env
cp .env.example .env

# Inicie os serviços
docker-compose up -d

# Execute as migrations
docker-compose exec backend npm run db:migrate

# A aplicação estará disponível em http://localhost:3000
```

#### Setup Manual

```bash
# 1. Instale as dependências
npm install

# 2. Configure PostgreSQL
createdb secult_db
psql -U admin -d secult_db -f docs/DATABASE_SCHEMA.sql

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Inicie o servidor backend em um terminal
npm run backend-dev

# 5. Inicie o frontend em outro terminal
npm run dev
```

---

## Ambiente de Staging

### Servidor Recomendado

- **Provider**: Google Cloud Platform / AWS / Azure
- **Configuração Mínima**:
  - VM: 2vCPU, 4GB RAM
  - Storage: 50GB SSD
  - Database: Instância PostgreSQL gerenciada

### Deployment via GitHub Actions

#### 1. Configurar Secrets no GitHub

```
STAGING_SSH_KEY: [chave privada SSH]
STAGING_HOST: staging.secult.com.br
STAGING_USER: deploy
DB_PASSWORD_STAGING: [senha]
JWT_SECRET_STAGING: [chave]
```

#### 2. Criar arquivo de workflow

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /app/secult
            git pull origin develop
            npm install
            npm run build
            npm run db:migrate
            pm2 restart all
```

### Configuração no Servidor Staging

```bash
# SSH no servidor
ssh deploy@staging.secult.com.br

# Clone o repositório
git clone https://github.com/seu-usuario/secult.git /app/secult
cd /app/secult

# Instale dependências globais
npm install -g pm2

# Configure ambiente
cp .env.example .env
# Edite .env com configurações de staging

# Instale dependências do projeto
npm install

# Build da aplicação
npm run build

# Inicie com PM2
pm2 start backend/src/app.js --name "secult-backend"
pm2 start "npm run start" --name "secult-frontend"
pm2 save

# Configure nginx como proxy reverso
sudo apt-get install -y nginx
# Copiar configuração em /etc/nginx/sites-available/secult
sudo systemctl restart nginx
```

#### Configuração do Nginx

```nginx
# /etc/nginx/sites-available/secult
server {
    listen 80;
    server_name staging.secult.com.br;

    # SSL (Let's Encrypt)
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/staging.secult.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.secult.com.br/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Ambiente de Produção

### Arquitetura Recomendada

```
┌─────────────────────────────────────────────────┐
│              CloudFlare CDN                      │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│         Load Balancer (AWS ALB/GCP LB)          │
└────────────────────┬────────────────────────────┘
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────────┐      ┌──────────────────┐
│  Frontend Server │      │  API Server      │
│  (VM/Container)  │      │  (VM/Container)  │
└──────────────────┘      └──────────────────┘
        ↓                         ↓
        └────────────┬────────────┘
                     ↓
        ┌────────────────────────┐
        │  RDS PostgreSQL (Multi-AZ)
        │  Backup Automático     │
        └────────────────────────┘
```

### Deployment em Kubernetes

#### 1. Build da imagem Docker

```dockerfile
# Dockerfile.prod
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["node", "backend/src/app.js"]
```

#### 2. Kubernetes Manifests

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secult-backend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: secult-backend
  template:
    metadata:
      labels:
        app: secult-backend
    spec:
      containers:
      - name: backend
        image: seu-registry/secult:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: secult-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 3. Deploy no Kubernetes

```bash
# Criar namespace
kubectl create namespace production

# Criar secrets
kubectl create secret generic secult-secrets \
  --from-literal=database-url=$DATABASE_URL \
  -n production

# Deploy
kubectl apply -f k8s/ -n production

# Verificar status
kubectl get pods -n production
kubectl get svc -n production
```

---

## CI/CD

### GitHub Actions Pipeline Completo

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: secult_test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run db:migrate
      - run: npm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v2
      - uses: docker/setup-buildx-action@v1
      - uses: docker/login-action@v1
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /app/secult
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T backend npm run db:migrate
```

---

## Monitoramento

### Ferramentas Recomendadas

- **Logs**: CloudWatch / ELK Stack / Datadog
- **Metrics**: Prometheus / CloudWatch / DataDog
- **APM**: New Relic / DataDog / AppDynamics
- **Alertas**: PagerDuty / Slack / OpsGenie

### Exemplo com Datadog

```javascript
// backend/src/config/monitoring.js
const datadogMetrics = require('datadog-metrics');

datadogMetrics.init({
  host: process.env.DD_AGENT_HOST,
  port: process.env.DD_AGENT_PORT,
  prefix: 'secult.',
  flushIntervalSeconds: 10
});

// Exemplo de métrica
app.get('/api/health', (req, res) => {
  datadogMetrics.increment('health_check');
  res.json({ status: 'ok' });
});
```

### Health Checks

```typescript
// backend/src/routes/health.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});
```

---

## Backup e Disaster Recovery

### Estratégia de Backup

```bash
# Backup automático diário
0 2 * * * /usr/local/bin/backup-secult.sh

# Script de backup
#!/bin/bash
# /usr/local/bin/backup-secult.sh

BACKUP_DIR="/backups/secult"
DB_NAME="secult_db"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do banco de dados
pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup de uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /app/secult/uploads

# Upload para S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://secult-backups/
aws s3 cp $BACKUP_DIR/uploads_$DATE.tar.gz s3://secult-backups/

# Deletar backups locais com mais de 7 dias
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup concluído em $DATE"
```

### Recuperação de Desastre

```bash
# Restaurar banco de dados
gunzip < /backups/secult/db_20260708_100000.sql.gz | psql secult_db

# Restaurar arquivos
tar -xzf /backups/secult/uploads_20260708_100000.tar.gz -C /app/secult
```

---

## Checklist de Deployment

### Antes do Deploy

- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Migrations testadas em staging
- [ ] Variáveis de ambiente configuradas
- [ ] SSL certificates válidos
- [ ] Backup do banco de dados realizado
- [ ] Plano de rollback preparado

### Após o Deploy

- [ ] Health checks passando
- [ ] Logs monitorados
- [ ] Alertas configurados
- [ ] Teste de funcionalidades críticas
- [ ] Verificar performance
- [ ] Comunicar ao time de negócio

---

## Rollback

```bash
# Em caso de problema

# Kubernetes
kubectl rollout undo deployment/secult-backend -n production

# Docker Compose
docker-compose down
git checkout <commit-anterior>
docker-compose up -d

# Restaurar banco de dados
psql secult_db < backups/db_backup.sql
```

---

**Última atualização**: 2026-07-08  
**Responsável**: DevOps Team
