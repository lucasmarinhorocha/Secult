// Tipos de Dados e Enums
export type UserRole = 'COORDENADOR' | 'RECEPCAO' | 'PRODUCAO' | 'LIMPEZA' | 'ADMIN';
export type EventStatus = 'PLANEJADO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
export type InsumoCategory = 'COPA' | 'HIGIENE' | 'LIMPEZA' | 'OUTROS';
export type OcorrenciaType = 'ELEVADOR' | 'TOMADAS' | 'AR_CONDICIONADO' | 'FORRO' | 'OUTRO';
export type OcorrenciaSeverity = 'BAIXA' | 'MEDIA' | 'ALTA';
export type OcorrenciaStatus = 'ABERTA' | 'EM_ATENDIMENTO' | 'RESOLVIDA' | 'CANCELADA';
export type ContratoType = 'SEGURANCA' | 'LIMPEZA' | 'MANUTENCAO' | 'OUTROS';
export type CheckinMethod = 'QR_CODE' | 'MANUAL' | 'IMPORT';

// ============================================
// MODELS
// ============================================

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: UserRole;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Evento {
  id: string;
  titulo: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
  publicoTotal: number;
  status: EventStatus;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface MetricasImpacto {
  id: string;
  dataRegistro: Date;
  totalEventos: number;
  totalPublico: number;
  receita: number;
}

export interface Contrato {
  id: string;
  fornecedor: string;
  tipo: ContratoType;
  dataInicio: Date;
  dataFim: Date;
  status: 'ATIVO' | 'VENCIDO' | 'PROXIMO_VENCIMENTO';
  valor: number;
  criadoEm: Date;
}

export interface Alvara {
  id: string;
  tipo: 'CORPO_BOMBEIROS' | 'PMV' | 'OUTROS';
  dataEmissao: Date;
  dataVencimento: Date;
  status: 'VALIDO' | 'VENCIDO' | 'PROXIMO_VENCIMENTO';
  arquivoUrl: string;
}

export interface Insumo {
  id: string;
  nome: string;
  categoria: InsumoCategory;
  quantidadeAtual: number;
  quantidadeMinima: number;
  localizacao: 'TERREO' | '2_ANDAR' | 'OUTRO';
  unidade: 'PACOTE' | 'LITRO' | 'UNIDADE' | 'CX';
  precoUnitario: number;
  criadoEm: Date;
}

export interface MovimentacaoInsumo {
  id: string;
  insumoId: string;
  tipoMovimento: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantidade: number;
  motivo: string;
  usuarioId: string;
  criadoEm: Date;
}

export interface SolicitacaoReposicao {
  id: string;
  insumoId: string;
  usuarioSolicitanteId: string;
  quantidadeSolicitada: number;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'ENTREGUE';
  dataSolicitacao: Date;
  dataAprovacao?: Date;
  dataEntrega?: Date;
}

export interface OcorrenciaTecnica {
  id: string;
  titulo: string;
  descricao: string;
  tipo: OcorrenciaType;
  localidade: string;
  fotoUrl?: string;
  severidade: OcorrenciaSeverity;
  status: OcorrenciaStatus;
  usuarioReporterId: string;
  fornecedorAtribuidoId?: string;
  dataAbertura: Date;
  dataResolucao?: Date;
}

export interface Fornecedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidade: string;
  contatoResponsavel: string;
}

export interface DocumentoGerado {
  id: string;
  tipo: 'CARTA_ANUENCIA' | 'RELATORIO' | 'OUTROS';
  templateId: string;
  dadosPreenchimento: Record<string, any>;
  arquivoUrl: string;
  usuarioGeradorId: string;
  criadoEm: Date;
}

export interface ListaPresenca {
  id: string;
  eventoId: string;
  dataCriacao: Date;
  status: 'PLANEJADA' | 'EM_USO' | 'FINALIZADA' | 'SINCRONIZADA';
}

export interface RegistroPresenca {
  id: string;
  listaPresencaId: string;
  nomeParticipante: string;
  emailParticipante: string;
  cpfParticipante: string;
  horarioCheckin: Date;
  metodoCheckin: CheckinMethod;
  consentimentoLGPD: boolean;
  sincronizado: boolean;
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: 'MANUTENCAO' | 'ESTOQUE_BAIXO' | 'CONTRATO_VENCENDO' | 'EVENTO_PROXIMO';
  mensagem: string;
  lida: boolean;
  dataCriacao: Date;
  dataLeitura?: Date;
}

export interface Permissao {
  id: string;
  perfil: UserRole;
  recurso: string;
  acao: 'CRIAR' | 'LER' | 'ATUALIZAR' | 'DELETAR';
}

// ============================================
// DTO (Data Transfer Objects)
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: Omit<Usuario, 'criadoEm' | 'atualizadoEm'>;
}

export interface CreateEventoRequest {
  titulo: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
}

export interface CreateInsumosRequest {
  nome: string;
  categoria: InsumoCategory;
  quantidadeMinima: number;
  localizacao: 'TERREO' | '2_ANDAR' | 'OUTRO';
  unidade: 'PACOTE' | 'LITRO' | 'UNIDADE' | 'CX';
  precoUnitario: number;
}

export interface CreateOcorrenciaRequest {
  titulo: string;
  descricao: string;
  tipo: OcorrenciaType;
  localidade: string;
  severidade: OcorrenciaSeverity;
}

export interface CreatePresencaRequest {
  eventoId: string;
  nomeParticipante: string;
  emailParticipante: string;
  cpfParticipante: string;
  consentimentoLGPD: boolean;
}

// ============================================
// API RESPONSE FORMAT
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
