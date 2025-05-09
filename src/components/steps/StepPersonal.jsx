import { useEffect, useState } from 'react';
import IconData from '../icons/IconData';
import CustomAlert from '../CustomAlert';

// Função para obter a data atual formatada
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function StepPersonal({ formData, handleChange, nextStep }) {
  // Estado para controlar a exibição do alerta
  const [alert, setAlert] = useState(null);
  // Estado para controlar se o formulário foi validado
  const [formValidated, setFormValidated] = useState(false);

  useEffect(() => {
    const dateEvent = {
      target: {
        name: 'DATA',
        value: getCurrentDate(),
      },
    };

    if (!formData.DATA) {
      handleChange(dateEvent);
    }
  }, []);

  // Efeito para fechar o alerta automaticamente
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000); // 5 segundos
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const validateAndProceed = (e) => {
    e.preventDefault();
    setFormValidated(true);

    const requiredFields = ['NOME', 'RG', 'CPF', 'NASCIMENTO', 'EMAIL', 'TELEFONE1'];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      // Mapeamento para nomes mais amigáveis
      const fieldNames = {
        NOME: 'Nome Completo',
        RG: 'RG',
        CPF: 'CPF',
        NASCIMENTO: 'Data de Nascimento',
        EMAIL: 'Email',
        TELEFONE1: 'Telefone 1'
      };
      
      const readableFieldNames = missingFields.map(field => fieldNames[field] || field);
      
      // Mostrar alerta personalizado
      setAlert({
        message: `Por favor, preencha os seguintes campos: ${readableFieldNames.join(', ')}`,
        type: 'warning'
      });
      return;
    }

    nextStep();
  };

  // Função de utilidade para verificar se um campo está vazio e o formulário foi validado
  const isFieldInvalid = (fieldName) => !formData[fieldName] && formValidated;

  const inputStyle =
    'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[100%] focus:outline-none focus:border-[#00AE71] text-black';

  return (
    <div className="space-y-4 relative">
      {/* Mostra o alerta personalizado se houver */}
      {alert && (
        <CustomAlert
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
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
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('NOME') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu nome completo"
        />
        {isFieldInvalid('NOME') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>

      {/* RG */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          RG
        </label>
        <input
          name="RG"
          type="text"
          required
          value={formData.RG || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('RG') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu RG"
        />
        {isFieldInvalid('RG') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>

      {/* CPF */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          CPF
        </label>
        <input
          name="CPF"
          type="text"
          required
          value={formData.CPF || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('CPF') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="000.000.000-00"
        />
        {isFieldInvalid('CPF') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>

      {/* Nascimento */}
      <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Data de Nascimento
        </label>
        <div className="relative">
          <input
            name="NASCIMENTO"
            type="text"
            required
            value={formData.NASCIMENTO || ''}
            onChange={handleChange}
            className={`${inputStyle} pr-10 ${isFieldInvalid('NASCIMENTO') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="DD/MM/AAAA"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <IconData className="w-5 h-5" />
          </div>
        </div>
        {isFieldInvalid('NASCIMENTO') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
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
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('EMAIL') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="exemplo@email.com"
        />
        {isFieldInvalid('EMAIL') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>

      {/* Telefones */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            Telefone 1
          </label>
          <input
            name="TELEFONE1"
            type="tel"
            required
            value={formData.TELEFONE1 || ''}
            onChange={handleChange}
            className={`${inputStyle} ${isFieldInvalid('TELEFONE1') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(00) 00000-0000"
          />
          {isFieldInvalid('TELEFONE1') && (
            <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
          )}
        </div>

        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Telefone 2</label>
          <input
            name="TELEFONE2"
            type="tel"
            value={formData.TELEFONE2 || ''}
            onChange={handleChange}
            className={inputStyle}
            placeholder="(00) 00000-0000"
          />
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