import React, { useEffect, useMemo, useState } from 'react';
import './AdminSurveys.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function AdminSurveys({ onNavigate }) {
  const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:5001/api";
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/surveys`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to load surveys');
        }
        const data = await res.json();
        setSurveys(data.surveys || []);
      } catch (err) {
        setError(err.message || 'Unable to fetch surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [API_BASE]);

  const filteredSurveys = useMemo(() => {
    return surveys
      .filter((survey) => {
        const titleMatch = survey.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || survey.status?.toLowerCase() === filter.toLowerCase();
        return titleMatch && matchesFilter;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [surveys, searchTerm, filter]);

  const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  };

  return (
    <div className="admin-surveys">
      <div className="header">
        <h2>Survey Management</h2>
        <button 
          className="create-button" 
          onClick={() => onNavigate("createSurvey")}
        >
          + Create New Survey
        </button>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search surveys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {loading && <div className="info-banner">Loading surveys...</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="cards-wrapper">
        <table className="survey-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Created</th>
              <th>Questions</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSurveys.map((survey, index) => (
              <tr key={survey._id || index}>
                <td>{survey.title || '-'}</td>
                <td className={`status ${survey.status ? survey.status.toLowerCase() : ''}`}>
                  {survey.status || '-'}
                </td>
                <td>{formatDate(survey.createdAt)}</td>
                <td>{survey.questions?.length ?? 0}</td>
                <td>{formatDate(survey.updatedAt)}</td>
                <td className="action-cell">
                  <button className="icon-button edit" title="Edit Survey">
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="icon-button delete"
                    title="Delete Survey"
                    disabled={deletingId === survey._id}
                    onClick={async () => {
                      if (!survey._id) return;
                      const confirmDelete = window.confirm('Delete this survey?');
                      if (!confirmDelete) return;
                      setDeletingId(survey._id);
                      setError('');
                      try {
                        const res = await fetch(`${API_BASE}/surveys/${survey._id}`, {
                          method: 'DELETE',
                        });
                        if (!res.ok) {
                          const errData = await res.json().catch(() => ({}));
                          throw new Error(errData.message || 'Failed to delete');
                        }
                        setSurveys((prev) => prev.filter((s) => s._id !== survey._id));
                      } catch (err) {
                        setError(err.message || 'Unable to delete survey');
                      } finally {
                        setDeletingId('');
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
            {!filteredSurveys.length && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>
                  No surveys found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
