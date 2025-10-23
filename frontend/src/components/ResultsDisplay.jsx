import React, { useState } from 'react';
import { generatePdf } from '../utils/pdfGenerator';

const ResultsDisplay = ({ 
    formData, 
    aiResults, 
    setCurrentPage,
    setFormData,
    setAiResults
}) => {
    const [pdfError, setPdfError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const emotionEmojis = {
        neutral: '😐',
        happy: '😊',
        sad: '😢',
        angry: '😠',
        fear: '😨',
        surprise: '😲',
        disgust: '🤢'
    };

    // Handle Check Another Child - Reset form
    const handleCheckAnotherChild = () => {
        // Reset form data to empty
        setFormData({
            childName: "",
            childAge: "",
            eyeContact: "",
            speechLevel: "",
            socialResponse: "",
            sensoryReactions: "",
        });
        // Clear AI results
        setAiResults(null);
        // Go back to form
        setCurrentPage('form');
    };

    // Handle PDF download
    const handleDownloadPdf = async () => {
        if (!aiResults) {
            setPdfError("No analysis results to download.");
            return;
        }

        setIsGenerating(true);
        setPdfError(null);

        try {
            await generatePdf(formData, aiResults);
        } catch (error) {
            console.error("PDF generation error:", error);
            setPdfError("PDF generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Child Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-indigo-200">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">👤 Child Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="text-lg font-semibold text-gray-800">{formData.childName || '—'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="text-lg font-semibold text-gray-800">{formData.childAge || '—'} years</p>
                    </div>
                </div>
            </div>

            {/* THERAPY GOALS - UPER */}
            {aiResults?.therapyGoals && aiResults.therapyGoals.length > 0 && (
                <div className="bg-indigo-50 p-6 rounded-2xl shadow-lg border-2 border-indigo-200">
                    <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Therapy Goals
                    </h2>
                    <ul className="space-y-3 list-disc list-inside">
                        {aiResults.therapyGoals.map((goal, index) => (
                            <li key={index} className="text-gray-800 leading-relaxed pl-2">
                                {goal}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* SUGGESTED ACTIVITIES - UPER */}
            {aiResults?.suggestedActivities && aiResults.suggestedActivities.length > 0 && (
                <div className="bg-teal-50 p-6 rounded-2xl shadow-lg border-2 border-teal-200">
                    <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                        </svg>
                        Suggested Activities
                    </h2>
                    <ul className="space-y-3 list-disc list-inside">
                        {aiResults.suggestedActivities.map((activity, index) => (
                            <li key={index} className="text-gray-800 leading-relaxed pl-2">
                                {activity}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* EMOTION ANALYSIS - NICHE */}
            {aiResults?.emotionData && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-orange-200">
                    <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center gap-2">
                        🎭 Emotion Analysis
                    </h2>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-semibold text-gray-700">Detected Emotion:</span>
                            <span className="text-5xl">
                                {emotionEmojis[aiResults.emotionData.primaryEmotion?.toLowerCase()] || '😐'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Primary Emotion</p>
                                <p className="text-xl font-bold text-orange-600 capitalize">
                                    {aiResults.emotionData.primaryEmotion || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                                <p className="text-xl font-bold text-green-600">
                                    {aiResults.emotionData.confidence || '0'}%
                                </p>
                            </div>
                        </div>

                        {aiResults.emotionData.emotions && Object.keys(aiResults.emotionData.emotions).length > 0 && (
                            <div className="mt-4">
                                <p className="font-semibold text-gray-700 mb-3">All Detected Emotions:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(aiResults.emotionData.emotions).map(([emotion, score]) => (
                                        <div key={emotion} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="capitalize text-gray-600 flex items-center gap-2">
                                                <span>{emotionEmojis[emotion] || '😐'}</span>
                                                {emotion}:
                                            </span>
                                            <span className="font-semibold text-orange-600">{score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PDF Error Message */}
            {pdfError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                    ⚠️ {pdfError}
                </div>
            )}

            {/* SIRF 2 BUTTONS - NICHE */}
            <div className="flex gap-4 justify-center pt-6">
                <button
                    onClick={handleCheckAnotherChild}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Check Another Child
                </button>
                
                <button
                    onClick={handleDownloadPdf}
                    disabled={isGenerating}
                    className={`px-8 py-4 font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${
                        isGenerating 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    {isGenerating ? 'Generating...' : 'Download PDF Report'}
                </button>
            </div>
        </div>
    );
};

export default ResultsDisplay;
