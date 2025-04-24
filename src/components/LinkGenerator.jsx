import React, { useState } from 'react';
import { contracts } from '../data/contracts';
import './LinkGenerator.css';

function LinkGenerator({ selectedContracts, closeModal }) {
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    // Criar um link que contém os IDs dos contratos selecionados
    const baseUrl = window.location.origin;
    const contractIds = selectedContracts.join(',');
    const link = `${baseUrl}/form/${contractIds}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar link:', err);
      });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-btn" onClick={closeModal}>&times;</span>
        <h3>Gerador de Link</h3>
        
        <div className="selected-contracts">
          <h4>Contratos Selecionados:</h4>
          <ul>
            {selectedContracts.map(id => (
              <li key={id}>
                {contracts.find(c => c.id === id).title}
              </li>
            ))}
          </ul>
        </div>
        
        <button className="generate-btn" onClick={generateLink}>
          Gerar Link
        </button>
        
        {generatedLink && (
          <div className="generated-link-container">
            <p>Link gerado:</p>
            <div className="link-display">
              <input 
                type="text" 
                value={generatedLink} 
                readOnly 
              />
              <button 
                className="copy-btn" 
                onClick={copyToClipboard}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LinkGenerator;