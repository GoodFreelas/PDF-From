import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.js';
import { defaultScale } from '../constants/contracts';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfPreview({ contractId }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [doc, setDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(1);
  const [error, setError] = useState(null);

  /* carrega PDF ---------------------------------------------------------- */
  useEffect(() => {
    if (!contractId) return;
    
    setError(null);
    
    (async () => {
      try {
        // Usa a URL do backend em vez do caminho do arquivo local
        const pdfUrl = contractId.pdfUrl;
        const loading = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loading.promise;
        setDoc(pdf);
        setTotal(pdf.numPages);
        setPageNum(1);
      } catch (err) {
        console.error("Erro ao carregar PDF:", err);
        setError("Não foi possível carregar o PDF. Verifique se o backend está acessível.");
      }
    })();

    // cancela render pendente ao trocar de PDF
    return () => {
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [contractId]);

  /* renderiza página ------------------------------------------------------ */
  useEffect(() => {
    if (!doc) return;
    
    let cancelled = false;
    
    (async () => {
      // cancela qualquer render anterior
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: defaultScale });
      const canvas = canvasRef.current;
      
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // começa novo render e guarda referência
      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      
      try {
        await task.promise; // espera terminar
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') throw e;
      }
      
      if (!cancelled) {
        renderTaskRef.current = null; // terminou com sucesso
      }
    })();
    
    // cleanup se componente desmontar ou pageNum mudar
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [doc, pageNum]);

  /* UI ------------------------------------------------------------------- */
  return (
    <div className="pdf-preview">
      {error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded">
          {error}
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="w-full" />
          {total > 1 && (
            <div className="flex justify-between items-center mt-3 px-2">
              <button
                className="bg-gray-200 px-4 py-1 rounded disabled:opacity-40"
                disabled={pageNum <= 1}
                onClick={() => setPageNum(p => p - 1)}
              >
                &lt; Anterior
              </button>
              <span>{pageNum} / {total}</span>
              <button
                className="bg-gray-200 px-4 py-1 rounded disabled:opacity-40"
                disabled={pageNum >= total}
                onClick={() => setPageNum(p => p + 1)}
              >
                Próxima &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}