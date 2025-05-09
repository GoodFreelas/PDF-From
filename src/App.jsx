import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Importar Framer Motion
import StepPersonal from './components/steps/StepPersonal';
import StepAddress from './components/steps/StepAddress';
import StepProfessional from './components/steps/StepProfissional';
import StepPlans from './components/steps/StepPlans';
import SuccessMessage from './components/SuccessMessage';
import IconAddress from './components/icons/IconAddress';
import IconPersonal from './components/icons/IconPersonal';
import IconPlans from './components/icons/IconPlans';
import IconProfessional from './components/icons/IconProfessional';
import IconSeparador from './components/icons/IconSeparador';

// URL base da API
const API_BASE_URL = 'http://localhost:3000';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1); // 1 para frente, -1 para trás
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
    setDirection(1); // Definir direção para frente
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    setDirection(-1); // Definir direção para trás
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

  // Variantes de animação
  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Se o processo estiver concluído, exibe a mensagem de sucesso
  if (done) {
    return <SuccessMessage email={formData.EMAIL} />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-1/2 bg-[#00AE71] z-10">
        <img 
          src="/bg.png" 
          alt="AMPARE" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 md:ml-[50%] p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="font-roboto font-bold text-[40px] leading-[100%] tracking-[0%] text-black mb-5">
              Adesão a benefícios
            </h1>
            <div className="flex mt-4 gap-[7px] items-center flex-wrap">
              {[1, 2, 3, 4].map((step, index, arr) => {
                const isActive = currentStep === step;
                const isCompleted = currentStep > step;

                const stepLabels = ['Pessoal', 'Endereço', 'Profissional', 'Planos'];
                const stepIcons = [
                  <IconPersonal key="personal" className="w-4 h-4 mr-1" />,
                  <IconAddress key="address" className="w-4 h-4 mr-1" />,
                  <IconProfessional key="professional" className="w-4 h-4 mr-1" />,
                  <IconPlans key="plans" className="w-4 h-4 mr-1" />
                ];

                return (
                  <div key={step} className="flex items-center">
                    {/* Bloco do step */}
                    <div
                      className={`flex items-center justify-center w-[110px] h-[40px] px-[15px] py-[10px] rounded-full border
                        ${isActive || isCompleted ? 'bg-[rgba(0,174,113,0.05)] border-[#00AE71] text-[#00AE71]' : 'bg-transparent border-gray-500 text-gray-500'}
                        ${isCompleted && !isActive ? 'opacity-50' : ''}
                      `}
                    >
                      {stepIcons[step - 1]}
                      <span className="text-sm font-medium">
                        {stepLabels[step - 1]}
                      </span>
                    </div>
            
                    {/* Seta entre os steps */}
                    {index < arr.length - 1 && (
                      <div className={`mx-3 ${currentStep > step ? 'text-[rgba(0,174,113,0.6)]' : 'text-gray-400'}`}>
                        <IconSeparador />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <StepPersonal 
                    formData={formData} 
                    handleChange={handleChange} 
                    nextStep={nextStep} 
                  />
                </motion.div>
              )}
              
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <StepAddress 
                    formData={formData} 
                    handleChange={handleChange} 
                    nextStep={nextStep} 
                    prevStep={prevStep} 
                  />
                </motion.div>
              )}
              
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  <StepProfessional 
                    formData={formData} 
                    handleChange={handleChange} 
                    nextStep={nextStep} 
                    prevStep={prevStep} 
                  />
                </motion.div>
              )}
              
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}