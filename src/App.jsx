import { useState, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StepPersonal from './components/steps/StepPersonal';
import StepAddress from './components/steps/StepAddress';
import StepProfessional from './components/steps/StepProfissional';
import StepPlans from './components/steps/StepPlans';
import SuccessMessage from './components/SuccessMessage';
// Removida a importação de generatePdf, pois será feito no backend
// import { generatePdf } from './utils/pdfUtils';

// URL base da API
const API_BASE_URL = 'http://localhost:3000';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const sigRef = useRef(null);

  // Função para atualizar os dados do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para lidar com mudanças nos dependentes
  const handleDependentsChange = (dependents) => {
    setFormData((prev) => ({ ...prev, dependents }));
  };

  // Função para avançar para a próxima etapa
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Função para atualizar os planos selecionados
  const handlePlansChange = (plans) => {
    setFormData((prev) => ({ ...prev, selectedPlans: plans }));
  };

  // Função para lidar com o envio final do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      // Verificações preliminares
      if (!sigRef.current) {
        throw new Error("Campo de assinatura não disponível");
      }
      
      // Verifica se pelo menos um plano foi selecionado
      const selectedPlans = formData.selectedPlans || [];
      if (selectedPlans.length === 0) {
        throw new Error("Por favor, selecione pelo menos um plano");
      }
      
      // Captura a assinatura como dataURL
      const sigDataUrl = sigRef.current.toDataURL('image/png');
      
      // Envia todos os dados para o servidor processar
      console.log("Enviando dados ao servidor...");
      const resp = await fetch(`${API_BASE_URL}/generate-pdfs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          formData,
          signatureData: sigDataUrl,
          contratos: selectedPlans.join(',')
        })
      });
      
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload.message || 'Erro no servidor');
      }
      
      // Processa a resposta do servidor
      const responseData = await resp.json();
      console.log("Resposta do servidor:", responseData);
      
      // Se temos PDFs no resultado, fazemos o download
      if (responseData.pdfs) {
        // Para cada PDF retornado pelo servidor, cria um link para download
        Object.entries(responseData.pdfs).forEach(([filename, base64Data]) => {
          // Converte base64 para blob
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          
          // Cria um link para download e clica automaticamente
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = filename;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Libera o objeto URL criado
          setTimeout(() => URL.revokeObjectURL(downloadLink.href), 1000);
        });
      }
      
      // Mostra a mensagem de sucesso
      setDone(true);
    } catch (err) {
      console.error("Erro no processamento do formulário:", err);
      alert('Erro ao processar sua solicitação: ' + (err.message || 'erro desconhecido'));
    } finally {
      setProcessing(false);
    }
  };

  // Se o processo estiver concluído, exibe a mensagem de sucesso
  if (done) {
    return <SuccessMessage email={formData.EMAIL} />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden md:block md:w-1/2 bg-blue-600">
        <div className="h-full flex items-center justify-center">
          <img 
            src="/logo-ampare.png" 
            alt="AMPARE" 
            className="max-w-xs mx-auto"
          />
        </div>
      </div>
      
      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-blue-800">AMPARE - Gerador de Contratos</h1>
            <div className="flex mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`w-1/4 text-center ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <div 
                    className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-white ${
                      currentStep === step 
                        ? 'bg-blue-600 border-blue-600' 
                        : currentStep > step 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-gray-300 border-gray-300'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <div className="text-xs mt-1">
                    {step === 1 && 'Pessoal'}
                    {step === 2 && 'Endereço'}
                    {step === 3 && 'Profissional'}
                    {step === 4 && 'Planos'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white border rounded shadow p-6">
            {currentStep === 1 && (
              <StepPersonal 
                formData={formData} 
                handleChange={handleChange} 
                nextStep={nextStep} 
              />
            )}
            
            {currentStep === 2 && (
              <StepAddress 
                formData={formData} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                prevStep={prevStep} 
              />
            )}
            
            {currentStep === 3 && (
              <StepProfessional 
                formData={formData} 
                handleChange={handleChange} 
                nextStep={nextStep} 
                prevStep={prevStep} 
              />
            )}
            
            {currentStep === 4 && (
              <StepPlans 
                formData={formData} 
                handleChange={handleChange} 
                handlePlansChange={handlePlansChange}
                handleDependentsChange={handleDependentsChange} 
                prevStep={prevStep} 
                handleSubmit={handleSubmit}
                sigRef={sigRef}
                processing={processing}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}