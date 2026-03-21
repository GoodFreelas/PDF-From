import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Componentes internos
import StepBanco from "./components/steps/StepBanco";
import SuccessMessage from "./components/SuccessMessage";

// Ícones
import IconPersonal from "./components/icons/IconPersonal";
import IconData from "./components/icons/IconData";
import IconSeparador from "./components/icons/IconSeparador";

// Hooks personalizados
import { useServerWakeup } from "./hooks/useServerWakeup";
import { useFormSubmission } from "./hooks/useFormSubmission";

export default function App() {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const sigRef = useRef(null);

  // Hooks personalizados
  const { serverWakeupAttempted } = useServerWakeup();
  const { processing, done, submitForm } = useFormSubmission();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(2);
  const prevStep = () => setCurrentStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!sigRef.current) {
        throw new Error("Campo de assinatura não disponível");
      }

      const sigDataUrl = sigRef.current.toDataURL("image/png");

      // Submit only with 'banco' contract
      await submitForm(formData, sigDataUrl, ['banco']);
    } catch (err) {
      console.error("Erro no processamento do formulário:", err);
      alert(
        "Erro ao processar sua solicitação: " +
          (err.message || "erro desconhecido")
      );
    }
  };

  if (done) {
    return <SuccessMessage email={formData.EMAIL} />;
  }

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
      <div className="w-full md:w-1/2 md:ml-[50%] p-6 min-h-screen flex flex-col pt-16">
        <div className="max-w-xl w-full mx-auto px-4 md:px-0">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-roboto font-bold text-[40px] leading-[100%] tracking-[0%] text-black mb-4">
              Autorização de Débito
            </h1>
          </div>

          {/* Stepper (Breadcrumbs) - Pill Style */}
          <div className="flex items-center space-x-3 text-sm mb-12 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
            {/* Step 1 */}
            <div className={`flex items-center px-4 py-2 rounded-full border transition-all duration-300 space-x-2 ${
              currentStep === 1 
                ? 'bg-[#E6F7F1] border-[#00AE71] text-[#00AE71]' 
                : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
            }`}>
               <IconPersonal className={`w-4 h-4 ${currentStep === 1 ? 'text-[#00AE71]' : 'text-[#9CA3AF]'}`} />
               <span className="font-roboto font-medium text-[14px]">Bancários</span>
            </div>
            
            <IconSeparador className="w-2 h-2 text-[#9CA3AF] flex-shrink-0" />
            
            {/* Step 2 */}
            <div className={`flex items-center px-4 py-2 rounded-full border transition-all duration-300 space-x-2 ${
              currentStep === 2 
                ? 'bg-[#E6F7F1] border-[#00AE71] text-[#00AE71]' 
                : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
            }`}>
               <IconData className={`w-4 h-4 ${currentStep === 2 ? 'text-[#00AE71]' : 'text-[#9CA3AF]'}`} />
               <span className="font-roboto font-medium text-[14px]">Pessoais</span>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={currentStep === 1 ? "step1" : "step2"}
                initial={{ x: currentStep === 1 ? -10 : 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: currentStep === 1 ? 10 : -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <StepBanco
                  step={currentStep}
                  formData={formData}
                  handleChange={handleChange}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  handleSubmit={handleSubmit}
                  sigRef={sigRef}
                  processing={processing}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
