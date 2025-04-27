import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import SignaturePad from 'signature_pad';

const SignatureCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    padRef.current = new SignaturePad(canvasRef.current, { backgroundColor: 'rgba(255,255,255,0)' });
  }, []);

  useImperativeHandle(ref, () => ({
    isEmpty: () => padRef.current?.isEmpty(),
    clear: () => padRef.current?.clear(),
    toDataURL: () => padRef.current?.toDataURL('image/png'),
  }));

  return (
    <div className="border rounded bg-white">
      <canvas ref={canvasRef} {...props} className="w-full h-[120px]" />
    </div>
  );
});

export default SignatureCanvas;
