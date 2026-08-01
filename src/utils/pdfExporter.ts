import html2pdf from 'html2pdf.js';

export async function exportElementToPdf(elementId: string, filename: string = '错题举一反三特训卷.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('找不到可打印的元素');
  }

  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  return html2pdf().set(opt).from(element).save();
}
