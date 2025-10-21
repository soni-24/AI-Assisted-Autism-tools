import React, { useState } from 'react';
import './EmotionAnalyzer.css';

function EmotionAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setAnalysis(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeEmotion = async () => {
    if (!selectedFile) {
      setError('Please select a photo first');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/analyze-emotion`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
    setError('');
  };

  return (
    <div className="emotion-analyzer">
      <div className="analyzer-card">
        <div className="card-header">
          <h2>📸 Emotion & Expression Analysis</h2>
          <p className="subtitle">Upload a child's photo for comprehensive emotional assessment</p>
        </div>

        <div className="upload-section">
          <input 
            type="file" 
            id="photo-upload"
            accept="image/*" 
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="photo-upload" className="upload-label">
            {selectedFile ? '✓ Photo Selected' : '📁 Choose Photo'}
          </label>
        </div>

        {preview && (
          <div className="preview-section">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="button-group">
          <button 
            onClick={analyzeEmotion} 
            disabled={loading || !selectedFile}
            className="analyze-btn"
          >
            {loading ? '🔄 Analyzing...' : '🔍 Analyze Emotion'}
          </button>
          
          {(selectedFile || analysis) && (
            <button onClick={resetForm} className="reset-btn">
              🔄 Reset
            </button>
          )}
        </div>

        {analysis && (
          <div className="analysis-result">
            <div className="result-header">
              <h3>📊 Emotional Assessment</h3>
              <p className="result-subtitle">AI-powered facial expression analysis</p>
            </div>
            
            {/* Primary Emotion */}
            <div className="primary-emotion">
              <div className="primary-label">
                Primary Emotion: {emotionEmojis[analysis.primaryEmotion?.toLowerCase()] || '😐'} <span className="emotion-name">{analysis.primaryEmotion}</span>
              </div>
              <div className="confidence-badge">
                {analysis.confidence}% confidence
              </div>
            </div>

            {/* Detailed Emotion Analysis */}
            <h4 className="section-title">Detailed Emotion Analysis:</h4>
            <div className="emotion-grid">
              {analysis.emotions && Object.entries(analysis.emotions).map(([emotion, percentage]) => (
                <div key={emotion} className="emotion-card">
                  <div className="emotion-header">
                    <span className="emotion-emoji">{emotionEmojis[emotion]}</span>
                    <span className="emotion-label">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="percentage">{percentage}%</div>
                </div>
              ))}
            </div>

            {/* Additional Assessments */}
            {(analysis.eyeContact || analysis.engagement || analysis.notes) && (
              <div className="additional-info">
                {analysis.eyeContact && (
                  <div className="info-item">
                    <strong>👁️ Eye Contact:</strong> {analysis.eyeContact}
                  </div>
                )}
                {analysis.engagement && (
                  <div className="info-item">
                    <strong>🤝 Engagement Level:</strong> {analysis.engagement}
                  </div>
                )}
                {analysis.notes && (
                  <div className="info-item">
                    <strong>📝 Notes:</strong> {analysis.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmotionAnalyzer;
