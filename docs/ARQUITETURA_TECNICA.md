# ARQUITETURA DE SOFTWARE - SISTEMA DE GESTÃO INTEGRADA DO HUB (GearOne)

## Documento Técnico de Arquitetura e Plano de Desenvolvimento

**Versão:** 1.0  
**Data:** 2026-07-08  
**Status:** DESIGN ARCHITECTURE  
**Responsável:** Arquiteto de Software

---

## 1. ARQUITETURA PROPOSTA

### 1.1 Estratégia de Arquitetura: MONOLITO MODULAR COM API BACKEND INDEPENDENTE

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React MVC)                        │
│  ┌─────────────┬──────────┬─────────┬────────┬─────────────────┐
│  │ Dashboard   │Insumos   │Ocorrências│Docs   │Presença/QR Code │
│  │ Executivo   │Almoxarifado│Técnicas│Autom.│& Eventos         │
│  └─────────────┴──────────┴─────────┴────────┴─────────────────┘
│         ↓ HTTP/REST + WebSocket (Real-Time)
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              API GATEWAY + BACKEND (Node.js/Express)             │
│  ┌──────────────┬──────────┬─────────┬────────┬──────────────┐
│  │ Auth Service │Dashboard │ Insumos │Ocor.   │ Presença     │
│  │ + RBAC       │ Service  │ Service │Service │ Service      │
│  └──────────────┴──────────┴─────────┴────────┴──────────────┘
│         ↓ (SQL Queries)
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│        DATABASE (PostgreSQL + IndexedDB para Offline)            │
│  ┌───────────────────────────────────────────────────────────┐
│  │ Tabelas: Usuários, Eventos, Insumos, Ocorrências, Contratos│
│  │ Backup Local: IndexedDB (Sincronização ao reconectar)     │
│  └───────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            INTEGRAÇÕES EXTERNAS                                  │
│  ├─ Web Scraping: esmaiscriativo.es.gov.br                      │
│  ├─ Email Service: Nodemailer / SendGrid                        │
│  ├─ PDF Generator: jsPDF / PDFKit                               │
│  ├─ QR Code: qrcode.js                                          │
│  └─ Push Notifications: Firebase Cloud Messaging (FCM)           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológico Completo

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | React 18 + TypeScript | Reatividade, ecossistema maduro, componentização |
| **Linguagem** | JavaScript/TypeScript | Compatibilidade full-stack, melhor performance |
| **State Management** | Context API + Redux (opcional) | Gerenciamento centralizado de estado global |
| **HTTP Client** | Axios | Interceptadores, retry automático, requisições offline |
| **Backend** | Node.js + Express.js | Escalabilidade, API REST estruturada, processamento assíncrono |
| **Banco de Dados** | PostgreSQL + IndexedDB | Relacional robusto + offline-first |
| **Autenticação** | JWT + Session Storage | Stateless, compatível com SPA, seguro |
| **UI Framework** | Material-UI / Tailwind CSS | Design responsivo, acessibilidade, temas |
| **Documentação** | Swagger/OpenAPI | Autodocumentação da API |
| **Versionamento** | Git + GitHub | Controle de código, CI/CD |

---

## 2. MODELAGEM DE DADOS INICIAL

### 2.1 Entidades Principais e Relacionamentos

```sql
-- USUÁRIOS E PERMISSÕES
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  perfil ENUM('COORDENADOR', 'RECEPCAO', 'PRODUCAO', 'LIMPEZA', 'ADMIN'),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissoes (
  id UUID PRIMARY KEY,
  perfil VARCHAR(50) NOT NULL,
  recurso VARCHAR(100) NOT NULL,
  acao ENUM('CRIAR', 'LER', 'ATUALIZAR', 'DELETAR') NOT NULL,
  UNIQUE(perfil, recurso, acao)
);

-- DASHBOARD E MÉTRICAS
CREATE TABLE eventos (
  id UUID PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  local VARCHAR(255),
  publico_total INTEGER DEFAULT 0,
  status ENUM('PLANEJADO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE metricas_impacto (
  id UUID PRIMARY KEY,
  data_registro DATE NOT NULL,
  total_eventos INTEGER,
  total_publico INTEGER,
  receita DECIMAL(10, 2),
  UNIQUE(data_registro)
);

-- CONTRATOS E ALVARÁS
CREATE TABLE contratos (
  id UUID PRIMARY KEY,
  fornecedor VARCHAR(255) NOT NULL,
  tipo ENUM('SEGURANCA', 'LIMPEZA', 'MANUTENCAO', 'OUTROS'),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status ENUM('ATIVO', 'VENCIDO', 'PROXIMO_VENCIMENTO'),
  valor DECIMAL(10, 2),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alvaras (
  id UUID PRIMARY KEY,
  tipo ENUM('CORPO_BOMBEIROS', 'PMV', 'OUTROS'),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status ENUM('VALIDO', 'VENCIDO', 'PROXIMO_VENCIMENTO'),
  arquivo_url VARCHAR(500)
);

-- INSUMOS E ALMOXARIFADO
CREATE TABLE insumos (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria ENUM('COPA', 'HIGIENE', 'LIMPEZA', 'OUTROS'),
  quantidade_atual INTEGER DEFAULT 0,
  quantidade_minima INTEGER NOT NULL,
  localizacao ENUM('TERREO', '2_ANDAR', 'OUTRO'),
  unidade ENUM('PACOTE', 'LITRO', 'UNIDADE', 'CX'),
  preco_unitario DECIMAL(10, 2),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE movimentacoes_insumos (
  id UUID PRIMARY KEY,
  insumo_id UUID REFERENCES insumos(id),
  tipo_movimento ENUM('ENTRADA', 'SAIDA', 'AJUSTE'),
  quantidade INTEGER NOT NULL,
  motivo VARCHAR(500),
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE solicitacoes_reposicao (
  id UUID PRIMARY KEY,
  insumo_id UUID REFERENCES insumos(id),
  usuario_solicitante_id UUID REFERENCES usuarios(id),
  quantidade_solicitada INTEGER NOT NULL,
  status ENUM('PENDENTE', 'APROVADA', 'REJEITADA', 'ENTREGUE'),
  data_solicitacao TIMESTAMP DEFAULT NOW(),
  data_aprovacao TIMESTAMP,
  data_entrega TIMESTAMP
);

-- OCORRÊNCIAS TÉCNICAS
CREATE TABLE ocorrencias_tecnicas (
  id UUID PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo ENUM('ELEVADOR', 'TOMADAS', 'AR_CONDICIONADO', 'FORRO', 'OUTRO'),
  localidade VARCHAR(255),
  foto_url VARCHAR(500),
  severidade ENUM('BAIXA', 'MEDIA', 'ALTA'),
  status ENUM('ABERTA', 'EM_ATENDIMENTO', 'RESOLVIDA', 'CANCELADA'),
  usuario_reporter_id UUID REFERENCES usuarios(id),
  fornecedor_atribuido_id UUID REFERENCES fornecedores(id),
  data_abertura TIMESTAMP DEFAULT NOW(),
  data_resolucao TIMESTAMP
);

CREATE TABLE fornecedores (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  especialidade VARCHAR(255),
  contato_responsavel VARCHAR(255)
);

-- DOCUMENTOS GERADOS
CREATE TABLE documentos_gerados (
  id UUID PRIMARY KEY,
  tipo ENUM('CARTA_ANUENCIA', 'RELATORIO', 'OUTROS'),
  template_id VARCHAR(100),
  dados_preenchimento JSON NOT NULL,
  arquivo_url VARCHAR(500),
  usuario_gerador_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- PRESENÇA E EVENTOS (QR CODE)
CREATE TABLE listas_presenca (
  id UUID PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id),
  data_criacao TIMESTAMP DEFAULT NOW(),
  status ENUM('PLANEJADA', 'EM_USO', 'FINALIZADA', 'SINCRONIZADA')
);

CREATE TABLE registros_presenca (
  id UUID PRIMARY KEY,
  lista_presenca_id UUID REFERENCES listas_presenca(id),
  nome_participante VARCHAR(255),
  email_participante VARCHAR(255),
  cpf_participante VARCHAR(11),
  horario_checkin TIMESTAMP,
  metodo_checkin ENUM('QR_CODE', 'MANUAL', 'IMPORT'),
  consentimento_lgpd BOOLEAN DEFAULT false,
  sincronizado BOOLEAN DEFAULT false
);

-- NOTIFICAÇÕES
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  tipo ENUM('MANUTENCAO', 'ESTOQUE_BAIXO', 'CONTRATO_VENCENDO', 'EVENTO_PROXIMO'),
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_leitura TIMESTAMP
);
```

### 2.2 Diagrama ER Simplificado

```
[USUÁRIOS] ────────────┐
    ├─ PERMISSÕES      │
    ├─ NOTIFICAÇÕES    │
    └─ DOCUMENTOS      │

[EVENTOS] ────────────┐
    ├─ LISTAS_PRESENCA│
    │   └─ REGISTROS_PRESENCA
    └─ METRICAS

[CONTRATOS] ────────────┐
[ALVARAS]               ├─ DASHBOARD EXECUTIVO
[NOTIFICACOES] ─────────┘

[INSUMOS] ────────────────┐
    ├─ MOVIMENTACOES      │
    ├─ SOLICITACOES       ├─ ALMOXARIFADO
    └─ NOTIFICAÇÕES ──────┘

[OCORRENCIAS] ────────────┐
    ├─ FORNECEDORES       ├─ OCORRÊNCIAS TÉCNICAS
    └─ FOTOS ─────────────┘
```

---

## 3. ESTRATÉGIA DE IMPLEMENTAÇÃO DOS REQUISITOS NÃO FUNCIONAIS

### 3.1 RBAC (Role-Based Access Control)

#### Matriz de Permissões Granular

```json
{
  "COORDENADOR": {
    "dashboard": ["ler", "exportar_relatorio"],
    "contratos": ["ler", "criar", "atualizar"],
    "alvaras": ["ler", "atualizar"],
    "eventos": ["ler", "criar", "atualizar", "deletar"],
    "usuarios": ["ler", "criar", "atualizar"],
    "documentos": ["ler", "criar", "gerar"]
  },
  "RECEPCAO": {
    "listas_presenca": ["ler", "criar", "atualizar"],
    "eventos": ["ler"],
    "documentos": ["ler", "gerar_carta_anuencia"],
    "fornecedores_contatos": ["ler"]
  },
  "PRODUCAO": {
    "ocorrencias": ["ler", "criar", "atualizar"],
    "insumos": ["ler", "criar_solicitacao"],
    "eventos": ["ler"],
    "documentos": ["ler"]
  },
  "LIMPEZA": {
    "insumos": ["ler", "criar_solicitacao"],
    "ocorrencias": ["ler", "criar"],
    "eventos": ["ler"]
  }
}
```

#### Implementação em Código

```typescript
// middleware/authorizationMiddleware.ts
export const authorize = (requiredPermissions: string[]) => {
  return async (req, res, next) => {
    const user = req.user;
    const userPermissions = await getPermissionsByRole(user.perfil);
    
    const hasPermission = requiredPermissions.every(perm =>
      userPermissions.includes(perm)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};

// Usage
app.post('/contratos', authorize(['contratos:criar']), criarContratoController);
```

### 3.2 Segurança e Conformidade com LGPD

#### Estratégia de Criptografia

```typescript
// utils/encryption.ts
import crypto from 'crypto';

export class CryptoService {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly key = process.env.ENCRYPTION_KEY;

  // Criptografia em Repouso
  static encryptAtRest(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  static decryptAtRest(encrypted: string): string {
    const [iv, data, authTag] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.key),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// utils/lgpdCompliance.ts
export class LGPDCompliance {
  // Consentimento digital
  static generateConsentTerms(type: 'evento' | 'newsletter') {
    return {
      texto: 'Autorizo a coleta e processamento de meus dados conforme LGPD...',
      versao: '1.0',
      data_criacao: new Date(),
      tipo: type
    };
  }

  // Direito ao esquecimento
  static async deleteUserData(userId: string) {
    await Promise.all([
      usuarios.delete({ id: userId }),
      registros_presenca.deleteMany({ participante_id: userId }),
      notificacoes.deleteMany({ usuario_id: userId })
    ]);
  }

  // Auditoria de acesso
  static logDataAccess(userId: string, action: string, data: string) {
    return {
      usuario_id: userId,
      acao: action,
      dados_acessados: data,
      timestamp: new Date(),
      ip_origem: null // Capturar do req
    };
  }
}
```

#### HTTPS e TLS

```javascript
// server.js
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

const options = {
  key: fs.readFileSync('./certs/private.key'),
  cert: fs.readFileSync('./certs/certificate.crt')
};

https.createServer(options, app).listen(3443);
```

### 3.3 Integração via API e Web Scraping

#### Exemplo de Web Scraping - esmaiscriativo.es.gov.br

```typescript
// services/eventosService.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export class EventosService {
  static async importarEventosDoSite() {
    try {
      const response = await axios.get('https://esmaiscriativo.es.gov.br/eventos');
      const $ = cheerio.load(response.data);
      
      const eventos = [];
      $('.evento-item').each((index, element) => {
        eventos.push({
          titulo: $(element).find('.titulo').text(),
          data: $(element).find('.data').text(),
          local: $(element).find('.local').text(),
          descricao: $(element).find('.descricao').text(),
          fonte: 'WEB_SCRAPING',
          data_import: new Date()
        });
      });
      
      // Salvar no BD
      await db.eventos.insertMany(eventos);
      return { total: eventos.length, status: 'sucesso' };
    } catch (error) {
      console.error('Erro ao importar eventos:', error);
      throw new Error('Falha na integração com site oficial');
    }
  }
}
```

#### API REST Interna - Exemplo

```typescript
// controllers/eventosController.ts
export class EventosController {
  static async listar(req, res) {
    try {
      const eventos = await db.eventos.findMany({
        where: { ativo: true },
        skip: req.query.skip || 0,
        take: req.query.take || 10
      });
      
      res.json({
        data: eventos,
        total: await db.eventos.count(),
        page: req.query.page || 1
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async criar(req, res) {
    try {
      const evento = await db.eventos.create({
        data: req.body
      });
      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

### 3.4 Disponibilidade Offline / Fallback Mecânico

#### Estratégia com IndexedDB + Service Workers

```typescript
// utils/offlineSync.ts
export class OfflineSync {
  private dbName = 'GEARONE_DB';
  private storeName = 'presenca_offline';

  // Salvar dados localmente
  async saveOffline(data: any) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.add(data);

        resolve({ salvo: true, timestamp: new Date() });
      };

      request.onerror = reject;
    });
  }

  // Sincronizar ao reconectar
  async syncOnReconnect() {
    if (!navigator.onLine) return;

    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = async (e) => {
        const db = e.target.result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const allData = store.getAll();

        allData.onsuccess = async () => {
          const dados = allData.result;

          // Enviar para servidor
          for (const item of dados) {
            try {
              await axios.post('/api/presenca/sincronizar', item);
              // Deletar após sincronizar
              const delTx = db.transaction([this.storeName], 'readwrite');
              delTx.objectStore(this.storeName).delete(item.id);
            } catch (error) {
              console.error('Erro ao sincronizar:', error);
            }
          }

          resolve({ sincronizados: dados.length });
        };
      };
    });
  }
}

// service-worker.ts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('GEARONE-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles/main.css',
        '/scripts/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 4. PLANO DE DESENVOLVIMENTO EM SPRINTS/FASES

### 4.1 Timeline e Roadmap Completo

**Duração Total Estimada:** 6 Meses (26 Sprints de 2 semanas)

### 4.2 Fases do Projeto

#### **FASE 1: FUNDAÇÃO (Sprints 1-4) - 8 Semanas**

**Sprint 1-2: Setup e Arquitetura Base**
- [x] Inicializar projeto React com TypeScript
- [x] Configurar estrutura de pastas MVC
- [x] Setup do backend Node.js/Express
- [x] Configurar PostgreSQL e migrations
- [x] Setup de autenticação JWT
- [ ] Documentar API com Swagger

**Sprint 3-4: Autenticação e RBAC**
- [ ] Implementar login/logout
- [ ] Sistema de permissões granular
- [ ] Middleware de autorização
- [ ] Testes de autenticação
- [ ] Implementar refresh token

#### **FASE 2: DASHBOARD EXECUTIVO (Sprints 5-8) - 8 Semanas**

**Sprint 5-6: Dashboard Base**
- [ ] Layout responsivo do dashboard
- [ ] Gráficos de métricas (Chart.js / Recharts)
- [ ] Cards de KPIs (eventos, público)
- [ ] Histórico de métricas

**Sprint 7-8: Alertas e Contratos**
- [ ] Sistema de notificações em tempo real (Socket.io)
- [ ] Monitoramento de contratos
- [ ] Status de alvarás
- [ ] Exportação PDF/Excel (jsPDF / ExcelJS)

#### **FASE 3: ALMOXARIFADO (Sprints 9-12) - 8 Semanas**

**Sprint 9: Inventário Digital**
- [ ] CRUD de insumos
- [ ] Categorização e localização
- [ ] Interface de consulta rápida
- [ ] Filtros e busca avançada

**Sprint 10-11: Reposição e Alertas**
- [ ] Fluxo de solicitação de reposição
- [ ] Sistema de alertas de estoque mínimo
- [ ] Histórico de movimentações
- [ ] Relatórios de consumo

**Sprint 12: Testes e Otimização**
- [ ] Testes unitários e integração
- [ ] Performance optimization
- [ ] Documentação de APIs

#### **FASE 4: OCORRÊNCIAS TÉCNICAS (Sprints 13-16) - 8 Semanas**

**Sprint 13-14: Diário de Ocorrências**
- [ ] Formulário mobile-first
- [ ] Upload de fotos (React Dropzone / Multer)
- [ ] Interface de listagem com status
- [ ] Filtros por tipo e data

**Sprint 15-16: Gestão de Chamados**
- [ ] Atribuição automática de fornecedores
- [ ] Workflow de ocorrências
- [ ] Notificações para fornecedores
- [ ] Histórico e rastreamento

#### **FASE 5: GESTÃO DOCUMENTAL (Sprints 17-20) - 8 Semanas**

**Sprint 17-18: Gerador de Documentos**
- [ ] Formulário de Carta de Anuência
- [ ] Template engine (Handlebars / EJS)
- [ ] Preenchimento automático de dados
- [ ] Geração de PDF

**Sprint 19-20: Repositório de Consulta**
- [ ] Central de credenciais
- [ ] Contatos de fornecedores
- [ ] Diretrizes de recepção
- [ ] Busca e filtros

#### **FASE 6: PRESENÇA E EVENTOS (Sprints 21-24) - 8 Semanas**

**Sprint 21-22: Sistema de QR Code**
- [ ] Gerador de QR codes (qrcode.js)
- [ ] Scanner via câmera (react-qr-reader)
- [ ] Check-in em tempo real
- [ ] Interface mobile otimizada

**Sprint 23-24: Sistema Híbrido e Sincronização**
- [ ] Geração de listas impressas
- [ ] Input manual de presença
- [ ] Sincronização com dados digitais
- [ ] Offline-first implementation

#### **FASE 7: IMPLEMENTAÇÃO DE RNF + TESTES (Sprints 25-26) - 4 Semanas**

**Sprint 25: Segurança LGPD**
- [ ] Implementar criptografia de dados
- [ ] Consentimento digital
- [ ] Audit logs
- [ ] Direito ao esquecimento

**Sprint 26: Testes e Deploy**
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Testes de segurança
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Deploy em ambiente staging

### 4.3 Roadmap de Evolução Pós-MVP (Futuro)

**Módulo IA Preditiva (Sprint 27-30)**
- Análise de séries temporais de consumo
- Previsão de demanda de insumos
- Machine Learning com TensorFlow.js

**Automação de Fluxos (Sprint 31-34)**
- Bot de atualização de status
- Automação de pipeline de eventos
- Webhooks reativos

**Base de Conhecimento (Sprint 35+)**
- LMS integrado
- Repositório de vídeo-tutoriais
- Onboarding automatizado

---

## 5. ESTRUTURA DE PASTAS DO PROJETO

```
projeto-secult/
├── docs/
│   ├── ARQUITETURA_TECNICA.md (este arquivo)
│   ├── API_SPEC.md
│   ├── DATABASE_SCHEMA.sql
│   └── DEPLOYMENT_GUIDE.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   ├── Insumos/
│   │   │   ├── Ocorrencias/
│   │   │   ├── Documentos/
│   │   │   ├── Presenca/
│   │   │   ├── Auth/
│   │   │   └── Common/
│   │   │
│   │   ├── models/
│   │   │   ├── Usuario.ts
│   │   │   ├── Evento.ts
│   │   │   ├── Insumo.ts
│   │   │   ├── Ocorrencia.ts
│   │   │   └── Contrato.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── DashboardController.ts
│   │   │   ├── InsumosController.ts
│   │   │   ├── OcorrenciasController.ts
│   │   │   ├── DocumentosController.ts
│   │   │   └── PresencaController.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── offline-sync.ts
│   │   │   └── notifications.ts
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── NotificationsContext.tsx
│   │   │   └── AppContext.tsx
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── storage.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── responsive.css
│   │   │
│   │   ├── App.tsx
│   │   └── index.tsx
│   │
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   │
│   ├── migrations/
│   │   ├── 001_create_usuarios.sql
│   │   ├── 002_create_eventos.sql
│   │   └── ...
│   │
│   ├── seeds/
│   │   └── seed-permissions.sql
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   └── package.json
│
├── .env.example
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 6. REQUISITOS DE INFRAESTRUTURA

### 6.1 Ambiente Desenvolvimento

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: secult_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: senha_segura
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://admin:senha_segura@postgres:5432/secult_db
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 6.2 Ambiente Produção

- **Hosting:** AWS EC2 / Google Cloud / Azure
- **CDN:** CloudFront / Cloudflare
- **Banco de Dados:** RDS PostgreSQL
- **Storage:** S3 (documentos, fotos)
- **Emails:** SES / SendGrid
- **Logs:** CloudWatch / ELK Stack
- **Monitoring:** DataDog / New Relic
- **CI/CD:** GitHub Actions / Jenkins

---

## 7. SEGURANÇA E CONFORMIDADE

### 7.1 Checklist de Segurança

- [ ] HTTPS/TLS em todos os endpoints
- [ ] CORS configurado corretamente
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation e sanitização
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (helmet.js)
- [ ] CSRF tokens
- [ ] Senhas hasheadas (bcryptjs)
- [ ] JWT com expiração
- [ ] Logs de acesso e auditoria
- [ ] Backup automático do banco
- [ ] Disaster recovery plan

### 7.2 Conformidade LGPD

- [ ] Consentimento prévio coletado
- [ ] Direito de acesso aos dados
- [ ] Direito ao esquecimento
- [ ] Portabilidade de dados
- [ ] Criptografia de dados sensíveis
- [ ] Notificação de brechas de segurança
- [ ] DPO (Data Protection Officer) designado
- [ ] Política de privacidade clara

---

## 8. MÉTRICAS DE SUCESSO

| KPI | Meta | Ferramenta |
|-----|------|-----------|
| Disponibilidade | 99.5% uptime | Uptime Robot |
| Performance | < 2s load time | Lighthouse |
| Segurança | 0 vulnerabilidades críticas | OWASP ZAP |
| Usabilidade | NPS > 8 | Surveys |
| Adoção | 100% dos coordenadores usando em 3 meses | Analytics |
| Redução de retrabalho | 40% redução em duplicações | Process metrics |

---

## 9. PRÓXIMOS PASSOS

1. ✅ Aprovação desta arquitetura pelo time de negócio
2. ⏳ Setup de ambiente de desenvolvimento
3. ⏳ Iniciar Sprint 1: Configuração do projeto base
4. ⏳ Realizar kickoff com o time completo
5. ⏳ Estabelecer comunicação contínua com stakeholders

---

**Documento preparado para SECULT - Sistema de Gestão Integrada do HUB**  
**Última atualização:** 2026-07-08  
**Próxima revisão recomendada:** Após Sprint 4
