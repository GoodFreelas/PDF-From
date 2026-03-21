/**
 * Hook personalizado para submissão de formulários
 * @fileoverview Hook que gerencia o processo de submissão com retry automático
 */

import { useState, useCallback } from 'react';
import { API_BASE_URL, RETRY_CONFIG } from '../constants/api';

/**
 * Hook para gerenciar submissão de formulários
 * @returns {Object} - Estado e funções de submissão
 */
export const useFormSubmission = () => {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  /**
   * Submete o formulário com sistema de retry
   * @param {Object} formData - Dados do formulário
   * @param {string} signatureData - Assinatura em base64
   * @param {Array} selectedPlans - Planos selecionados
   * @returns {Promise<Object>} - Resultado da submissão
   */
  const submitForm = useCallback(async (formData, signatureData, selectedPlans) => {
    setProcessing(true);

    try {
      // Verificações preliminares
      if (!signatureData) {
        throw new Error("Campo de assinatura não disponível");
      }

      // Verifica se pelo menos um plano foi selecionado
      if (selectedPlans.length === 0) {
        throw new Error("Por favor, selecione pelo menos um plano");
      }

      // Sistema de retry para caso o servidor tenha acordado mas ainda esteja "esquentando"
      let attempts = 0;
      const maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS;
      let success = false;
      let responseData;

      while (attempts < maxAttempts && !success) {
        try {
          attempts++;

          if (attempts > 1) {
            console.log(`Tentativa ${attempts} de ${maxAttempts}...`);
          }

          // Tenta enviar os dados
          const resp = await fetch(`${API_BASE_URL}/generate-pdfs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              formData,
              signatureData,
              contratos: selectedPlans.join(","),
            }),
          });

          if (!resp.ok) {
            const payload = await resp.json().catch(() => ({}));
            throw new Error(
              payload.message || `Erro no servidor (${resp.status})`
            );
          }

          // Processa a resposta do servidor
          responseData = await resp.json();
          success = true;
        } catch (error) {
          if (attempts >= maxAttempts) {
            throw error;
          }

          const delay = RETRY_CONFIG.BASE_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempts - 1);
          console.log(
            `Falha na tentativa ${attempts}. Tentando novamente em ${
              delay / 1000
            }s...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // Mostra a mensagem de sucesso
      setDone(true);
      return responseData;
    } catch (err) {
      console.error("Erro no processamento do formulário:", err);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  /**
   * Reseta o estado de submissão
   */
  const resetSubmission = useCallback(() => {
    setProcessing(false);
    setDone(false);
  }, []);

  return {
    processing,
    done,
    submitForm,
    resetSubmission
  };
};
