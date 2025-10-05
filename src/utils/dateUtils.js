/**
 * Utilitários para manipulação de datas
 * @fileoverview Funções auxiliares para formatação e manipulação de datas
 */

/**
 * Obtém a data atual formatada no padrão brasileiro
 * @returns {string} - Data no formato DD/MM/AAAA
 */
export const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Converte data do formato ISO para DD/MM/AAAA
 * @param {string} isoDate - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} - Data formatada no padrão brasileiro
 */
export const formatDateFromCalendar = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Obtém a data máxima permitida (hoje) no formato ISO
 * @returns {string} - Data no formato YYYY-MM-DD
 */
export const getMaxDateISO = () => {
  return new Date().toISOString().split('T')[0];
};
