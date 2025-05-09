import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import SignaturePad from 'signature_pad';

const SignatureCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  
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
  
  // Expõe métodos para o componente pai
  useImperativeHandle(ref, () => ({
    isEmpty: () => padRef.current?.isEmpty(),
    clear: () => padRef.current?.clear(),
    toDataURL: () => padRef.current?.toDataURL('image/png'),
  }));
  
  return (
    <div className=" bg-transparent">
      <canvas 
        ref={canvasRef} 
        {...props} 
        className="max-w-[550px] max-h-[150px] w-full h-full" 
      />
    </div>
  );
});

export default SignatureCanvas;