// App.jsx
import React, { useState } from "react";
import AssessmentForm from "./components/AssessmentForm";
import ResultsDisplay from "./components/ResultsDisplay";

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

    return (
        <div className="min-h-screen p-6 bg-slate-100 font-sans">
            <main className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center drop-shadow-md">
                    🧩 Autism Spectrum Disorder Screening
                </h1>

                {currentPage === 'form' ? (
                    <AssessmentForm 
                        formData={formData}
                        setFormData={setFormData}
                        setAiResults={setAiResults}
                        setCurrentPage={setCurrentPage}
                    />
                ) : (
                    <ResultsDisplay 
                        formData={formData}
                        aiResults={aiResults}
                        setCurrentPage={setCurrentPage}
                        setFormData={setFormData}
                        setAiResults={setAiResults}
                    />
                )}
            </main>
        </div>
    );
};

export default App;