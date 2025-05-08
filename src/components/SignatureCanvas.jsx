import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import SignaturePad from 'signature_pad';

const SignatureCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  
  useEffect(() => {
    // Inicializa o SignaturePad quando o componente for montado
    padRef.current = new SignaturePad(canvasRef.current, { 
      backgroundColor: 'rgba(255,255,255,0)'
    });
    
    return () => {
      // Limpa quando o componente for desmontado
      if (padRef.current) {
        padRef.current.off();
      }
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
        className="w-full h-[150px]" 
      />
    </div>
  );
});

export default SignatureCanvas;