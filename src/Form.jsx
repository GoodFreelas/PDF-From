import React, { useState, useRef } from 'react';
import { jsPDF } from "jspdf";

const SignatureForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: ''
  });

  const signatureCanvasRef = useRef(null);
  const [isSignatureDrawn, setIsSignatureDrawn] = useState(false);
  const [isPenDown, setIsPenDown] = useState(false);

  // Atualiza dados do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Configurações de desenho na assinatura
  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsPenDown(true);
  };

  const draw = (e) => {
    if (!isPenDown) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsSignatureDrawn(true);
  };

  const stopDrawing = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsPenDown(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSignatureDrawn(false);
  };

  // Gera PDF com os dados e assinatura
  const generatePDF = () => {
    if (!isSignatureDrawn) {
      alert('Por favor, assine o contrato.');
      return;
    }

    const doc = new jsPDF();
    
    // Adiciona dados pessoais
    doc.setFontSize(12);
    doc.text('Dados do Contratante', 20, 20);
    doc.text(`Nome: ${formData.nome}`, 20, 30);
    doc.text(`Email: ${formData.email}`, 20, 40);
    doc.text(`CPF: ${formData.cpf}`, 20, 50);
    doc.text(`Telefone: ${formData.telefone}`, 20, 60);

    // Adiciona assinatura
    const canvas = signatureCanvasRef.current;
    const signatureDataUrl = canvas.toDataURL('image/png');
    doc.addImage(signatureDataUrl, 'PNG', 20, 80, 100, 50);

    // Salva PDF
    doc.save('contrato_assinado.pdf');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Assinatura de Contrato</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label>Nome Completo</label>
          <input 
            type="text" 
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Digite seu nome completo"
          />
        </div>
        
        <div>
          <label>Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Digite seu email"
          />
        </div>
        
        <div>
          <label>CPF</label>
          <input 
            type="text" 
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="Digite seu CPF"
          />
        </div>
        
        <div>
          <label>Telefone</label>
          <input 
            type="tel" 
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            placeholder="Digite seu telefone"
          />
        </div>
      </div>

      <div className="mb-6">
        <label>Assinatura</label>
        <canvas 
          ref={signatureCanvasRef}
          width={300} 
          height={150}
          className="border border-gray-300"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
        <button 
          variant="outline" 
          onClick={clearSignature}
          className="mt-2"
        >
          Limpar Assinatura
        </button>
      </div>

      <button 
        onClick={generatePDF}
        disabled={!isSignatureDrawn}
      >
        Gerar Contrato Assinado
      </button>
    </div>
  );
};

export default SignatureForm;