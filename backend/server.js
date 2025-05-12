/**************************************************************************
 *  server.js — AMPARE PDF-From
 **************************************************************************/

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {
  PDFDocument,
  StandardFonts
} from 'pdf-lib';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* ───────────────── utilidades ES-modules ─────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ───────────────── configuração geral ────────────────────────────────── */
const app = express();
const PORT = process.env.PORT || 3000;

/* ────────────────────────────── CORS ────────────────────────────────────*/
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'https://pdf-from.vercel.app',
  'https://pdf-from.onrender.com',
  'https://www.pdf-from.vercel.app'
];


app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);           // curl / Postman
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error(`Origin ${origin} não permitida pelo CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
  })
);

// pré-flight global
app.options('*', cors());

/* ─────────────────────── body-parser / multipart ─────────────────────── */
app.use(express.json({ limit: '50mb' }));
const upload = multer();

/* ───────────────────── Arquivos estáticos (PDFs) ─────────────────────── */
app.use(
  '/api/pdf',
  express.static(path.join(__dirname, 'public'))
);

// Servir PDFs também na raiz para compatibilidade
app.use('/', express.static(path.join(__dirname, 'public')));

/* ─────────────────────────── Nodemailer ──────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

/* ──────────────────── diretório temporário local ─────────────────────── */
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

/* ───────────────────── mapas de contratos (PDFs) ─────────────────────── */
export const CONTRACT_FILES = {
  saude: {
    label: 'Seguro-Saúde',
    file: path.join(__dirname, 'public', 'contrato-blue-saude.pdf'),
    positions: {
      NOME: [{ x: 80, y: 675 }, { x: 92, y: 455 }],
      RG: { x: 90, y: 660 },
      CPF: { x: 380, y: 660 },
      EMPRESA: { x: 475, y: 629 },
      RUA: { x: 110, y: 430 },
      NUMERO: { x: 515, y: 430 },
      COMPLEMENTO: { x: 135, y: 404 },
      BAIRRO: { x: 95, y: 378 },
      CIDADE: { x: 298, y: 378 },
      ESTADO: { x: 440, y: 378 },
      CEP: { x: 485, y: 378 },
      TELEFONE1: { x: 115, y: 353 },
      TELEFONE2: { x: 210, y: 353 },
      TELEFONE3: { x: 290, y: 353 },
      NASCIMENTO: { x: 485, y: 353 },
      MATRICULA: { x: 120, y: 328 },
      ORGAO: { x: 370, y: 328 },
      CARGO: { x: 138, y: 303 },
      ADMISSAO: { x: 480, y: 303 },
      PIS: { x: 120, y: 277 },
      EMAIL: { x: 115, y: 253 },
      DATA: { x: 360, y: 225 },
      SIGN: { x: 92, y: 150 },
    }
  },
  qualidonto: {
    label: 'Plano Odontológico',
    file: path.join(__dirname, 'public', 'contrato-qualidonto.pdf'),
    positions: {
      NOME: [{ x: 80, y: 651 }, { x: 92, y: 422 }],
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
      VALOR: { x: 155, y: 500 }
    }
  },
  vitalmed: {
    label: 'Assistência Familiar (Vitalmed)',
    file: path.join(__dirname, 'public', 'contrato-vitalmed.pdf'),
    positions: {
      NOME: { x: 100, y: 262 },
      NASCIMENTO: { x: 115, y: 242 },
      CPF: { x: 98, y: 212 },
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
      MATRICULA: { x: 170, y: 106 },
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
      SIGN: { x: 70, y: 215, page: 1 },
    }
  }
};

export const defaultScale = 1.05;

/* ────────────────────────── rotas auxiliares ─────────────────────────── */
app.get('/api/check-status', (_, res) =>
  res.json({ status: 'online', timestamp: new Date().toISOString() })
);

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

    // … outras validações …
    res.json({ success: true, contratos: lista });
  } catch (e) {
    console.error('Erro na pré-validação', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

/* ────────────────────────── rota principal PDFs ───────────────────────── */
app.post('/generate-pdfs', async (req, res) => {
  try {
    const { formData, signatureData, contratos } = req.body;
    const contratosArray = contratos.split(',');
    const signatureBuffer = Buffer.from(
      signatureData.replace(/^data:image\/png;base64,/, ''), 'base64'
    );

    const generated = [];
    const pdfBuffers = {}; // Para armazenar os buffers dos PDFs gerados

    // Função para limpar CPF/RG (remover pontos, traços, espaços)
    const limparDocumento = (doc) => doc ? doc.replace(/[^\d]/g, '') : '';

    // Função para desenhar CPF com espaçamento especial para os últimos 2 dígitos
    const desenharCPFComEspaco = (page, cpf, posicaoBase, tamanho, font, espacamentoNormal, espacamentoFinal) => {
      const digitos = limparDocumento(cpf);

      // Para CPF (11 dígitos): XXX.XXX.XXX-XX
      // Queremos espaçar diferentemente os 2 últimos dígitos

      // Se for um CPF válido com 11 dígitos
      if (digitos.length === 11) {
        const primeiros9 = digitos.substring(0, 9);
        const ultimos2 = digitos.substring(9);

        // Desenha os primeiros 9 dígitos com espaçamento normal
        primeiros9.split('').forEach((digito, index) => {
          const x = posicaoBase.x + (index * espacamentoNormal);
          page.drawText(digito, {
            x,
            y: posicaoBase.y,
            size: tamanho,
            font
          });
        });

        // Desenha os últimos 2 dígitos com espaçamento adicional
        ultimos2.split('').forEach((digito, index) => {
          // Posição base + espaço dos 9 primeiros + espaço adicional + espaço normal entre os últimos dígitos
          const x = posicaoBase.x + (9 * espacamentoNormal) + espacamentoFinal + (index * espacamentoNormal);
          page.drawText(digito, {
            x,
            y: posicaoBase.y,
            size: tamanho,
            font
          });
        });
      } else {
        // Se não for um CPF com 11 dígitos, desenha normalmente
        digitos.split('').forEach((digito, index) => {
          const x = posicaoBase.x + (index * espacamentoNormal);
          page.drawText(digito, {
            x,
            y: posicaoBase.y,
            size: tamanho,
            font
          });
        });
      }
    };

    // Função para desenhar RG com espaçamento regular
    const desenharDigitosComEspaco = (page, texto, posicaoBase, tamanho, font, espacamento = 5) => {
      const digitos = limparDocumento(texto);
      digitos.split('').forEach((digito, index) => {
        const x = posicaoBase.x + (index * espacamento);
        page.drawText(digito, {
          x,
          y: posicaoBase.y,
          size: tamanho,
          font
        });
      });
    };

    for (const id of contratosArray) {
      const contrato = CONTRACT_FILES[id];
      if (!contrato) continue;

      const { file, positions, label } = contrato;

      // Lê o arquivo PDF do template
      const pdfDoc = await PDFDocument.load(fs.readFileSync(file));
      const pages = pdfDoc.getPages();
      const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Processa campos de dependentes se existirem no formData
      if (id === 'vitalmed' && formData.dependents) {
        formData.dependents.forEach((dependent, index) => {
          // Apenas processa até 6 dependentes (limite do formulário)
          if (index < 6) {
            // Mapeia os campos do dependente para o formato esperado pelo preenchimento
            const depNum = index + 1;
            formData[`FAMILIAR${depNum}_NOME`] = dependent.NOME || '';
            formData[`FAMILIAR${depNum}_NASCIMENTO`] = dependent.NASCIMENTO || '';
            // CPF será tratado separadamente
          }
        });
      }

      // Tratamento especial para CPF e RG no contrato vitalmed
      let formDataClone = { ...formData };

      if (id === 'vitalmed') {
        // Salve os valores originais de CPF e RG
        const cpfOriginal = formDataClone.CPF;
        const rgOriginal = formDataClone.RG;

        // Remova CPF e RG do formData para evitar o processamento padrão
        delete formDataClone.CPF;
        delete formDataClone.RG;

        // Preenche texto nos campos do PDF (exceto CPF e RG no vitalmed)
        Object.entries(formDataClone).forEach(([k, v]) => {
          const pos = positions[k];
          if (!v || !pos) return;
          (Array.isArray(pos) ? pos : [pos]).forEach(p => {
            const idx = p.page ?? 0;
            if (idx < pages.length)
              pages[idx].drawText(String(v), { x: p.x, y: p.y, size: 10, font: helv });
          });
        });

        // Desenhe CPF com espaçamento especial para os últimos 2 dígitos
        if (cpfOriginal) {
          desenharCPFComEspaco(
            pages[0],
            cpfOriginal,
            { x: positions.CPF.x, y: positions.CPF.y },
            15,
            helv,
            18, // espaçamento normal entre dígitos
            10  // espaçamento extra antes dos dois últimos dígitos
          );
        }

        // Desenhe RG com espaçamento regular
        if (rgOriginal) {
          desenharDigitosComEspaco(
            pages[0],
            rgOriginal,
            { x: positions.RG.x, y: positions.RG.y },
            15,
            helv,
            18 // espaçamento entre dígitos
          );
        }

        // Faça o mesmo para CPF dos dependentes, se necessário
        if (formData.dependents) {
          formData.dependents.forEach((dependent, index) => {
            if (index < 6 && dependent.CPF) {
              const depNum = index + 1;
              const positionKey = `FAMILIAR${depNum}_CPF`;
              const position = positions[positionKey];

              if (position) {
                // Desenhe CPF dos dependentes com o mesmo espaçamento especial
                desenharCPFComEspaco(
                  pages[position.page || 0],
                  dependent.CPF,
                  { x: position.x, y: position.y },
                  15,
                  helv,
                  18, // espaçamento normal
                  10  // espaçamento extra
                );
              }
            }
          });
        }
      } else {
        // Para outros contratos, use o processamento padrão para todos os campos
        Object.entries(formDataClone).forEach(([k, v]) => {
          const pos = positions[k];
          if (!v || !pos) return;
          (Array.isArray(pos) ? pos : [pos]).forEach(p => {
            const idx = p.page ?? 0;
            if (idx < pages.length)
              pages[idx].drawText(String(v), { x: p.x, y: p.y, size: 10, font: helv });
          });
        });
      }

      // Adiciona a assinatura
      if (positions.SIGN) {
        const img = await pdfDoc.embedPng(signatureBuffer);
        const w = 120;
        const h = (img.height / img.width) * w;
        const p = positions.SIGN;
        const idx = p.page ?? 0;
        if (idx < pages.length)
          pages[idx].drawImage(img, { x: p.x, y: p.y, width: w, height: h });
      }

      // Salva o PDF em bytes
      const pdfBytes = await pdfDoc.save();

      // Nome do arquivo para download e email
      const filename = `${label.replace(/\s+/g, '_')}-${formData.NOME || 'Contrato'}.pdf`;

      // Salva temporariamente no servidor para anexar ao email
      const output = path.join(tempDir, filename);
      fs.writeFileSync(output, pdfBytes);

      // Adiciona à lista de PDFs gerados para email
      generated.push({
        path: output,
        filename,
        label
      });

      // Armazena o buffer como base64 para enviar ao cliente para download
      pdfBuffers[filename] = Buffer.from(pdfBytes).toString('base64');
    }

    if (!generated.length)
      return res.status(400).json({ success: false, message: 'Nenhum PDF gerado' });

    // Envia os PDFs por email
    await sendEmailWithAttachments(formData.EMAIL, generated, formData.NOME);

    // Responde com sucesso e envia os PDFs gerados para download automático no frontend
    res.json({
      success: true,
      message: `${generated.length} PDFs enviados para ${formData.EMAIL}`,
      pdfs: pdfBuffers
    });

    // Limpa arquivos temporários depois de 1 minuto
    setTimeout(() => generated.forEach(f => fs.unlink(f.path, () => { })), 60_000);
  } catch (err) {
    console.error('Erro em /generate-pdfs', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ───────────────────────── helper para e-mail ─────────────────────────── */
async function sendEmailWithAttachments(destino, anexos, nome) {
  await transporter.sendMail({
    from: `AMPARE <${process.env.GMAIL_USER}>`,
    to: destino,
    cc: process.env.GMAIL_USER,
    subject: 'Seus contratos AMPARE',
    html: `<h2>Olá ${nome}</h2><p>Seguem anexos os contratos solicitados.</p>`,
    attachments: anexos.map(a => ({ filename: a.filename, path: a.path }))
  });
}

/* ───────────────────────────── start! ─────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✅  Servidor rodando em http://localhost:${PORT}`);
});