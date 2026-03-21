import { useState, useRef } from "react";
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
  "VALOR_EXTENSO",
  "DATA_DIA",
  "DATA_MES"
];

const inputStyle =
  "h-[45px] rounded-[10px] border border-gray-300 px-[20px] w-full focus:outline-none focus:border-[#00AE71] text-black";

export default function StepBanco({
  formData,
  handleChange,
  handleSubmit,
  sigRef,
  processing,
}) {
  const [alert, setAlert] = useState(null);
  const [formValidated, setFormValidated] = useState(false);

  const handleCleaveChange = (e) => {
    const { name, rawValue, value } = e.target;
    handleChange({ target: { name, value, rawValue } });
  };

  const handleRegularChange = (e) => {
    handleChange(e);
  };

  const isFieldInvalid = (fieldName) => {
    if (!formValidated) return false;
    return !formData[fieldName] || formData[fieldName].toString().trim() === "";
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setFormValidated(true);

    let hasErrors = false;

    // Validate Required
    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        hasErrors = true;
      }
    });

    if (sigRef.current?.isEmpty()) {
      hasErrors = true;
    }

    if (hasErrors) {
      setAlert({
        message: "Por favor, preencha todos os campos e assine.",
        type: "warning",
      });
      return;
    }

    handleSubmit(e);
  };

  return (
    <div className="space-y-6 relative">
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* CPF de Identificação */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">
          CPF do Associado
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
      </div>

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
      </div>

      {/* CNPJ Opcional */}
      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">CNPJ (Opcional)</label>
        <Cleave
          name="CNPJ"
          value={formData.CNPJ || ""}
          onChange={handleCleaveChange}
          className={`${inputStyle}`}
          placeholder="00.000.000/0000-00"
          options={{
            delimiters: [".", ".", "/", "-"],
            blocks: [2, 3, 3, 4, 2],
            numericOnly: true,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Agência */}
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Agência Nº / Dígito</label>
          <input
            name="AGENCIA"
            type="text"
            required
            value={formData.AGENCIA || ""}
            onChange={handleRegularChange}
            className={`${inputStyle} ${
              isFieldInvalid("AGENCIA") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="Ex: 1234-5"
          />
        </div>

        {/* Conta */}
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Conta Corrente Nº / Dígito</label>
          <input
            name="CONTA"
            type="text"
            required
            value={formData.CONTA || ""}
            onChange={handleRegularChange}
            className={`${inputStyle} ${
              isFieldInvalid("CONTA") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="Ex: 12345-6"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Valor Numérico */}
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
        </div>

        {/* Valor por Extenso */}
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Valor por Extenso</label>
          <input
            name="VALOR_EXTENSO"
            type="text"
            required
            value={formData.VALOR_EXTENSO || ""}
            onChange={handleRegularChange}
            className={`${inputStyle} ${
              isFieldInvalid("VALOR_EXTENSO") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="Trinta reais..."
          />
        </div>
      </div>

      {/* Data */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Data (Dia)</label>
          <input
            name="DATA_DIA"
            type="text"
            required
            value={formData.DATA_DIA || ""}
            onChange={handleRegularChange}
            className={`${inputStyle} ${
              isFieldInvalid("DATA_DIA") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="Ex: 20"
            maxLength={2}
          />
        </div>

        <div className="text-gray-500 focus-within:text-black">
          <label className="block text-sm mb-1">Data (Mês por extenso)</label>
          <input
            name="DATA_MES"
            type="text"
            required
            value={formData.DATA_MES || ""}
            onChange={handleRegularChange}
            className={`${inputStyle} ${
              isFieldInvalid("DATA_MES") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="Ex: Março"
          />
        </div>
      </div>

      <div className="pt-4 mt-4">
        <label className="block text-sm mb-1">Assinatura</label>
        <p className="text-gray-500 text-sm mb-2">
          Escreva a sua assinatura abaixo com o mouse ou dedo
        </p>

        <div
          className={`relative bg-white border rounded-[10px] p-[20px] ${
            sigRef.current?.isEmpty() && formValidated
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
        >
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{ className: "w-full h-[150px] bg-white rounded-md" }}
          />

          <button
            type="button"
            onClick={() => sigRef.current?.clear()}
            className="absolute top-2 right-2 text-sm text-gray-600 hover:text-black"
          >
            Limpar
          </button>
        </div>
        {sigRef.current?.isEmpty() && formValidated && (
          <p className="text-xs text-red-500 mt-1">
            Por favor, adicione sua assinatura
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          onClick={validateAndSubmit}
          disabled={processing}
          className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-6 py-2 font-semibold flex items-center justify-center disabled:opacity-60"
        >
          {processing ? "Processando..." : "Gerar Autorização"}
        </button>
      </div>
    </div>
  );
}
