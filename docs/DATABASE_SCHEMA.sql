-- ============================================
-- SCHEMA DO BANCO DE DADOS - SECULT
-- ============================================
-- PostgreSQL 12+
-- Criado em: 2026-07-08

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- USUÁRIOS E AUTENTICAÇÃO
-- ============================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('COORDENADOR', 'RECEPCAO', 'PRODUCAO', 'LIMPEZA', 'ADMIN')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);

-- ============================================
-- PERMISSÕES E RBAC
-- ============================================

CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil VARCHAR(50) NOT NULL,
  recurso VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL CHECK (acao IN ('CRIAR', 'LER', 'ATUALIZAR', 'DELETAR')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(perfil, recurso, acao),
  FOREIGN KEY (perfil) REFERENCES usuarios(perfil)
);

CREATE INDEX idx_permissoes_perfil ON permissoes(perfil);

-- ============================================
-- EVENTOS
-- ============================================

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  local VARCHAR(255),
  publico_total INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PLANEJADO' CHECK (status IN ('PLANEJADO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO')),
  usuario_criador_id UUID NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_criador ON eventos(usuario_criador_id);

-- ============================================
-- MÉTRICAS DE IMPACTO
-- ============================================

CREATE TABLE metricas_impacto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_registro DATE NOT NULL,
  total_eventos INTEGER DEFAULT 0,
  total_publico INTEGER DEFAULT 0,
  receita DECIMAL(12, 2) DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(data_registro)
);

CREATE INDEX idx_metricas_data ON metricas_impacto(data_registro);

-- ============================================
-- CONTRATOS
-- ============================================

CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fornecedor VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('SEGURANCA', 'LIMPEZA', 'MANUTENCAO', 'OUTROS')),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'VENCIDO', 'PROXIMO_VENCIMENTO')),
  valor DECIMAL(12, 2),
  descricao TEXT,
  usuario_criador_id UUID,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_contratos_tipo ON contratos(tipo);
CREATE INDEX idx_contratos_data_fim ON contratos(data_fim);

-- ============================================
-- ALVARÁS
-- ============================================

CREATE TABLE alvaras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CORPO_BOMBEIROS', 'PMV', 'OUTROS')),
  numero_alvara VARCHAR(100),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'VALIDO' CHECK (status IN ('VALIDO', 'VENCIDO', 'PROXIMO_VENCIMENTO')),
  arquivo_url VARCHAR(500),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alvaras_status ON alvaras(status);
CREATE INDEX idx_alvaras_tipo ON alvaras(tipo);

-- ============================================
-- INSUMOS E ALMOXARIFADO
-- ============================================

CREATE TABLE insumos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('COPA', 'HIGIENE', 'LIMPEZA', 'OUTROS')),
  quantidade_atual INTEGER DEFAULT 0,
  quantidade_minima INTEGER NOT NULL,
  localizacao VARCHAR(50) NOT NULL CHECK (localizacao IN ('TERREO', '2_ANDAR', 'OUTRO')),
  unidade VARCHAR(50) NOT NULL CHECK (unidade IN ('PACOTE', 'LITRO', 'UNIDADE', 'CX', 'KG', 'ML')),
  preco_unitario DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insumos_categoria ON insumos(categoria);
CREATE INDEX idx_insumos_localizacao ON insumos(localizacao);
CREATE INDEX idx_insumos_nome ON insumos USING GIN (nome gin_trgm_ops);

-- ============================================
-- MOVIMENTAÇÕES DE INSUMOS
-- ============================================

CREATE TABLE movimentacoes_insumos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insumo_id UUID NOT NULL,
  tipo_movimento VARCHAR(50) NOT NULL CHECK (tipo_movimento IN ('ENTRADA', 'SAIDA', 'AJUSTE')),
  quantidade INTEGER NOT NULL,
  motivo VARCHAR(500),
  usuario_id UUID NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_movimentacoes_insumo ON movimentacoes_insumos(insumo_id);
CREATE INDEX idx_movimentacoes_usuario ON movimentacoes_insumos(usuario_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_insumos(criado_em);

-- ============================================
-- SOLICITAÇÕES DE REPOSIÇÃO
-- ============================================

CREATE TABLE solicitacoes_reposicao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insumo_id UUID NOT NULL,
  usuario_solicitante_id UUID NOT NULL,
  quantidade_solicitada INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADA', 'REJEITADA', 'ENTREGUE')),
  motivo_rejeicao TEXT,
  data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_aprovacao TIMESTAMP,
  data_entrega TIMESTAMP,
  FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_solicitante_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_solicitacoes_status ON solicitacoes_reposicao(status);
CREATE INDEX idx_solicitacoes_insumo ON solicitacoes_reposicao(insumo_id);

-- ============================================
-- FORNECEDORES
-- ============================================

CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  especialidade VARCHAR(255),
  contato_responsavel VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fornecedores_especialidade ON fornecedores(especialidade);

-- ============================================
-- OCORRÊNCIAS TÉCNICAS
-- ============================================

CREATE TABLE ocorrencias_tecnicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ELEVADOR', 'TOMADAS', 'AR_CONDICIONADO', 'FORRO', 'OUTRO')),
  localidade VARCHAR(255),
  foto_url VARCHAR(500),
  severidade VARCHAR(50) NOT NULL CHECK (severidade IN ('BAIXA', 'MEDIA', 'ALTA')),
  status VARCHAR(50) DEFAULT 'ABERTA' CHECK (status IN ('ABERTA', 'EM_ATENDIMENTO', 'RESOLVIDA', 'CANCELADA')),
  usuario_reporter_id UUID NOT NULL,
  fornecedor_atribuido_id UUID,
  data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_resolucao TIMESTAMP,
  FOREIGN KEY (usuario_reporter_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (fornecedor_atribuido_id) REFERENCES fornecedores(id) ON DELETE SET NULL
);

CREATE INDEX idx_ocorrencias_status ON ocorrencias_tecnicas(status);
CREATE INDEX idx_ocorrencias_tipo ON ocorrencias_tecnicas(tipo);
CREATE INDEX idx_ocorrencias_severidade ON ocorrencias_tecnicas(severidade);

-- ============================================
-- DOCUMENTOS GERADOS
-- ============================================

CREATE TABLE documentos_gerados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CARTA_ANUENCIA', 'RELATORIO', 'OUTROS')),
  template_id VARCHAR(100),
  dados_preenchimento JSONB NOT NULL,
  arquivo_url VARCHAR(500),
  usuario_gerador_id UUID NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_gerador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_documentos_tipo ON documentos_gerados(tipo);
CREATE INDEX idx_documentos_usuario ON documentos_gerados(usuario_gerador_id);

-- ============================================
-- LISTAS DE PRESENÇA
-- ============================================

CREATE TABLE listas_presenca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'PLANEJADA' CHECK (status IN ('PLANEJADA', 'EM_USO', 'FINALIZADA', 'SINCRONIZADA')),
  usuario_criador_id UUID,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_listas_presenca_evento ON listas_presenca(evento_id);
CREATE INDEX idx_listas_presenca_status ON listas_presenca(status);

-- ============================================
-- REGISTROS DE PRESENÇA
-- ============================================

CREATE TABLE registros_presenca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lista_presenca_id UUID NOT NULL,
  nome_participante VARCHAR(255) NOT NULL,
  email_participante VARCHAR(255),
  cpf_participante VARCHAR(11),
  horario_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_checkin VARCHAR(50) NOT NULL CHECK (metodo_checkin IN ('QR_CODE', 'MANUAL', 'IMPORT')),
  consentimento_lgpd BOOLEAN DEFAULT false,
  sincronizado BOOLEAN DEFAULT false,
  FOREIGN KEY (lista_presenca_id) REFERENCES listas_presenca(id) ON DELETE CASCADE
);

CREATE INDEX idx_registros_presenca_lista ON registros_presenca(lista_presenca_id);
CREATE INDEX idx_registros_presenca_cpf ON registros_presenca(cpf_participante);
CREATE INDEX idx_registros_presenca_email ON registros_presenca(email_participante);

-- ============================================
-- NOTIFICAÇÕES
-- ============================================

CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('MANUTENCAO', 'ESTOQUE_BAIXO', 'CONTRATO_VENCENDO', 'EVENTO_PROXIMO')),
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_leitura TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID,
  acao VARCHAR(100) NOT NULL,
  tabela VARCHAR(100),
  registro_id UUID,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip_origem VARCHAR(45),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_data ON audit_log(criado_em);

-- ============================================
-- TRIGGERS PARA ATUALIZAR TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_update
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_eventos_update
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_contratos_update
  BEFORE UPDATE ON contratos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_insumos_update
  BEFORE UPDATE ON insumos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- ============================================
-- INSERÇÃO DE DADOS INICIAIS
-- ============================================

-- Inserir usuários de teste
INSERT INTO usuarios (email, senha_hash, nome, perfil) VALUES
('coordenador@test.com', '$2a$10$abcdef1234567890abcdef1234567890', 'Coordenador Teste', 'COORDENADOR'),
('recepcao@test.com', '$2a$10$abcdef1234567890abcdef1234567890', 'Recepção Teste', 'RECEPCAO'),
('producao@test.com', '$2a$10$abcdef1234567890abcdef1234567890', 'Produção Teste', 'PRODUCAO'),
('limpeza@test.com', '$2a$10$abcdef1234567890abcdef1234567890', 'Limpeza Teste', 'LIMPEZA');

-- Inserir permissões
INSERT INTO permissoes (perfil, recurso, acao) VALUES
('COORDENADOR', 'dashboard', 'LER'),
('COORDENADOR', 'eventos', 'CRIAR'),
('COORDENADOR', 'contratos', 'CRIAR'),
('RECEPCAO', 'listas_presenca', 'CRIAR'),
('PRODUCAO', 'ocorrencias', 'CRIAR'),
('LIMPEZA', 'insumos', 'LER');

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

CREATE VIEW v_insumos_com_alerta AS
SELECT
  i.id,
  i.nome,
  i.categoria,
  i.quantidade_atual,
  i.quantidade_minima,
  CASE
    WHEN i.quantidade_atual <= i.quantidade_minima THEN 'ALERTA'
    WHEN i.quantidade_atual <= i.quantidade_minima * 1.5 THEN 'AVISO'
    ELSE 'OK'
  END as nivel_alerta
FROM insumos i
WHERE i.ativo = true
ORDER BY nivel_alerta DESC, i.quantidade_atual ASC;

CREATE VIEW v_contratos_vencendo AS
SELECT
  c.id,
  c.fornecedor,
  c.tipo,
  c.data_fim,
  CASE
    WHEN c.data_fim < CURRENT_DATE THEN 'VENCIDO'
    WHEN c.data_fim <= CURRENT_DATE + INTERVAL '30 days' THEN 'VENCENDO_30_DIAS'
    WHEN c.data_fim <= CURRENT_DATE + INTERVAL '7 days' THEN 'VENCENDO_7_DIAS'
    ELSE 'OK'
  END as status_vencimento
FROM contratos c
WHERE c.status = 'ATIVO'
ORDER BY c.data_fim ASC;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE usuarios IS 'Armazena informações de usuários do sistema';
COMMENT ON TABLE eventos IS 'Armazena eventos realizados no HUB';
COMMENT ON TABLE insumos IS 'Armazena itens do almoxarifado';
COMMENT ON TABLE ocorrencias_tecnicas IS 'Armazena ocorrências técnicas reportadas';
COMMENT ON TABLE registros_presenca IS 'Armazena registros de presença nos eventos';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Executar: psql -U admin -d secult_db -f database_schema.sql
