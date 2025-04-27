export default function DependentsForm({ formData, handleChange }) {
  return (
    <div className="pt-4 border-t mt-4">
      <h3 className="font-semibold mb-3">Dados dos Familiares</h3>
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="pb-4 mb-4 border-b last:border-b-0">
          <h4 className="text-sm font-medium mb-2">Familiar {idx}</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-0.5">NOME</label>
              <input
                name={`FAMILIAR${idx}_NOME`}
                type="text"
                value={formData[`FAMILIAR${idx}_NOME`] || ''}
                onChange={handleChange}
                className="w-full border rounded p-1"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm mb-0.5">CPF</label>
              <input
                name={`FAMILIAR${idx}_CPF`}
                type="text"
                value={formData[`FAMILIAR${idx}_CPF`] || ''}
                onChange={handleChange}
                className="w-full border rounded p-1"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm mb-0.5">DATA DE NASCIMENTO</label>
              <input
                name={`FAMILIAR${idx}_NASCIMENTO`}
                type="text"
                value={formData[`FAMILIAR${idx}_NASCIMENTO`] || ''}
                onChange={handleChange}
                className="w-full border rounded p-1"
                placeholder="DD/MM/AAAA"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}