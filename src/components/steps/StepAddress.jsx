export default function StepAddress({ formData, handleChange, nextStep, prevStep }) {
  // Lista de estados brasileiros
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Função para validar o formulário antes de prosseguir
  const validateAndProceed = (e) => {
    e.preventDefault();
    
    // Lista de campos obrigatórios
    const requiredFields = ['CEP', 'RUA', 'NUMERO', 'BAIRRO', 'CIDADE', 'ESTADO'];
    
    // Verifica se todos os campos obrigatórios estão preenchidos
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`);
      return;
    }
    
    // Se tudo estiver preenchido, avança para a próxima etapa
    nextStep();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Endereço</h2>
      
      <div>
        <label className="block text-sm mb-1">CEP</label>
        <input
          name="CEP"
          type="text"
          required
          value={formData.CEP || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="00000-000"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm mb-1">Rua</label>
          <input
            name="RUA"
            type="text"
            required
            value={formData.RUA || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Nome da rua"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Número</label>
          <input
            name="NUMERO"
            type="text"
            required
            value={formData.NUMERO || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="123"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm mb-1">Complemento</label>
        <input
          name="COMPLEMENTO"
          type="text"
          value={formData.COMPLEMENTO || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Apto, Bloco, etc."
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Bairro</label>
        <input
          name="BAIRRO"
          type="text"
          required
          value={formData.BAIRRO || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Nome do bairro"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Cidade</label>
          <input
            name="CIDADE"
            type="text"
            required
            value={formData.CIDADE || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Nome da cidade"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Estado</label>
          <select
            name="ESTADO"
            required
            value={formData.ESTADO || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">Selecione...</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 rounded py-2"
        >
          Voltar
        </button>
        
        <button
          type="button"
          onClick={validateAndProceed}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}