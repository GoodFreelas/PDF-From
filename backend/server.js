import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// -----------------------------------------------------------------------------
// Utilidades ES‑Modules --------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// Configuração geral -----------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// -------- CORS ---------------------------------------------------------------
origin: [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5173/',
  'https://meusite.com'
],             // responde ao pre‑flight

  // -------- Body‑Parser --------------------------------------------------------
  app.use(express.json({ limit: '50mb' }));   // front envia JSON
// Se usar multipart/form‑data: const upload = multer(); e remova esta linha
const upload = multer();

// -------- Arquivos estáticos -------------------------------------------------
app.use(express.static('public'));

// -------- Nodemailer ---------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

// -----------------------------------------------------------------------------
// Configuração de diretórios temporários --------------------------------------
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// -----------------------------------------------------------------------------
// Mapas de contratos ----------------------------------------------------------
export const CONTRACT_FILES = {
  saude: {
    label: 'Seguro‑Saúde',
    file: path.join(__dirname, 'public', 'AMPARE_TERMO_ADESAO_SAUDE.pdf'),
    positions: {
      NOME: [{ x: 80, y: 675 }, { x: 92, y: 455 }],
      RG: { x: 90, y: 660 },
      CPF: { x: 380, y: 660 },
      EMPRESA: { x: 475, y: 630 },
      RUA: { x: 110, y: 430 },
      NUMERO: { x: 515, y: 430 },
      COMPLEMENTO: { x: 135, y: 403 },
      BAIRRO: { x: 95, y: 378 },
      CIDADE: { x: 298, y: 378 },
      ESTADO: { x: 440, y: 378 },
      CEP: { x: 485, y: 378 },
      TELEFONE1: { x: 115, y: 352 },
      TELEFONE2: { x: 210, y: 352 },
      TELEFONE3: { x: 290, y: 352 },
      NASCIMENTO: { x: 485, y: 352 },
      MATRICULA: { x: 120, y: 328 },
      ORGAO: { x: 370, y: 328 },
      CARGO: { x: 138, y: 303 },
      ADMISSAO: { x: 480, y: 303 },
      PIS: { x: 120, y: 277 },
      EMAIL: { x: 120, y: 253 },
      DATA: { x: 360, y: 225 },
      SIGN: { x: 92, y: 150 },
    },
  },
  qualidonto: {
    label: 'Plano Odontológico',
    file: path.join(__dirname, 'public', 'AMPARE_TERMO_ADESAO_QUALIDONTO.pdf'),
    positions: {
      NOME: [{ x: 80, y: 650 }, { x: 92, y: 420 }],
      RG: { x: 90, y: 635 },
      CPF: { x: 380, y: 635 },
      EMPRESA: { x: 245, y: 605 },
      RUA: { x: 110, y: 396 },
      NUMERO: { x: 515, y: 396 },
      COMPLEMENTO: { x: 140, y: 371 },
      BAIRRO: { x: 98, y: 345 },
      CIDADE: { x: 296, y: 345 },
      ESTADO: { x: 440, y: 345 },
      CEP: { x: 488, y: 345 },
      TELEFONE1: { x: 115, y: 320 },
      TELEFONE2: { x: 210, y: 320 },
      TELEFONE3: { x: 290, y: 320 },
      NASCIMENTO: { x: 475, y: 320 },
      MATRICULA: { x: 120, y: 295 },
      ORGAO: { x: 370, y: 295 },
      CARGO: { x: 138, y: 270 },
      ADMISSAO: { x: 480, y: 270 },
      PIS: { x: 120, y: 244 },
      EMAIL: { x: 110, y: 218 },
      DATA: { x: 360, y: 193 },
      SIGN: { x: 92, y: 130 },
    },
  },
  vitalmed: {
    label: 'Assistência Familiar (Vitalmed)',
    file: path.join(__dirname, 'public', 'TERMO_ADESAO_VITALMED.pdf'),
    positions: {
      NOME: { x: 100, y: 262 },
      NASCIMENTO: { x: 115, y: 242 },
      CPF: { x: 100, y: 212 },
      RG: { x: 350, y: 212 },
      RUA: { x: 174, y: 183 },
      NUMERO: { x: 400, y: 183 },
      COMPLEMENTO: { x: 130, y: 164 },
      BAIRRO: { x: 350, y: 164 },
      CEP: { x: 90, y: 145 },
      TELEFONE1: { x: 280, y: 145 },
      TELEFONE2: { x: 444, y: 145 },
      CIDADE: { x: 160, y: 125 },
      TELEFONE3: { x: 405, y: 125 },
      MATRICULA: { x: 170, y: 105 },
      FAMILIAR1_NOME: { x: 70, y: 685, page: 1 },
      FAMILIAR1_NASCIMENTO: { x: 315, y: 685, page: 1 },
      FAMILIAR1_CPF: { x: 435, y: 685, page: 1 },
      FAMILIAR2_NOME: { x: 70, y: 672, page: 1 },
      FAMILIAR2_NASCIMENTO: { x: 315, y: 672, page: 1 },
      FAMILIAR2_CPF: { x: 435, y: 672, page: 1 },
      FAMILIAR3_NOME: { x: 70, y: 660, page: 1 },
      FAMILIAR3_NASCIMENTO: { x: 315, y: 660, page: 1 },
      FAMILIAR3_CPF: { x: 435, y: 660, page: 1 },
      FAMILIAR4_NOME: { x: 70, y: 646, page: 1 },
      FAMILIAR4_NASCIMENTO: { x: 315, y: 646, page: 1 },
      FAMILIAR4_CPF: { x: 435, y: 646, page: 1 },
      FAMILIAR5_NOME: { x: 70, y: 633, page: 1 },
      FAMILIAR5_NASCIMENTO: { x: 315, y: 633, page: 1 },
      FAMILIAR5_CPF: { x: 435, y: 633, page: 1 },
      FAMILIAR6_NOME: { x: 70, y: 622, page: 1 },
      FAMILIAR6_NASCIMENTO: { x: 315, y: 622, page: 1 },
      FAMILIAR6_CPF: { x: 435, y: 622, page: 1 },
      DATA: { x: 70, y: 290, page: 1 },
      SIGN: { x: 70, y: 200, page: 1 },
    },
  }
};

export const defaultScale = 1.05;

// -----------------------------------------------------------------------------
// Utilitário de data ----------------------------------------------------------
export const getCurrentDate = () => {
  const t = new Date();
  return t.toLocaleDateString('pt-BR');
};

// -----------------------------------------------------------------------------
// Rotas simples ----------------------------------------------------------------
app.get('/api/check-status', (_, res) =>
  res.status(200).json({ status: 'online', timestamp: new Date().toISOString() })
);
// -----------------------------------------------------------------------------
// Pré-validação do formulário --------------------------------------------------
app.post('/api/pre-process-check', (req, res) => {
  try {
    const { contratos, formData } = req.body;

    const lista = Array.isArray(contratos) ? contratos : contratos.split(',');
    const invalidos = lista.filter(id => !CONTRACT_FILES[id]);

    if (invalidos.length)
      return res.status(400).json({
        success: false,
        message: `Contratos inválidos: ${invalidos.join(', ')}`
      });

    // (aqui você pode fazer outras validações nos campos)
    res.json({ success: true, contratos: lista });
  } catch (e) {
    console.error('Erro na pré-validação', e);
    res.status(500).json({ success: false, message: e.message });
  }
});


// -----------------------------------------------------------------------------
// Sua rota principal para gerar PDFs ------------------------------------------
app.post('/generate-pdfs', async (req, res) => {
  try {
    const { formData, signatureData, contratos } = req.body;
    const contratosArray = contratos.split(',');
    const signatureBuffer = Buffer.from(
      signatureData.replace(/^data:image\/png;base64,/, ''), 'base64'
    );

    const generatedPDFs = [];

    for (const id of contratosArray) {
      const contrato = CONTRACT_FILES[id];
      if (!contrato) continue;

      const { file, positions, label } = contrato;

      const pdfDoc = await PDFDocument.load(fs.readFileSync(file));
      const pages = pdfDoc.getPages();
      const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);

      Object.entries(formData).forEach(([chave, valor]) => {
        const pos = positions[chave];
        if (!valor || !pos) return;
        (Array.isArray(pos) ? pos : [pos]).forEach(p => {
          const idx = p.page ?? 0;
          if (idx < pages.length)
            pages[idx].drawText(String(valor), { x: p.x, y: p.y, size: 10, font: helv });
        });
      });

      if (positions.SIGN) {
        const img = await pdfDoc.embedPng(signatureBuffer);
        const w = 120;
        const h = (img.height / img.width) * w;
        const s = positions.SIGN;
        const idx = s.page ?? 0;
        if (idx < pages.length)
          pages[idx].drawImage(img, { x: s.x, y: s.y, width: w, height: h });
      }

      const output = path.join(tempDir, `Contrato_${id}_Preenchido.pdf`);
      fs.writeFileSync(output, await pdfDoc.save());

      generatedPDFs.push({ path: output, filename: path.basename(output), label });
    }

    if (!generatedPDFs.length)
      return res.status(400).json({ success: false, message: 'Nenhum PDF gerado' });

    await sendEmailWithAttachments(formData.EMAIL, generatedPDFs, formData.NOME);

    res.json({ success: true, message: `${generatedPDFs.length} PDFs enviados` });

    // limpeza assíncrona
    setTimeout(() => {
      generatedPDFs.forEach(f => fs.unlink(f.path, () => { }));
    }, 60_000);

  } catch (err) {
    console.error('Erro em /generate-pdfs', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------------------------------------------------------
// E‑mail helper ----------------------------------------------------------------
async function sendEmailWithAttachments(destino, anexos, nome) {
  const cfg = anexos.map(a => ({ filename: a.filename, path: a.path }));
  await transporter.sendMail({
    from: 'AMPARE <' + process.env.GMAIL_USER + '>',
    to: destino,
    cc: process.env.GMAIL_USER,
    subject: 'Seus contratos AMPARE',
    html: `<h2>Olá ${nome}</h2><p>Seguem anexos.</p>`,
    attachments: cfg,
  });
}

// Rota para servir os arquivos PDF
app.get('/api/pdf/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'public', `${filename}`);
  res.sendFile(filePath);
});


// -----------------------------------------------------------------------------
// Start ------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));