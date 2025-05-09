import { useState, useEffect } from 'react';
import CustomAlert from '../CustomAlert';

export default function StepProfessional({ formData, handleChange, nextStep, prevStep }) {
  // Estado para controlar a exibição do alerta
  const [alert, setAlert] = useState(null);
  // Estado para controlar se o formulário foi validado
  const [formValidated, setFormValidated] = useState(false);

  // Efeito para fechar o alerta automaticamente após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const inputStyle =
    'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[550px] focus:outline-none focus:border-[#00AE71] text-gray-500';

  const validateAndProceed = (e) => {
    e.preventDefault();
    setFormValidated(true);
    
    const requiredFields = ['EMPRESA', 'MATRICULA', 'ORGAO', 'CARGO', 'PIS', 'ADMISSAO'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      // Mapeamento para nomes mais amigáveis
      const fieldNames = {
        EMPRESA: 'Empresa',
        MATRICULA: 'Matrícula',
        ORGAO: 'Órgão',
        CARGO: 'Cargo',
        PIS: 'PIS',
        ADMISSAO: 'Data de Admissão'
      };
      
      const readableFieldNames = missingFields.map(field => fieldNames[field] || field);
      
      // Mostrar alerta personalizado em vez do alert() padrão
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

  return (
    <div className="space-y-4 relative">
      {/* Exibe o alerta personalizado quando necessário */}
      {alert && (
        <CustomAlert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Empresa
        </label>
        <input
          name="EMPRESA"
          type="text"
          required
          value={formData.EMPRESA || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('EMPRESA') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Nome da empresa"
        />
        {isFieldInvalid('EMPRESA') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>
      
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Matrícula
        </label>
        <input
          name="MATRICULA"
          type="text"
          required
          value={formData.MATRICULA || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('MATRICULA') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Número de matrícula"
        />
        {isFieldInvalid('MATRICULA') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>
      
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Órgão
        </label>
        <input
          name="ORGAO"
          type="text"
          required
          value={formData.ORGAO || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('ORGAO') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Nome do órgão"
        />
        {isFieldInvalid('ORGAO') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>
      
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Cargo
        </label>
        <input
          name="CARGO"
          type="text"
          required
          value={formData.CARGO || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('CARGO') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Cargo atual"
        />
        {isFieldInvalid('CARGO') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>
      
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          PIS
        </label>
        <input
          name="PIS"
          type="text"
          required
          value={formData.PIS || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('PIS') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="000.00000.00-0"
        />
        {isFieldInvalid('PIS') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>
      
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Data de Admissão
        </label>
        <input
          name="ADMISSAO"
          type="text"
          required
          value={formData.ADMISSAO || ''}
          onChange={handleChange}
          className={`${inputStyle} ${isFieldInvalid('ADMISSAO') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="DD/MM/AAAA"
        />
        {isFieldInvalid('ADMISSAO') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-transparent border border-[#00AE71] hover:bg-gray-100 text-[#00AE71] rounded-[10px] px-6 py-2 font-semibold"
        >
          Voltar
        </button>
        
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