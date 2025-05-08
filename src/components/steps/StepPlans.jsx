import { useState, useEffect } from 'react';
import SignatureCanvas from '../SignatureCanvas';

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
  // Estado para gerenciar planos selecionados
  const [selectedPlans, setSelectedPlans] = useState(formData.selectedPlans || []);
  
  // Estado para gerenciar dependentes
  const [dependents, setDependents] = useState(formData.dependents || []);
  
  // Opções de planos disponíveis
  const plansOptions = [
    { id: 'qualidonto', label: 'Qualidonto' },
    { id: 'vitalmed', label: 'Vitalmed' },
    { id: 'saude', label: 'Blue Saúde' }
  ];

  // Atualiza o formData quando os planos mudam
  useEffect(() => {
    handlePlansChange(selectedPlans);
  }, [selectedPlans]);

  // Atualiza o formData quando os dependentes mudam
  useEffect(() => {
    handleDependentsChange(dependents);
  }, [dependents]);

  // Função para alternar seleção de plano
  const togglePlan = (planId) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId);
      } else {
        return [...prev, planId];
      }
    });
  };

  // Função para adicionar dependente
  const addDependent = () => {
    if (dependents.length < 6) {
      setDependents([...dependents, { NOME: '', CPF: '', NASCIMENTO: '' }]);
    }
  };

  // Função para remover dependente
  const removeDependent = (index) => {
    const newDependents = [...dependents];
    newDependents.splice(index, 1);
    setDependents(newDependents);
  };

  // Função para atualizar dados do dependente
  const updateDependent = (index, field, value) => {
    const newDependents = [...dependents];
    newDependents[index] = { ...newDependents[index], [field]: value };
    setDependents(newDependents);
  };

  // Função para validar o formulário antes de enviar
  const validateAndSubmit = (e) => {
    e.preventDefault();
    
    // Verifica se pelo menos um plano foi selecionado
    if (selectedPlans.length === 0) {
      alert('Por favor, selecione pelo menos um plano.');
      return;
    }
    
    // Verifica se a assinatura está preenchida
    if (sigRef.current?.isEmpty()) {
      alert('Por favor, assine antes de continuar.');
      return;
    }
    
    // Valida dados dos dependentes
    const invalidDependents = dependents.filter(
      dep => !dep.NOME || !dep.CPF || !dep.NASCIMENTO
    );
    
    if (invalidDependents.length > 0) {
      alert('Por favor, preencha todos os dados dos dependentes ou remova-os.');
      return;
    }
    
    // Se tudo estiver válido, envia o formulário
    handleSubmit(e);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Planos e Dependentes</h2>
      
      <div>
        <label className="block text-sm mb-1">Valor</label>
        <input
          name="VALOR"
          type="text"
          required
          value={formData.VALOR || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="R$ 0,00"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-3">Planos (selecione pelo menos um)</label>
        <div className="space-y-2">
          {plansOptions.map(plan => (
            <div key={plan.id} className="flex items-center">
              <input
                type="checkbox"
                id={`plan-${plan.id}`}
                checked={selectedPlans.includes(plan.id)}
                onChange={() => togglePlan(plan.id)}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor={`plan-${plan.id}`} className="text-sm">{plan.label}</label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t mt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Dependentes</h3>
          {dependents.length < 6 && (
            <button
              type="button"
              onClick={addDependent}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Adicionar Dependente
            </button>
          )}
        </div>
        
        {dependents.length === 0 && (
          <p className="text-gray-500 text-sm italic">Nenhum dependente adicionado.</p>
        )}
        
        {dependents.map((dependent, index) => (
          <div key={index} className="p-3 border rounded mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Dependente {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeDependent(index)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remover
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-0.5">Nome</label>
                <input
                  type="text"
                  value={dependent.NOME || ''}
                  onChange={(e) => updateDependent(index, 'NOME', e.target.value)}
                  className="w-full border rounded p-1"
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-0.5">CPF</label>
                <input
                  type="text"
                  value={dependent.CPF || ''}
                  onChange={(e) => updateDependent(index, 'CPF', e.target.value)}
                  className="w-full border rounded p-1"
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-0.5">Data de Nascimento</label>
                <input
                  type="text"
                  value={dependent.NASCIMENTO || ''}
                  onChange={(e) => updateDependent(index, 'NASCIMENTO', e.target.value)}
                  className="w-full border rounded p-1"
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 mt-4">
        <label className="block text-sm mb-1">Assinatura</label>
        <SignatureCanvas ref={sigRef} />
        <button
          type="button"
          className="mt-2 px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => sigRef.current?.clear()}
        >
          Limpar
        </button>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 rounded py-2"
        >
          Voltar
        </button>
        
        <button
          type="submit"
          onClick={validateAndSubmit}
          disabled={processing}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2 disabled:opacity-60 flex items-center justify-center"
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