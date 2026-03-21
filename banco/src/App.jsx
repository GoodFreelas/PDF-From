import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Componentes internos
import StepBanco from "./components/steps/StepBanco";
import SuccessMessage from "./components/SuccessMessage";

// Ícones
import IconPersonal from "./components/icons/IconPersonal";

// Hooks personalizados
import { useServerWakeup } from "./hooks/useServerWakeup";
import { useFormSubmission } from "./hooks/useFormSubmission";

export default function App() {
  const [formData, setFormData] = useState({});
  const sigRef = useRef(null);

  // Hooks personalizados
  const { serverWakeupAttempted } = useServerWakeup();
  const { processing, done, submitForm } = useFormSubmission();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      <div className="w-full md:w-1/2 md:ml-[50%] p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 mt-10">
            <h1 className="font-roboto font-bold text-[40px] leading-[100%] tracking-[0%] text-black mb-5">
              Autorização de Débito
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key="step-banco"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <StepBanco
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  sigRef={sigRef}
                  processing={processing}
                />
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
