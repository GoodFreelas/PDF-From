export default function StepProfessional({ formData, handleChange, nextStep, prevStep }) {
  const inputStyle =
    'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[550px] focus:outline-none focus:border-[#00AE71] text-gray-500';

  const validateAndProceed = (e) => {
    e.preventDefault();

    const requiredFields = ['EMPRESA', 'MATRICULA', 'ORGAO', 'CARGO', 'PIS', 'ADMISSAO'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`);
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-4">

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Empresa</label>
        <input
          name="EMPRESA"
          type="text"
          required
          value={formData.EMPRESA || ''}
          onChange={handleChange}
          className={inputStyle}
          placeholder="Nome da empresa"
        />
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Matrícula</label>
        <input
          name="MATRICULA"
          type="text"
          required
          value={formData.MATRICULA || ''}
          onChange={handleChange}
          className={inputStyle}
          placeholder="Número de matrícula"
        />
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Órgão</label>
        <input
          name="ORGAO"
          type="text"
          required
          value={formData.ORGAO || ''}
          onChange={handleChange}
          className={inputStyle}
          placeholder="Nome do órgão"
        />
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Cargo</label>
        <input
          name="CARGO"
          type="text"
          required
          value={formData.CARGO || ''}
          onChange={handleChange}
          className={inputStyle}
          placeholder="Cargo atual"
        />
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">PIS</label>
        <input
          name="PIS"
          type="text"
          required
          value={formData.PIS || ''}
          onChange={handleChange}
          className={inputStyle}
          placeholder="000.00000.00-0"
        />
      </div>

      <div className="text-gray-500 focus-within:text-black">
        <label className="block text-sm mb-1">Data de Admissão</label>
        <input
          name="ADMISSAO"
          type="text"
          required
          value={formData.ADMISSAO || ''}
          onChange={handleChange}
          className={inputStyle}
          placeholder="DD/MM/AAAA"
        />
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
