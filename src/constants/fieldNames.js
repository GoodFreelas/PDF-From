/**
 * Constantes para nomes de campos amigáveis
 * @fileoverview Mapeamento de nomes técnicos para nomes amigáveis exibidos ao usuário
 */

/**
 * Mapeamento de nomes de campos para nomes amigáveis - Step Personal
 */
export const PERSONAL_FIELD_NAMES = {
  NOME: 'Nome Completo',
  RG: 'RG',
  CPF: 'CPF',
  NASCIMENTO: 'Data de Nascimento',
  EMAIL: 'Email',
  TELEFONE1: 'Telefone 1',
  TELEFONE2: 'Telefone 2'
};

/**
 * Mapeamento de nomes de campos para nomes amigáveis - Step Address
 */
export const ADDRESS_FIELD_NAMES = {
  CEP: 'CEP',
  RUA: 'Rua',
  NUMERO: 'Número',
  BAIRRO: 'Bairro',
  CIDADE: 'Cidade',
  ESTADO: 'Estado'
};

/**
 * Mapeamento de nomes de campos para nomes amigáveis - Step Professional
 */
export const PROFESSIONAL_FIELD_NAMES = {
  EMPRESA: 'Empresa',
  MATRICULA: 'Matrícula',
  ORGAO: 'Órgão',
  CARGO: 'Cargo',
  PIS: 'PIS',
  ADMISSAO: 'Data de Admissão'
};

/**
 * Lista de estados brasileiros
 */
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
];

/**
 * Opções de planos disponíveis
 */
export const PLANS_OPTIONS = [
  { id: 'qualidonto', label: 'Qualidonto' },
  { id: 'vitalmed', label: 'Vitalmed' }
];
