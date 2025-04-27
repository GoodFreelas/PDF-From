import { useState } from 'react';

export default function FamilyMembersForm({ formData, handleChange }) {
  const [familyCount, setFamilyCount] = useState(1);
  
  const fields = [
    { name: 'NOME', type: 'text', placeholder: 'Nome completo' },
    { name: 'CPF', type: 'text', placeholder: '000.000.000-00' },
    { name: 'NASCIMENTO', type: 'text', placeholder: 'DD/MM/AAAA' },
  ];

  const addFamilyMember = () => {
    setFamilyCount(prevCount => prevCount + 1);
  };

  const removeFamilyMember = (index) => {
    if (familyCount > 1) {
      // Limpa os dados do familiar que está sendo removido
      const updatedFormData = { ...formData };
      fields.forEach(field => {
        const fieldName = `FAMILIAR${index}_${field.name}`;
        delete updatedFormData[fieldName];
      });
      
      // Renumera os familiares após o que foi removido
      for (let i = index; i < familyCount; i++) {
        fields.forEach(field => {
          const currentField = `FAMILIAR${i+1}_${field.name}`;
          const newField = `FAMILIAR${i}_${field.name}`;
          if (updatedFormData[currentField]) {
            updatedFormData[newField] = updatedFormData[currentField];
            delete updatedFormData[currentField];
          }
        });
      }
      
      // Atualiza os dados do formulário e diminui a contagem
      handleChange({ target: { name: 'formData', value: updatedFormData } }, true);
      setFamilyCount(prevCount => prevCount - 1);
    }
  };

  return (
    <div className="pt-3 border-t space-y-3">
      <h3 className="font-semibold">Dados dos Familiares</h3>
      
      {[...Array(familyCount)].map((_, idx) => (
        <div key={idx} className="pb-3 border-b last:border-b-0">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Familiar {idx + 1}</h4>
            {idx > 0 && (
              <button 
                type="button"
                onClick={() => removeFamilyMember(idx + 1)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remover
              </button>
            )}
          </div>
          
          {fields.map((field) => {
            const name = `FAMILIAR${idx + 1}_${field.name}`;
            return (
              <div key={name} className="mb-2">
                <label className="block text-sm mb-0.5">{field.name}</label>
                <input
                  name={name}
                  type={field.type}
                  value={formData[name] || ''}
                  onChange={handleChange}
                  className="w-full border rounded p-1"
                  placeholder={field.placeholder}
                />
              </div>
            );
          })}
        </div>
      ))}
      
      {familyCount < 6 && (
        <button
          type="button"
          onClick={addFamilyMember}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center justify-center w-full"
        >
          Adicionar Familiar
        </button>
      )}
    </div>
  );
}