import { useState, useEffect } from 'react';
import Cleave from 'cleave.js/react';
import CustomAlert from '../CustomAlert';

// Função para validação do CEP
const validations = {
  CEP: (value) => {
    // Remove caracteres não numéricos
    const cep = value.replace(/[^\d]/g, '');
    
    // Verifica se tem 8 dígitos
    return cep.length === 8;
  },
  
  NUMERO: (value) => {
    // Permite apenas números e letras (para casos como "123A", "S/N", etc.)
    return /^[0-9a-zA-Z\s\/\-]+$/.test(value);
  }
};

export default function StepAddress({ formData, handleChange, nextStep, prevStep }) {
  // Estado para controlar a exibição do alerta
  const [alert, setAlert] = useState(null);
  // Estado para controlar se o formulário foi validado
  const [formValidated, setFormValidated] = useState(false);
  // Estado para controlar erros de validação específicos
  const [validationErrors, setValidationErrors] = useState({});
  // Estado para controlar o carregamento do CEP
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Efeito para fechar o alerta automaticamente após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  const inputStyle =
    'h-[45px] rounded-[10px] border border-gray-300 px-[20px] w-full focus:outline-none focus:border-[#00AE71] text-black';

  // Função para lidar com alterações nos campos Cleave
  const handleCleaveChange = (e) => {
    const { name, rawValue, value } = e.target;
    
    // Cria um evento sintético para ser compatível com o handleChange original
    const syntheticEvent = {
      target: {
        name,
        value,
        rawValue
      }
    };
    
    // Chama a função handleChange original
    handleChange(syntheticEvent);
    
    // Valida o campo se o formulário já foi validado
    if (formValidated && validations[name]) {
      const isValid = validations[name](value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: isValid ? null : true
      }));
    }
    
    // Se for o CEP e tiver 8 dígitos, busca os dados do endereço
    if (name === 'CEP') {
      const cepDigits = value.replace(/[^\d]/g, '');
      if (cepDigits.length === 8) {
        fetchAddressByCep(cepDigits);
      }
    }
  };

  // Função para campos que não usam Cleave
  const handleRegularChange = (e) => {
    const { name, value } = e.target;
    
    // Chama a função handleChange original
    handleChange(e);
    
    // Valida o campo se o formulário já foi validado
    if (formValidated && validations[name]) {
      const isValid = validations[name](value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: isValid ? null : true
      }));
    }
  };
  
  // Função para buscar o endereço pelo CEP usando a API ViaCEP
  const fetchAddressByCep = async (cep) => {
    if (!cep || cep.length !== 8) return;
    
    try {
      setIsLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setAlert({
          message: 'CEP não encontrado',
          type: 'error'
        });
        return;
      }
      
      // Atualiza os campos com os dados retornados
      const addressFields = {
        RUA: data.logradouro,
        BAIRRO: data.bairro,
        CIDADE: data.localidade,
        ESTADO: data.uf
      };
      
      // Atualiza os campos do formulário
      Object.entries(addressFields).forEach(([field, value]) => {
        if (value) {
          const event = {
            target: {
              name: field,
              value
            }
          };
          handleChange(event);
        }
      });
      
      // Limpa os erros de validação desses campos
      if (formValidated) {
        setValidationErrors(prev => ({
          ...prev,
          RUA: null,
          BAIRRO: null,
          CIDADE: null,
          ESTADO: null
        }));
      }
      
      // Move o foco para o campo de número
      const numeroInput = document.querySelector('input[name="NUMERO"]');
      if (numeroInput) {
        numeroInput.focus();
      }
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setAlert({
        message: 'Erro ao buscar o CEP. Verifique sua conexão.',
        type: 'error'
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const validateAndProceed = (e) => {
    e.preventDefault();
    setFormValidated(true);
    
    // Verifica os campos obrigatórios
    const requiredFields = ['CEP', 'RUA', 'NUMERO', 'BAIRRO', 'CIDADE', 'ESTADO'];
    const errors = {};
    
    // Verifica campos vazios
    const missingFields = [];
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
    
    setValidationErrors(errors);

    // Se houver erros, mostra alerta
    if (Object.keys(errors).length > 0) {
      // Mapeamento para nomes mais amigáveis
      const fieldNames = {
        CEP: 'CEP',
        RUA: 'Rua',
        NUMERO: 'Número',
        BAIRRO: 'Bairro',
        CIDADE: 'Cidade',
        ESTADO: 'Estado'
      };
      
      let message = '';
      
      if (missingFields.length > 0) {
        const readableFieldNames = missingFields.map(field => fieldNames[field] || field);
        message = `Por favor, preencha os seguintes campos: ${readableFieldNames.join(', ')}`;
      } else {
        message = 'Por favor, corrija os erros de validação nos campos destacados';
      }
      
      // Mostrar alerta personalizado
      setAlert({
        message,
        type: 'warning'
      });
      return;
    }

    nextStep();
  };
  
  // Função para verificar se um campo está inválido
  const isFieldInvalid = (fieldName) => {
    return validationErrors[fieldName];
  };

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
      
      {/* CEP */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          CEP
        </label>
        <div className="relative">
          <Cleave
            name="CEP"
            required
            value={formData.CEP || ''}
            onChange={handleCleaveChange}
            className={`${inputStyle} ${isFieldInvalid('CEP') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="00000-000"
            options={{
              delimiters: ['-'],
              blocks: [5, 3],
              numericOnly: true
            }}
          />
          {isLoadingCep && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-t-2 border-[#00AE71] border-solid rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {isFieldInvalid('CEP') && (
          <p className="text-xs text-red-500 mt-1">CEP inválido. Deve ter 8 dígitos</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher o endereço automaticamente</p>
      </div>

      {/* Rua e Número */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            Rua
          </label>
          <input
            name="RUA"
            type="text"
            required
            value={formData.RUA || ''}
            onChange={handleRegularChange}
            className={`${inputStyle} ${isFieldInvalid('RUA') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="Nome da rua"
          />
          {isFieldInvalid('RUA') && (
            <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
          )}
        </div>
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            Número
          </label>
          <Cleave
            name="NUMERO"
            required
            value={formData.NUMERO || ''}
            onChange={handleCleaveChange}
            className={`${inputStyle} ${isFieldInvalid('NUMERO') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="123"
            options={{
              blocks: [10],
              uppercase: true,
              // Aceita números, letras, espaços, / e -
              numericOnly: false,
              delimiter: ''
            }}
          />
          {isFieldInvalid('NUMERO') && (
            <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
          )}
        </div>
      </div>

      {/* Complemento */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Complemento</label>
        <input
          name="COMPLEMENTO"
          type="text"
          value={formData.COMPLEMENTO || ''}
          onChange={handleRegularChange}
          className={inputStyle}
          placeholder="Apto, Bloco, etc."
        />
      </div>

      {/* Bairro */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          Bairro
        </label>
        <input
          name="BAIRRO"
          type="text"
          required
          value={formData.BAIRRO || ''}
          onChange={handleRegularChange}
          className={`${inputStyle} ${isFieldInvalid('BAIRRO') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Nome do bairro"
        />
        {isFieldInvalid('BAIRRO') && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
        )}
      </div>

      {/* Cidade e Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            Cidade
          </label>
          <input
            name="CIDADE"
            type="text"
            required
            value={formData.CIDADE || ''}
            onChange={handleRegularChange}
            className={`${inputStyle} ${isFieldInvalid('CIDADE') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="Nome da cidade"
          />
          {isFieldInvalid('CIDADE') && (
            <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
          )}
        </div>

        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            Estado
          </label>
          <select
            name="ESTADO"
            required
            value={formData.ESTADO || ''}
            onChange={handleRegularChange}
            className={`${inputStyle} ${isFieldInvalid('ESTADO') ? 'border-red-500 bg-red-50' : ''}`}
          >
            <option value="">Selecione...</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {isFieldInvalid('ESTADO') && (
            <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
          )}
        </div>
      </div>

      {/* Botões */}
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