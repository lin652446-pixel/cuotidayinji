import html2pdf from 'html2pdf.js';

export async function exportElementToPdf(elementId: string, filename: string = '错题举一反三特训卷.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('找不到可打印的元素');
  }

  // 1. Sanitize all <style> tags in document.head to remove oklch(...) before html2canvas parses CSS rules
  const styleTags = Array.from(document.querySelectorAll('style'));
  const originalContents = styleTags.map((tag) => tag.textContent || '');

  try {
    styleTags.forEach((tag) => {
      if (tag.textContent && tag.textContent.includes('oklch')) {
        tag.textContent = tag.textContent.replace(/oklch\([^)]+\)/gi, 'rgb(59, 130, 246)');
      }
    });

    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    // Execute html2pdf save promise
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.warn('html2pdf 客户端导出失败，尝试使用系统标准打印窗口/另存为PDF:', err);
    // Fallback: trigger system print dialog where user can choose "Save as PDF"
    window.print();
  } finally {
    // Restore original <style> contents
    styleTags.forEach((tag, idx) => {
      if (tag && originalContents[idx] !== undefined) {
        tag.textContent = originalContents[idx];
      }
    });
  }
}

