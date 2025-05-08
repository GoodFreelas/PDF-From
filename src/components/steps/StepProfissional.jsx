export default function StepProfessional({ formData, handleChange, nextStep, prevStep }) {
  // Função para validar o formulário antes de prosseguir
  const validateAndProceed = (e) => {
    e.preventDefault();
    
    // Lista de campos obrigatórios
    const requiredFields = ['EMPRESA', 'MATRICULA', 'ORGAO', 'CARGO', 'PIS', 'ADMISSAO'];
    
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
      <h2 className="text-xl font-semibold mb-4">Dados Profissionais</h2>
      
      <div>
        <label className="block text-sm mb-1">Empresa</label>
        <input
          name="EMPRESA"
          type="text"
          required
          value={formData.EMPRESA || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Nome da empresa"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Matrícula</label>
        <input
          name="MATRICULA"
          type="text"
          required
          value={formData.MATRICULA || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Número de matrícula"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Órgão</label>
        <input
          name="ORGAO"
          type="text"
          required
          value={formData.ORGAO || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Nome do órgão"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Cargo</label>
        <input
          name="CARGO"
          type="text"
          required
          value={formData.CARGO || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Cargo atual"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">PIS</label>
        <input
          name="PIS"
          type="text"
          required
          value={formData.PIS || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="000.00000.00-0"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Data de Admissão</label>
        <input
          name="ADMISSAO"
          type="text"
          required
          value={formData.ADMISSAO || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="DD/MM/AAAA"
        />
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