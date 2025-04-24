import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { contracts } from '../data/contracts';
import SignatureCanvas from '../components/SignatureCanvas';
import PDFGenerator from '../components/PDFGenerator';
import './ClientForm.css';

function ClientForm() {
  const { ids } = useParams();
  const contractIds = ids.split(',').map(id => parseInt(id));
  const selectedContracts = contracts.filter(contract => contractIds.includes(contract.id));
  
  const [formData, setFormData] = useState({});
  const [signatures, setSignatures] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showPdf, setShowPdf] = useState(false);

  // Inicializar formData com todos os campos necessários
  useEffect(() => {
    const allFields = new Set();
    selectedContracts.forEach(contract => {
      contract.fields.forEach(field => allFields.add(field));
    });
    
    const initialFormData = {};
    allFields.forEach(field => {
      initialFormData[field] = '';
    });
    
    setFormData(initialFormData);
  }, [selectedContracts]);

  // Atualizar dados do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Salvar assinatura
  const handleSignature = (contractId, signatureData) => {
    setSignatures({
      ...signatures,
      [contractId]: signatureData
    });
  };

  // Avançar para o próximo contrato
  const nextStep = () => {
    if (currentStep < selectedContracts.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPdf(true);
    }
  };

  // Voltar para o contrato anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Se estamos mostrando o PDF
  if (showPdf) {
    return (
      <PDFGenerator 
        contracts={selectedContracts} 
        formData={formData} 
        signatures={signatures} 
      />
    );
  }

  const currentContract = selectedContracts[currentStep];

  // Formatar conteúdo do contrato preenchendo os campos com os dados do formulário
  const formatContractContent = (content) => {
    let formattedContent = content;
    currentContract.fields.forEach(field => {
      formattedContent = formattedContent.replace(`[${field}]`, formData[field] || `[${field}]`);
    });
    return formattedContent;
  };

  return (
    <div className="client-form-container">
      <h2>Preenchimento de Contrato</h2>
      
      <div className="progress-indicator">
        {selectedContracts.map((contract, index) => (
          <div 
            key={contract.id} 
            className={`progress-step ${index === currentStep ? 'active' : (index < currentStep ? 'completed' : '')}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      
      <h3>{currentContract.title}</h3>
      
      <div className="form-container">
        <div className="form-fields">
          <h4>Preencha seus dados:</h4>
          
          {currentContract.fields.map(field => (
            <div key={field} className="form-group">
              <label htmlFor={field}>{field.replace(/_/g, ' ')}:</label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          ))}
        </div>
        
        <div className="contract-preview">
          <h4>Prévia do Contrato:</h4>
          <div className="preview-content">
            <pre>{formatContractContent(currentContract.content)}</pre>
          </div>
        </div>
      </div>
      
      <div className="signature-section">
        <h4>Assinatura:</h4>
        <SignatureCanvas 
          onSave={(data) => handleSignature(currentContract.id, data)} 
          existingSignature={signatures[currentContract.id]}
        />
      </div>
      
      <div className="form-navigation">
        {currentStep > 0 && (
          <button className="prev-btn" onClick={prevStep}>
            Anterior
          </button>
        )}
        
        <button 
          className="next-btn" 
          onClick={nextStep}
          disabled={!signatures[currentContract.id]}
        >
          {currentStep < selectedContracts.length - 1 ? 'Próximo' : 'Finalizar e Gerar PDF'}
        </button>
      </div>
    </div>
  );
}

export default ClientForm;
