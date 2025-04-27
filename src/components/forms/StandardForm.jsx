import { useEffect } from 'react';

// Função para obter a data atual formatada
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function StandardForm({ formData, handleChange }) {
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
  }, []); // Executa apenas uma vez na montagem do componente

  const fieldTypes = {
    NOME: { type: 'text', placeholder: 'Nome completo' },
    RG: { type: 'text', placeholder: '0000000' },
    CPF: { type: 'text', placeholder: '000.000.000-00' },
    EMPRESA: { type: 'text', placeholder: 'Nome da empresa' },
    RUA: { type: 'text', placeholder: 'Nome da rua' },
    NUMERO: { type: 'text', placeholder: '123' },
    COMPLEMENTO: { type: 'text', placeholder: 'Apto, Bloco, etc.' },
    BAIRRO: { type: 'text', placeholder: 'Nome do bairro' },
    CIDADE: { type: 'text', placeholder: 'Nome da cidade' },
    ESTADO: { type: 'select', placeholder: '' },
    CEP: { type: 'text', placeholder: '00000-000' },
    TELEFONE1: { type: 'tel', placeholder: '(00) 00000-0000' },
    TELEFONE2: { type: 'tel', placeholder: '(00) 00000-0000' },
    TELEFONE3: { type: 'tel', placeholder: '(00) 00000-0000' },
    NASCIMENTO: { type: 'text', placeholder: 'DD/MM/AAAA' },
    MATRICULA: { type: 'text', placeholder: 'Número de matrícula' },
    ORGAO: { type: 'text', placeholder: 'Nome do órgão' },
    CARGO: { type: 'text', placeholder: 'Cargo atual' },
    ADMISSAO: { type: 'text', placeholder: 'DD/MM/AAAA' },
    PIS: { type: 'text', placeholder: '000.00000.00-0' },
    EMAIL: { type: 'email', placeholder: 'exemplo@email.com' },
  };

  const states = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR',
    'PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
  ];
  
  const nonRequiredFields = ['TELEFONE2', 'TELEFONE3', 'COMPLEMENTO'];
  
  return (
    <>
      {Object.keys(fieldTypes).map((field) => (
        <div key={field}>
          <label className="block text-sm mb-0.5">{field}</label>
          {field === 'ESTADO' ? (
            <select
              name={field}
              required
              value={formData[field] || ''}
              onChange={handleChange}
              className="w-full border rounded p-1"
            >
              <option value="">Selecione…</option>
              {states.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          ) : (
            <input
              name={field}
              type={fieldTypes[field].type}
              required={!nonRequiredFields.includes(field)}
              value={field === 'DATA' ? (formData[field] || getCurrentDate()) : (formData[field] || '')}
              onChange={handleChange}
              className="w-full border rounded p-1"
              placeholder={fieldTypes[field].placeholder}
              readOnly={field === 'DATA' ? true : false}
            />
          )}
        </div>
      ))}
    </>
  );
}