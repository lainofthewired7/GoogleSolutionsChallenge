import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { createRoot } from 'react-dom/client';
import React from 'react';

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
    // We add skipFonts: true as a fallback because Google Fonts can cause
    // a TypeError in html-to-image's font weight parser (CORS related).
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2, 
      cacheBust: true,
      skipFonts: false, // Try with fonts first (index.html has preconnect now)
      style: {
        background: '#0f172a',
        color: '#f8fafc' 
      },
      filter: (node) => {
        if (node instanceof HTMLElement && node.innerText?.includes('Export PDF')) return false;
        return true;
      }
    }).catch(async (err) => {
        // If it fails with the specific font error, retry without fonts
        if (err.message?.includes('trim') || err.message?.includes('font')) {
            console.warn("Font parsing failed, retrying without web fonts...");
            return toPng(element, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: true, // Fallback to system fonts
                style: {
                    background: '#0f172a',
                    color: '#f8fafc'
                }
            });
        }
        throw err;
    });

    // 2. Create jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate dimensions to fit the A4 page
    const imgWidth = 210; 
    const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
    
    // Add the image to the PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // 3. Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error: any) {
    console.error('PDF Export failed:', error);
    alert(`PDF Export failed: ${error.message || 'Unknown error'}. Try using a Chromium-based browser.`);
  }
}

/**
 * Advanced Stat Sheet Export
 * Renders a React component off-screen, captures it, and exports.
 */
export async function exportStatSheet(
  component: React.ReactElement,
  filename: string
): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.id = 'report-capture-container';
  document.body.appendChild(container);

  const root = createRoot(container);
  
  try {
    // Render the component
    root.render(component);
    
    // Wait for render/images/fonts
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const element = container.firstChild as HTMLElement;
    if (!element) throw new Error("Failed to render report component.");

    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 3, // Ultra high resolution for print
      skipFonts: false,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);

  } catch (error: any) {
    console.error('Stat Sheet Export failed:', error);
    alert(`Report generation failed: ${error.message}`);
  } finally {
    // Cleanup
    setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
    }, 1000);
  }
}
