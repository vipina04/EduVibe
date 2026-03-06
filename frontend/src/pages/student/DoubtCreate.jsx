// src/components/students/DoubtCreate.jsx
/**
 * Student Doubt Creation Component
 * Allows students to ask doubts by selecting subject
 * EduVibe Platform - 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './DoubtCreate.css';

const DoubtCreate = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    subject_id: '',
    text: '',
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/students/doubts/subjects/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      } else {
        setError('Failed to load subjects');
      }
    } catch (err) {
      setError('Error loading subjects');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.subject_id) {
      setError('Please select a subject');
      return;
    }
    
    if (!formData.text && !formData.image) {
      setError('Please provide either text or image for your doubt');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      submitData.append('subject_id', formData.subject_id);
      submitData.append('text', formData.text);
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      const response = await fetch(`${API_BASE_URL}/students/doubts/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Doubt posted successfully! Your teachers have been notified.');
        // Reset form
        setFormData({
          subject_id: '',
          text: '',
          image: null
        });
        setImagePreview(null);
        
        // Redirect to doubts list after 2 seconds
        setTimeout(() => {
          navigate('/student/doubts');
        }, 2000);
      } else {
        setError(data.error || 'Failed to post doubt');
      }
    } catch (err) {
      setError('Error posting doubt. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doubt-create-container">
      <div className="doubt-create-header">
        <h2>Ask a Doubt</h2>
        <p>Select a subject and describe your doubt. Your teachers will be notified.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="doubt-create-form">
        {/* Subject Selection */}
        <div className="form-group">
          <label htmlFor="subject_id">
            Select Subject <span className="required">*</span>
          </label>
          <select
            id="subject_id"
            name="subject_id"
            value={formData.subject_id}
            onChange={handleInputChange}
            className="form-control"
            required
          >
            <option value="">-- Select Subject --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doubt Text */}
        <div className="form-group">
          <label htmlFor="text">
            Describe Your Doubt
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            className="form-control"
            rows="6"
            placeholder="Explain your doubt in detail..."
          ></textarea>
          <small className="form-help">
            Provide as much detail as possible to help teachers understand your doubt.
          </small>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label htmlFor="image">
            Attach Image (Optional)
          </label>
          <div className="image-upload-area">
            {!imagePreview ? (
              <div className="upload-placeholder">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <label htmlFor="image" className="file-label">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>Click to upload image</span>
                </label>
              </div>
            ) : (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="btn-remove-image"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>
          <small className="form-help">
            You can upload a screenshot or photo of your doubt.
          </small>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/student/doubts')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Doubt'}
          </button>
        </div>
      </form>

      <div className="doubt-create-tips">
        <h3>💡 Tips for Asking Good Doubts:</h3>
        <ul>
          <li>Select the correct subject</li>
          <li>Be specific about what you don't understand</li>
          <li>Include relevant chapter or topic information</li>
          <li>Attach images if it helps explain your doubt</li>
          <li>Your classmates and teachers can see and reply to your doubt</li>
        </ul>
      </div>
    </div>
  );
};

export default DoubtCreate;