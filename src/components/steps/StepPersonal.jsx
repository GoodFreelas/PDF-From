// ================================
// Imports
// ================================
import { useEffect, useRef } from 'react';
import Cleave from 'cleave.js/react';

// Componentes internos
import IconData from '../icons/IconData';
import CustomAlert from '../CustomAlert';

// Hooks personalizados
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAlert } from '../../hooks/useAlert';

// Utils
import { getCurrentDate, formatDateFromCalendar, getMaxDateISO } from '../../utils/dateUtils';
import { createSyntheticEvent } from '../../utils/formUtils';
import { validations } from '../../utils/validation';
import { PERSONAL_FIELD_NAMES } from '../../constants/fieldNames';

// Importações necessárias para o Cleave
import 'cleave.js/dist/addons/cleave-phone.br';

// ================================
// Constantes
// ================================
const REQUIRED_FIELDS = ['NOME', 'RG', 'CPF', 'NASCIMENTO', 'EMAIL', 'TELEFONE1'];
const INPUT_STYLE = 'h-[45px] rounded-[10px] border border-gray-300 px-[20px] w-full focus:outline-none focus:border-[#00AE71] text-black';

/**
 * Componente do step de dados pessoais
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.formData - Dados do formulário
 * @param {Function} props.handleChange - Função para atualizar dados
 * @param {Function} props.nextStep - Função para avançar para próximo step
 * @returns {JSX.Element} - Componente StepPersonal
 */
export default function StepPersonal({ formData, handleChange, nextStep }) {
  // ================================
  // Hooks e Estados
  // ================================
  const calendarRef = useRef(null);
  const { formValidated, isInvalid, validateSingleField, validateRequired } = useFormValidation();
  const { alert, showWarning, closeAlert } = useAlert();

  // ================================
  // Effects
  // ================================
  useEffect(() => {
    const dateEvent = createSyntheticEvent('DATA', getCurrentDate());
    if (!formData.DATA) {
      handleChange(dateEvent);
    }
  }, [formData.DATA, handleChange]);

  // ================================
  // Funções Auxiliares
  // ================================

  /**
   * Lida com alterações nos campos Cleave
   * @param {Event} e - Evento de mudança
   */
  const handleCleaveChange = (e) => {
    const { name, rawValue, value } = e.target;
    const syntheticEvent = createSyntheticEvent(name, value, rawValue);
    
    handleChange(syntheticEvent);
    validateSingleField(name, value);
  };

  /**
   * Lida com alterações em campos regulares
   * @param {Event} e - Evento de mudança
   */
  const handleRegularChange = (e) => {
    const { name, value } = e.target;
    
    handleChange(e);
    validateSingleField(name, value);
  };

  /**
   * Abre o calendário nativo
   */
  const openCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.showPicker();
    }
  };

  /**
   * Manipula mudanças no calendário
   * @param {Event} e - Evento de mudança
   */
  const handleCalendarChange = (e) => {
    const isoDate = e.target.value;
    const formattedDate = formatDateFromCalendar(isoDate);
    const event = createSyntheticEvent('NASCIMENTO', formattedDate);
    
    handleChange(event);
    validateSingleField('NASCIMENTO', formattedDate);
  };

  /**
   * Valida o formulário e avança para o próximo step
   * @param {Event} e - Evento de submit
   */
  const validateAndProceed = (e) => {
    e.preventDefault();
    
    const { hasErrors, message } = validateRequired(REQUIRED_FIELDS, formData, PERSONAL_FIELD_NAMES);
    
    if (hasErrors) {
      showWarning(message);
      return;
    }

    nextStep();
  };

  // ================================
  // JSX Return
  // ================================
  return (
    <div className="space-y-4 relative">
      {/* Alerta personalizado */}
      {alert && (
        <CustomAlert
          message={alert.message} 
          type={alert.type} 
          onClose={closeAlert} 
        />
      )}
      
      {/* Nome */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Nome Completo
        </label>
        <input
          name="NOME"
          type="text"
          required
          value={formData.NOME || ''}
          onChange={handleRegularChange}
          className={`${INPUT_STYLE} ${isInvalid('NOME') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu nome completo"
        />
        {isInvalid('NOME') && (
          <p className="text-xs text-red-500 mt-1">Nome inválido. Use apenas letras</p>
        )}
      </div>

      {/* RG */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          RG
        </label>
        <Cleave
          name="RG"
          required
          value={formData.RG || ''}
          onChange={handleCleaveChange}
          className={`${INPUT_STYLE} ${isInvalid('RG') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu RG"
          options={{
            numericOnly: true,
            blocks: [12]
          }}
        />
        {isInvalid('RG') && (
          <p className="text-xs text-red-500 mt-1">RG inválido. Deve ter pelo menos 7 dígitos</p>
        )}
      </div>

      {/* CPF */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          CPF
        </label>
        <Cleave
          name="CPF"
          required
          value={formData.CPF || ''}
          onChange={handleCleaveChange}
          className={`${INPUT_STYLE} ${isInvalid('CPF') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="000.000.000-00"
          options={{
            delimiters: ['.', '.', '-'],
            blocks: [3, 3, 3, 2],
            numericOnly: true
          }}
        />
        {isInvalid('CPF') && (
          <p className="text-xs text-red-500 mt-1">CPF inválido</p>
        )}
      </div>

      {/* Nascimento com calendário */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Data de Nascimento
        </label>
        <div className="relative">
          <Cleave
            name="NASCIMENTO"
            required
            value={formData.NASCIMENTO || ''}
            onChange={handleCleaveChange}
            className={`${INPUT_STYLE} pr-12 ${isInvalid('NASCIMENTO') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="DD/MM/AAAA"
            options={{
              date: true,
              datePattern: ['d', 'm', 'Y']
            }}
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent p-0 m-0 flex items-center justify-center"
            onClick={openCalendar}
          >
            <IconData className="w-5 h-5" />
          </button>
          
          {/* Calendário escondido */}
          <input
            ref={calendarRef}
            type="date"
            className="opacity-0 absolute w-0 h-0"
            onChange={handleCalendarChange}
            max={getMaxDateISO()} // Limita até hoje
          />
        </div>
        {isInvalid('NASCIMENTO') && (
          <p className="text-xs text-red-500 mt-1">Data de nascimento inválida</p>
        )}
      </div>

      {/* Email */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Email
        </label>
        <input
          name="EMAIL"
          type="email"
          required
          value={formData.EMAIL || ''}
          onChange={handleRegularChange}
          className={`${INPUT_STYLE} ${isInvalid('EMAIL') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="exemplo@email.com"
        />
        {isInvalid('EMAIL') && (
          <p className="text-xs text-red-500 mt-1">Email inválido</p>
        )}
      </div>

      {/* Telefones */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            Telefone 1
          </label>
          <Cleave
            name="TELEFONE1"
            required
            value={formData.TELEFONE1 || ''}
            onChange={handleCleaveChange}
            className={`${INPUT_STYLE} ${isInvalid('TELEFONE1') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(55) 55555-5555"
            options={{
              delimiters: ['(', ') ', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
          />
          {isInvalid('TELEFONE1') && (
            <p className="text-xs text-red-500 mt-1">Telefone inválido</p>
          )}
        </div>

        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Telefone 2</label>
          <Cleave
            name="TELEFONE2"
            value={formData.TELEFONE2 || ''}
            onChange={handleCleaveChange}
            className={`${INPUT_STYLE} ${isInvalid('TELEFONE2') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(55) 55555-5555"
            options={{
              delimiters: ['(', ') ', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
          />
          {isInvalid('TELEFONE2') && (
            <p className="text-xs text-red-500 mt-1">Telefone inválido</p>
          )}
        </div>
      </div>

      {/* Botão */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={validateAndProceed}
          className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-6 py-2 font-semibold"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}