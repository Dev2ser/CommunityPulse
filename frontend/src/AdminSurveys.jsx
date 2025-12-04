import React, { useState } from 'react';
import './AdminSurveys.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faCopy, faTrash } from '@fortawesome/free-solid-svg-icons';

const surveys = [
  {
    name: 'Wheeling Gateway Center - Wheeling, WV',
    status: 'Active',
    created: '2025-01-10',
    responses: 189,
    updated: '5 hours ago',
  },
  {
    name: 'Robinson Fans - Lakeland, FL',
    status: 'Draft',
    created: '2025-01-20',
    responses: 0,
    updated: '1 hour ago',
  },
  {
    name: 'RenewAll - Huntington, WV',
    status: 'Active',
    created: '2024-12-28',
    responses: 412,
    updated: '3 days ago',
  },
  {
    name: 'Innovation District - Myrtle Beach, SC',
    status: 'Archived',
    created: '2024-10-01',
    responses: 567,
    updated: '2 months ago',
  },
  {
    name: 'Memphis and Pearl - Cleveland, OH',
    status: 'Draft',
    created: '2025-01-18',
    responses: 0,
    updated: '3 days ago',
  },
  {
    name: 'Clay School - Wheeling, WV',
    status: 'Active',
    created: '2025-01-05',
    responses: 298,
    updated: '1 day ago',
  },
  {
    name: 'Brite - Warren, OH',
    status: 'Active',
    created: '2024-12-20',
    responses: 345,
    updated: '4 days ago',
  },
];

export default function AdminSurveys({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || survey.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-surveys">
      <div className="header">
        <h2>Survey Management</h2>
        <button
          className="create-button"
          onClick={() => onNavigate("createSurvey")}
        />
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search surveys..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <table className="survey-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Responses</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSurveys.map((survey, index) => (
            <tr key={index}>
              <td>{survey.name}</td>
              <td className={`status ${survey.status.toLowerCase()}`}>{survey.status}</td>
              <td>{survey.created}</td>
              <td>{survey.responses}</td>
              <td>{survey.updated}</td>
              <td>
                <button className="icon-button view" title="View Survey">
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button className="icon-button edit" title="Edit Survey">
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button className="icon-button delete" title="Delete Survey">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
