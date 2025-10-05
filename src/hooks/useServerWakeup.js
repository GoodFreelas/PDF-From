/**
 * Hook personalizado para acordar o servidor
 * @fileoverview Hook que gerencia o processo de "wakeup" do servidor na Render
 */

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../constants/api';

/**
 * Hook para gerenciar o wakeup do servidor
 * @returns {Object} - Estado do wakeup
 */
export const useServerWakeup = () => {
  const [serverWakeupAttempted, setServerWakeupAttempted] = useState(false);

  /**
   * Tenta acordar o servidor na Render
   */
  const wakeupServer = useCallback(async () => {
    if (serverWakeupAttempted) return;

    try {
      console.log("Tentando acordar o servidor na Render...");
      setServerWakeupAttempted(true);

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT);

      fetch(`${API_BASE_URL}/api/check-status`, {
        method: "GET",
        signal: abortController.signal,
        mode: "no-cors",
      })
        .then((response) => {
          console.log("Servidor acordado com sucesso!");
          clearTimeout(timeoutId);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.log(
              "Erro ao acordar o servidor, mas o app continuará funcionando:",
              err.message
            );
          } else {
            console.log(
              "Timeout ao acordar o servidor, mas o app continuará funcionando"
            );
          }
        });
    } catch (error) {
      console.log("Erro ao tentar acordar o servidor:", error);
    }
  }, [serverWakeupAttempted]);

  // Executa o wakeup na montagem do componente
  useEffect(() => {
    wakeupServer();
  }, [wakeupServer]);

  return {
    serverWakeupAttempted,
    wakeupServer
  };
};
