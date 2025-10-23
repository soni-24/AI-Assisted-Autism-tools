// API utility functions for backend communication

/**
 * Analyze child behavior using AI
 * @param {Object} formData - Child assessment data
 * @returns {Promise<Object>} AI analysis results
 */
export const analyzeChildBehavior = async (formData) => {
    const response = await fetch(`${import.meta.env.VITE_API_KEY}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return await response.json();
};

/**
 * Analyze emotion from photo
 * @param {File} photoFile - Photo file to analyze
 * @returns {Promise<Object>} Emotion analysis results
 */
export const analyzeEmotion = async (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await fetch(`${import.meta.env.VITE_API_KEY}/analyze-emotion`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
    }

    return data;
};

/**
 * Save assessment data to Firebase
 * @param {Object} assessmentData - Complete assessment data
 * @returns {Promise<Object>} Save confirmation
 */
export const saveToFirebase = async (assessmentData) => {
    const response = await fetch(`${import.meta.env.VITE_API_KEY}/save-conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessmentData),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save data');
    }

    return await response.json();
};
