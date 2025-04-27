import { useEffect } from 'react';

// Função para obter a data atual formatada
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function PersonalInfoForm({ formData, handleChange }) {
  // Atualizar automaticamente o campo DATA quando o componente for montado
  useEffect(() => {
    // Cria um evento simulado para atualizar o formData
    const dateEvent = {
      target: {
        name: 'DATA',
        value: getCurrentDate()
      }
    };
    
    // Chama handleChange para incluir a data atual no formData
    handleChange(dateEvent);
  }, []); // Executa apenas uma vez na montagem do componente

  return (
    <>
      <div>
        <label className="block text-sm mb-0.5">NOME</label>
        <input
          name="NOME"
          type="text"
          required
          value={formData.NOME || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="Nome completo"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">DATA DE NASCIMENTO</label>
        <input
          name="NASCIMENTO"
          type="text"
          required
          value={formData.NASCIMENTO || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="DD/MM/AAAA"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">CPF</label>
        <input
          name="CPF"
          type="text"
          required
          value={formData.CPF || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="000.000.000-00"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">RG</label>
        <input
          name="RG"
          type="text"
          required
          value={formData.RG || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="0000000"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">EMAIL</label>
        <input
          name="EMAIL"
          type="email"
          required
          value={formData.EMAIL || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="exemplo@email.com"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">RUA</label>
        <input
          name="RUA"
          type="text"
          required
          value={formData.RUA || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="Nome da rua"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">NÚMERO</label>
        <input
          name="NUMERO"
          type="text"
          required
          value={formData.NUMERO || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="123"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">COMPLEMENTO</label>
        <input
          name="COMPLEMENTO"
          type="text"
          value={formData.COMPLEMENTO || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="Apto, Bloco, etc."
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">BAIRRO</label>
        <input
          name="BAIRRO"
          type="text"
          required
          value={formData.BAIRRO || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="Nome do bairro"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">CIDADE</label>
        <input
          name="CIDADE"
          type="text"
          required
          value={formData.CIDADE || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="Nome da cidade"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">CEP</label>
        <input
          name="CEP"
          type="text"
          required
          value={formData.CEP || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="00000-000"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">TELEFONE 1</label>
        <input
          name="TELEFONE1"
          type="tel"
          required
          value={formData.TELEFONE1 || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">TELEFONE 2</label>
        <input
          name="TELEFONE2"
          type="tel"
          value={formData.TELEFONE2 || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">TELEFONE 3</label>
        <input
          name="TELEFONE3"
          type="tel"
          value={formData.TELEFONE3 || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <label className="block text-sm mb-0.5">MATRÍCULA</label>
        <input
          name="MATRICULA"
          type="text"
          required
          value={formData.MATRICULA || ''}
          onChange={handleChange}
          className="w-full border rounded p-1"
          placeholder="Número de matrícula"
        />
      </div>
    </>
  );
}