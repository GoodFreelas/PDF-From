import { useEffect, useState, useRef } from 'react';
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
    
    // Verifica se a pessoa tem pelo menos 18 anos
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
    
    return date <= eighteenYearsAgo;
  },
  
  // Validação de Telefone
  TELEFONE1: (value) => {
    // Remove caracteres não numéricos
    const phone = value.replace(/[^\d]/g, '');
    // Verifica se tem 10 ou 11 dígitos (com ou sem o 9)
    return phone.length >= 10 && phone.length <= 11;
  },
  
  TELEFONE2: (value) => {
    // Se estiver vazio, é válido
    if (!value || value.trim() === '') return true;
    
    // Remove caracteres não numéricos
    const phone = value.replace(/[^\d]/g, '');
    // Verifica se tem 10 ou 11 dígitos (com ou sem o 9)
    return phone.length >= 10 && phone.length <= 11;
  },
  
  // Validação de nome (não pode conter números)
  NOME: (value) => {
    if (!value || value.trim() === '') return false;
    
    // Verifica se contém apenas letras, espaços e alguns caracteres especiais comuns em nomes
    return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'.,-]+$/.test(value);
  }
};

// Função para formatar valores
const formatters = {
  CPF: (value) => {
    if (!value) return '';
    // Remove caracteres não numéricos
    const cpf = value.replace(/[^\d]/g, '');
    // Aplica máscara: 000.000.000-00
    return cpf
      .substring(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(-\d{2})?$/, '$1');
  },
  
  RG: (value) => {
    if (!value) return '';
    // Remove caracteres não numéricos
    return value.replace(/[^\d]/g, '');
  },
  
  TELEFONE1: (value) => {
    if (!value) return '';
    // Remove caracteres não numéricos
    const phone = value.replace(/[^\d]/g, '');
    // Aplica máscara: (00) 00000-0000 ou (00) 0000-0000
    if (phone.length <= 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  },
  
  TELEFONE2: (value) => formatters.TELEFONE1(value),
  
  NASCIMENTO: (value) => {
    if (!value) return '';
    // Remove caracteres não numéricos
    const date = value.replace(/[^\d]/g, '');
    // Aplica máscara: DD/MM/AAAA
    return date
      .substring(0, 8)
      .replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
      .replace(/(\d{2}\/\d{2}\/)(.*)$/, '$1$2');
  },
  
  // Formatador para nomes (remove números)
  NOME: (value) => {
    if (!value) return '';
    // Remove todos os números, mantém apenas letras, espaços e alguns caracteres especiais
    return value.replace(/[0-9]/g, '');
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

  // Função modificada para aplicar formatação enquanto o usuário digita
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Aplica formatador se existir para o campo
    if (formatters[name]) {
      const formattedValue = formatters[name](value);
      e.target.value = formattedValue;
    }
    
    // Chama a função handleChange original
    handleChange(e);
    
    // Valida o campo se o formulário já foi validado
    if (formValidated && validations[name]) {
      const isValid = validations[name](e.target.value);
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
          onChange={handleFormChange}
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
        <input
          name="RG"
          type="text"
          required
          value={formData.RG || ''}
          onChange={handleFormChange}
          className={`${inputStyle} ${isFieldInvalid('RG') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="Digite seu RG"
          maxLength={12}
          inputMode="numeric"
          pattern="[0-9]*"
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
        <input
          name="CPF"
          type="text"
          required
          value={formData.CPF || ''}
          onChange={handleFormChange}
          className={`${inputStyle} ${isFieldInvalid('CPF') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="000.000.000-00"
          maxLength={14}
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
          <input
            name="NASCIMENTO"
            type="text"
            required
            value={formData.NASCIMENTO || ''}
            onChange={handleFormChange}
            className={`${inputStyle} pr-12 ${isFieldInvalid('NASCIMENTO') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="DD/MM/AAAA"
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
          <p className="text-xs text-red-500 mt-1">Data de nascimento inválida. Você deve ter pelo menos 18 anos</p>
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
          onChange={handleFormChange}
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
          <input
            name="TELEFONE1"
            type="tel"
            required
            value={formData.TELEFONE1 || ''}
            onChange={handleFormChange}
            className={`${inputStyle} ${isFieldInvalid('TELEFONE1') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
          {isFieldInvalid('TELEFONE1') && (
            <p className="text-xs text-red-500 mt-1">Telefone inválido</p>
          )}
        </div>

        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Telefone 2</label>
          <input
            name="TELEFONE2"
            type="tel"
            value={formData.TELEFONE2 || ''}
            onChange={handleFormChange}
            className={`${inputStyle} ${isFieldInvalid('TELEFONE2') ? 'border-red-500 bg-red-50' : ''}`}
            placeholder="(00) 00000-0000"
            maxLength={15}
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