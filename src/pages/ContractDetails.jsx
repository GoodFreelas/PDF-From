import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contracts } from '../data/contracts';
import './ContractDetails.css';

function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contract = contracts.find(c => c.id === parseInt(id));

  if (!contract) {
    return <div>Contrato não encontrado</div>;
  }

  const goBack = () => {
    navigate(-1);
  };

  // Função para estilizar o conteúdo do contrato (substituir os marcadores por espaços em branco para visualização)
  const formatContractContent = (content) => {
    let formattedContent = content;
    contract.fields.forEach(field => {
      formattedContent = formattedContent.replace(`[${field}]`, `__________`);
    });
    return formattedContent;
  };

  return (
    <div className="contract-detail-container">
      <button className="back-btn" onClick={goBack}>Voltar</button>
      <h2>{contract.title}</h2>
      <div className="contract-content">
        <pre>{formatContractContent(contract.content)}</pre>
      </div>
    </div>
  );
}

export default ContractDetails;
