import { useEffect, useState, useRef } from "react";
import Cleave from "cleave.js/react";
import CustomAlert from "../CustomAlert";
import IconData from "../icons/IconData";

// Funções de validação (agora apenas validam formato quando preenchido)
const validations = {
  // Validação de PIS (11 dígitos) - só valida se preenchido
  PIS: (value) => {
    if (!value || value.trim() === "") return true; // Válido se vazio

    // Remove caracteres não numéricos
    const pis = value.replace(/[^\d]/g, "");

    // Verifica se tem 11 dígitos
    if (pis.length !== 11) return false;

    // Algoritmo de validação do dígito verificador (simplificado)
    const multipliers = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      sum += parseInt(pis.charAt(i)) * multipliers[i];
    }

    const remainder = sum % 11;
    const expectedDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(pis.charAt(10)) === expectedDigit;
  },

  // Validação de data de admissão - só valida se preenchido
  ADMISSAO: (value) => {
    if (!value || value.trim() === "") return true; // Válido se vazio

    // Verifica formato DD/MM/AAAA
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (!dateRegex.test(value)) return false;

    const [_, day, month, year] = value.match(dateRegex);
    const date = new Date(year, month - 1, day);

    // Verifica se é uma data válida
    if (
      date.getDate() !== parseInt(day) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getFullYear() !== parseInt(year)
    ) {
      return false;
    }

    // Verifica se a data não é futura
    const today = new Date();
    if (date > today) return false;

    return true;
  },

  // Matrícula (apenas dígitos) - só valida se preenchido
  MATRICULA: (value) => {
    if (!value || value.trim() === "") return true; // Válido se vazio

    // Remove caracteres não numéricos e verifica se tem pelo menos 3 dígitos
    const matricula = value.replace(/[^\d]/g, "");
    return matricula.length >= 3;
  },
};

export default function StepProfessional({
  formData,
  handleChange,
  nextStep,
  prevStep,
}) {
  // Estado para controlar a exibição do alerta
  const [alert, setAlert] = useState(null);
  // Estado para controlar se o formulário foi validado
  const [formValidated, setFormValidated] = useState(false);
  // Estados para controlar erros de validação específicos
  const [validationErrors, setValidationErrors] = useState({});
  // Referência para o calendário
  const calendarRef = useRef(null);

  // Efeito para fechar o alerta automaticamente após 5 segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Função para lidar com alterações nos campos Cleave
  const handleCleaveChange = (e) => {
    const { name, rawValue, value } = e.target;

    // Cria um evento sintético para ser compatível com o handleChange original
    const syntheticEvent = {
      target: {
        name,
        value,
        rawValue,
      },
    };

    // Chama a função handleChange original
    handleChange(syntheticEvent);

    // Valida o campo se o formulário já foi validado
    if (formValidated && validations[name]) {
      const isValid = validations[name](value);
      setValidationErrors((prev) => ({
        ...prev,
        [name]: isValid ? null : true,
      }));
    }
  };

  // Função para campos que não usam Cleave
  const handleRegularChange = (e) => {
    const { name, value } = e.target;

    // Chama a função handleChange original
    handleChange(e);

    // Valida o campo se o formulário já foi validado
    if (formValidated && validations[name]) {
      const isValid = validations[name](value);
      setValidationErrors((prev) => ({
        ...prev,
        [name]: isValid ? null : true,
      }));
    }
  };

  // Função para abrir o calendário nativo
  const openCalendar = () => {
    if (calendarRef.current) {
      calendarRef.current.showPicker();
    }
  };

  // Função para converter data do formato ISO para DD/MM/AAAA
  const formatDateFromCalendar = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Manipulador para o calendário
  const handleCalendarChange = (e) => {
    const isoDate = e.target.value;
    const formattedDate = formatDateFromCalendar(isoDate);

    const event = {
      target: {
        name: "ADMISSAO",
        value: formattedDate,
      },
    };

    handleChange(event);

    // Valida o campo
    if (formValidated && validations.ADMISSAO) {
      const isValid = validations.ADMISSAO(formattedDate);
      setValidationErrors((prev) => ({
        ...prev,
        ADMISSAO: isValid ? null : true,
      }));
    }
  };

  const validateAndProceed = (e) => {
    e.preventDefault();
    setFormValidated(true);

    // Agora apenas verifica se os campos preenchidos são válidos (não se estão vazios)
    const fieldsToValidate = [
      "EMPRESA",
      "MATRICULA",
      "ORGAO",
      "CARGO",
      "PIS",
      "ADMISSAO",
    ];
    const errors = {};

    // Verifica apenas validação de formato para campos preenchidos
    fieldsToValidate.forEach((field) => {
      const value = formData[field];
      if (value && validations[field] && !validations[field](value)) {
        errors[field] = true;
      }
    });

    setValidationErrors(errors);

    // Se houver erros de formato, mostra alerta
    if (Object.keys(errors).length > 0) {
      // Mapeamento para nomes mais amigáveis
      const fieldNames = {
        EMPRESA: "Empresa",
        MATRICULA: "Matrícula",
        ORGAO: "Órgão",
        CARGO: "Cargo",
        PIS: "PIS",
        ADMISSAO: "Data de Admissão",
      };

      const message =
        "Por favor, corrija os erros de formato nos campos destacados";

      // Mostrar alerta personalizado
      setAlert({
        message,
        type: "warning",
      });
      return;
    }

    // Se não há erros de formato, prossegue
    nextStep();
  };

  // Função para verificar se um campo está inválido
  const isFieldInvalid = (fieldName) => {
    return validationErrors[fieldName];
  };

  const inputStyle =
    "h-[45px] rounded-[10px] border border-gray-300 px-[20px] w-full focus:outline-none focus:border-[#00AE71] text-black";

  return (
    <div className="space-y-4 relative">
      {/* Exibe o alerta personalizado quando necessário */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Texto informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>Informações Profissionais</strong>
          <br />
          Preencha apenas se for funcionário público ou se houver exigência
          legal específica para incluir esses dados no contrato.
        </p>
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Empresa</label>
        <input
          name="EMPRESA"
          type="text"
          value={formData.EMPRESA || ""}
          onChange={handleRegularChange}
          className={`${inputStyle} ${
            isFieldInvalid("EMPRESA") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="Nome da empresa"
        />
        {isFieldInvalid("EMPRESA") && (
          <p className="text-xs text-red-500 mt-1">Formato inválido</p>
        )}
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Matrícula</label>
        <Cleave
          name="MATRICULA"
          value={formData.MATRICULA || ""}
          onChange={handleCleaveChange}
          className={`${inputStyle} ${
            isFieldInvalid("MATRICULA") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="Número de matrícula"
          options={{
            numericOnly: true,
            blocks: [20],
          }}
        />
        {isFieldInvalid("MATRICULA") && (
          <p className="text-xs text-red-500 mt-1">
            Matrícula inválida. Use apenas números (mínimo 3 dígitos)
          </p>
        )}
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Órgão</label>
        <input
          name="ORGAO"
          type="text"
          value={formData.ORGAO || ""}
          onChange={handleRegularChange}
          className={`${inputStyle} ${
            isFieldInvalid("ORGAO") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="Nome do órgão"
        />
        {isFieldInvalid("ORGAO") && (
          <p className="text-xs text-red-500 mt-1">Formato inválido</p>
        )}
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Cargo</label>
        <input
          name="CARGO"
          type="text"
          value={formData.CARGO || ""}
          onChange={handleRegularChange}
          className={`${inputStyle} ${
            isFieldInvalid("CARGO") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="Cargo atual"
        />
        {isFieldInvalid("CARGO") && (
          <p className="text-xs text-red-500 mt-1">Formato inválido</p>
        )}
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">PIS</label>
        <Cleave
          name="PIS"
          value={formData.PIS || ""}
          onChange={handleCleaveChange}
          className={`${inputStyle} ${
            isFieldInvalid("PIS") ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="000.00000.00-0"
          options={{
            delimiters: [".", ".", "-"],
            blocks: [3, 5, 2, 1],
            numericOnly: true,
          }}
        />
        {isFieldInvalid("PIS") && (
          <p className="text-xs text-red-500 mt-1">PIS inválido</p>
        )}
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Data de Admissão</label>
        <div className="relative">
          <Cleave
            name="ADMISSAO"
            value={formData.ADMISSAO || ""}
            onChange={handleCleaveChange}
            className={`${inputStyle} pr-10 ${
              isFieldInvalid("ADMISSAO") ? "border-red-500 bg-red-50" : ""
            }`}
            placeholder="DD/MM/AAAA"
            options={{
              date: true,
              datePattern: ["d", "m", "Y"],
            }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer border-none bg-transparent p-0 m-0 flex items-center justify-center"
            onClick={openCalendar}
          >
            <IconData className="w-5 h-5" />
          </button>

          {/* Calendário escondido */}
          <input
            ref={calendarRef}
            type="date"
            className="opacity-0 absolute w-0 h-0"
            onChange={handleCalendarChange}
            max={new Date().toISOString().split("T")[0]} // Limita até hoje
          />
        </div>
        {isFieldInvalid("ADMISSAO") && (
          <p className="text-xs text-red-500 mt-1">
            Data de admissão inválida ou futura
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-transparent border border-[#00AE71] hover:bg-gray-100 text-[#00AE71] rounded-[10px] px-6 py-2 font-semibold"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={validateAndProceed}
          className="bg-[#00AE71] hover:bg-green-700 text-white rounded-[10px] px-6 py-2 font-semibold"
        >
          Avançar
        </button>
      </div>
    </div>
  );
}
