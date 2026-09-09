# Especificação de API REST - GearOne

## Visão Geral

API REST para o Sistema de Gestão Integrada do HUB (GearOne). Base URL: `/api/v1`

## Autenticação

Todas as requisições devem incluir o token JWT no header:

```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. AUTENTICAÇÃO

#### POST /auth/login
Fazer login no sistema

**Request:**
```json
{
  "email": "coordenador@test.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": "uuid",
      "email": "coordenador@test.com",
      "nome": "Coordenador",
      "perfil": "COORDENADOR",
      "ativo": true
    }
  },
  "timestamp": "2026-07-08T10:00:00Z"
}
```

#### POST /auth/refresh
Renovar token de acesso

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/logout
Fazer logout (opcional - remoção do lado client)

---

### 2. DASHBOARD

#### GET /dashboard/metricas
Obter métricas do dashboard

**Query Params:**
- `startDate` (opcional): Data inicial (YYYY-MM-DD)
- `endDate` (opcional): Data final (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEventos": 42,
    "totalPublico": 376,
    "contractosVencendo": 3,
    "alvarasVencidos": 1,
    "insumosComAlerta": 5
  },
  "timestamp": "2026-07-08T10:00:00Z"
}
```

#### GET /dashboard/alertas
Obter alertas do dashboard

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipo": "MANUTENCAO",
      "mensagem": "Manutenção do elevador vencendo em 5 dias",
      "severidade": "ALTA",
      "dataCriacao": "2026-07-08T10:00:00Z"
    }
  ],
  "timestamp": "2026-07-08T10:00:00Z"
}
```

---

### 3. EVENTOS

#### GET /eventos
Listar eventos

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)
- `status`: PLANEJADO | EM_ANDAMENTO | FINALIZADO | CANCELADO

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titulo": "Workshop de Arte",
      "dataInicio": "2026-07-15T14:00:00Z",
      "dataFim": "2026-07-15T17:00:00Z",
      "local": "Auditório Principal",
      "publicoTotal": 50,
      "status": "PLANEJADO",
      "criadoEm": "2026-07-08T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5,
  "timestamp": "2026-07-08T10:00:00Z"
}
```

#### GET /eventos/{id}
Obter evento por ID

#### POST /eventos
Criar novo evento (Requer: COORDENADOR)

**Request:**
```json
{
  "titulo": "Workshop de Arte",
  "dataInicio": "2026-07-15T14:00:00Z",
  "dataFim": "2026-07-15T17:00:00Z",
  "local": "Auditório Principal"
}
```

#### PUT /eventos/{id}
Atualizar evento (Requer: COORDENADOR)

#### DELETE /eventos/{id}
Deletar evento (Requer: COORDENADOR)

---

### 4. INSUMOS

#### GET /insumos
Listar insumos

**Query Params:**
- `categoria`: COPA | HIGIENE | LIMPEZA | OUTROS
- `localizacao`: TERREO | 2_ANDAR | OUTRO
- `search`: Busca por nome

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "Café em Pó",
      "categoria": "COPA",
      "quantidadeAtual": 12,
      "quantidadeMinima": 5,
      "localizacao": "TERREO",
      "unidade": "PACOTE",
      "precoUnitario": 15.50,
      "criadoEm": "2026-07-08T10:00:00Z"
    }
  ],
  "timestamp": "2026-07-08T10:00:00Z"
}
```

#### POST /insumos
Criar novo insumo

**Request:**
```json
{
  "nome": "Café em Pó",
  "categoria": "COPA",
  "quantidadeMinima": 5,
  "localizacao": "TERREO",
  "unidade": "PACOTE",
  "precoUnitario": 15.50
}
```

#### POST /insumos/{id}/reposicao
Solicitar reposição de insumo

**Request:**
```json
{
  "quantidade": 10
}
```

#### POST /insumos/{id}/movimentacao
Registrar movimentação de insumo

**Request:**
```json
{
  "tipoMovimento": "SAIDA",
  "quantidade": 5,
  "motivo": "Consumo em evento"
}
```

---

### 5. OCORRÊNCIAS TÉCNICAS

#### GET /ocorrencias
Listar ocorrências

**Query Params:**
- `status`: ABERTA | EM_ATENDIMENTO | RESOLVIDA | CANCELADA
- `tipo`: ELEVADOR | TOMADAS | AR_CONDICIONADO | FORRO | OUTRO
- `severidade`: BAIXA | MEDIA | ALTA

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titulo": "Ar-condicionado não liga",
      "descricao": "O equipamento de ar-condicionado da sala de reuniões não está ligando",
      "tipo": "AR_CONDICIONADO",
      "localidade": "Sala de Reuniões",
      "severidade": "MEDIA",
      "status": "ABERTA",
      "usuarioReporterId": "uuid",
      "dataAbertura": "2026-07-08T10:00:00Z",
      "dataResolucao": null
    }
  ],
  "timestamp": "2026-07-08T10:00:00Z"
}
```

#### POST /ocorrencias
Criar nova ocorrência

**Request (multipart/form-data):**
```json
{
  "titulo": "Ar-condicionado não liga",
  "descricao": "...",
  "tipo": "AR_CONDICIONADO",
  "localidade": "Sala de Reuniões",
  "severidade": "MEDIA",
  "foto": [File] // opcional
}
```

#### PUT /ocorrencias/{id}
Atualizar ocorrência

#### PUT /ocorrencias/{id}/atribuir
Atribuir ocorrência a fornecedor

**Request:**
```json
{
  "fornecedorId": "uuid"
}
```

#### PUT /ocorrencias/{id}/resolver
Marcar ocorrência como resolvida

---

### 6. DOCUMENTOS

#### POST /documentos/carta-anuencia/gerar
Gerar Carta de Anuência

**Request:**
```json
{
  "nomeEvento": "Workshop de Arte",
  "nomeProponente": "João Silva",
  "cpfCnpj": "123.456.789-00",
  "dataEvento": "2026-07-15",
  "horarioEvento": "14:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "CARTA_ANUENCIA",
    "arquivoUrl": "/documentos/carta-anuencia-2026-07-08.pdf",
    "criadoEm": "2026-07-08T10:00:00Z"
  },
  "timestamp": "2026-07-08T10:00:00Z"
}
```

#### GET /documentos
Listar documentos gerados

#### GET /documentos/{id}/download
Baixar documento

---

### 7. PRESENÇA

#### POST /presenca/lista
Criar nova lista de presença

**Request:**
```json
{
  "eventoId": "uuid"
}
```

#### GET /presenca/lista/{id}
Obter lista de presença

#### POST /presenca/registro
Registrar presença (Check-in)

**Request:**
```json
{
  "listaPresencaId": "uuid",
  "nomeParticipante": "Maria Silva",
  "emailParticipante": "maria@email.com",
  "cpfParticipante": "123.456.789-00",
  "metodoCheckin": "QR_CODE",
  "consentimentoLGPD": true
}
```

#### GET /presenca/lista/{id}/registros
Obter registros de presença de uma lista

#### POST /presenca/sincronizar
Sincronizar dados offline

**Request:**
```json
{
  "registros": [
    {
      "nomeParticipante": "João Silva",
      "emailParticipante": "joao@email.com",
      "metodoCheckin": "MANUAL"
    }
  ]
}
```

---

### 8. CONTRATOS

#### GET /contratos
Listar contratos

#### GET /contratos/{id}
Obter contrato

#### POST /contratos
Criar contrato (Requer: COORDENADOR)

**Request:**
```json
{
  "fornecedor": "Empresa XYZ",
  "tipo": "SEGURANCA",
  "dataInicio": "2026-07-01",
  "dataFim": "2027-06-30",
  "valor": 5000.00
}
```

---

### 9. ALVARÁS

#### GET /alvaras
Listar alvarás

#### POST /alvaras
Criar alvará (Requer: COORDENADOR)

#### PUT /alvaras/{id}
Atualizar alvará

---

## Códigos de Erro

| Código | Significado |
|--------|-----------|
| 200 | OK |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito |
| 500 | Erro do servidor |

## Rate Limiting

- Limite: 100 requisições por minuto por IP
- Headers de resposta:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1620000000`

## Paginação

Todos os endpoints que retornam listas suportam paginação:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

## Resposta Padrão

```json
{
  "success": true/false,
  "data": {...},
  "error": "mensagem de erro (opcional)",
  "message": "mensagem de sucesso (opcional)",
  "timestamp": "2026-07-08T10:00:00Z"
}
```

---

**Versão da API:** 1.0  
**Última atualização:** 2026-07-08
