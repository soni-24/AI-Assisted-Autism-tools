import React, { useState } from 'react';
import { analyzeChildBehavior, saveToFirebase } from '../utils/api';
import EmotionSection from './EmotionSection';

/**
 * AssessmentForm Component
 * Handles ONLY child behavioral assessment form fields
 */
const AssessmentForm = ({ 
    formData, 
    setFormData,
    setAiResults,
    setCurrentPage
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emotionData, setEmotionData] = useState(null);

    // Handle emotion data from EmotionSection
    const handleEmotionData = (data) => {
        setEmotionData(data);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission and AI analysis
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields are filled
        const isFormFilled = formData.childName && formData.childAge && 
                             formData.eyeContact && formData.speechLevel && 
                             formData.socialResponse && formData.sensoryReactions;
        
        if (!isFormFilled) {
            setError("Please fill in all the fields before analyzing.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get AI analysis
            const aiOutput = await analyzeChildBehavior(formData);

            if (aiOutput && Object.keys(aiOutput).length > 0) {
                // Combine AI results with emotion data
                const combinedResults = {
                    ...aiOutput,
                    emotionData: emotionData // Add emotion data to results
                };
                
                setAiResults(combinedResults);
                
                // Save to Firebase (without emotion data)
                try {
                    const savePayload = {
                        ...formData,
                        therapyGoals: aiOutput.therapyGoals || [],
                        suggestedActivities: aiOutput.suggestedActivities || []
                    };
                    
                    console.log("📤 Sending to Firebase:", savePayload);
                    await saveToFirebase(savePayload);
                    console.log("✅ Successfully saved to Firebase");
                } catch (saveError) {
                    console.error("❌ Error saving to Firebase:", saveError);
                }

                // Navigate to results page
                setCurrentPage("results");
            } else {
                setError("No analysis returned from AI.");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Analysis failed. Check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-200/50 transition-all duration-300 border border-indigo-100">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-600 border-b pb-3">
                Enter Child Observations
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Child Name */}
                <label className="block">
                    <div className="text-sm font-medium mb-1 text-gray-700">Child's Name</div>
                    <input 
                        id="childName" 
                        name="childName" 
                        value={formData.childName} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                        placeholder="Enter child's name" 
                        required 
                    />
                </label>

                {/* Child Age */}
                <label className="block">
                    <div className="text-sm font-medium mb-1 text-gray-700">Child's Age (Years)</div>
                    <input 
                        id="childAge" 
                        name="childAge" 
                        type="number" 
                        min="1" 
                        value={formData.childAge} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                        placeholder="Enter child's age" 
                        required 
                    />
                </label>

                {/* Eye Contact */}
                <label className="block">
                    <div className="text-sm font-medium mb-1 text-gray-700">Eye Contact Level</div>
                    <select 
                        name="eyeContact" 
                        value={formData.eyeContact} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" 
                        required
                    >
                        <option value="">-- Select level --</option>
                        <option>Good</option>
                        <option>Medium</option>
                        <option>Poor</option>
                    </select>
                </label>

                {/* Speech Level */}
                <label className="block">
                    <div className="text-sm font-medium mb-1 text-gray-700">Speech Level</div>
                    <select 
                        name="speechLevel" 
                        value={formData.speechLevel} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" 
                        required
                    >
                        <option value="">-- Select level --</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Average</option>
                        <option>Below Average</option>
                        <option>Poor</option>
                        <option>Non-Verbal</option>
                    </select>
                </label>

                {/* Social Response */}
                <label className="block">
                    <div className="text-sm font-medium mb-1 text-gray-700">Social Response Level</div>
                    <select 
                        name="socialResponse" 
                        value={formData.socialResponse} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" 
                        required
                    >
                        <option value="">-- Select level --</option>
                        <option>Very Interactive</option>
                        <option>Good Interaction</option>
                        <option>Moderate Interaction</option>
                        <option>Limited Interaction</option>
                        <option>Minimal Interaction</option>
                        <option>No Interaction</option>
                    </select>
                </label>

                {/* Sensory Reactions */}
                <label className="block">
                    <div className="text-sm font-medium mb-1 text-gray-700">Sensory Reactions Level</div>
                    <select 
                        name="sensoryReactions" 
                        value={formData.sensoryReactions} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:ring-teal-500 focus:border-teal-500 appearance-none transition-colors bg-white" 
                        required
                    >
                        <option value="">-- Select level --</option>
                        <option>Normal Response</option>
                        <option>Mild Sensitivity</option>
                        <option>Moderate Sensitivity</option>
                        <option>High Sensitivity</option>
                        <option>Very High Sensitivity</option>
                        <option>Sensory Seeking Behavior</option>
                    </select>
                </label>

                {/* Emotion Analysis Section - Separate Component */}
                <EmotionSection onEmotionData={handleEmotionData} />

                {/* Submit Button */}
                <div className="pt-6">
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform 
                            ${loading ? 'bg-indigo-300 cursor-not-allowed shadow-inner' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl active:scale-[0.99]'}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Analyzing Behavioral Data...</span>
                            </>
                        ) : (
                            <span>📋 Generate AI Assessment Report</span>
                        )}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <p className="mt-4 text-red-700 font-medium p-3 bg-red-100 border border-red-300 rounded-xl">
                        {error}
                    </p>
                )}
            </form>
        </section>
    );
};

export default AssessmentForm;
