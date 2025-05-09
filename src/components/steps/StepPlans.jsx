import { useState, useEffect, useRef } from 'react';
import SignatureCanvas from '../SignatureCanvas';
import CustomAlert from '../CustomAlert';
import IconData from '../icons/IconData'; // Supondo que este ícone exista

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
    
    return true;
  },
  
  // Validação de valor monetário
  VALOR: (value) => {
    if (!value) return false;
    
    // Remove o R$ e espaços
    const cleanValue = value.replace(/R\$\s?/g, '');
    
    // Se estiver vazio após remoção de R$, é inválido
    if (!cleanValue.trim()) return false;
    
    // Verifica se há pelo menos um dígito
    return /\d/.test(cleanValue);
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
  
  VALOR: (value) => {
    // Se estiver vazio, retorna vazio
    if (!value) return '';
    
    // Se começar com R$, remove para fazer a formatação
    let numericValue = value.replace(/^R\$\s?/, '');
    
    // Remove tudo exceto números e vírgula
    numericValue = numericValue.replace(/[^\d,]/g, '');
    
    // Se houver mais de uma vírgula, mantém apenas a última
    if ((numericValue.match(/,/g) || []).length > 1) {
      const parts = numericValue.split(',');
      numericValue = parts.slice(0, -1).join('') + ',' + parts.slice(-1);
    }
    
    // Se for um valor válido, formata como moeda
    if (numericValue) {
      // Adiciona R$ no início
      return `R$ ${numericValue}`;
    } else {
      return 'R$ ';
    }
  },
  
  // Formatador para nomes (remove números)
  NOME: (value) => {
    if (!value) return '';
    // Remove todos os números, mantém apenas letras, espaços e alguns caracteres especiais
    return value.replace(/[0-9]/g, '');
  }
};

export default function StepPlans({ 
  formData, 
  handleChange, 
  handlePlansChange,
  handleDependentsChange,
  handleSubmit,
  prevStep, 
  sigRef,
  processing
}) {
  const [selectedPlans, setSelectedPlans] = useState(formData.selectedPlans || []);
  const [dependents, setDependents] = useState(formData.dependents || []);
  // Estado para controlar se o vitalmed está selecionado
  const [isVitalmedSelected, setIsVitalmedSelected] = useState(selectedPlans.includes('vitalmed'));
  // Estado para controlar o alerta personalizado
  const [alert, setAlert] = useState(null);
  // Estado para controlar se o formulário foi validado
  const [formValidated, setFormValidated] = useState(false);
  // Estado para controlar erros de validação específicos
  const [validationErrors, setValidationErrors] = useState({});
  // Estado para controlar erros dos dependentes
  const [dependentErrors, setDependentErrors] = useState([]);
  // Referências para os calendários dos dependentes
  const calendarRefs = useRef([]);

  const plansOptions = [
    { id: 'qualidonto', label: 'Qualidonto' },
    { id: 'vitalmed', label: 'Vitalmed' },
    { id: 'saude', label: 'Blue Saúde' }
  ];

  // Inicializa as referências dos calendários quando dependentes mudam
  useEffect(() => {
    calendarRefs.current = dependents.map((_, i) => calendarRefs.current[i] || null);
  }, [dependents]);

  // Efeito para fechar o alerta automaticamente após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    handlePlansChange(selectedPlans);
    // Atualiza o estado de vitalmed selecionado
    setIsVitalmedSelected(selectedPlans.includes('vitalmed'));
    
    // Se o vitalmed for desmarcado, limpar os dependentes
    if (!selectedPlans.includes('vitalmed') && dependents.length > 0) {
      setDependents([]);
      setDependentErrors([]);
    }
  }, [selectedPlans]);

  useEffect(() => {
    handleDependentsChange(dependents);
  }, [dependents]);

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

  const togglePlan = (planId) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const addDependent = () => {
    if (dependents.length < 6) {
      setDependents([...dependents, { NOME: '', CPF: '', NASCIMENTO: '' }]);
      // Adiciona entrada para erros de dependente
      setDependentErrors([...dependentErrors, { NOME: false, CPF: false, NASCIMENTO: false }]);
    }
  };

  const removeDependent = (index) => {
    const newDependents = [...dependents];
    newDependents.splice(index, 1);
    setDependents(newDependents);
    
    const newErrors = [...dependentErrors];
    newErrors.splice(index, 1);
    setDependentErrors(newErrors);
  };

  const updateDependent = (index, field, value) => {
    // Aplica formatação para CPF e data de nascimento
    if (field === 'CPF' || field === 'NASCIMENTO') {
      value = formatters[field](value);
    }
    
    // Aplica formatação para nome (remove números)
    if (field === 'NOME') {
      value = formatters.NOME(value);
    }
    
    const newDependents = [...dependents];
    newDependents[index] = { ...newDependents[index], [field]: value };
    setDependents(newDependents);
    
    // Valida o campo se o formulário já foi validado
    if (formValidated) {
      let isValid = true;
      
      if (field === 'NOME') {
        isValid = !!value.trim(); // Nome válido se não for vazio após trim
      } else if (validations[field]) {
        isValid = validations[field](value);
      }
      
      const newErrors = [...dependentErrors];
      newErrors[index] = { ...newErrors[index], [field]: !isValid };
      setDependentErrors(newErrors);
    }
  };

  // Função para abrir o calendário nativo para um dependente específico
  const openDependentCalendar = (index) => {
    if (calendarRefs.current[index]) {
      calendarRefs.current[index].showPicker();
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

  // Manipulador para o calendário de dependente
  const handleDependentCalendarChange = (index, e) => {
    const isoDate = e.target.value;
    const formattedDate = formatDateFromCalendar(isoDate);
    
    // Atualiza o valor no array de dependentes
    updateDependent(index, 'NASCIMENTO', formattedDate);
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setFormValidated(true);
    let hasErrors = false;

    // Verificar se o valor é válido
    const isValorValid = formData.VALOR && validations.VALOR(formData.VALOR);
    setValidationErrors(prev => ({ ...prev, VALOR: !isValorValid }));
    if (!isValorValid) hasErrors = true;

    // Verificar se algum plano foi selecionado
    if (selectedPlans.length === 0) {
      hasErrors = true;
    }

    // Verificar a assinatura
    if (sigRef.current?.isEmpty()) {
      hasErrors = true;
    }

    // Validar dependentes se o vitalmed estiver selecionado
    if (isVitalmedSelected && dependents.length > 0) {
      const newDependentErrors = dependents.map(dep => ({
        NOME: !dep.NOME,
        CPF: !dep.CPF || (dep.CPF && !validations.CPF(dep.CPF)),
        NASCIMENTO: !dep.NASCIMENTO || (dep.NASCIMENTO && !validations.NASCIMENTO(dep.NASCIMENTO))
      }));
      
      setDependentErrors(newDependentErrors);
      
      const hasDependentErrors = newDependentErrors.some(err => 
        err.NOME || err.CPF || err.NASCIMENTO
      );
      
      if (hasDependentErrors) {
        hasErrors = true;
        setAlert({
          message: 'Por favor, corrija os erros nos dados dos dependentes.',
          type: 'warning'
        });
      }
    }

    // Se não há erros, enviar o formulário
    if (!hasErrors) {
      handleSubmit(e);
    } else {
      // Mostra mensagem de erro específica dependendo do que está faltando
      if (!isValorValid) {
        setAlert({
          message: 'Por favor, preencha um valor válido.',
          type: 'warning'
        });
      } else if (selectedPlans.length === 0) {
        setAlert({
          message: 'Por favor, selecione pelo menos um plano.',
          type: 'warning'
        });
      } else if (sigRef.current?.isEmpty()) {
        setAlert({
          message: 'Por favor, assine antes de continuar.',
          type: 'warning'
        });
      }
    }
  };

  // Verifica se um campo de dependente está inválido
  const isDependentFieldInvalid = (index, field) => {
    return dependentErrors[index] && dependentErrors[index][field];
  };

  // Verifica se um campo está inválido
  const isFieldInvalid = (fieldName) => {
    return validationErrors[fieldName];
  };

  const inputStyle = 'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[550px] focus:outline-none focus:border-[#00AE71] text-black';

  return (
    <div className="space-y-6 relative">
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
          Valor
        </label>
        <input
          name="VALOR"
          type="text"
          required
          value={formData.VALOR || ''}
          onChange={handleFormChange}
          className={`${inputStyle} ${isFieldInvalid('VALOR') ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="R$ 0,00"
        />
        {isFieldInvalid('VALOR') && (
          <p className="text-xs text-red-500 mt-1">Por favor, insira um valor válido</p>
        )}
      </div>

      <div>
        <div className="space-y-4">
          {plansOptions.map(plan => {
            const isSelected = selectedPlans.includes(plan.id);
            return (
              <div key={plan.id} className="space-y-1">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => togglePlan(plan.id)}
                >
                  <div className="flex flex-col">
                    <span
                      className="text-black mb-1"
                      style={{
                        fontWeight: 400,
                        fontSize: '20px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                      }}
                    >
                      {plan.label}
                    </span>
                    <span
                      className="text-gray-500"
                      style={{
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        textAlign: 'right',
                      }}
                    >
                      Clique aqui para ler os termos
                    </span>
                  </div>

                  {/* Botão toggle com bolinha animada */}
                  <div
                    className={`w-[35px] h-[20px] rounded-full p-[2px] flex items-center transition-colors duration-300 ${
                      isSelected ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-[16px] h-[16px] bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        isSelected ? 'translate-x-[15px]' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {selectedPlans.length === 0 && formValidated && (
          <p className="text-xs text-red-500 mt-1">Por favor, selecione pelo menos um plano</p>
        )}
      </div>

      {/* Mostrar seção de dependentes somente se vitalmed estiver selecionado */}
      {isVitalmedSelected && (
        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between items-center mb-3">
            {dependents.length < 6 && (
              <button
                type="button"
                onClick={addDependent}
                className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-[30px] py-[15px] w-[257px] h-[55px] text-sm"
              >
                Adicionar Dependente
              </button>
            )}
          </div>

          {dependents.map((dependent, index) => (
            <div key={index} className="p-4 border rounded mb-4 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Dependente {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDependent(index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remover
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-gray-500 focus-within:text-black">
                  <label className="block text-sm mb-0.5">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={dependent.NOME || ''}
                    onChange={(e) => updateDependent(index, 'NOME', e.target.value)}
                    className={`${inputStyle} ${isDependentFieldInvalid(index, 'NOME') ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="Nome completo"
                  />
                  {isDependentFieldInvalid(index, 'NOME') && (
                    <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
                  )}
                </div>

                <div className="text-gray-500 focus-within:text-black">
                  <label className="block text-sm mb-0.5">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={dependent.CPF || ''}
                    onChange={(e) => updateDependent(index, 'CPF', e.target.value)}
                    className={`${inputStyle} ${isDependentFieldInvalid(index, 'CPF') ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {isDependentFieldInvalid(index, 'CPF') && (
                    <p className="text-xs text-red-500 mt-1">CPF inválido</p>
                  )}
                </div>

                <div className="text-gray-500 focus-within:text-black">
                  <label className="block text-sm mb-0.5">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dependent.NASCIMENTO || ''}
                      onChange={(e) => updateDependent(index, 'NASCIMENTO', e.target.value)}
                      className={`${inputStyle} pr-12 ${isDependentFieldInvalid(index, 'NASCIMENTO') ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="DD/MM/AAAA"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent p-0 m-0 flex items-center justify-center"
                      onClick={() => openDependentCalendar(index)}
                    >
                      <IconData className="w-5 h-5" />
                    </button>
                    
                    {/* Calendário escondido */}
                    <input
                      ref={el => calendarRefs.current[index] = el}
                      type="date"
                      className="opacity-0 absolute w-0 h-0"
                      onChange={(e) => handleDependentCalendarChange(index, e)}
                      max={new Date().toISOString().split('T')[0]} // Limita até hoje
                    />
                  </div>
                  {isDependentFieldInvalid(index, 'NASCIMENTO') && (
                    <p className="text-xs text-red-500 mt-1">Data de nascimento inválida</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 mt-4">
        <label className="block text-sm mb-1">
          Assinatura
        </label>
        <p
          className="text-gray-500 text-sm mb-2"
          style={{
            fontFamily: 'Roboto',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '100%',
            letterSpacing: '0%',
            textAlign: 'left',
          }}
        >
          Escreva a sua assinatura abaixo com o mouse ou dedo
        </p>

        <div
          className={`relative bg-transparent border rounded-[10px] p-[20px] ${sigRef.current?.isEmpty() && formValidated ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
        >
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{ className: 'w-full h-full' }}
          />

          <button
            type="button"
            onClick={() => sigRef.current?.clear()}
            className="absolute top-2 right-2 text-sm text-gray-600 hover:text-black"
          >
            Limpar
          </button>
        </div>
        {sigRef.current?.isEmpty() && formValidated && (
          <p className="text-xs text-red-500 mt-1">Por favor, adicione sua assinatura</p>
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
          type="submit"
          onClick={validateAndSubmit}
          disabled={processing}
          className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-6 py-2 font-semibold flex items-center justify-center disabled:opacity-60"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : (
            'Concluir'
          )}
        </button>
      </div>
    </div>
  );
}