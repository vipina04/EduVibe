// src/components/students/DoubtList.jsx
/**
 * Student Doubt Listing Component
 * Shows all doubts from the class with filtering options
 * EduVibe Platform - 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './DoubtList.css';

const DoubtList = () => {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    selectedSubject: '',
    showOnlyMyDoubts: false
  });

  useEffect(() => {
    fetchSubjects();
    fetchDoubts();
  }, [filters.selectedSubject, filters.showOnlyMyDoubts]);

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
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchDoubts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let endpoint = filters.showOnlyMyDoubts 
        ? `${API_BASE_URL}/students/doubts/my-doubts/`
        : `${API_BASE_URL}/students/doubts/all/`;
      
      if (filters.selectedSubject && !filters.showOnlyMyDoubts) {
        endpoint += `?subject_id=${filters.selectedSubject}`;
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoubts(filters.showOnlyMyDoubts ? data.my_doubts : data.doubts);
      } else {
        setError('Failed to load doubts');
      }
    } catch (err) {
      setError('Error loading doubts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectFilter = (e) => {
    setFilters(prev => ({
      ...prev,
      selectedSubject: e.target.value
    }));
  };

  const toggleMyDoubts = () => {
    setFilters(prev => ({
      ...prev,
      showOnlyMyDoubts: !prev.showOnlyMyDoubts
    }));
  };

  const getStatusBadge = (doubt) => {
    const hasTeacherReply = doubt.replies?.some(r => r.user.role === 'teacher');
    return hasTeacherReply ? (
      <span className="badge badge-success">Answered</span>
    ) : (
      <span className="badge badge-pending">Pending</span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="doubt-list-container">
      {/* Header */}
      <div className="doubt-list-header">
        <div>
          <h2>Doubts & Discussions</h2>
          <p>Ask questions and help your classmates</p>
        </div>
        <button
          onClick={() => navigate('/student/doubts/create')}
          className="btn btn-primary"
        >
          + Ask Doubt
        </button>
      </div>

      {/* Filters */}
      <div className="doubt-filters">
        <div className="filter-group">
          <label htmlFor="subject-filter">Filter by Subject:</label>
          <select
            id="subject-filter"
            value={filters.selectedSubject}
            onChange={handleSubjectFilter}
            className="filter-select"
            disabled={filters.showOnlyMyDoubts}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-checkbox">
          <label>
            <input
              type="checkbox"
              checked={filters.showOnlyMyDoubts}
              onChange={toggleMyDoubts}
            />
            <span>Show only my doubts</span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading doubts...</p>
        </div>
      ) : (
        <>
          {/* Doubts List */}
          {doubts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❓</div>
              <h3>No doubts yet</h3>
              <p>
                {filters.showOnlyMyDoubts 
                  ? "You haven't asked any doubts yet."
                  : "Be the first one to ask a doubt!"}
              </p>
              <button
                onClick={() => navigate('/student/doubts/create')}
                className="btn btn-primary"
              >
                Ask Your First Doubt
              </button>
            </div>
          ) : (
            <div className="doubts-grid">
              {doubts.map(doubt => (
                <div
                  key={doubt.id}
                  className="doubt-card"
                  onClick={() => navigate(`/student/doubts/${doubt.id}`)}
                >
                  {/* Card Header */}
                  <div className="doubt-card-header">
                    <div className="doubt-meta">
                      <span className="subject-tag">
                        {doubt.subject.name}
                      </span>
                      {getStatusBadge(doubt)}
                    </div>
                    <span className="doubt-time">
                      {formatDate(doubt.created_at)}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="doubt-student">
                    <div className="student-avatar">
                      {doubt.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-info">
                      <span className="student-name">{doubt.student.name}</span>
                      {doubt.student.unique_id && (
                        <span className="student-id">{doubt.student.unique_id}</span>
                      )}
                    </div>
                    {doubt.is_my_doubt && (
                      <span className="my-doubt-badge">You</span>
                    )}
                  </div>

                  {/* Doubt Content */}
                  <div className="doubt-content">
                    <p className="doubt-text">
                      {doubt.text.length > 200 
                        ? `${doubt.text.substring(0, 200)}...` 
                        : doubt.text}
                    </p>
                    {doubt.image_url && (
                      <div className="doubt-image-indicator">
                        📷 Image attached
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="doubt-card-footer">
                    <span className="reply-count">
                      💬 {doubt.reply_count} {doubt.reply_count === 1 ? 'reply' : 'replies'}
                    </span>
                    <span className="view-link">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {doubts.length > 0 && (
            <div className="doubt-stats">
              <p>
                Showing {doubts.length} doubt{doubts.length !== 1 ? 's' : ''}
                {filters.selectedSubject && ' in selected subject'}
                {filters.showOnlyMyDoubts && ' (your doubts only)'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoubtList;