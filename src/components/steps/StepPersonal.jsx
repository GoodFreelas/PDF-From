import { useEffect } from 'react';

// Função para obter a data atual formatada
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function StepPersonal({ formData, handleChange, nextStep }) {
  // Atualizar automaticamente o campo DATA quando o componente for montado
  useEffect(() => {
    // Cria um evento simulado para atualizar o formData
    const dateEvent = {
      target: {
        name: 'DATA',
        value: getCurrentDate()
      }
    };
    
    // Chama handleChange apenas se DATA ainda não estiver definida
    if (!formData.DATA) {
      handleChange(dateEvent);
    }
  }, []);

  // Função para validar o formulário antes de prosseguir
  const validateAndProceed = (e) => {
    e.preventDefault();
    
    // Lista de campos obrigatórios
    const requiredFields = ['NOME', 'RG', 'CPF', 'NASCIMENTO', 'EMAIL', 'TELEFONE1'];
    
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
      <h2 className="text-xl font-semibold mb-4">Dados Pessoais</h2>
      
      <div>
        <label className="block text-sm mb-1">Nome Completo</label>
        <input
          name="NOME"
          type="text"
          required
          value={formData.NOME || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Digite seu nome completo"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">RG</label>
          <input
            name="RG"
            type="text"
            required
            value={formData.RG || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Digite seu RG"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">CPF</label>
          <input
            name="CPF"
            type="text"
            required
            value={formData.CPF || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="000.000.000-00"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm mb-1">Data de Nascimento</label>
        <input
          name="NASCIMENTO"
          type="text"
          required
          value={formData.NASCIMENTO || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="DD/MM/AAAA"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          name="EMAIL"
          type="email"
          required
          value={formData.EMAIL || ''}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="exemplo@email.com"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Telefone 1</label>
          <input
            name="TELEFONE1"
            type="tel"
            required
            value={formData.TELEFONE1 || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="(00) 00000-0000"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Telefone 2</label>
          <input
            name="TELEFONE2"
            type="tel"
            value={formData.TELEFONE2 || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
      
      <div className="mt-6">
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