import { useEffect } from 'react';
import IconData from '../icons/IconData'

// Função para obter a data atual formatada
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function StepPersonal({ formData, handleChange, nextStep }) {
  useEffect(() => {
    const dateEvent = {
      target: {
        name: 'DATA',
        value: getCurrentDate(),
      },
    };

    if (!formData.DATA) {
      handleChange(dateEvent);
    }
  }, []);

  const validateAndProceed = (e) => {
    e.preventDefault();

    const requiredFields = ['NOME', 'RG', 'CPF', 'NASCIMENTO', 'EMAIL', 'TELEFONE1'];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`);
      return;
    }

    nextStep();
  };

  const inputStyle =
    'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[100%] focus:outline-none focus:border-[#00AE71] text-black';

  return (
    <div className="space-y-4">
  {/* Nome */}
  <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">Nome Completo</label>
    <input
      name="NOME"
      type="text"
      required
      value={formData.NOME || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="Digite seu nome completo"
    />
  </div>

  {/* RG */}
  <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">RG</label>
    <input
      name="RG"
      type="text"
      required
      value={formData.RG || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="Digite seu RG"
    />
  </div>

  {/* CPF */}
  <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">CPF</label>
    <input
      name="CPF"
      type="text"
      required
      value={formData.CPF || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="000.000.000-00"
    />
  </div>

  {/* Nascimento */}
  <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
  <label className="block text-sm mb-1">Data de Nascimento</label>
  <div className="relative">
    <input
      name="NASCIMENTO"
      type="text"
      required
      value={formData.NASCIMENTO || ''}
      onChange={handleChange}
      className={`${inputStyle} pr-10`}
      placeholder="DD/MM/AAAA"
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <IconData className="w-5 h-5" />
    </div>
  </div>
</div>

  {/* Email */}
  <div className="w-full max-w-[100%] text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">Email</label>
    <input
      name="EMAIL"
      type="email"
      required
      value={formData.EMAIL || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="exemplo@email.com"
    />
  </div>

  {/* Telefones */}
  <div className="grid grid-cols-2 gap-4">
    <div className="text-gray-500 focus-within:text-black">
      <label className="block text-sm mb-1">Telefone 1</label>
      <input
        name="TELEFONE1"
        type="tel"
        required
        value={formData.TELEFONE1 || ''}
        onChange={handleChange}
        className={inputStyle}
        placeholder="(00) 00000-0000"
      />
    </div>

    <div className="text-gray-500 focus-within:text-black">
      <label className="block text-sm mb-1">Telefone 2</label>
      <input
        name="TELEFONE2"
        type="tel"
        value={formData.TELEFONE2 || ''}
        onChange={handleChange}
        className={inputStyle}
        placeholder="(00) 00000-0000"
      />
    </div>
  </div>

  {/* Botão */}
  <div className="mt-6 flex justify-end">
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
