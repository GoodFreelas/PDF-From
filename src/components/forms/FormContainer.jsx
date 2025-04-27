import { useState, useEffect } from 'react';
import SignatureCanvas from '../SignatureCanvas';
import PersonalInfoForm from './PersonalInfoForm';
import StandardForm from './StandardForm';
import DependentsForm from './DependentsForm';
import FamilyMembersForm from './FamilyMembersForm';

// URL base da API
const API_BASE_URL = 'https://pdf-from.onrender.com'; // Altere para a URL correta da sua API

export default function FormContainer({
  formData,
  handleChange,
  handleSubmit: originalHandleSubmit,
  sigRef,
  isOnlyVitalmed,
  contratos,
  processing: externalProcessing
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState(null);

  // Função de submit com verificação de backend e tempo mínimo
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Previne múltiplos cliques
    if (isProcessing || externalProcessing) return;
    
    // Verifica se a assinatura está preenchida
    if (sigRef.current?.isEmpty()) {
      alert('Por favor, assine antes de continuar.');
      return;
    }
    
    // Inicia o processamento
    setIsProcessing(true);
    setError(null);
    
    // Registra o tempo de início
    const startTime = Date.now();
    
    try {
      // Tenta verificar se o backend está online - usando a URL correta
      const backendCheckResponse = await fetch(`${API_BASE_URL}/api/check-status`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Se necessário para cookies/sessão
      });
      
      // Se o backend não responder corretamente, lança um erro
      if (!backendCheckResponse.ok) {
        throw new Error('Servidor indisponível no momento. Tente novamente mais tarde.');
      }
      
      // Calcula o tempo decorrido e quanto tempo ainda precisamos esperar
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      
      // Aguarda o tempo restante para completar o mínimo de 3 segundos
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Se chegou até aqui, o backend está respondendo e passamos dos 3 segundos
      // Agora podemos chamar a função handleSubmit original
      return await originalHandleSubmit(e);
      
    } catch (error) {
      console.error("Erro durante o processamento:", error);
      
      // Mesmo em caso de erro, aguardamos o tempo mínimo de 3 segundos
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Define o erro para exibição
      setError(error.message || "Ocorreu um erro ao processar sua solicitação.");
      return false;
    } finally {
      // Sempre finaliza o estado de processamento
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded shadow p-4 space-y-3 overflow-y-auto max-h-[80vh]"
    >
      <h2 className="text-xl font-semibold mb-3">Preencha os dados</h2>
      
      {isOnlyVitalmed ? (
        <>
          <PersonalInfoForm formData={formData} handleChange={handleChange} />
          <DependentsForm formData={formData} handleChange={handleChange} />
        </>
      ) : (
        <>
          <StandardForm formData={formData} handleChange={handleChange} />
          {contratos.includes('vitalmed') && (
            <FamilyMembersForm formData={formData} handleChange={handleChange} />
          )}
        </>
      )}
      
      <div>
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
      
      {error && (
        <div className="p-2 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isProcessing || externalProcessing}
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2 mt-4 disabled:opacity-60 flex items-center justify-center"
      >
        {(isProcessing || externalProcessing) ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </>
        ) : (
          'Gerar PDF preenchido'
        )}
      </button>
    </form>
  );
}