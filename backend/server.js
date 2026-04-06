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
import extenso from 'extenso';

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
// ── SMTP e ADMIN_EMAIL são OBRIGATÓRIOS ──────────────────────────────────
const missingVars = [];
if (!process.env.SMTP_USER)     missingVars.push('SMTP_USER');
if (!process.env.SMTP_PASSWORD) missingVars.push('SMTP_PASSWORD');
if (!process.env.ADMIN_EMAIL)   missingVars.push('ADMIN_EMAIL');

if (missingVars.length > 0) {
  console.error('❌ ERRO FATAL: Variáveis de ambiente obrigatórias não configuradas:');
  missingVars.forEach(v => console.error(`   → ${v} está ausente`));
  console.error('Configure com: fly secrets set SMTP_USER=... SMTP_PASSWORD=... ADMIN_EMAIL=...');
  process.exit(1); // Derruba o servidor imediatamente
}

console.log(`✅ SMTP_USER:    ${process.env.SMTP_USER}`);
console.log(`✅ ADMIN_EMAIL:  ${process.env.ADMIN_EMAIL}`);
console.log('✅ SMTP_PASSWORD: configurado');

const transporter = nodemailer.createTransport({
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
});

// Verifica a conexão SMTP no startup
transporter.verify((err) => {
  if (err) {
    console.error('❌ SMTP verify falhou — não foi possível conectar ao servidor de email:');
    console.error(err.message);
    console.error('Verifique SMTP_USER, SMTP_PASSWORD e o host smtpi.ampare.org.br:587');
    process.exit(1); // Derruba o servidor se o SMTP não conectar
  } else {
    console.log('✅ Conexão SMTP verificada com sucesso — emails prontos para envio.');
  }
});

/* ──────────────────── diretório temporário local ─────────────────────── */
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

/* ───────────────────── mapas de contratos (PDFs) ─────────────────────── */
export const CONTRACT_FILES = {
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
      VALOR1: { x: 160, y: 497 }
    }
  },
  vitalmed: {
    label: 'Assistência Familiar (Vitalmed)',
    file: path.join(__dirname, 'public', 'contrato-vitalmed.pdf'),
    positions: {
      NOME: { x: 90, y: 154 },
      NASCIMENTO: { x: 320, y: 154 },
      CPF: { x: 75, y: 137 },
      RUA: { x: 102, y: 118 },
      NUMERO: { x: 320, y: 118 },
      COMPLEMENTO: { x: 120, y: 100 },
      BAIRRO: { x: 340, y: 100 },
      CEP: { x: 74, y: 82 },
      TELEFONE1: { x: 345, y: 82 },
      TELEFONE2: { x: 202, y: 82 },
      CIDADE: { x: 143, y: 63 },
      TELEFONE3: { x: 365, y: 64 },
      MATRICULA: { x: 153, y: 712, page: 1 },
      FAMILIAR1_NOME: { x: 70, y: 673, page: 1 },
      FAMILIAR1_NASCIMENTO: { x: 352, y: 673, page: 1 },
      FAMILIAR1_CPF: { x: 410, y: 673, page: 1 },
      FAMILIAR2_NOME: { x: 70, y: 660, page: 1 },
      FAMILIAR2_NASCIMENTO: { x: 352, y: 660, page: 1 },
      FAMILIAR2_CPF: { x: 410, y: 660, page: 1 },
      FAMILIAR3_NOME: { x: 70, y: 647, page: 1 },
      FAMILIAR3_NASCIMENTO: { x: 352, y: 647, page: 1 },
      FAMILIAR3_CPF: { x: 410, y: 647, page: 1 },
      FAMILIAR4_NOME: { x: 70, y: 634, page: 1 },
      FAMILIAR4_NASCIMENTO: { x: 352, y: 634, page: 1 },
      FAMILIAR4_CPF: { x: 410, y: 634, page: 1 },
      FAMILIAR5_NOME: { x: 70, y: 622, page: 1 },
      FAMILIAR5_NASCIMENTO: { x: 352, y: 622, page: 1 },
      FAMILIAR5_CPF: { x: 410, y: 622, page: 1 },
      FAMILIAR6_NOME: { x: 70, y: 609, page: 1 },
      FAMILIAR6_NASCIMENTO: { x: 352, y: 609, page: 1 },
      FAMILIAR6_CPF: { x: 410, y: 609, page: 1 },
      VALOR: { x: 120, y: 417, page: 1 },
      VALOR1: { x: 143, y: 408, page: 1 },
      DATA: { x: 120, y: 361, page: 1 },
      SIGN: { x: 85, y: 300, page: 1 },
    }
  },
  banco: {
    label: 'Autorização Débito (Banco)',
    file: path.join(__dirname, 'public', 'banco.pdf'),
    positions: {
      CPF_IDENTIFICACAO: { x: 255, y: 488 },
      NOME: { x: 70, y: 428 },
      CPF_BOX_CHARS: { x: 67, y: 376, spacing: 14.5, size: 14 },
      CNPJ_BOX_CHARS: { x: 283, y: 376, spacing: 14.7, spaceWidth: 5.3, size: 14 },
      AGENCIA: { x: 60, y: 335, spacing: 14.5, spaceWidth: 12, size: 14 },
      CONTA: { x: 260, y: 335, spacing: 14.5, spaceWidth: 12, size: 14 },
      VALOR: { x: 75, y: 288 },
      VALOR_EXTENSO: { x: 210, y: 288 },
      DATA_DIA: { x: 120, y: 231 },
      DATA_MES: { x: 155, y: 231 },
      DATA_ANO: { x: 205, y: 231 },
      SIGN: { x: 130, y: 165 },
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

    // Função para formatar CPF no padrão 555.555.555-55
    const formatarCPF = (cpf) => {
      if (!cpf) return '';
      // Remove tudo que não é número
      const numeros = cpf.replace(/\D/g, '');
      // Aplica a máscara de CPF
      if (numeros.length === 11) {
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return cpf; // Retorna original se não tiver 11 dígitos
    };

    for (const id of contratosArray) {
      const contrato = CONTRACT_FILES[id];
      if (!contrato) continue;

      const { file, positions, label } = contrato;

      // Lê o arquivo PDF do template
      const pdfDoc = await PDFDocument.load(fs.readFileSync(file));
      const pages = pdfDoc.getPages();
      const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 10;

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

      // Processa todos os campos normalmente (incluindo CPF formatado)
      let formDataClone = { ...formData };

      // Automação: Valor por Extenso
      if (formDataClone.VALOR) {
        // Remove R$ e limpa o valor numérico (1.500,00 -> 1500.00)
        let cleanValor = formDataClone.VALOR.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();
        const numValor = parseFloat(cleanValor);
        if (!isNaN(numValor)) {
          // Converte para extenso em português (reais)
          formDataClone.VALOR_EXTENSO = extenso(numValor, { mode: 'currency', currency: { type: 'BRL' } });
          // Ajuste fino para o formato da biblioteca (ex: "cinco reais" vs "cinco reais")
          // A lib extenso já faz um bom trabalho.
        }
      }

      // Automação: Decomposição de Data
      if (formDataClone.DATA) {
        const d = new Date(formDataClone.DATA + 'T12:00:00'); // Garante meio-dia para evitar fuso horário
        if (!isNaN(d.getTime())) {
          formDataClone.DATA_DIA = d.getDate().toString().padStart(2, '0');
          const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          formDataClone.DATA_MES = meses[d.getMonth()];
          formDataClone.DATA_ANO = d.getFullYear().toString();
        }
      }

      // Formata o CPF/CNPJ principal e cria os caracteres para as caixas
      const formatarCNPJ = (cnpj) => {
        const n = cnpj.replace(/\D/g, '');
        if (n.length === 14) return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        return cnpj;
      };

      if (formDataClone.CPF) {
        const rawCPF = formDataClone.CPF.replace(/\D/g, '');
        formDataClone.CPF_IDENTIFICACAO = formatarCPF(rawCPF);
        formDataClone.CPF_BOX_CHARS = rawCPF.substring(0, 9) + "  " + rawCPF.substring(9, 11);
      }

      if (formDataClone.CNPJ) {
        const rawCNPJ = formDataClone.CNPJ.replace(/\D/g, '');
        if (rawCNPJ.length === 14) {
          formDataClone.CNPJ_BOX_CHARS = rawCNPJ.substring(0, 8) + "  " + rawCNPJ.substring(8, 12) + "    " + rawCNPJ.substring(12, 14);
        }
      }

      if (formDataClone.AGENCIA) {
        formDataClone.AGENCIA = formDataClone.AGENCIA.replace('-', '  ');
      }
      if (formDataClone.CONTA) {
        formDataClone.CONTA = formDataClone.CONTA.replace('-', '  ');
      }

      // Mantém lógica vitalmed original
      if (formDataClone.CPF) {
        formDataClone.CPF = formatarCPF(formDataClone.CPF);
      }

      // Adiciona CPFs dos dependentes aos dados do formulário (vitalmed)
      if (id === 'vitalmed' && formData.dependents) {
        formData.dependents.forEach((dependent, index) => {
          if (index < 6 && dependent.CPF) {
            const depNum = index + 1;
            formDataClone[`FAMILIAR${depNum}_CPF`] = formatarCPF(dependent.CPF);
          }
        });
      }

      // Desenha todos os campos de texto
      Object.entries(formDataClone).forEach(([k, v]) => {
        const pos = positions[k];
        if (!v || !pos) return;
        (Array.isArray(pos) ? pos : [pos]).forEach(p => {
          const idx = p.page ?? 0;
          if (p.spacing) {
            const text = String(v);
            let curX = p.x;
            for (let i = 0; i < text.length; i++) {
              if (text[i] !== ' ') {
                pages[idx].drawText(text[i], { x: curX, y: p.y, size: p.size || fontSize, font: helv });
              }
              // Avança o X: se for espaço usa spaceWidth (fallback spacing), se for letra usa spacing
              curX += (text[i] === ' ') ? (p.spaceWidth || p.spacing) : p.spacing;
            }
          } else {
            pages[idx].drawText(String(v), { x: p.x, y: p.y, size: p.size || fontSize, font: helv });
          }
        });
      });

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

    // Se email falhou, retorna erro 500 — NÃO confirma para o usuário
    if (!emailResult.emailSent) {
      return res.status(500).json({
        success: false,
        message: `PDFs gerados mas falha no envio do email ao administrador. Erro: ${emailResult.error || 'desconhecido'}. Tente novamente.`
      });
    }

    // Responde com sucesso apenas se o email foi enviado
    res.json({
      success: true,
      message: `${generated.length} PDFs enviados com sucesso para o administrador.`
    });
  } catch (err) {
    console.error('Erro em /generate-pdfs', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ───────────────────────── helper para e-mail APENAS ADMIN ─────────────────────────────── */
async function sendEmailToAdmin(anexos, formData) {
  // Transporter sempre existe (obrigatório desde o startup)
  try {
    const ADMIN_EMAILS = process.env.ADMIN_EMAIL;

    console.log(`📧 Tentando enviar email para: ${ADMIN_EMAILS}`);

    await transporter.sendMail({
      from: `AMPARE <${process.env.SMTP_USER || 'noreply@ampare.org.br'}>`,
      to: ADMIN_EMAILS,
      subject: `Nova Adesão - ${formData.NOME}`,
      html: `
        <h2>Nova Solicitação Recebida</h2>
        <p><strong>Nome:</strong> ${formData.NOME || 'Não informado'}</p>
        <p><strong>Email:</strong> ${formData.EMAIL || 'Não informado'}</p>
        <p><strong>CPF:</strong> ${formData.CPF || 'Não informado'}</p>
        ${formData.CNPJ ? `<p><strong>CNPJ:</strong> ${formData.CNPJ}</p>` : ''}
        ${formData.TELEFONE1 ? `<p><strong>Telefone:</strong> ${formData.TELEFONE1}</p>` : ''}
        ${formData.EMPRESA ? `<p><strong>Empresa:</strong> ${formData.EMPRESA}</p>` : ''}
        
        ${formData.AGENCIA ? `
          <h3>Dados Bancários (Autorização de Débito)</h3>
          <p><strong>Agência:</strong> ${formData.AGENCIA}</p>
          <p><strong>Conta:</strong> ${formData.CONTA}</p>
          <p><strong>Valor:</strong> ${formData.VALOR}</p>
        ` : ''}

        <p><strong>Contratos Selecionados:</strong></p>
        <ul>
          ${anexos.map(a => `<li>${a.label}</li>`).join('')}
        </ul>
        <p>Os documentos preenchidos e assinados seguem em anexo.</p>
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