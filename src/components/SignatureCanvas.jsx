// ================================
// Imports
// ================================
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import SignaturePad from 'signature_pad';
import PropTypes from 'prop-types';

// ================================
// Componente SignatureCanvas
// ================================

/**
 * Componente de canvas para assinatura digital
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.canvasProps - Propriedades do canvas
 * @param {Object} ref - Referência do componente
 * @returns {JSX.Element} - Componente SignatureCanvas
 */
const SignatureCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  
  // ================================
  // Effects
  // ================================
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Define o tamanho real com base no tamanho renderizado (corrige a resolução)
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
  
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  
    ctx.scale(ratio, ratio);
  
    padRef.current = new SignaturePad(canvas, { 
      backgroundColor: 'rgba(255,255,255,0)' 
    });
  
    return () => {
      padRef.current?.off();
    };
  }, []);  
  
  // ================================
  // Imperative Handle
  // ================================
  useImperativeHandle(ref, () => ({
    isEmpty: () => padRef.current?.isEmpty(),
    clear: () => padRef.current?.clear(),
    toDataURL: () => padRef.current?.toDataURL('image/png'),
  }));
  
  // ================================
  // JSX Return
  // ================================
  return (
    <div className="bg-transparent">
      <canvas 
        ref={canvasRef} 
        {...props} 
        className="max-w-[550px] max-h-[150px] w-full h-full" 
      />
    </div>
  );
});

// ================================
// PropTypes
// ================================
SignatureCanvas.propTypes = {
  canvasProps: PropTypes.object,
};

// ================================
// Export
// ================================
export default SignatureCanvas;