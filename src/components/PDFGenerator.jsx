import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import './PDFGenerator.css';

function PDFGenerator({ contracts, formData, signatures }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generatePDF();
  }, []);

  const generatePDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;
    
    // Para cada contrato
    contracts.forEach((contract, index) => {
      // Adicionar nova página após a primeira página
      if (index > 0) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Título do contrato
      pdf.setFontSize(16);
      pdf.text(contract.title, 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Conteúdo do contrato
      pdf.setFontSize(10);
      
      // Dividir o conteúdo em linhas
      let content = contract.content;
      contract.fields.forEach(field => {
        content = content.replace(`[${field}]`, formData[field] || '______');
      });
      
      // Remover marcadores de formatação markdown
      content = content.replace(/\*\*/g, '');
      
      // Dividir por linhas
      const lines = content.split('\n');
      
      lines.forEach(line => {
        // Verificar se a linha está em branco
        if (line.trim() === '') {
          yPosition += 5;
          return;
        }
        
        // Verificar se é necessário adicionar uma nova página
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const wrappedText = pdf.splitTextToSize(line.trim(), 180);
        pdf.text(wrappedText, 15, yPosition);
        yPosition += 5 * wrappedText.length;
      });
      
      // Adicionar assinatura
      if (signatures[contract.id]) {
        // Verificar se é necessário adicionar uma nova página
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(signatures[contract.id], 'PNG', 65, yPosition, 80, 40);
        yPosition += 40;
      }
    });
    
    // Gerar URL do PDF
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setIsGenerating(false);
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'contratos-assinados.pdf';
    link.click();
  };

  return (
    <div className="pdf-generator-container">
      <h2>Seu Documento está Pronto!</h2>
      
      {isGenerating ? (
        <div className="loading">
          <p>Gerando PDF, aguarde...</p>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="pdf-preview">
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="600px" 
              title="Prévia do PDF" 
            />
          </div>
          
          <div className="pdf-actions">
            <button className="download-btn" onClick={downloadPDF}>
              Baixar PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PDFGenerator;