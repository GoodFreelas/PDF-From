import { useState } from 'react';
import { CONTRACT_FILES } from '../constants/contracts';

export default function LinkGenerator() {
  const [selected, setSelected] = useState([]);
  const [link, setLink] = useState('');

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const generate = () => {
    if (selected.length === 0) {
      alert('Selecione ao menos um contrato.');
      return;
    }
    
    // Pega a URL base sem o hash
    const baseUrl = window.location.href.split('#')[0];
    // Cria o caminho usando o formato de hash
    const hashPath = `#/preencher`;
    // Monta a URL completa com os parâmetros
    const fullUrl = `${baseUrl}${hashPath}?contratos=${selected.join(',')}`;
    
    setLink(fullUrl);
    navigator.clipboard.writeText(fullUrl);
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6 mt-8">
      <h1 className="text-2xl font-bold">AMPARE – Gerador de Contratos</h1>
      <div>
        <p className="font-semibold mb-1">1. Escolha quais contratos enviar:</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(CONTRACT_FILES).map(([id, { label }]) => (
            <label
              key={id}
              className="flex items-center bg-white p-3 rounded shadow cursor-pointer"
            >
              <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
              <span className="ml-2">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="font-semibold mb-1">2. Gere o link de preenchimento:</p>
        <div className="flex">
          <input
            className="flex-1 border rounded-l px-2 py-1 text-sm"
            value={link}
            readOnly
            placeholder="Selecione os contratos acima"
          />
          <button
            onClick={generate}
            className="bg-blue-600 text-white px-4 rounded-r disabled:opacity-40"
            disabled={selected.length === 0}
          >
            Gerar & Copiar
          </button>
        </div>
      </div>
    </section>
  );
}