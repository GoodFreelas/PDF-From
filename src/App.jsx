// ================================
// Imports
// ================================
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Componentes internos
import StepPersonal from "./components/steps/StepPersonal";
import StepAddress from "./components/steps/StepAddress";
import StepProfessional from "./components/steps/StepProfessional";
import StepPlans from "./components/steps/StepPlans";
import SuccessMessage from "./components/SuccessMessage";

// Ícones
import IconAddress from "./components/icons/IconAddress";
import IconPersonal from "./components/icons/IconPersonal";
import IconPlans from "./components/icons/IconPlans";
import IconProfessional from "./components/icons/IconProfessional";
import IconSeparador from "./components/icons/IconSeparador";

// Hooks personalizados
import { useServerWakeup } from "./hooks/useServerWakeup";
import { useFormSubmission } from "./hooks/useFormSubmission";

// ================================
// Constantes e Configurações
// ================================

/**
 * Componente principal da aplicação de adesão a benefícios
 * Gerencia o fluxo multi-step do formulário de adesão
 * @returns {JSX.Element} - Componente App
 */
export default function App() {
  // ================================
  // Estados e Hooks
  // ================================
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [direction, setDirection] = useState(1);
  const sigRef = useRef(null);

  // Hooks personalizados
  const { serverWakeupAttempted } = useServerWakeup();
  const { processing, done, submitForm } = useFormSubmission();

  // ================================
  // Dados dos Steps
  // ================================
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

  // ================================
  // Funções Auxiliares
  // ================================

  /**
   * Atualiza os dados do formulário
   * @param {Event} e - Evento de mudança do input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Atualiza os dependentes no formulário
   * @param {Array} dependents - Array de dependentes
   */
  const handleDependentsChange = (dependents) => {
    setFormData((prev) => ({ ...prev, dependents }));
  };

  /**
   * Atualiza os planos selecionados
   * @param {Array} plans - Array de planos selecionados
   */
  const handlePlansChange = (plans) => {
    setFormData((prev) => ({ ...prev, selectedPlans: plans }));
  };

  /**
   * Avança para a próxima etapa
   */
  const nextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  /**
   * Volta para a etapa anterior
   */
  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /**
   * Lida com o envio final do formulário
   * @param {Event} e - Evento de submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Submete o formulário usando o hook
      await submitForm(formData, sigDataUrl, selectedPlans);
    } catch (err) {
      console.error("Erro no processamento do formulário:", err);
      alert(
        "Erro ao processar sua solicitação: " +
          (err.message || "erro desconhecido")
      );
    }
  };

  // ================================
  // Variantes de Animação
  // ================================
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

  // ================================
  // Early Returns
  // ================================
  // Se o processo estiver concluído, exibe a mensagem de sucesso
  if (done) {
    return <SuccessMessage email={formData.EMAIL} />;
  }

  // ================================
  // JSX Return
  // ================================
  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-1/2 bg-[#00AE71] z-10">
        <img
          src="./bg.png"
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
