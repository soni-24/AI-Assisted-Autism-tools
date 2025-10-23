// PDF generation utilities

/**
 * Sanitize AI output text
 * @param {string} s - Text to sanitize
 * @returns {string} Cleaned text
 */
export const sanitizeText = (s) => {
    return s ? String(s).replace(/```json|```/g, "").trim() : "";
};

/**
 * Build HTML content for PDF
 * @param {Object} formData - Child information
 * @param {Object} result - AI analysis results
 * @returns {string} HTML content
 */
export const buildPdfHtml = (formData, result) => {
    const name = formData.childName || "Child";
    let html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Assessment - ${name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          h1 { font-size: 24px; margin-bottom: 10px; }
          h2 { font-size: 20px; margin-top: 15px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          td { padding: 8px; border: 1px solid #eee; }
          td:first-child { font-weight: bold; background-color: #f9f9f9; }
          ul { padding-left: 20px; list-style-type: disc; }
          li { margin-bottom: 5px; }
          pre { background-color: #f0f0f0; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Child Behavioral Assessment Report</h1>
        <p>Report generated on: ${new Date().toLocaleDateString()}</p>
        <h2>Child Information</h2>
        <table>
          <tr><td>Name</td><td>${name}</td></tr>
          <tr><td>Age</td><td>${formData.childAge || "N/A"}</td></tr>
          <tr><td>Eye Contact</td><td>${formData.eyeContact || "N/A"}</td></tr>
          <tr><td>Speech Level</td><td>${formData.speechLevel || "N/A"}</td></tr>
          <tr><td>Social Response</td><td>${formData.socialResponse || "N/A"}</td></tr>
          <tr><td>Sensory Reactions</td><td>${formData.sensoryReactions || "N/A"}</td></tr>
        </table>
        <h2>AI Analysis and Recommendations</h2>
    `;

    if (!result) {
        html += "<p>No AI analysis available.</p>";
    } else {
        // ONLY Therapy Goals and Activities - NO EMOTION DATA
        if (result.therapyGoals?.length) 
            html += `<h3>Therapy Goals</h3><ul>${result.therapyGoals.map((g) => `<li>${g}</li>`).join("")}</ul>`;
        if (result.suggestedActivities?.length)
            html += `<h3>Suggested Activities</h3><ul>${result.suggestedActivities.map((a) => `<li>${a}</li>`).join("")}</ul>`;

        // Exclude emotion data from PDF
        const remaining = { ...result };
        delete remaining.therapyGoals;
        delete remaining.suggestedActivities;
        delete remaining.emotionData; // REMOVE EMOTION DATA FROM PDF
        
        // Only show remaining data if there's something other than emotion
        if (Object.keys(remaining).length) 
            html += `<h3>Other Details</h3><pre>${sanitizeText(JSON.stringify(remaining, null, 2))}</pre>`;
    }

    html += "</body></html>";
    return html;
};

/**
 * Generate and download PDF
 * @param {Object} formData - Child information
 * @param {Object} aiResults - AI analysis results
 * @returns {Promise<void>}
 */
export const generatePdf = async (formData, aiResults) => {
    // Load html2pdf library if not loaded
    if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const filename = `${(formData.childName || "analysis").replace(/\s+/g, "_")}_Assessment.pdf`;
    const html = buildPdfHtml(formData, aiResults);

    // Create temporary container
    const container = document.createElement("div");
    container.style.cssText = "padding: 20px; background: white; width: 794px;";
    container.innerHTML = html;
    document.body.appendChild(container);

    const options = {
        margin: 0.4,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate and download PDF
    await window.html2pdf().set(options).from(container).save();

    // Cleanup
    document.body.removeChild(container);
};
