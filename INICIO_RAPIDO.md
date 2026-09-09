# GUIA RÁPIDO DE INÍCIO - SECULT

## 🚀 Começar em 5 minutos

### 1. Pré-requisitos
```bash
- Node.js 16+
- npm ou yarn
- Git
```

### 2. Clone e Setup
```bash
git clone https://github.com/seu-usuario/secult.git
cd secult

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

### 3. Inicie a aplicação
```bash
# Terminal 1 - Frontend (http://localhost:3000)
npm run dev

# Terminal 2 - Backend (http://localhost:3001) [quando tiver implementado]
npm run backend-dev
```

---

## 📁 Estrutura de Pastas

```
gearone/
├── docs/
│   ├── ARQUITETURA_TECNICA.md       ← Leia primeiro!
│   ├── API_SPEC.md                  ← Especificação das APIs
│   ├── DATABASE_SCHEMA.sql          ← Schema do banco
│   └── DEPLOYMENT_GUIDE.md          ← Deploy em prod
│
├── src/
│   ├── components/                   ← Componentes React
│   │   ├── Auth/                     ← Autenticação
│   │   ├── Common/                   ← Layout, componentes comuns
│   │   ├── Dashboard/                ← Dashboard executivo
│   │   ├── Insumos/                  ← Controle de insumos
│   │   ├── Ocorrencias/              ← Ocorrências técnicas
│   │   ├── Documentos/               ← Gestão de docs
│   │   └── Presenca/                 ← Sistema de presença
│   │
│   ├── models/types.ts              ← Tipos TypeScript
│   ├── services/                     ← Lógica de negócio
│   │   ├── api.ts                   ← Cliente HTTP
│   │   ├── auth.ts                  ← Autenticação
│   │   └── offline-sync.ts          ← Sincronização offline
│   │
│   ├── controllers/                  ← Controladores (MVC)
│   ├── context/                      ← Context API
│   ├── utils/                        ← Funções utilitárias
│   ├── styles/                       ← Estilos globais
│   ├── App.tsx                       ← Componente raiz
│   └── index.tsx                     ← Entry point
│
├── public/
│   ├── index.html                    ← HTML principal
│   └── service-worker.js             ← Suporte offline
│
├── backend/                          ← Backend (será implementado)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔐 Credenciais de Teste

```
Email:    coordenador@test.com
Senha:    password123
Perfil:   COORDENADOR
```

---

## 🎯 Próximos Passos

### 1. Compreenda a Arquitetura
📖 Leia: [ARQUITETURA_TECNICA.md](./docs/ARQUITETURA_TECNICA.md)

### 2. Implemente o Backend
- Setup Node.js/Express
- Conectar PostgreSQL
- Implementar autenticação JWT
- Criar controllers e rotas

### 3. Desenvolva os Módulos
- [ ] Dashboard Executivo
- [ ] Controle de Insumos
- [ ] Ocorrências Técnicas
- [ ] Gestão Documental
- [ ] Sistema de Presença

### 4. Testes
```bash
npm test              # Testes unitários
npm run test:e2e      # Testes E2E
npm run lint          # Verificar código
```

### 5. Deploy
📖 Leia: [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev                # Inicia frontend
npm run backend-dev        # Inicia backend

# Build
npm run build             # Build de produção
npm run build:backend     # Build do backend

# Testes
npm test                  # Testes
npm run test:e2e          # Testes E2E (Cypress)

# Qualidade de código
npm run lint              # ESLint
npm run format            # Prettier

# Banco de dados
npm run db:migrate        # Executar migrations
npm run db:seed           # Popular com dados iniciais
```

---

## 📞 Precisando de Ajuda?

1. **Documentação técnica**: Ver `docs/ARQUITETURA_TECNICA.md`
2. **API**: Ver `docs/API_SPEC.md`
3. **Database**: Ver `docs/DATABASE_SCHEMA.sql`
4. **Deploy**: Ver `docs/DEPLOYMENT_GUIDE.md`

---

## 🎓 Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **UI**: Material-UI (MUI)
- **State**: Context API + IndexedDB
- **HTTP**: Axios
- **Autenticação**: JWT
- **Backend**: Node.js + Express (a implementar)
- **Database**: PostgreSQL
- **Deployment**: Docker, Kubernetes, GitHub Actions

---

## ✅ Checklist de Desenvolvimento

### Fase 1: Fundação
- [x] Setup do projeto
- [x] Estrutura de pastas
- [x] Tipos TypeScript
- [x] Context de autenticação
- [x] Layout base
- [ ] Testes de exemplo
- [ ] Backend setup

### Fase 2: Dashboard
- [ ] Gráficos
- [ ] Alertas em tempo real
- [ ] Exportação de relatórios

### Fase 3-6: Outros módulos
- [ ] Insumos
- [ ] Ocorrências
- [ ] Documentos
- [ ] Presença

### Fase 7: Produção
- [ ] LGPD compliance
- [ ] Testes E2E
- [ ] Performance
- [ ] Deploy

---

## 📊 Roadmap

**Semana 1-2**: Setup + Autenticação  
**Semana 3-4**: Dashboard  
**Semana 5-6**: Insumos  
**Semana 7-8**: Ocorrências  
**Semana 9-10**: Documentos  
**Semana 11-12**: Presença  
**Semana 13**: Testes + Deploy  

---

## 💡 Dicas Importantes

1. **Sempre usar TypeScript** - Evita bugs
2. **Testar offline** - Simular offline no DevTools
3. **Audit de segurança** - Antes de qualquer deploy
4. **Documentar** - Manter docs atualizados
5. **Code review** - Pull requests antes de merge

---

**Versão**: 1.0  
**Última atualização**: 2026-07-08  
**Status**: 🟢 Pronto para desenvolvimento
