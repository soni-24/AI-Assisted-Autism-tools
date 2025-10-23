import React, { useState } from 'react';
import { analyzeEmotion } from '../utils/api';

/**
 * EmotionSection Component
 * Handles photo upload and emotion analysis
 */
const EmotionSection = ({ onEmotionData }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [emotionAnalysis, setEmotionAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const emotionEmojis = {
        neutral: '😐',
        happy: '😊',
        sad: '😢',
        angry: '😠',
        fear: '😨',
        surprise: '😲',
        disgust: '🤢'
    };

    // Handle photo selection
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedPhoto(file);
            setError('');
            setEmotionAnalysis(null);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Analyze emotion from photo
    const handleAnalyzeEmotion = async () => {
        if (!selectedPhoto) {
            setError('Please select a photo first');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const data = await analyzeEmotion(selectedPhoto);
            setEmotionAnalysis(data);
            // Pass emotion data to parent component
            if (onEmotionData) {
                onEmotionData(data);
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to analyze emotion. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Reset photo and analysis
    const handleReset = () => {
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setEmotionAnalysis(null);
        setError('');
    };

    return (
        <div className="mt-6 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
            <h3 className="text-lg font-bold text-indigo-800 mb-3 flex items-center gap-2">
                📸 Optional: Upload Photo for Emotion Analysis
            </h3>
            <p className="text-sm text-indigo-600 mb-4">
                Upload a clear photo of the child's face for AI-powered emotional assessment
            </p>
            
            <div className="space-y-4">
                {/* Photo Upload */}
                <div className="flex flex-col gap-3">
                    <input 
                        type="file" 
                        id="photo-upload"
                        accept="image/*" 
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                    <label 
                        htmlFor="photo-upload" 
                        className="cursor-pointer px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center gap-2 w-full"
                    >
                        <span>📁</span>
                        {selectedPhoto ? '✓ Photo Selected' : 'Choose Photo'}
                    </label>

                    {/* Photo Preview */}
                    {photoPreview && (
                        <div className="mt-2">
                            <img 
                                src={photoPreview} 
                                alt="Preview" 
                                className="max-w-full h-48 object-contain rounded-xl shadow-lg border-2 border-indigo-300 mx-auto" 
                            />
                        </div>
                    )}
                    
                    {/* Single Action Button - Analyze with AI */}
                    {selectedPhoto && (
                        <button 
                            type="button"
                            onClick={handleAnalyzeEmotion}
                            disabled={loading}
                            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg active:scale-95'
                            }`}
                        >
                            {loading ? '🔄 Analyzing...' : '🤖 Analyze with AI'}
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Emotion Analysis Results */}
                {emotionAnalysis && (
                    <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg border-2 border-indigo-200">
                        <div className="text-center mb-4 pb-4 border-b-2 border-indigo-300">
                            <h4 className="text-xl font-bold text-indigo-900 mb-2">📊 Emotional Assessment</h4>
                            <p className="text-indigo-700 text-sm">AI-powered facial expression analysis</p>
                        </div>
                        
                        {/* Primary Emotion */}
                        <div className="flex justify-between items-center p-4 bg-white rounded-xl mb-4 shadow-md border-2 border-indigo-200">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                    {emotionEmojis[emotionAnalysis.primaryEmotion?.toLowerCase()] || '😐'}
                                </span>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Primary Emotion</div>
                                    <div className="text-lg font-bold text-indigo-900 capitalize">
                                        {emotionAnalysis.primaryEmotion}
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-md">
                                {emotionAnalysis.confidence}%
                            </div>
                        </div>

                        {/* Emotion Grid */}
                        <h5 className="text-indigo-900 font-semibold mb-3 text-sm">Detailed Analysis:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                            {emotionAnalysis.emotions && Object.entries(emotionAnalysis.emotions).map(([emotion, percentage]) => (
                                <div key={emotion} className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{emotionEmojis[emotion]}</span>
                                        <span className="font-semibold text-gray-800 capitalize text-sm">{emotion}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-700"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-sm font-bold text-indigo-600">{percentage}%</div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Info */}
                        {(emotionAnalysis.eyeContact || emotionAnalysis.engagement || emotionAnalysis.notes) && (
                            <div className="bg-white rounded-xl p-4 shadow-md space-y-2 border border-indigo-100">
                                {emotionAnalysis.eyeContact && (
                                    <div className="text-sm border-b border-gray-100 pb-2">
                                        <strong className="text-indigo-900">👁️ Eye Contact:</strong> 
                                        <span className="text-gray-700 ml-2">{emotionAnalysis.eyeContact}</span>
                                    </div>
                                )}
                                {emotionAnalysis.engagement && (
                                    <div className="text-sm border-b border-gray-100 pb-2">
                                        <strong className="text-indigo-900">🤝 Engagement:</strong> 
                                        <span className="text-gray-700 ml-2">{emotionAnalysis.engagement}</span>
                                    </div>
                                )}
                                {emotionAnalysis.notes && (
                                    <div className="text-sm">
                                        <strong className="text-indigo-900">📝 Notes:</strong> 
                                        <span className="text-gray-700 ml-2">{emotionAnalysis.notes}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmotionSection;
