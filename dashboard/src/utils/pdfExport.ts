import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Captures a DOM element and exports it as a PDF.
 * Uses html-to-image for better compatibility with modern CSS (oklch/oklab).
 * @param elementId The ID of the HTML element to capture.
 * @param filename The name of the resulting file (without extension).
 */
export async function exportToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for PDF export.`);
    return;
  }

  try {
    // 1. Capture the element as a PNG using html-to-image
    // This library is much more robust with modern CSS filters and colors.
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2, // Retain high quality
      cacheBust: true,
      style: {
        // Force the background to be visible during capture if it's transparent
        background: '#0f172a' 
      },
      // Ensure all filters are processed
      filter: (node) => {
        // Exclude specific elements like the export button itself if needed
        if (node instanceof HTMLElement && node.innerText?.includes('Export PDF')) return false;
        return true;
      }
    });

    // 2. Create jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate dimensions to fit the A4 page
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
    
    // Add the image to the PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // 3. Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error: any) {
    console.error('PDF Export failed:', error);
    // Fallback if the user's browser is extremely restricted
    if (error.message?.includes('oklab')) {
        alert("Your browser is using a PDF engine that doesn't support modern colors. We recommend using Chrome or Edge for the best experience.");
    }
  }
}
