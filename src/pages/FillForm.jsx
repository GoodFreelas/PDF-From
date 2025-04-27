import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CONTRACT_FILES } from '../constants/contracts';
import PdfPreview from '../components/PdfPreview';
import ContractSelector from '../components/forms/ContractSelector';
import FormContainer from '../components/forms/FormContainer';
import SuccessMessage from '../components/forms/SuccessMessage';
import { generatePdf } from '../utils/pdfUtils';

// URL base da API
const API_BASE_URL = 'https://pdf-from.onrender.com'; // Altere para a URL correta da sua API

export default function FillForm() {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location]);
  const contratos = (query.get('contratos') || 'saude')
    .split(',')
    .filter((id) => CONTRACT_FILES[id]);
  const [currentContract, setCurrentContract] = useState(contratos[0]);
  const sigRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
  return <SuccessMessage email={formData.EMAIL} />;
  }
  
  // Verifica se é apenas o contrato vitalmed
  const isOnlyVitalmed = contratos.length === 1 && contratos[0] === 'vitalmed';
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setProcessing(true);
    try {
      // 1) captura a assinatura como dataURL
      const sigDataUrl = sigRef.current.toDataURL('image/png');
      const sigBytes   = new Uint8Array(
        await (await fetch(sigDataUrl)).arrayBuffer()
      );
  
      // 2) gera PDFs localmente para download / visualização
      for (const id of contratos) {
        await generatePdf(id, formData, sigBytes);
      }
  
      // 3) envia tudo ao servidor para ele gerar e mandar por e-mail
      const resp = await fetch(`${API_BASE_URL}/generate-pdfs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',                // opcional: cookies/sessão
        body: JSON.stringify({
          formData,
          signatureData: sigDataUrl,           // base64 da assinatura
          contratos: contratos.join(',')       // ex.: "saude,qualidonto"
        })
      });
  
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        throw new Error(payload.message || 'Erro no servidor');
      }
  
      // 4) fluxo concluído
      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar/enviar PDFs: ' + (err.message || 'erro desconhecido'));
    } finally {
      setProcessing(false);
    }
  };  
  
  return (
    <section className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-8">
      <div>
        {contratos.length > 1 && (
          <ContractSelector
            contracts={contratos}
            currentContract={currentContract}
            onChange={setCurrentContract}
          />
        )}
        <div className="border rounded p-2 bg-white shadow">
          <PdfPreview contractId={CONTRACT_FILES[currentContract]} />
        </div>
      </div>
      <FormContainer
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        sigRef={sigRef}
        isOnlyVitalmed={isOnlyVitalmed}
        contratos={contratos}
        processing={processing}
      />
    </section>
  );
}