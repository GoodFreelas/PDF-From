// Importações necessárias
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const upload = multer();

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public')); // Para servir arquivos estáticos

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro serviço de sua preferência
  auth: {
    user: 'dionatha.work@gmail.com', // substitua pelo seu email
    pass: 'uykp sgqz sfjj alrt' // use uma senha de aplicativo para o Gmail
  }
});

// Pasta para armazenar PDFs temporários
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Configuração dos contratos
const CONTRACT_FILES = {
  saude: {
    label: 'Seguro-Saúde',
    file: path.join(__dirname, 'public', 'AMPARE_TERMO_ADESAO_SAUDE.pdf'),
    positions: {
      NOME: [{ x: 80, y: 720 }, { x: 80, y: 530 }],
      RG: { x: 90, y: 700 },
      CPF: { x: 380, y: 700 },
      EMPRESA: { x: 100, y: 120 },
      RUA: { x: 100, y: 120 },
      NUMERO: { x: 100, y: 120 },
      COMPLEMENTO: { x: 100, y: 120 },
      BAIRRO: { x: 100, y: 120 },
      CIDADE: { x: 100, y: 120 },
      ESTADO: { x: 100, y: 120 },
      CEP: { x: 100, y: 120 },
      TELEFONE1: { x: 100, y: 120 },
      TELEFONE2: { x: 100, y: 120 },
      TELEFONE3: { x: 100, y: 120 },
      NASCIMENTO: { x: 100, y: 120 },
      MATRICULA: { x: 100, y: 120 },
      ORGAO: { x: 100, y: 120 },
      CARGO: { x: 100, y: 120 },
      ADMISSAO: { x: 100, y: 120 },
      PIS: { x: 100, y: 120 },
      EMAIL: { x: 100, y: 120 },
      DATA: { x: 100, y: 120 },
      SIGN: { x: 100, y: 120 },
    }
  },
  qualidonto: {
    label: 'Plano Odontológico',
    file: path.join(__dirname, 'public', 'AMPARE_TERMO_ADESAO_QUALIDONTO.pdf'),
    positions: {
      NOME: { x: 80, y: 715 },
      RG: { x: 90, y: 695 },
      CPF: { x: 380, y: 695 },
      SIGN: { x: 100, y: 110 }
    }
  },
  vitalmed: {
    label: 'Assistência Familiar (Vitalmed)',
    file: path.join(__dirname, 'public', 'TERMO_ADESAO_VITALMED.pdf'),
    positions: {
      NOME: { x: 100, y: 640 },
      RG: { x: 350, y: 640 },
      CPF: { x: 100, y: 620 },
      // Campos para familiares
      FAMILIAR1_NOME: { x: 100, y: 500 },
      FAMILIAR1_CPF: { x: 300, y: 500 },
      FAMILIAR1_RG: { x: 450, y: 500 },
      FAMILIAR1_NASCIMENTO: { x: 100, y: 480 },
      FAMILIAR1_PARENTESCO: { x: 300, y: 480 },

      FAMILIAR2_NOME: { x: 100, y: 450 },
      FAMILIAR2_CPF: { x: 300, y: 450 },
      FAMILIAR2_RG: { x: 450, y: 450 },
      FAMILIAR2_NASCIMENTO: { x: 100, y: 430 },
      FAMILIAR2_PARENTESCO: { x: 300, y: 430 },

      FAMILIAR3_NOME: { x: 100, y: 400 },
      FAMILIAR3_CPF: { x: 300, y: 400 },
      FAMILIAR3_RG: { x: 450, y: 400 },
      FAMILIAR3_NASCIMENTO: { x: 100, y: 380 },
      FAMILIAR3_PARENTESCO: { x: 300, y: 380 },

      SIGN: { x: 100, y: 160 }
    }
  }
};

// Rota para processar o formulário, gerar PDFs e enviar emails
app.post('/generate-pdfs', upload.none(), async (req, res) => {
  try {
    const { formData, signatureData, contratos } = req.body;
    const contratosArray = contratos.split(',');

    // Converter a imagem da assinatura de base64 para buffer
    const signatureBase64 = signatureData.replace(/^data:image\/png;base64,/, '');
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');

    // Array para armazenar os caminhos dos PDFs gerados
    const generatedPDFs = [];

    // Gerar PDFs para cada contrato selecionado
    for (const id of contratosArray) {
      if (!CONTRACT_FILES[id]) continue;

      const { file, positions, label } = CONTRACT_FILES[id];

      // Carregar o PDF modelo
      const existingBytes = fs.readFileSync(file);
      const pdfDoc = await PDFDocument.load(existingBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 10;

      // Preencher campos de texto
      for (const [key, value] of Object.entries(formData)) {
        const pos = positions[key];
        if (!pos) continue;

        const posArray = Array.isArray(pos) ? pos : [pos];
        posArray.forEach(p => {
          if (value) {
            const pageIndex = p.page || 0;
            if (pageIndex < pages.length) {
              pages[pageIndex].drawText(String(value), {
                x: p.x,
                y: p.y,
                size: fontSize,
                font
              });
            }
          }
        });
      }

      // Adicionar assinatura se houver posição para ela
      if (positions.SIGN) {
        const pngImg = await pdfDoc.embedPng(signatureBuffer);
        const sigW = 120;
        const sigH = (pngImg.height / pngImg.width) * sigW;

        const signPage = positions.SIGN.page || 0;
        if (signPage < pages.length) {
          pages[signPage].drawImage(pngImg, {
            x: positions.SIGN.x,
            y: positions.SIGN.y,
            width: sigW,
            height: sigH
          });
        }
      }

      // Salvar o PDF gerado
      const pdfBytes = await pdfDoc.save();
      const outputPath = path.join(tempDir, `Contrato_${id}_Preenchido.pdf`);
      fs.writeFileSync(outputPath, pdfBytes);

      generatedPDFs.push({
        path: outputPath,
        filename: `Contrato_${id}_Preenchido.pdf`,
        label: label
      });
    }

    // Enviar email com os PDFs em anexo
    if (generatedPDFs.length > 0) {
      await sendEmailWithAttachments(formData.EMAIL, generatedPDFs, formData.NOME);
    }

    // Resposta para o cliente
    res.json({
      success: true,
      message: `${generatedPDFs.length} PDFs foram gerados e enviados por email.`
    });

    // Limpar arquivos temporários após alguns segundos
    setTimeout(() => {
      generatedPDFs.forEach(pdf => {
        fs.unlink(pdf.path, err => {
          if (err) console.error(`Erro ao excluir arquivo temporário: ${err}`);
        });
      });
    }, 60000); // Remove após 1 minuto

  } catch (error) {
    console.error('Erro ao processar o formulário:', error);
    res.status(500).json({
      success: false,
      message: 'Ocorreu um erro ao processar o formulário',
      error: error.message
    });
  }
});

// Função para enviar email com anexos
async function sendEmailWithAttachments(recipientEmail, attachments, nomeAssociado) {
  const attachmentsConfig = attachments.map(attachment => ({
    filename: attachment.filename,
    path: attachment.path
  }));

  const contractNames = attachments.map(a => a.label).join(', ');

  // Email para o associado
  await transporter.sendMail({
    from: '"AMPARE Associação" <seu-email@gmail.com>',
    to: recipientEmail,
    cc: 'dionatha.work@gmail.com',
    subject: 'Seus contratos da AMPARE',
    html: `
      <h2>Olá ${nomeAssociado},</h2>
      <p>Agradecemos por escolher a AMPARE! Seus contratos estão anexados a este email:</p>
      <ul>
        ${attachments.map(a => `<li>${a.label}</li>`).join('')}
      </ul>
      <p>Em caso de dúvidas, entre em contato conosco.</p>
      <p>Atenciosamente,<br>Equipe AMPARE</p>
    `,
    attachments: attachmentsConfig
  });

  console.log(`Email enviado para ${recipientEmail} e dionatha.work@gmail.com com ${attachments.length} anexos`);
}

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});