import { useState, useEffect } from 'react';
import SignatureCanvas from '../SignatureCanvas';
import CustomAlert from '../CustomAlert';

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

  const plansOptions = [
    { id: 'qualidonto', label: 'Qualidonto' },
    { id: 'vitalmed', label: 'Vitalmed' },
    { id: 'saude', label: 'Blue Saúde' }
  ];

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
    }
  }, [selectedPlans]);

  useEffect(() => {
    handleDependentsChange(dependents);
  }, [dependents]);

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
    }
  };

  const removeDependent = (index) => {
    const newDependents = [...dependents];
    newDependents.splice(index, 1);
    setDependents(newDependents);
  };

  const updateDependent = (index, field, value) => {
    const newDependents = [...dependents];
    newDependents[index] = { ...newDependents[index], [field]: value };
    setDependents(newDependents);
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setFormValidated(true);

    // Verificar se o valor foi preenchido
    if (!formData.VALOR) {
      setAlert({
        message: 'Por favor, preencha o valor.',
        type: 'warning'
      });
      return;
    }

    if (selectedPlans.length === 0) {
      setAlert({
        message: 'Por favor, selecione pelo menos um plano.',
        type: 'warning'
      });
      return;
    }

    if (sigRef.current?.isEmpty()) {
      setAlert({
        message: 'Por favor, assine antes de continuar.',
        type: 'warning'
      });
      return;
    }

    // Só valida dependentes se o vitalmed estiver selecionado
    if (isVitalmedSelected && dependents.length > 0) {
      const invalidDependents = dependents.filter(
        dep => !dep.NOME || !dep.CPF || !dep.NASCIMENTO
      );

      if (invalidDependents.length > 0) {
        setAlert({
          message: 'Por favor, preencha todos os dados dos dependentes ou remova-os.',
          type: 'warning'
        });
        return;
      }
    }

    handleSubmit(e);
  };

  const inputStyle = 'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[550px] focus:outline-none focus:border-[#00AE71] text-gray-500';

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
          onChange={handleChange}
          className={`${inputStyle} ${!formData.VALOR && formValidated ? 'border-red-500 bg-red-50' : ''}`}
          placeholder="R$ 0,00"
        />
        {!formData.VALOR && formValidated && (
          <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>
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
                    className={`${inputStyle} ${!dependent.NOME && formValidated ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="text-gray-500 focus-within:text-black">
                  <label className="block text-sm mb-0.5">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={dependent.CPF || ''}
                    onChange={(e) => updateDependent(index, 'CPF', e.target.value)}
                    className={`${inputStyle} ${!dependent.CPF && formValidated ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="text-gray-500 focus-within:text-black">
                  <label className="block text-sm mb-0.5">
                    Data de Nascimento
                  </label>
                  <input
                    type="text"
                    value={dependent.NASCIMENTO || ''}
                    onChange={(e) => updateDependent(index, 'NASCIMENTO', e.target.value)}
                    className={`${inputStyle} ${!dependent.NASCIMENTO && formValidated ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="DD/MM/AAAA"
                  />
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