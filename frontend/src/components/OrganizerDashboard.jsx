import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import ScoringOverview from './ScoringOverview';
import Navbar from './Navbar';

function OrganizerDashboard({ onLogout, logo }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [showScoringOverview, setShowScoringOverview] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const getScoreColor = (score) => {
    if (score <= 2) return 'text-red-600';
    if (score <= 4) return 'text-orange-600';
    if (score <= 6) return 'text-yellow-600';
    if (score <= 8) return 'text-lime-600';
    return 'text-green-600';
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/organizer/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createSampleEvent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const event = {
        name: 'Hackathon 2025',
        date: '2025-12-08',
        criteria: [
          { name: 'Innovation', weight: 0.3 },
          { name: 'Technical Complexity', weight: 0.25 },
          { name: 'UX/UI', weight: 0.2 },
          { name: 'Feasibility', weight: 0.15 },
          { name: 'Presentation', weight: 0.1 }
        ]
      };
      await axios.post(`${API_BASE_URL}/organizer/events`, event, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/organizer/events/${eventId}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(response.data);
    } catch (error) {
      console.error(error);
      setTeams([]);
    }
  };

  const fetchJudges = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/organizer/events/${eventId}/judges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJudges(response.data);
    } catch (error) {
      console.error(error);
      setJudges([]);
    }
  };

  const fetchLeaderboard = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/organizer/events/${eventId}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error(error);
      setLeaderboard([]);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/organizer/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      alert('Error deleting event: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportLeaderboard = async () => {
    if (!selectedEvent) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/organizer/events/${selectedEvent.id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leaderboard.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(error);
      alert('Failed to export leaderboard');
    }
  };

  const handleFormSubmit = async (e, type, eventId) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (type === 'team') {
        await axios.post(`${API_BASE_URL}/organizer/events/${eventId}/teams`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTeams(eventId);
        fetchEvents(); // Refresh event counts
      } else if (type === 'upload') {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.file);
        await axios.post(`${API_BASE_URL}/organizer/events/${eventId}/teams/upload`, formDataUpload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        fetchTeams(eventId);
        fetchEvents(); // Refresh event counts
        alert('Teams uploaded successfully');
      } else if (type === 'judge') {
        await axios.post(`${API_BASE_URL}/organizer/events/${eventId}/judges`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchJudges(eventId);
        fetchEvents(); // Refresh event counts
      }
      setShowForm(null);
      setFormData({});
    } catch (error) {
      console.error(error);
      alert('Error: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'events', name: 'Events', icon: '📅' },
    ...(selectedEvent ? [
      { id: 'teams', name: 'Teams', icon: '👥' },
      { id: 'judges', name: 'Judges', icon: '👨‍⚖️' },
      { id: 'results', name: 'Results', icon: '📊' }
    ] : [])
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Event Management</h2>
                <button
                  onClick={createSampleEvent}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Sample Event
                </button>
              </div>

              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Date: {new Date(event.date).toLocaleDateString()}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>🏆 Teams: {event.teamCount || 0}</span>
                          <span>👨‍⚖️ Judges: {event.judgeCount || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setActiveTab('teams');
                            fetchTeams(event.id);
                            fetchJudges(event.id);
                          }}
                          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                          Manage Event
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {events.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h2a2 2 0 012 2v4m-6 4V7a2 2 0 012-2h2a2 2 0 012 2v4m0 4v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first hackathon event.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Team Management</h2>
                  <p className="text-gray-600 mt-1">Manage teams for {selectedEvent?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm('team')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Team
                  </button>
                  <button
                    onClick={() => setShowForm('upload')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{team.teamName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                          Team #{team.teamNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {teams.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
                    <p className="mt-1 text-sm text-gray-500">Add teams to get started with judging.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'judges':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Judge Management</h2>
                  <p className="text-gray-600 mt-1">Manage judges for {selectedEvent?.name}</p>
                </div>
                <button
                  onClick={() => setShowForm('judge')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Judge
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {judges.map(judge => (
                  <div key={judge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {judge.name ? judge.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'J'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{judge.name}</h3>
                        <p className="text-sm text-gray-600">{judge.email}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {judges.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No judges assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">Add judges to start the evaluation process.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Results & Analytics</h2>
                  <p className="text-gray-600 mt-1">View judging results for {selectedEvent?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLeaderboard(selectedEvent.id)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Refresh Results
                  </button>
                  <button
                    onClick={() => setShowScoringOverview(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Detailed View
                  </button>
                  <button
                    onClick={exportLeaderboard}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((item, index) => (
                    <div key={item.team.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.team.teamName}</h3>
                          <p className="text-sm text-gray-600">{item.team.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(Math.round(item.averageScore))}`}>{item.averageScore.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Average Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Results will appear once judges start scoring teams.</p>
                  <button
                    onClick={() => fetchLeaderboard(selectedEvent.id)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Load Results
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="ORGANIZER" onLogout={onLogout} logo={logo} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
              {selectedEvent && (
                <span className="ml-4 text-lg text-gray-600">• {selectedEvent.name}</span>
              )}
            </div>
            {selectedEvent && (
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setActiveTab('events');
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Events
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Forms Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <form onSubmit={(e) => handleFormSubmit(e, showForm, selectedEvent.id)}>
              {showForm === 'team' && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Add Team</h3>
                  <input
                    placeholder="Team Name"
                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                    required
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="number"
                    placeholder="Team Number"
                    onChange={(e) => setFormData({...formData, teamNumber: parseInt(e.target.value)})}
                    required
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    placeholder="Description"
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="w-full p-2 border rounded mb-4"
                  />
                </>
              )}
              {showForm === 'upload' && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Upload Teams CSV</h3>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                    required
                    className="w-full p-2 border rounded mb-2"
                  />
                  <p className="text-sm text-gray-600 mb-4">CSV format: teamName,teamNumber,description (with header)</p>
                </>
              )}
              {showForm === 'judge' && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Add Judge</h3>
                  <input
                    type="email"
                    placeholder="Judge Email"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full p-2 border rounded mb-2"
                  />
                  <p className="text-sm text-gray-600 mb-4">Judge must register first before being added to an event.</p>
                </>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(null); setFormData({}); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scoring Overview Modal */}
      {showScoringOverview && selectedEvent && (
        <ScoringOverview
          eventId={selectedEvent.id}
          onClose={() => setShowScoringOverview(false)}
        />
      )}
    </div>
  );
}

export default OrganizerDashboard;