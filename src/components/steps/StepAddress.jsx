export default function StepAddress({ formData, handleChange, nextStep, prevStep }) {
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  const inputStyle =
    'h-[55px] rounded-[10px] border border-gray-300 px-[20px] w-full max-w-[550px] focus:outline-none focus:border-[#00AE71] text-black';

  const validateAndProceed = (e) => {
    e.preventDefault();
    const requiredFields = ['CEP', 'RUA', 'NUMERO', 'BAIRRO', 'CIDADE', 'ESTADO'];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`);
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-4">
  {/* CEP */}
  <div className="text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">CEP</label>
    <input
      name="CEP"
      type="text"
      required
      value={formData.CEP || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="00000-000"
    />
  </div>

  {/* Rua e Número */}
  <div className="grid grid-cols-3 gap-4">
    <div className="col-span-2 text-gray-500 focus-within:text-black">
      <label className="block text-sm mb-1">Rua</label>
      <input
        name="RUA"
        type="text"
        required
        value={formData.RUA || ''}
        onChange={handleChange}
        className={inputStyle}
        placeholder="Nome da rua"
      />
    </div>
    <div className="text-gray-500 focus-within:text-black">
      <label className="block text-sm mb-1">Número</label>
      <input
        name="NUMERO"
        type="text"
        required
        value={formData.NUMERO || ''}
        onChange={handleChange}
        className={inputStyle}
        placeholder="123"
      />
    </div>
  </div>

  {/* Complemento */}
  <div className="text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">Complemento</label>
    <input
      name="COMPLEMENTO"
      type="text"
      value={formData.COMPLEMENTO || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="Apto, Bloco, etc."
    />
  </div>

  {/* Bairro */}
  <div className="text-gray-500 focus-within:text-black">
    <label className="block text-sm mb-1">Bairro</label>
    <input
      name="BAIRRO"
      type="text"
      required
      value={formData.BAIRRO || ''}
      onChange={handleChange}
      className={inputStyle}
      placeholder="Nome do bairro"
    />
  </div>

  {/* Cidade e Estado */}
  <div className="grid grid-cols-2 gap-4">
    <div className="text-gray-500 focus-within:text-black">
      <label className="block text-sm mb-1">Cidade</label>
      <input
        name="CIDADE"
        type="text"
        required
        value={formData.CIDADE || ''}
        onChange={handleChange}
        className={inputStyle}
        placeholder="Nome da cidade"
      />
    </div>

    <div className="text-gray-500 focus-within:text-black">
      <label className="block text-sm mb-1">Estado</label>
      <select
        name="ESTADO"
        required
        value={formData.ESTADO || ''}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="">Selecione...</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Botões */}
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
