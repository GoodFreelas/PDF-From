/**************************************************************************
 *  server.js — AMPARE PDF-Form (Versão sem download e email só admin)
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
const PORT = process.env.PORT || 8080;

/* ────────────────────────────── CORS ────────────────────────────────────*/
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'https://pdf-from.vercel.app',
  'https://pdf-from.fly.dev',
  'https://www.pdf-from.vercel.app',
  'https://ampare.org.br',
  'https://ampare-pdf-backend.fly.dev',
  // Adicionar mais domínios comuns para desenvolvimento
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://localhost:5173',
  'https://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Permitir requisições sem origin (curl, Postman, etc.)
      if (!origin) return cb(null, true);

      // Permitir origens da lista
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // Para desenvolvimento local, permitir qualquer localhost
      if (origin && (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://127.0.0.1:')
      )) {
        console.log(`🔓 Permitindo origin de desenvolvimento: ${origin}`);
        return cb(null, true);
      }

      // Log da origem rejeitada para debug
      console.log(`❌ Origin rejeitada: ${origin}`);
      return cb(new Error(`Origin ${origin} não permitida pelo CORS`));
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
// Verificar se as credenciais SMTP estão definidas
if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.warn('⚠️  Credenciais SMTP não configuradas. Email será desabilitado.');
}

const transporter = process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
    host: 'smtpi.ampare.org.br',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  })
  : null;

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
      SIGN: { x: 92, y: 125 },
      VALOR: { x: 155, y: 498 }
    }
  },
  vitalmed: {
    label: 'Assistência Familiar (Vitalmed)',
    file: path.join(__dirname, 'public', 'contrato-vitalmed.pdf'),
    positions: {
      NOME: { x: 90, y: 154 },
      NASCIMENTO: { x: 320, y: 154 },
      CPF: { x: 75, y: 137 },
      RUA: { x: 105, y: 118 },
      NUMERO: { x: 320, y: 118 },
      COMPLEMENTO: { x: 120, y: 100 },
      BAIRRO: { x: 210, y: 100 },
      CEP: { x: 74, y: 82 },
      TELEFONE1: { x: 360, y: 82 },
      TELEFONE2: { x: 200, y: 82 },
      CIDADE: { x: 143, y: 64 },
      TELEFONE3: { x: 365, y: 64 },
      MATRICULA: { x: 153, y: 714, page: 1 },
      FAMILIAR1_NOME: { x: 70, y: 673, page: 1 },
      FAMILIAR1_NASCIMENTO: { x: 352, y: 673, page: 1 },
      FAMILIAR1_CPF: { x: 410, y: 673, page: 1 },
      FAMILIAR2_NOME: { x: 70, y: 662, page: 1 },
      FAMILIAR2_NASCIMENTO: { x: 352, y: 662, page: 1 },
      FAMILIAR2_CPF: { x: 410, y: 662, page: 1 },
      FAMILIAR3_NOME: { x: 70, y: 648, page: 1 },
      FAMILIAR3_NASCIMENTO: { x: 352, y: 648, page: 1 },
      FAMILIAR3_CPF: { x: 410, y: 648, page: 1 },
      FAMILIAR4_NOME: { x: 70, y: 634, page: 1 },
      FAMILIAR4_NASCIMENTO: { x: 352, y: 634, page: 1 },
      FAMILIAR4_CPF: { x: 410, y: 634, page: 1 },
      FAMILIAR5_NOME: { x: 70, y: 622, page: 1 },
      FAMILIAR5_NASCIMENTO: { x: 352, y: 622, page: 1 },
      FAMILIAR5_CPF: { x: 410, y: 622, page: 1 },
      FAMILIAR6_NOME: { x: 70, y: 610, page: 1 },
      FAMILIAR6_NASCIMENTO: { x: 352, y: 610, page: 1 },
      FAMILIAR6_CPF: { x: 410, y: 610, page: 1 },
      VALOR: { x: 200, y: 416, page: 1 },
      DATA: { x: 120, y: 370, page: 1 },
      SIGN: { x: 85, y: 310, page: 1 },
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

    // Função para limpar CPF/RG (remover pontos, traços, espaços)
    const limparDocumento = (doc) => doc ? doc.replace(/[^\d]/g, '') : '';

    // Função para desenhar CPF com espaçamento especial para os últimos 2 dígitos
    const desenharCPFComEspaco = (page, cpf, posicaoBase, tamanho, font, espacamentoNormal, espacamentoFinal) => {
      const digitos = limparDocumento(cpf);

      if (digitos.length === 11) {
        const primeiros9 = digitos.substring(0, 9);
        const ultimos2 = digitos.substring(9);

        primeiros9.split('').forEach((digito, index) => {
          const x = posicaoBase.x + (index * espacamentoNormal);
          page.drawText(digito, {
            x,
            y: posicaoBase.y,
            size: tamanho,
            font
          });
        });

        ultimos2.split('').forEach((digito, index) => {
          const x = posicaoBase.x + (9 * espacamentoNormal) + espacamentoFinal + (index * espacamentoNormal);
          page.drawText(digito, {
            x,
            y: posicaoBase.y,
            size: tamanho,
            font
          });
        });
      } else {
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
          if (index < 6) {
            const depNum = index + 1;
            formData[`FAMILIAR${depNum}_NOME`] = dependent.NOME || '';
            formData[`FAMILIAR${depNum}_NASCIMENTO`] = dependent.NASCIMENTO || '';
          }
        });
      }

      // Tratamento especial para CPF e RG no contrato vitalmed
      let formDataClone = { ...formData };

      if (id === 'vitalmed') {
        const cpfOriginal = formDataClone.CPF;

        delete formDataClone.CPF;

        Object.entries(formDataClone).forEach(([k, v]) => {
          const pos = positions[k];
          if (!v || !pos) return;
          (Array.isArray(pos) ? pos : [pos]).forEach(p => {
            const idx = p.page ?? 0;
            if (idx < pages.length)
              pages[idx].drawText(String(v), { x: p.x, y: p.y, size: 10, font: helv });
          });
        });

        if (cpfOriginal) {
          desenharCPFComEspaco(
            pages[0],
            cpfOriginal,
            { x: positions.CPF.x, y: positions.CPF.y },
            10,
            helv,
            12,
            6
          );
        }

        if (formData.dependents) {
          formData.dependents.forEach((dependent, index) => {
            if (index < 6 && dependent.CPF) {
              const depNum = index + 1;
              const positionKey = `FAMILIAR${depNum}_CPF`;
              const position = positions[positionKey];

              if (position) {
                desenharCPFComEspaco(
                  pages[position.page || 0],
                  dependent.CPF,
                  { x: position.x, y: position.y },
                  10,
                  helv,
                  12,
                  6
                );
              }
            }
          });
        }
      } else {
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

      // Nome do arquivo para anexar ao email
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
    }

    if (!generated.length)
      return res.status(400).json({ success: false, message: 'Nenhum PDF gerado' });

    // Envia os PDFs APENAS para o email do administrador (se configurado)
    const emailResult = await sendEmailToAdmin(generated, formData);

    // Se o email foi enviado com sucesso, exclui os arquivos imediatamente
    if (emailResult.emailSent) {
      console.log('🗑️  Excluindo arquivos temporários após envio bem-sucedido do email...');
      generated.forEach(file => {
        try {
          fs.unlinkSync(file.path); // Exclusão síncrona imediata
          console.log(`✅ Arquivo excluído: ${file.filename}`);
        } catch (err) {
          console.error(`❌ Erro ao excluir ${file.filename}:`, err.message);
        }
      });
    } else {
      // Se o email falhou, mantém os arquivos por 10 minutos como backup
      console.log('⚠️  Email não foi enviado. Mantendo arquivos temporários por 10 minutos...');
      setTimeout(() => {
        generated.forEach(file => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(`🗑️  Arquivo de backup excluído: ${file.filename}`);
            }
          } catch (err) {
            console.error(`❌ Erro ao excluir backup ${file.filename}:`, err.message);
          }
        });
      }, 10 * 60 * 1000); // 10 minutos
    }

    // Responde com sucesso (sem enviar PDFs para download)
    res.json({
      success: true,
      message: emailResult.emailSent
        ? `${generated.length} PDFs enviados para o administrador e arquivos temporários excluídos`
        : `${generated.length} PDFs gerados. ${emailResult.error ? 'Erro no email: ' + emailResult.error : 'Email não configurado'}`
    });

    // Não precisa mais do setTimeout aqui, pois os arquivos são excluídos imediatamente após o envio
    // ou mantidos por 10 minutos se o email falhar
  } catch (err) {
    console.error('Erro em /generate-pdfs', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ───────────────────────── helper para e-mail APENAS ADMIN ─────────────────────────────── */
async function sendEmailToAdmin(anexos, formData) {
  // Verificar se o transporter está configurado
  if (!transporter) {
    console.warn('⚠️  Email não configurado. PDFs salvos apenas no servidor.');
    return { emailSent: false };
  }

  try {
    // Email fixo do administrador - substitua pelo seu email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@ampare.org.br';

    console.log(`📧 Tentando enviar email para: ${ADMIN_EMAIL}`);

    // Verificar se temos um destinatário válido
    if (!ADMIN_EMAIL || ADMIN_EMAIL.trim() === '') {
      throw new Error('Email do administrador não configurado');
    }

    await transporter.sendMail({
      from: `AMPARE <${process.env.SMTP_USER || 'noreply@ampare.org.br'}>`,
      to: ADMIN_EMAIL,
      subject: `Nova Adesão - ${formData.NOME}`,
      html: `
        <h2>Nova Adesão Recebida</h2>
        <p><strong>Nome:</strong> ${formData.NOME}</p>
        <p><strong>Email do Cliente:</strong> ${formData.EMAIL}</p>
        <p><strong>CPF:</strong> ${formData.CPF}</p>
        <p><strong>Telefone:</strong> ${formData.TELEFONE1}</p>
        <p><strong>Empresa:</strong> ${formData.EMPRESA}</p>
        <p><strong>Contratos Selecionados:</strong></p>
        <ul>
          ${anexos.map(a => `<li>${a.label}</li>`).join('')}
        </ul>
        <p>Os contratos preenchidos seguem em anexo.</p>
      `,
      attachments: anexos.map(a => ({ filename: a.filename, path: a.path }))
    });

    console.log('✅ Email enviado com sucesso para o administrador');
    return { emailSent: true };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { emailSent: false, error: error.message };
  }
}

/* ───────────────────────────── start! ─────────────────────────────────── */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌍 Acessível externamente via Fly.io`);
});