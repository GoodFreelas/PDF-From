import { PDFDocument, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { CONTRACT_FILES } from '../constants/contracts';

export async function generatePdf(id, data, sigBytes) {
  const { file, positions } = CONTRACT_FILES[id];
  const originalBytes = await fetch(file).then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(originalBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let pages = pdfDoc.getPages();

  // Make sure we have at least 2 pages if needed (for Vitalmed contract)
  if (id === 'vitalmed' && pages.length < 2) {
    pdfDoc.addPage();
    pages = pdfDoc.getPages(); // Refresh pages array after adding a new page
  }

  Object.entries(positions).forEach(([key, pos]) => {
    if (key === 'SIGN') return;
    const text = data[key] || '';

    if (Array.isArray(pos)) {
      pos.forEach(({ x, y, page = 0 }) => {
        if (pages[page]) pages[page].drawText(text, { x, y, size: 11, font: helvetica });
      });
    } else {
      const { x, y, page = 0 } = pos;
      if (pages[page]) pages[page].drawText(text, { x, y, size: 11, font: helvetica });
    }
  });

  if (positions.SIGN) {
    const pngImg = await pdfDoc.embedPng(sigBytes);
    const sigW = 120;
    const sigH = (pngImg.height / pngImg.width) * sigW;
    const { x, y, page: p = 0 } = positions.SIGN;
    if (pages[p]) pages[p].drawImage(pngImg, { x, y, width: sigW, height: sigH });
  }

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const fileName = `${CONTRACT_FILES[id].label.replace(/\s+/g, '_')} - ${data.NOME}.pdf`;
  saveAs(blob, fileName);
  return bytes;
}