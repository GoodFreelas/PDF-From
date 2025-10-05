/**
 * Utilitários para manipulação de formulários
 * @fileoverview Funções auxiliares para validação e manipulação de dados de formulário
 */

/**
 * Cria um evento sintético para compatibilidade com handleChange
 * @param {string} name - Nome do campo
 * @param {string} value - Valor do campo
 * @param {string} rawValue - Valor bruto (sem formatação)
 * @returns {Object} - Evento sintético
 */
export const createSyntheticEvent = (name, value, rawValue = null) => ({
  target: {
    name,
    value,
    rawValue
  }
});

/**
 * Valida um campo específico e atualiza os erros
 * @param {string} fieldName - Nome do campo
 * @param {string} value - Valor do campo
 * @param {Object} validations - Objeto com funções de validação
 * @param {boolean} formValidated - Se o formulário já foi validado
 * @param {Function} setValidationErrors - Função para atualizar erros
 */
export const validateField = (fieldName, value, validations, formValidated, setValidationErrors) => {
  if (formValidated && validations[fieldName]) {
    const isValid = validations[fieldName](value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: isValid ? null : true
    }));
  }
};

/**
 * Verifica se um campo está inválido
 * @param {string} fieldName - Nome do campo
 * @param {Object} validationErrors - Objeto com erros de validação
 * @returns {boolean} - true se inválido, false caso contrário
 */
export const isFieldInvalid = (fieldName, validationErrors) => {
  return validationErrors[fieldName];
};

/**
 * Valida campos obrigatórios
 * @param {Array} requiredFields - Array com nomes dos campos obrigatórios
 * @param {Object} formData - Dados do formulário
 * @param {Object} validations - Objeto com funções de validação
 * @returns {Object} - Objeto com erros encontrados
 */
export const validateRequiredFields = (requiredFields, formData, validations) => {
  const errors = {};
  const missingFields = [];
  
  // Verifica campos vazios
  requiredFields.forEach(field => {
    if (!formData[field]) {
      errors[field] = true;
      missingFields.push(field);
    }
  });
  
  // Verifica validação específica para cada campo
  requiredFields.forEach(field => {
    if (formData[field] && validations[field] && !validations[field](formData[field])) {
      errors[field] = true;
    }
  });
  
  return { errors, missingFields };
};

/**
 * Cria mensagem de erro amigável
 * @param {Array} missingFields - Campos obrigatórios não preenchidos
 * @param {Object} fieldNames - Mapeamento de nomes técnicos para nomes amigáveis
 * @returns {string} - Mensagem de erro formatada
 */
export const createErrorMessage = (missingFields, fieldNames) => {
  if (missingFields.length > 0) {
    const readableFieldNames = missingFields.map(field => fieldNames[field] || field);
    return `Por favor, preencha os seguintes campos: ${readableFieldNames.join(', ')}`;
  }
  return 'Por favor, corrija os erros de validação nos campos destacados';
};
