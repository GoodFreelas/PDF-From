import { useEffect, useState, useRef } from 'react';
import Cleave from 'cleave.js/react';
import IconData from '../icons/IconData';
import CustomAlert from '../CustomAlert';

// Importações necessárias para o Cleave
import 'cleave.js/dist/addons/cleave-phone.br';

// Função para obter a data atual formatada
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

// Funções de validação
const validations = {
  // Validação de CPF
  CPF: (value) => {
    // Remove caracteres não numéricos
    const cpf = value.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  },
  
  // Validação de Email
  EMAIL: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  // Validação de RG (formato básico)
  RG: (value) => {
    // Remove caracteres não numéricos
    const rg = value.replace(/[^\d]/g, '');
    // Verifica se tem pelo menos 7 dígitos
    return rg.length >= 7;
  },
  
  // Validação de Data de Nascimento
  NASCIMENTO: (value) => {
    // Verifica formato DD/MM/AAAA
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    
    if (!dateRegex.test(value)) return false;
    
    const [_, day, month, year] = value.match(dateRegex);
    const date = new Date(year, month - 1, day);
    
    // Verifica se é uma data válida
    if (
      date.getDate() !== parseInt(day) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getFullYear() !== parseInt(year)
    ) {
      return false;
    }
    
    // Verifica se a data não é futura
    const today = new Date();
    if (date > today) return false;
    
    // Verifica se a pessoa tem pelo menos 12 anos
    const twelveYearsAgo = new Date();
    twelveYearsAgo.setFullYear(today.getFullYear() - 12);
    
    // Verifica se a pessoa tem no máximo 120 anos
    const oneHundredTwentyYearsAgo = new Date();
    oneHundredTwentyYearsAgo.setFullYear(today.getFullYear() - 120);
    
    return date <= twelveYearsAgo && date >= oneHundredTwentyYearsAgo;
  },
  
  // Validação de Telefone
  TELEFONE1: (value) => {
    // Remove caracteres não numéricos
    const phone = value.replace(/[^\d]/g, '');
    // Verifica se tem 11 dígitos (2 do DDD + 9 do número)
    return phone.length === 11;
  },
  
  TELEFONE2: (value) => {
    // Se estiver vazio, é válido
    if (!value || value.trim() === '') return true;
    
    // Remove caracteres não numéricos
    const phone = value.replace(/[^\d]/g, '');
    // Verifica se tem 11 dígitos (2 do DDD + 9 do número)
    return phone.length === 11;
  },
  
  // Validação de nome (não pode conter números)
  NOME: (value) => {
    if (!value || value.trim() === '') return false;
    
    // Verifica se contém apenas letras, espaços e alguns caracteres especiais comuns em nomes
    return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'.,-]+$/.test(value);
  }
};

export default function StepPersonal({ formData, handleChange, nextStep }) {
  // Estado para controlar a exibição do alerta
  const [alert, setAlert] = useState(null);
  // Estado para controlar se o formulário foi validado
  const [formValidated, setFormValidated] = useState(false);
  // Estados para controlar erros de validação específicos
  const [validationErrors, setValidationErrors] = useState({});
  // Referência para o calendário
  const calendarRef = useRef(null);

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

  // Função para abrir o calendário nativo
  const openCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.showPicker();
    }
  };

  // Função para converter data do formato ISO para DD/MM/AAAA
  const formatDateFromCalendar = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Manipulador para o calendário
  const handleCalendarChange = (e) => {
    const isoDate = e.target.value;
    const formattedDate = formatDateFromCalendar(isoDate);
    
    const event = {
      target: {
        name: 'NASCIMENTO',
        value: formattedDate
      }
    };
    
    handleChange(event);
    
    // Valida o campo
    if (formValidated && validations.NASCIMENTO) {
      const isValid = validations.NASCIMENTO(formattedDate);
      setValidationErrors(prev => ({
        ...prev,
        NASCIMENTO: isValid ? null : true
      }));
    }
  };

  const validateAndProceed = (e) => {
    e.preventDefault();
    setFormValidated(true);

    // Verifica os campos obrigatórios
    const requiredFields = ['NOME', 'RG', 'CPF', 'NASCIMENTO', 'EMAIL', 'TELEFONE1'];
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
        NOME: 'Nome Completo',
        RG: 'RG',
        CPF: 'CPF',
        NASCIMENTO: 'Data de Nascimento',
        EMAIL: 'Email',
        TELEFONE1: 'Telefone 1'
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

  const inputStyle =
    'h-[45px] rounded-[10px] border border-gray-300 px-[20px] w-full focus:outline-none focus:border-[#00AE71] text-black';

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
          onChange={handleRegularChange}
          className={`${inputStyle} ${isFieldInvalid('NOME') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu nome completo"
        />
        {isFieldInvalid('NOME') && (
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
          className={`${inputStyle} ${isFieldInvalid('RG') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu RG"
          options={{
            numericOnly: true,
            blocks: [12]
          }}
        />
        {isFieldInvalid('RG') && (
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
          className={`${inputStyle} ${isFieldInvalid('CPF') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="000.000.000-00"
          options={{
            delimiters: ['.', '.', '-'],
            blocks: [3, 3, 3, 2],
            numericOnly: true
          }}
        />
        {isFieldInvalid('CPF') && (
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
            className={`${inputStyle} pr-12 ${isFieldInvalid('NASCIMENTO') ? 'border-red-500 bg-red-50' : ''}`}
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
            max={new Date().toISOString().split('T')[0]} // Limita até hoje
          />
        </div>
        {isFieldInvalid('NASCIMENTO') && (
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
          className={`${inputStyle} ${isFieldInvalid('EMAIL') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="exemplo@email.com"
        />
        {isFieldInvalid('EMAIL') && (
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
            className={`${inputStyle} ${isFieldInvalid('TELEFONE1') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(55) 55555-5555"
            options={{
              delimiters: ['(', ') ', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
          />
          {isFieldInvalid('TELEFONE1') && (
            <p className="text-xs text-red-500 mt-1">Telefone inválido</p>
          )}
        </div>

        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Telefone 2</label>
          <Cleave
            name="TELEFONE2"
            value={formData.TELEFONE2 || ''}
            onChange={handleCleaveChange}
            className={`${inputStyle} ${isFieldInvalid('TELEFONE2') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(55) 55555-5555"
            options={{
              delimiters: ['(', ') ', '-'],
              blocks: [0, 2, 5, 4],
              numericOnly: true
            }}
          />
          {isFieldInvalid('TELEFONE2') && (
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