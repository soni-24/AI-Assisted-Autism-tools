// App.jsx
import React, { useState } from "react";

const App = () => {
    const [currentPage, setCurrentPage] = useState("form");
    const [formData, setFormData] = useState({
        childName: "",
        childAge: "",
        eyeContact: "",
        speechLevel: "",
        socialResponse: "",
        sensoryReactions: "",
    });
    const [aiResults, setAiResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // -----------------------
    // Form input handler
    // -----------------------
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // -----------------------
    // Sanitize AI output
    // -----------------------
    const sanitizeText = (s) => (s ? String(s).replace(/```json|```/g, "").trim() : "");

    // -----------------------
    // AI Analysis Handler
    // -----------------------
    const analyzeWithAI = async (e) => {
        e.preventDefault();

        // Check if user filled mandatory fields
        const isFormFilled = formData.childName && formData.childAge && formData.eyeContact && formData.speechLevel && formData.socialResponse && formData.sensoryReactions;
        if (!isFormFilled) {
            setError("Please fill in all the fields before analyzing.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Call backend /analyze endpoint
            const res = await fetch(`${import.meta.env.VITE_API_KEY}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error(await res.text());
            const aiOutput = await res.json();

            // Only set aiResults if AI returned actual results
            if (aiOutput && Object.keys(aiOutput).length > 0) {
                setAiResults(aiOutput);
                
                // Save to backend Firebase asynchronously
                fetch(`${import.meta.env.VITE_API_KEY}/save-conversation`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        childData: formData,
                        analysis: aiOutput
                    }),
                }).catch((err) => console.error("Failed to save assessment:", err));

                // Show results immediately
                setCurrentPage("results");
            } else {
                setAiResults(null);
                setError("No analysis returned from AI.");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Analysis failed. Check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    // -----------------------
    // PDF generation
    // -----------------------
    const buildPdfHtml = (result) => {
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
            if (result.therapyGoals?.length) html += `<h3>Therapy Goals</h3><ul>${result.therapyGoals.map((g) => `<li>${g}</li>`).join("")}</ul>`;
            if (result.suggestedActivities?.length)
                html += `<h3>Suggested Activities</h3><ul>${result.suggestedActivities.map((a) => `<li>${a}</li>`).join("")}</ul>`;

            const remaining = { ...result };
            delete remaining.therapyGoals;
            delete remaining.suggestedActivities;
            if (Object.keys(remaining).length) html += `<h3>Other Details</h3><pre>${sanitizeText(JSON.stringify(remaining, null, 2))}</pre>`;
        }

        html += "</body></html>";
        return html;
    };

    const generatePdf = async (result) => {
        if (!result && currentPage === "results") {
            setError("No analysis results to download. Please analyze first.");
            return;
        }

        try {
            // Load html2pdf if not loaded yet
            if (!window.html2pdf) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement("script");
                    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }

            const filename = `${(formData.childName || "analysis").replace(/\s+/g, "_")}_Assessment.pdf`;
            const html = buildPdfHtml(result || formData);

            // Create container and append
            const container = document.createElement("div");
            container.style.cssText = "padding: 20px; background: white; width: 794px;";
            container.innerHTML = html;
            document.body.appendChild(container);

            const opt = {
                margin: 0.4,
                filename,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            };

            // Generate and download PDF
            await window.html2pdf().set(opt).from(container).save();

            // Cleanup
            document.body.removeChild(container);
        } catch (e) {
            console.error("PDF generation error:", e);
            setError("PDF generation failed. Check console.");
        }
    };

    return (
        <div className="min-h-screen p-6 bg-slate-100 font-sans">
            <main className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center drop-shadow-md">
                    Child Behavioral Screening
                </h1>
                {currentPage === 'form' ? (
                    <section className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-200/50 transition-all duration-300 border border-indigo-100">
                        <h2 className="text-2xl font-semibold mb-6 text-indigo-600 border-b pb-3">Enter Child Observations</h2>
                        <form onSubmit={analyzeWithAI} className="space-y-5">

                            {/* Input: Child Name */}
                            <label className="block">
                                <div className="text-sm font-medium mb-1 text-gray-700">Child's Name</div>
                                <input id="childName" name="childName" value={formData.childName} onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="child name" required />
                            </label>

                            {/* Input: Child Age */}
                            <label className="block">
                                <div className="text-sm font-medium mb-1 text-gray-700">Child's Age (Years)</div>
                                <input id="childAge" name="childAge" type="number" min="1" value={formData.childAge} onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 transition-colors" placeholder="e.g., 5" required />
                            </label>

                            {/* Select: Eye Contact */}
                            <label className="block">
                                <div className="text-sm font-medium mb-1 text-gray-700">Eye Contact Observation</div>
                                <select name="eyeContact" value={formData.eyeContact} onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" required>
                                    <option value="">-- Select an observation --</option>
                                    <option>Consistent</option>
                                    <option>Moderate</option>
                                    <option>Minimal/Avoidant</option>
                                </select>
                            </label>

                            {/* Select: Speech Level */}
                            <label className="block">
                                <div className="text-sm font-medium mb-1 text-gray-700">Speech Level</div>
                                <select name="speechLevel" value={formData.speechLevel} onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" required>
                                    <option value="">-- Select an observation --</option>
                                    <option>Age-Appropriate</option>
                                    <option>Limited Vocabulary</option>
                                    <option>No Speech</option>
                                </select>
                            </label>

                            {/* Select: Social Response */}
                            <label className="block">
                                <div className="text-sm font-medium mb-1 text-gray-700">Social Response</div>
                                <select name="socialResponse" value={formData.socialResponse} onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" required>
                                    <option value="">-- Select an observation --</option>
                                    <option>Initiates Interaction</option>
                                    <option>Responds to Directives</option>
                                    <option>Unresponsive</option>
                                </select>
                            </label>

                            {/* Select: Sensory Reactions */}
                            <label className="block pb-2">
                                <div className="text-sm font-medium mb-1 text-gray-700">Sensory Reactions</div>
                                <select name="sensoryReactions" value={formData.sensoryReactions} onChange={handleInputChange}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" required>
                                    <option value="">-- Select an observation --</option>
                                    <option>Typical</option>
                                    <option>Overreactive (to sounds, lights, textures)</option>
                                    <option>Underreactive (seeks intense stimuli)</option>
                                </select>
                            </label>

                            {/* Analyze Button */}
                            <div className="flex pt-4">
                                <button type="submit"
                                    disabled={loading}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform 
                                      ${loading ? 'bg-indigo-300 cursor-not-allowed shadow-inner' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl active:scale-[0.99]'}`}>
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <span>Analyze with AI</span>
                                    )}
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && <p className="mt-4 text-red-700 font-medium p-3 bg-red-100 border border-red-300 rounded-xl">{error}</p>}

                        </form>
                    </section>
                ) : (
                    <section className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-200/50 border border-indigo-100">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-indigo-700">Analysis Report</h2>
                                <p className="text-sm text-gray-600">
                                    For: **{formData.childName || '—'}** • Age: **{formData.childAge || '—'}**
                                </p>
                            </div>
                            <button onClick={() => generatePdf(aiResults)}
                                className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl active:scale-[0.99] transform">
                                Download Full Report PDF
                            </button>
                        </div>

                        <div className="mt-4 space-y-6">
                            {aiResults && typeof aiResults === 'object' && (aiResults.therapyGoals || aiResults.suggestedActivities) ? (
                                <>
                                    {aiResults.therapyGoals && <div className="p-5 border border-indigo-300 bg-indigo-50 rounded-xl shadow-inner">
                                        <h3 className="font-bold text-xl text-indigo-800 flex items-center mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            Therapy Goals
                                        </h3>
                                        <ul className="list-disc pl-8 mt-2 space-y-2 text-gray-800">
                                            {aiResults.therapyGoals.map((g, i) => <li key={i}>{g}</li>)}
                                        </ul>
                                    </div>}

                                    {aiResults.suggestedActivities && <div className="p-5 border border-teal-300 bg-teal-50 rounded-xl shadow-inner">
                                        <h3 className="font-bold text-xl text-teal-800 flex items-center mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-teal-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75l.183.097.306.162.385.2.46.234.524.256.577.268.627.265.666.248.7.218.724.175.742.128.752.078.75.025.74-.015.728-.052.716-.093.704-.138.69-.187.674-.24.656-.295.636-.353.614-.413.59-.476.564-.543.535-.61.503-.68.468-.755.43-.834.39-.915.35-.997.309-1.079.27-1.163.228-1.246.185-1.328.14-1.409.094-1.488.046-1.564-.002-1.638-.052-1.708-.103-1.775-.157-1.838-.214-1.897-.275-1.95-.339-1.996-.407-2.035-.477-2.066-.55-2.088-.626-2.102-.704-2.108-.785-2.106-.867-2.096-.95-2.079-1.034-2.053-1.117-2.019-1.2-1.977-1.282-1.927-1.363-1.869-1.442-1.804-1.519-1.731-1.593-1.652-1.662-1.565-1.724-1.472-1.779-1.373-1.825-1.268-1.86-1.157-1.884-1.04-.15-.92-.12-.8-.08-.68-.04-.56-.01-.44-.01-.32-.01-.2-.01-.08-.01-.04 4.5 0 8.5 4.03 8.5 9s-4.03 9-8.5 9c-4.47 0-8.5-4.03-8.5-9s4.03-9 8.5-9zM10 4a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" /></svg>
                                            Suggested Activities
                                        </h3>
                                        <ul className="list-disc pl-8 mt-2 space-y-2 text-gray-800">
                                            {aiResults.suggestedActivities.map((a, i) => <li key={i}>{a}</li>)}
                                        </ul>
                                    </div>}

                                    {(() => {
                                        const remaining = { ...aiResults };
                                        delete remaining.therapyGoals;
                                        delete remaining.suggestedActivities;
                                        if (Object.keys(remaining).length)
                                            return (<div className="mt-6"><h3 className="font-bold text-lg text-gray-800">Other AI Output</h3>
                                                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-xl text-sm overflow-auto max-h-60 border border-gray-300">{JSON.stringify(remaining, null, 2)}</pre>
                                            </div>);
                                        return null;
                                    })()}
                                </>
                            ) : (
                                <div className="p-5 border border-red-300 bg-red-100 rounded-xl shadow-inner">
                                    <h3 className="font-bold text-xl text-red-800">Raw AI Output (Unstructured)</h3>
                                    <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-xl text-sm overflow-auto max-h-60 mt-2 border border-gray-300">
                                        {aiResults ? (typeof aiResults === 'string' ? aiResults : JSON.stringify(aiResults, null, 2)) : 'No analysis yet'}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 text-center">
                            <button onClick={() => setCurrentPage('form')}
                                className="px-6 py-2 border border-gray-400 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-semibold shadow-md active:scale-[0.99] transform">
                                ← Back to Form
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default App;