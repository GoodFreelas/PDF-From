import { useState, useRef, useEffect } from "react";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.br";
import SignatureCanvas from "../SignatureCanvas";
import CustomAlert from "../CustomAlert";

const REQUIRED_FIELDS = [
  "CPF",
  "NOME",
  "AGENCIA",
  "CONTA",
  "VALOR",
  "DATA"
];

const inputStyle =
  "h-[45px] rounded-[10px] border border-gray-300 px-[20px] w-full focus:outline-none focus:border-[#00AE71] text-black";

// Funções de validação
const validations = {
  // Validação de CPF
  CPF: (value) => {
    const cpf = value.replace(/[^\d]/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  },

  // Validação de CNPJ
  CNPJ: (value) => {
    if (!value) return true; // Opcional no preenchimento mas validado se existir
    const cnpj = value.replace(/[^\d]/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    let digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += numbers.charAt(size - i) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    return true;
  },

  // Validação de Nome (sem números)
  NOME: (value) => {
    if (!value || value.trim() === "") return false;
    return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'.,-]+$/.test(value);
  },

  // Validação de Email
  EMAIL: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Validação de Agência (0000-0)
  AGENCIA: (value) => {
    const raw = value.replace(/[^\d]/g, "");
    return raw.length >= 4;
  },

  // Validação de Conta
  CONTA: (value) => {
    const raw = value.replace(/[^\d]/g, "");
    return raw.length >= 5;
  },

  // Validação de valor monetário
  VALOR: (value) => {
    if (!value) return false;
    const cleanValue = value.replace(/R\$\s?/g, "");
    if (!cleanValue.trim()) return false;
    return /\d/.test(cleanValue);
  },
};

export default function StepBanco({
  step,
  formData,
  handleChange,
  nextStep,
  prevStep,
  handleSubmit,
  sigRef,
  processing,
}) {
  const [validationErrors, setValidationErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [formValidated, setFormValidated] = useState(false);

  // Efeito para fechar o alerta automaticamente após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Set default date to today
  useEffect(() => {
    if (!formData.DATA) {
      const today = new Date().toISOString().split('T')[0];
      handleChange({ target: { name: 'DATA', value: today } });
    }
  }, []);

  const handleCleaveChange = (e) => {
    const { name, rawValue, value } = e.target;
    handleChange({ target: { name, value, rawValue } });
    
    if (formValidated && validations[name]) {
      const isValid = validations[name](value);
      setValidationErrors(prev => ({ ...prev, [name]: isValid ? null : true }));
    }
  };

  const handleRegularChange = (e) => {
    let { name, value } = e.target;
    
    // Proibir números no nome em tempo real
    if (name === "NOME") {
      value = value.replace(/[0-9]/g, "");
    }

    handleChange({ target: { name, value } });
    
    if (formValidated && validations[name]) {
      const isValid = validations[name](value);
      setValidationErrors(prev => ({ ...prev, [name]: isValid ? null : true }));
    }
  };

  const isFieldInvalid = (fieldName) => {
    return validationErrors[fieldName];
  };

  const validateAndProceed = (e) => {
    e.preventDefault();
    setFormValidated(true);

    const step1Fields = ["AGENCIA", "CONTA", "VALOR"];
    const step2Fields = ["CPF", "NOME", "EMAIL"];

    const currentFields = step === 1 ? step1Fields : step2Fields;
    let hasErrors = false;
    const newErrors = { ...validationErrors };

    currentFields.forEach((field) => {
      const isValid = validations[field] ? validations[field](formData[field] || "") : !!formData[field];
      if (!isValid) {
        hasErrors = true;
        newErrors[field] = true;
      } else {
        newErrors[field] = null;
      }
    });

    // CNPJ é opcional no preenchimento, mas validado se existir
    if (step === 2 && formData.CNPJ) {
      if (!validations.CNPJ(formData.CNPJ)) {
        hasErrors = true;
        newErrors.CNPJ = true;
      }
    }

    if (step === 2 && sigRef.current?.isEmpty()) {
      hasErrors = true;
    }

    setValidationErrors(newErrors);

    if (hasErrors) {
      setAlert({
        message: "Por favor, preencha corretamente todos os campos obrigatórios.",
        type: "warning",
      });
      return;
    }

    if (step === 1) {
      setFormValidated(false); 
      setValidationErrors({});
      nextStep();
    } else {
      handleSubmit(e);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6 relative">
        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Agência */}
          <div className="text-gray-500 focus-within:text-black">
            <label className="block text-sm mb-1">Agência Nº / Dígito</label>
            <Cleave
              name="AGENCIA"
              required
              value={formData.AGENCIA || ""}
              onChange={handleCleaveChange}
              className={`${inputStyle} ${
                isFieldInvalid("AGENCIA") ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="Ex: 1234-5"
              options={{
                delimiters: ["-"],
                blocks: [4, 1],
                numericOnly: true,
              }}
            />
            {isFieldInvalid("AGENCIA") && <p className="text-[10px] text-red-500 mt-1">Agência inválida</p>}
          </div>

          {/* Conta */}
          <div className="text-gray-500 focus-within:text-black">
            <label className="block text-sm mb-1">Conta Corrente Nº / Dígito</label>
            <Cleave
              name="CONTA"
              required
              value={formData.CONTA || ""}
              onChange={handleCleaveChange}
              className={`${inputStyle} ${
                isFieldInvalid("CONTA") ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="Ex: 00098765-4"
              options={{
                delimiters: ["-"],
                blocks: [10, 1],
                numericOnly: true,
              }}
            />
            {isFieldInvalid("CONTA") && <p className="text-[10px] text-red-500 mt-1">Conta inválida</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="text-gray-500 focus-within:text-black">
            <label className="block text-sm mb-1">Valor (R$)</label>
            <Cleave
              name="VALOR"
              required
              value={formData.VALOR || ""}
              onChange={handleCleaveChange}
              className={`${inputStyle} ${
                isFieldInvalid("VALOR") ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="R$ 0,00"
              options={{
                numeral: true,
                numeralThousandsGroupStyle: "thousand",
                prefix: "R$ ",
                rawValueTrimPrefix: true,
                numeralDecimalMark: ",",
                delimiter: ".",
              }}
            />
            {isFieldInvalid("VALOR") && <p className="text-[10px] text-red-500 mt-1">Informe o valor</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={validateAndProceed}
            className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-8 h-[55px] font-semibold flex items-center justify-center min-w-[200px]"
          >
            Próxima Etapa
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: DADOS PESSOAIS + ASSINATURA
  return (
    <div className="space-y-6 relative">
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Nome Completo */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Nome Completo do Associado</label>
        <input
          name="NOME"
          type="text"
          required
          value={formData.NOME || ""}
          onChange={handleRegularChange}
          className={`${inputStyle} ${
            isFieldInvalid("NOME") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="Nome completo"
        />
        {isFieldInvalid("NOME") && <p className="text-[10px] text-red-500 mt-1">Nome inválido (use apenas letras)</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* CPF de Identificação */}
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">
            CPF
          </label>
          <Cleave
            name="CPF"
            required
            value={formData.CPF || ""}
            onChange={handleCleaveChange}
            className={`${inputStyle} ${
              isFieldInvalid("CPF") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="000.000.000-00"
            options={{
              delimiters: [".", ".", "-"],
              blocks: [3, 3, 3, 2],
              numericOnly: true,
            }}
          />
          {isFieldInvalid("CPF") && <p className="text-[10px] text-red-500 mt-1">CPF inválido</p>}
        </div>

        {/* CNPJ */}
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">CNPJ</label>
          <Cleave
            name="CNPJ"
            value={formData.CNPJ || ""}
            onChange={handleCleaveChange}
            className={`${inputStyle} ${
              isFieldInvalid("CNPJ") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="00.000.000/0000-00"
            options={{
              delimiters: [".", ".", "/", "-"],
              blocks: [2, 3, 3, 4, 2],
              numericOnly: true,
            }}
          />
          {isFieldInvalid("CNPJ") && <p className="text-[10px] text-red-500 mt-1">CNPJ inválido</p>}
        </div>
      </div>

      {/* Email */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Email</label>
        <input
          name="EMAIL"
          type="email"
          required
          value={formData.EMAIL || ""}
          onChange={handleRegularChange}
          className={`${inputStyle} ${
            isFieldInvalid("EMAIL") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="exemplo@email.com"
        />
        {isFieldInvalid("EMAIL") && <p className="text-[10px] text-red-500 mt-1">Email inválido</p>}
      </div>

      <div className="pt-4 mt-4">
        <label className="block text-sm mb-1 font-bold text-black">Assinatura</label>
        <p className="text-gray-500 text-sm mb-2">
          Desenhe sua assinatura abaixo
        </p>

        <div
          className={`relative bg-transparent border rounded-[10px] p-[10px] ${
            sigRef.current?.isEmpty() && formValidated
              ? "border-red-500 bg-red-50"
              : "border-gray-200"
          }`}
        >
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{ className: "w-full h-[150px] bg-white rounded-md cursor-crosshair" }}
          />

          <button
            type="button"
            onClick={() => sigRef.current?.clear()}
            className="absolute top-2 right-2 text-xs text-gray-400 hover:text-black uppercase tracking-wider font-bold"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="text-gray-400 hover:text-black font-semibold transition-colors"
        >
          Voltar
        </button>
        <button
          type="submit"
          onClick={validateAndProceed}
          disabled={processing}
          className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-8 h-[55px] font-semibold flex items-center justify-center disabled:opacity-60 min-w-[200px] transition-all"
        >
          {processing ? "Processando..." : "Enviar Autenticação"}
        </button>
      </div>
    </div>
  );
}
