import { PDFDocument, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { CONTRACT_FILES } from '../constants/contracts';

/**
 * Gera um PDF preenchido com os dados do formulário
 * @param {string} id - ID do contrato (saude, qualidonto, vitalmed)
 * @param {Object} data - Dados do formulário
 * @param {Uint8Array} sigBytes - Assinatura em formato de imagem (bytes)
 * @returns {Promise<Uint8Array>} - PDF gerado em bytes
 */
export async function generatePdf(id, data, sigBytes) {
  const { file, pdfUrl, positions } = CONTRACT_FILES[id];
  let pdfDoc = null;

  // 1. Tenta carregar o PDF do backend local
  try {
    console.log(`Tentando carregar PDF de: ${pdfUrl}`);

    // Adiciona um timestamp para evitar cache
    const urlWithTimestamp = `${pdfUrl}?t=${Date.now()}`;

    const response = await fetch(urlWithTimestamp, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao carregar PDF: ${response.status} ${response.statusText}`);
    }

    const originalBytes = await response.arrayBuffer();
    if (!originalBytes || originalBytes.byteLength === 0) {
      throw new Error('PDF vazio ou inválido');
    }

    console.log(`PDF carregado com sucesso: ${originalBytes.byteLength} bytes`);
    pdfDoc = await PDFDocument.load(originalBytes);
  } catch (error) {
    console.error("Erro ao carregar PDF:", error);

    // Se falhar, tenta criar um novo documento PDF em branco
    alert(`Não foi possível carregar o contrato original. Criando um PDF em branco para ${CONTRACT_FILES[id].label}.`);

    pdfDoc = await PDFDocument.create();

    // Adiciona algumas páginas ao documento
    pdfDoc.addPage([612, 792]); // Tamanho carta
    if (id === 'vitalmed') {
      pdfDoc.addPage([612, 792]); // Adiciona segunda página para Vitalmed
    }
  }

  // 2. Continua para finalizar o PDF
  return await finalizePdf(pdfDoc, id, data, sigBytes, positions);
}

/**
 * Finaliza o processamento do PDF preenchendo os campos e adicionando a assinatura
 * @param {PDFDocument} pdfDoc - Documento PDF a ser preenchido
 * @param {string} id - ID do contrato
 * @param {Object} data - Dados do formulário
 * @param {Uint8Array} sigBytes - Assinatura em bytes
 * @param {Object} positions - Posições dos campos no PDF
 * @returns {Promise<Uint8Array>} - PDF finalizado em bytes
 */
async function finalizePdf(pdfDoc, id, data, sigBytes, positions) {
  try {
    // 1. Prepara a fonte para escrever no PDF
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 2. Obtém as páginas do PDF
    let pages = pdfDoc.getPages();

    // 3. Garante que temos pelo menos 2 páginas para o contrato Vitalmed
    if (id === 'vitalmed' && pages.length < 2) {
      pdfDoc.addPage();
      pages = pdfDoc.getPages(); // Atualiza o array de páginas
    }

    // 4. Preenche os campos de texto no PDF
    Object.entries(positions).forEach(([key, pos]) => {
      // Pula o campo de assinatura, que será tratado separadamente
      if (key === 'SIGN') return;

      // Obtém o valor do campo do formulário ou vazio se não existir
      let text = '';

      // Trata os campos dos dependentes
      if (key.startsWith('FAMILIAR') && data.dependents) {
        // Extrai o número do familiar e o nome do campo
        const matches = key.match(/FAMILIAR(\d+)_(.+)/);
        if (matches) {
          const [, depIndex, fieldName] = matches;
          const index = parseInt(depIndex, 10) - 1;

          // Verifica se o dependente existe no array e tem o campo solicitado
          if (data.dependents[index]) {
            text = data.dependents[index][fieldName] || '';
          }
        }
      } else {
        // Campos normais
        text = data[key] || '';
      }

      try {
        // Escreve o texto no PDF na posição correta
        if (Array.isArray(pos)) {
          // Múltiplas posições para o mesmo campo
          pos.forEach(({ x, y, page = 0 }) => {
            if (pages[page]) pages[page].drawText(text, { x, y, size: 11, font: helvetica });
          });
        } else {
          // Posição única
          const { x, y, page = 0 } = pos;
          if (pages[page]) pages[page].drawText(text, { x, y, size: 11, font: helvetica });
        }
      } catch (error) {
        console.error(`Erro ao escrever o campo ${key}:`, error);
      }
    });

    // 5. Adiciona a assinatura ao PDF
    if (positions.SIGN && sigBytes && sigBytes.length > 0) {
      try {
        // Incorpora a imagem da assinatura no documento
        const pngImg = await pdfDoc.embedPng(sigBytes);

        // Define o tamanho da assinatura
        const sigW = 120;
        const sigH = (pngImg.height / pngImg.width) * sigW;

        // Obtém a posição para a assinatura e desenha a imagem
        const { x, y, page: p = 0 } = positions.SIGN;
        if (pages[p]) pages[p].drawImage(pngImg, { x, y, width: sigW, height: sigH });
      } catch (error) {
        console.error("Erro ao adicionar assinatura:", error);
      }
    }

    // 6. Salva o documento modificado
    const bytes = await pdfDoc.save();

    // 7. Cria um blob para download e salva o arquivo
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const fileName = `${CONTRACT_FILES[id].label.replace(/\s+/g, '_')} - ${data.NOME || 'Contrato'}.pdf`;
    saveAs(blob, fileName);

    return bytes;
  } catch (error) {
    console.error("Erro ao finalizar PDF:", error);
    alert(`Erro ao gerar o PDF para ${CONTRACT_FILES[id].label}: ${error.message}`);
    return new Uint8Array(); // Retorna um array vazio em caso de erro
  }
}