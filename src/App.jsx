import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepPersonal from './components/steps/StepPersonal';
import StepAddress from './components/steps/StepAddress';
import StepProfessional from './components/steps/StepProfessional';
import StepPlans from './components/steps/StepPlans';
import SuccessMessage from './components/SuccessMessage';
import IconAddress from './components/icons/IconAddress';
import IconPersonal from './components/icons/IconPersonal';
import IconPlans from './components/icons/IconPlans';
import IconProfessional from './components/icons/IconProfessional';
import IconSeparador from './components/icons/IconSeparador';

// URL base da API
const API_BASE_URL = 'https://pdf-from.onrender.com';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const sigRef = useRef(null);
  // Novo estado para controlar a disponibilidade do servidor
  const [serverStatus, setServerStatus] = useState({
    isChecking: true,
    isOnline: false,
    message: "Verificando conexão com o servidor...",
    details: null
  });

  // Efeito para verificar o status do servidor na montagem do componente
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        setServerStatus(prev => ({ ...prev, isChecking: true }));
        
        const response = await fetch(`${API_BASE_URL}/api/check-status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Servidor indisponível');
        }
        
        const data = await response.json();
        
        setServerStatus({
          isChecking: false,
          isOnline: true,
          message: "Servidor conectado",
          details: data
        });
      } catch (error) {
        console.error('Erro ao verificar o status do servidor:', error);
        setServerStatus({
          isChecking: false,
          isOnline: false,
          message: `Servidor indisponível: ${error.message}`,
          details: null
        });
      }
    };
    
    // Executa a verificação assim que o componente montar
    checkServerStatus();
  }, []);

  // Dados dos steps
  const stepData = [
    { 
      id: 1, 
      label: 'Pessoal', 
      icon: <IconPersonal className="w-4 h-4 mr-1" /> 
    },
    { 
      id: 2, 
      label: 'Endereço', 
      icon: <IconAddress className="w-4 h-4 mr-1" /> 
    },
    { 
      id: 3, 
      label: 'Profissional', 
      icon: <IconProfessional className="w-4 h-4 mr-1" /> 
    },
    { 
      id: 4, 
      label: 'Planos', 
      icon: <IconPlans className="w-4 h-4 mr-1" /> 
    }
  ];

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
    
    // Verifica se o servidor está online antes de tentar enviar
    if (!serverStatus.isOnline) {
      alert('O servidor está indisponível no momento. Por favor, tente novamente mais tarde.');
      return;
    }
    
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
        x: { type: 'tween', duration: 0.4, ease: 'easeOut' },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'tween', duration: 0.4, ease: 'easeIn' },
        opacity: { duration: 0.2 }
      }
    })
  };
  
  // Componente de alerta de servidor offline
  const ServerOfflineAlert = () => (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50 text-center">
      <p className="text-sm font-medium">
        {serverStatus.message} 
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 bg-white text-red-500 px-3 py-1 rounded-md text-xs font-bold"
        >
          Tentar Novamente
        </button>
      </p>
    </div>
  );

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
          {/* Indicador de carregamento durante a verificação do servidor */}
          {serverStatus.isChecking && (
            <div className="flex justify-center items-center my-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00AE71]"></div>
              <span className="ml-2 text-sm text-gray-600">Verificando conexão...</span>
            </div>
          )}
          
          <div className="mb-8 mt-10">
            <h1 className="font-roboto font-bold text-[40px] leading-[100%] tracking-[0%] text-black mb-5">
              Adesão a benefícios
            </h1>
            <div className="flex mt-4 gap-[7px] items-center flex-wrap">
              {stepData.map((item, index, arr) => {
                const isActive = currentStep === item.id;
                const isCompleted = currentStep > item.id;

                return (
                  <div key={item.id} className="flex items-center">
                    {/* Bloco do step */}
                    <div
                      className={`flex items-center justify-center min-w-[110px] max-w-[200px] h-[40px] px-[15px] py-[10px] rounded-full border
                        ${isActive || isCompleted ? 'bg-[rgba(0,174,113,0.05)] border-[#00AE71] text-[#00AE71]' : 'bg-transparent border-gray-500 text-gray-500'}
                        ${isCompleted && !isActive ? 'opacity-50' : ''}
                      `}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </div>
            
                    {/* Seta entre os steps */}
                    {index < arr.length - 1 && (
                      <div className={`ml-2.5 mr-1.5 ${currentStep > item.id ? 'text-[rgba(0,174,113,0.6)]' : 'text-gray-400'}`}>
                        <IconSeparador />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Formulário - Desabilitado se o servidor estiver offline */}
          <form onSubmit={handleSubmit} className={`relative overflow-hidden ${!serverStatus.isOnline && !serverStatus.isChecking ? 'opacity-50 pointer-events-none' : ''}`}>
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