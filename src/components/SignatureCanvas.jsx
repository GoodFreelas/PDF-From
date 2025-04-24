import React, { useRef, useEffect, useState } from 'react';
import './SignatureCanvas.css';

function SignatureCanvas({ onSave, existingSignature }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Configurar contexto
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    
    setCtx(context);
    
    // Se já existe uma assinatura, carregá-la
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        // Limpar canvas antes de desenhar
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
      img.src = existingSignature;
    }
  }, [existingSignature]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  // Função para obter coordenadas do evento (mouse ou toque)
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    // Verificar se é um evento de toque ou mouse
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="signature-canvas-container">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="signature-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      ></canvas>
      
      <div className="canvas-actions">
        <button className="clear-btn" onClick={clearCanvas}>
          Limpar
        </button>
        <button className="save-btn" onClick={saveSignature}>
          Salvar Assinatura
        </button>
      </div>
    </div>
  );
}

export default SignatureCanvas;
