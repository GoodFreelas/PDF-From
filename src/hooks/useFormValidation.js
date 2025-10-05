/**
 * Hook personalizado para validação de formulários
 * @fileoverview Hook que gerencia estado de validação e erros de formulário
 */

import { useState, useCallback } from 'react';
import { validations } from '../utils/validation';
import { validateField, isFieldInvalid, validateRequiredFields, createErrorMessage } from '../utils/formUtils';

/**
 * Hook para gerenciar validação de formulários
 * @returns {Object} - Objeto com funções e estado de validação
 */
export const useFormValidation = () => {
  const [formValidated, setFormValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Valida um campo específico
   * @param {string} fieldName - Nome do campo
   * @param {string} value - Valor do campo
   */
  const validateSingleField = useCallback((fieldName, value) => {
    validateField(fieldName, value, validations, formValidated, setValidationErrors);
  }, [formValidated]);

  /**
   * Verifica se um campo está inválido
   * @param {string} fieldName - Nome do campo
   * @returns {boolean} - true se inválido
   */
  const isInvalid = useCallback((fieldName) => {
    return isFieldInvalid(fieldName, validationErrors);
  }, [validationErrors]);

  /**
   * Valida campos obrigatórios
   * @param {Array} requiredFields - Array com campos obrigatórios
   * @param {Object} formData - Dados do formulário
   * @param {Object} fieldNames - Mapeamento de nomes amigáveis
   * @returns {Object} - Resultado da validação
   */
  const validateRequired = useCallback((requiredFields, formData, fieldNames) => {
    const { errors, missingFields } = validateRequiredFields(requiredFields, formData, validations);
    
    setValidationErrors(errors);
    setFormValidated(true);

    const hasErrors = Object.keys(errors).length > 0;
    const message = hasErrors ? createErrorMessage(missingFields, fieldNames) : null;

    return { hasErrors, message, errors };
  }, []);

  /**
   * Limpa erros de validação
   */
  const clearErrors = useCallback(() => {
    setValidationErrors({});
    setFormValidated(false);
  }, []);

  /**
   * Limpa erro de um campo específico
   * @param {string} fieldName - Nome do campo
   */
  const clearFieldError = useCallback((fieldName) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  return {
    formValidated,
    validationErrors,
    validateSingleField,
    isInvalid,
    validateRequired,
    clearErrors,
    clearFieldError,
    setFormValidated
  };
};
