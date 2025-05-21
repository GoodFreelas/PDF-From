import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StepPersonal from "./components/steps/StepPersonal";
import StepAddress from "./components/steps/StepAddress";
import StepProfessional from "./components/steps/StepProfessional";
import StepPlans from "./components/steps/StepPlans";
import SuccessMessage from "./components/SuccessMessage";
import IconAddress from "./components/icons/IconAddress";
import IconPersonal from "./components/icons/IconPersonal";
import IconPlans from "./components/icons/IconPlans";
import IconProfessional from "./components/icons/IconProfessional";
import IconSeparador from "./components/icons/IconSeparador";

// URL base da API
const API_BASE_URL = "https://ampare-termos.onrender.com";

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);
  const sigRef = useRef(null);
  // Estado para controlar a tentativa de acordar o servidor (sem bloquear o uso do app)
  const [serverWakeupAttempted, setServerWakeupAttempted] = useState(false);

  // Efeito para enviar uma requisição "ping" para acordar o servidor na Render
  useEffect(() => {
    const wakeupRenderServer = async () => {
      if (serverWakeupAttempted) return; // Evitar múltiplas tentativas

      try {
        console.log("Tentando acordar o servidor na Render...");
        setServerWakeupAttempted(true);

        // Usando o método que não bloqueia o uso do aplicativo
        // e não depende de CORS para funcionar
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10s timeout

        // Fetch que não bloqueia o uso do app mesmo se falhar
        fetch(`${API_BASE_URL}/api/check-status`, {
          method: "GET",
          signal: abortController.signal,
          // Remover credentials para evitar problemas de CORS
          // credentials: 'include',
          // Modo 'no-cors' permite o request, mas não a resposta
          mode: "no-cors",
        })
          .then((response) => {
            console.log("Servidor acordado com sucesso!");
            clearTimeout(timeoutId);
          })
          .catch((err) => {
            // Falha silenciosa - não afeta o uso do app
            if (err.name !== "AbortError") {
              console.log(
                "Erro ao acordar o servidor, mas o app continuará funcionando:",
                err.message
              );
            } else {
              console.log(
                "Timeout ao acordar o servidor, mas o app continuará funcionando"
              );
            }
          });
      } catch (error) {
        // Falha silenciosa - não afeta o uso do app
        console.log("Erro ao tentar acordar o servidor:", error);
      }
    };

    // Tenta acordar o servidor na montagem do componente
    wakeupRenderServer();
  }, [serverWakeupAttempted]);

  // Dados dos steps
  const stepData = [
    {
      id: 1,
      label: "Pessoal",
      icon: <IconPersonal className="w-4 h-4 mr-1" />,
    },
    {
      id: 2,
      label: "Endereço",
      icon: <IconAddress className="w-4 h-4 mr-1" />,
    },
    {
      id: 3,
      label: "Profissional",
      icon: <IconProfessional className="w-4 h-4 mr-1" />,
    },
    {
      id: 4,
      label: "Planos",
      icon: <IconPlans className="w-4 h-4 mr-1" />,
    },
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
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    setDirection(-1); // Definir direção para trás
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Função para atualizar os planos selecionados
  const handlePlansChange = (plans) => {
    setFormData((prev) => ({ ...prev, selectedPlans: plans }));
  };

  // Função para lidar com o envio final do formulário com sistema de retry
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
      const sigDataUrl = sigRef.current.toDataURL("image/png");

      // Sistema de retry para caso o servidor tenha acordado mas ainda esteja "esquentando"
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      let responseData;

      while (attempts < maxAttempts && !success) {
        try {
          attempts++;

          // Se não for a primeira tentativa, mostra feedback
          if (attempts > 1) {
            console.log(`Tentativa ${attempts} de ${maxAttempts}...`);
          }

          // Tenta enviar os dados
          const resp = await fetch(`${API_BASE_URL}/generate-pdfs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Remover credentials para evitar problemas de CORS
            // credentials: 'include',
            body: JSON.stringify({
              formData,
              signatureData: sigDataUrl,
              contratos: selectedPlans.join(","),
            }),
          });

          if (!resp.ok) {
            const payload = await resp.json().catch(() => ({}));
            throw new Error(
              payload.message || `Erro no servidor (${resp.status})`
            );
          }

          // Processa a resposta do servidor
          responseData = await resp.json();
          success = true;
        } catch (error) {
          if (attempts >= maxAttempts) {
            throw error; // Re-lança o erro se esgotar as tentativas
          }

          // Espera um pouco antes de tentar novamente (backoff exponencial)
          const delay = 2000 * Math.pow(2, attempts - 1); // 2s, 4s, 8s...
          console.log(
            `Falha na tentativa ${attempts}. Tentando novamente em ${
              delay / 1000
            }s...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // Se temos PDFs no resultado, fazemos o download
      if (responseData?.pdfs) {
        // Para cada PDF retornado pelo servidor, cria um link para download
        Object.entries(responseData.pdfs).forEach(([filename, base64Data]) => {
          // Converte base64 para blob
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });

          // Cria um link para download e clica automaticamente
          const downloadLink = document.createElement("a");
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
      alert(
        "Erro ao processar sua solicitação: " +
          (err.message || "erro desconhecido")
      );
    } finally {
      setProcessing(false);
    }
  };

  // Variantes de animação
  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "tween", duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: {
        x: { type: "tween", duration: 0.4, ease: "easeIn" },
        opacity: { duration: 0.2 },
      },
    }),
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
          src="https://ampare.org.br/termos/bg.png"
          alt="AMPARE"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 md:ml-[50%] p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 mt-10">
            <h1 className="font-roboto font-bold text-[40px] leading-[100%] tracking-[0%] text-black mb-5">
              Adesão a benefícios
            </h1>

            {/* Menu de Steps */}
            {/* Menu de Steps */}
            <div className="mt-4 pb-2">
              <div className="flex items-center w-full">
                {stepData.map((item, index, arr) => {
                  const isActive = currentStep === item.id;
                  const isCompleted = currentStep > item.id;

                  return (
                    <div key={item.id} className="flex items-center">
                      {/* Bloco do step*/}
                      <div
                        className={`flex items-center justify-center rounded-full border
              ${
                isActive || isCompleted
                  ? "bg-[rgba(0,174,113,0.05)] border-[#00AE71] text-[#00AE71]"
                  : "bg-transparent border-gray-500 text-gray-500"
              }
              ${isCompleted && !isActive ? "opacity-50" : ""}
              
              /* Tamanhos responsivos */
              h-[28px] md:h-[40px] px-2 md:px-3 py-[1px]
            `}
                      >
                        <div className="flex items-center">
                          <div className="transform scale-70 md:scale-100">
                            {item.icon}
                          </div>
                          <span className="text-[0.42rem] md:text-sm font-medium ml-0.5 md:ml-1 whitespace-nowrap">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Seta entre os steps + espaço */}
                      {index < arr.length - 1 && (
                        <div className="flex-1 flex items-center justify-center min-w-[20px] md:min-w-[30px]">
                          <div
                            className={`transform scale-50 md:scale-100 ${
                              currentStep > item.id
                                ? "text-[rgba(0,174,113,0.6)]"
                                : "text-gray-400"
                            }`}
                          >
                            <IconSeparador />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Formulário */}
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
