import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { contracts } from '../data/contracts';
import LinkGenerator from '../components/LinkGenerator';
import './Home.css';

function Home() {
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);

  const toggleContractSelection = (contractId) => {
    if (selectedContracts.includes(contractId)) {
      setSelectedContracts(selectedContracts.filter(id => id !== contractId));
    } else {
      setSelectedContracts([...selectedContracts, contractId]);
    }
  };

  const openLinkGenerator = () => {
    setShowLinkGenerator(true);
  };

  const closeLinkGenerator = () => {
    setShowLinkGenerator(false);
  };

  return (
    <div className="home-container">
      <h2>Contratos Disponíveis</h2>
      <div className="contracts-grid">
        {contracts.map((contract) => (
          <div key={contract.id} className="contract-card">
            <h3>{contract.title}</h3>
            <div className="card-actions">
              <Link to={`/contract/${contract.id}`} className="view-btn">
                Visualizar Contrato
              </Link>
              <label className="select-contract">
                <input
                  type="checkbox"
                  onChange={() => toggleContractSelection(contract.id)}
                  checked={selectedContracts.includes(contract.id)}
                />
                Selecionar
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="generate-link-btn"
        disabled={selectedContracts.length === 0}
        onClick={openLinkGenerator}
      >
        Gerar Link
      </button>
      
      {showLinkGenerator && (
        <LinkGenerator 
          selectedContracts={selectedContracts}
          closeModal={closeLinkGenerator}
        />
      )}
    </div>
  );
}

export default Home;