/**
 * Utilitários de validação para formulários
 * @fileoverview Funções de validação reutilizáveis para CPF, email, telefone, etc.
 */

/**
 * Validação de CPF
 * @param {string} value - CPF a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateCPF = (value) => {
  // Remove caracteres não numéricos
  const cpf = value.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

/**
 * Validação de Email
 * @param {string} value - Email a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validação de RG (formato básico)
 * @param {string} value - RG a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateRG = (value) => {
  // Remove caracteres não numéricos
  const rg = value.replace(/[^\d]/g, '');
  // Verifica se tem pelo menos 7 dígitos
  return rg.length >= 7;
};

/**
 * Validação de Data de Nascimento
 * @param {string} value - Data no formato DD/MM/AAAA
 * @returns {boolean} - true se válida, false caso contrário
 */
export const validateBirthDate = (value) => {
  // Verifica formato DD/MM/AAAA
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  
  if (!dateRegex.test(value)) return false;
  
  const [_, day, month, year] = value.match(dateRegex);
  const date = new Date(year, month - 1, day);
  
  // Verifica se é uma data válida
  if (
    date.getDate() !== parseInt(day) ||
    date.getMonth() !== parseInt(month) - 1 ||
    date.getFullYear() !== parseInt(year)
  ) {
    return false;
  }
  
  // Verifica se a data não é futura
  const today = new Date();
  if (date > today) return false;
  
  // Verifica se a pessoa tem pelo menos 12 anos
  const twelveYearsAgo = new Date();
  twelveYearsAgo.setFullYear(today.getFullYear() - 12);
  
  // Verifica se a pessoa tem no máximo 120 anos
  const oneHundredTwentyYearsAgo = new Date();
  oneHundredTwentyYearsAgo.setFullYear(today.getFullYear() - 120);
  
  return date <= twelveYearsAgo && date >= oneHundredTwentyYearsAgo;
};

/**
 * Validação de Telefone
 * @param {string} value - Telefone a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validatePhone = (value) => {
  // Remove caracteres não numéricos
  const phone = value.replace(/[^\d]/g, '');
  // Verifica se tem 11 dígitos (2 do DDD + 9 do número)
  return phone.length === 11;
};

/**
 * Validação de nome (não pode conter números)
 * @param {string} value - Nome a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateName = (value) => {
  if (!value || value.trim() === '') return false;
  
  // Verifica se contém apenas letras, espaços e alguns caracteres especiais comuns em nomes
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'.,-]+$/.test(value);
};

/**
 * Validação de CEP
 * @param {string} value - CEP a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateCEP = (value) => {
  // Remove caracteres não numéricos
  const cep = value.replace(/[^\d]/g, '');
  
  // Verifica se tem 8 dígitos
  return cep.length === 8;
};

/**
 * Validação de número de endereço
 * @param {string} value - Número a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateAddressNumber = (value) => {
  // Permite apenas números e letras (para casos como "123A", "S/N", etc.)
  return /^[0-9a-zA-Z\s\/\-]+$/.test(value);
};

/**
 * Validação de PIS (11 dígitos)
 * @param {string} value - PIS a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validatePIS = (value) => {
  if (!value || value.trim() === "") return true; // Válido se vazio

  // Remove caracteres não numéricos
  const pis = value.replace(/[^\d]/g, "");

  // Verifica se tem 11 dígitos
  if (pis.length !== 11) return false;

  // Algoritmo de validação do dígito verificador (simplificado)
  const multipliers = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(pis.charAt(i)) * multipliers[i];
  }

  const remainder = sum % 11;
  const expectedDigit = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(pis.charAt(10)) === expectedDigit;
};

/**
 * Validação de data de admissão
 * @param {string} value - Data no formato DD/MM/AAAA
 * @returns {boolean} - true se válida, false caso contrário
 */
export const validateAdmissionDate = (value) => {
  if (!value || value.trim() === "") return true; // Válido se vazio

  // Verifica formato DD/MM/AAAA
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  if (!dateRegex.test(value)) return false;

  const [_, day, month, year] = value.match(dateRegex);
  const date = new Date(year, month - 1, day);

  // Verifica se é uma data válida
  if (
    date.getDate() !== parseInt(day) ||
    date.getMonth() !== parseInt(month) - 1 ||
    date.getFullYear() !== parseInt(year)
  ) {
    return false;
  }

  // Verifica se a data não é futura
  const today = new Date();
  if (date > today) return false;

  return true;
};

/**
 * Validação de matrícula
 * @param {string} value - Matrícula a ser validada
 * @returns {boolean} - true se válida, false caso contrário
 */
export const validateMatricula = (value) => {
  if (!value || value.trim() === "") return true; // Válido se vazio

  // Remove caracteres não numéricos e verifica se tem pelo menos 3 dígitos
  const matricula = value.replace(/[^\d]/g, "");
  return matricula.length >= 3;
};

/**
 * Validação de valor monetário
 * @param {string} value - Valor a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const validateCurrency = (value) => {
  if (!value) return false;
  
  // Remove o R$ e espaços
  const cleanValue = value.replace(/R\$\s?/g, '');
  
  // Se estiver vazio após remoção de R$, é inválido
  if (!cleanValue.trim()) return false;
  
  // Verifica se há pelo menos um dígito
  return /\d/.test(cleanValue);
};

/**
 * Objeto com todas as validações para facilitar o uso
 */
export const validations = {
  CPF: validateCPF,
  EMAIL: validateEmail,
  RG: validateRG,
  NASCIMENTO: validateBirthDate,
  TELEFONE1: validatePhone,
  TELEFONE2: validatePhone,
  NOME: validateName,
  CEP: validateCEP,
  NUMERO: validateAddressNumber,
  PIS: validatePIS,
  ADMISSAO: validateAdmissionDate,
  MATRICULA: validateMatricula,
  VALOR: validateCurrency,
};
