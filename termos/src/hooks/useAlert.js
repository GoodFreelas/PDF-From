/**
 * Hook personalizado para gerenciar alertas
 * @fileoverview Hook que gerencia estado e exibição de alertas personalizados
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar alertas
 * @returns {Object} - Objeto com funções e estado de alerta
 */
export const useAlert = () => {
  const [alert, setAlert] = useState(null);

  /**
   * Exibe um alerta
   * @param {string} message - Mensagem do alerta
   * @param {string} type - Tipo do alerta ('warning', 'error', 'success')
   */
  const showAlert = useCallback((message, type = 'warning') => {
    setAlert({ message, type });
  }, []);

  /**
   * Fecha o alerta atual
   */
  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  /**
   * Exibe alerta de erro
   * @param {string} message - Mensagem de erro
   */
  const showError = useCallback((message) => {
    showAlert(message, 'error');
  }, [showAlert]);

  /**
   * Exibe alerta de sucesso
   * @param {string} message - Mensagem de sucesso
   */
  const showSuccess = useCallback((message) => {
    showAlert(message, 'success');
  }, [showAlert]);

  /**
   * Exibe alerta de aviso
   * @param {string} message - Mensagem de aviso
   */
  const showWarning = useCallback((message) => {
    showAlert(message, 'warning');
  }, [showAlert]);

  // Auto-close do alerta após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return {
    alert,
    showAlert,
    closeAlert,
    showError,
    showSuccess,
    showWarning
  };
};
