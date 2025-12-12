import { useState, useEffect } from 'react';
import axios from 'axios';

function ScoringOverview({ eventId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const getScoreColor = (score) => {
    if (score <= 2) return 'text-red-600';
    if (score <= 4) return 'text-orange-600';
    if (score <= 6) return 'text-yellow-600';
    if (score <= 8) return 'text-lime-600';
    return 'text-green-600';
  };

  const getScoreLabel = (score) => {
    if (score === 1) return 'Abysmal';
    if (score === 2) return 'Dreadful';
    if (score === 3) return 'Poor';
    if (score === 4) return 'Below Average';
    if (score === 5) return 'Average';
    if (score === 6) return 'Above Average';
    if (score === 7) return 'Good';
    if (score === 8) return 'Very Good';
    if (score === 9) return 'Excellent';
    return 'Outstanding';
  };

  const getProgressColor = (percent) => {
    if (percent < 25) return 'bg-red-600';
    if (percent < 50) return 'bg-orange-600';
    if (percent < 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  useEffect(() => {
    fetchDetailedScores();
  }, [eventId]);

  const fetchDetailedScores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8081/organizer/events/${eventId}/detailed-scores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch detailed scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading scoring details...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { teams, judges, criteria } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Detailed Scoring Overview</h2>
              <p className="text-indigo-100 mt-1">Judge scores breakdown for all teams</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
              <div className="text-sm text-blue-600">Teams</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{judges.length}</div>
              <div className="text-sm text-green-600">Judges</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{criteria.length}</div>
              <div className="text-sm text-purple-600">Criteria</div>
            </div>
          </div>

          {/* Scoring Matrix */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    {judges.map(judge => (
                      <th key={judge.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {judge.name}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((teamData, index) => {
                    const team = teamData.team;
                    const judgeScores = teamData.judgeScores;
                    const averageScore = teamData.averageScore;
                    const scoresCount = teamData.scoresCount;

                    return (
                      <tr key={team.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                            <div className="text-sm text-gray-500">{team.description}</div>
                          </div>
                        </td>
                        {judges.map(judge => {
                          const scoreData = judgeScores[judge.name];
                          return (
                            <td key={judge.id} className="px-6 py-4 whitespace-nowrap">
                              {scoreData ? (
                                <div className="text-center">
                                  <div className={`text-lg font-semibold ${getScoreColor(Math.round(scoreData.finalScore))}`}>
                                    {scoreData.finalScore.toFixed(1)}
                                  </div>
                                  <button
                                    onClick={() => setSelectedTeam({ team, judge, scoreData })}
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                  >
                                    View Details
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Not Scored
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-lg font-bold ${getScoreColor(Math.round(averageScore))}`}>
                            {averageScore.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            scoresCount === judges.length
                              ? 'bg-green-100 text-green-800'
                              : scoresCount > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {scoresCount}/{judges.length} Scored
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Judge Progress Cards */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Judge Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {judges.map(judge => {
                const totalPossible = teams.length;
                const scoredCount = teams.filter(teamData =>
                  teamData.judgeScores[judge.name] !== null
                ).length;
                const progressPercent = totalPossible > 0 ? (scoredCount / totalPossible) * 100 : 0;

                return (
                  <div key={judge.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{judge.name}</h4>
                      <span className="text-sm text-gray-500">{judge.email}</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{scoredCount}/{totalPossible}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getProgressColor(progressPercent)} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {progressPercent === 100 ? '✅ Complete' :
                       progressPercent > 50 ? '🔄 In Progress' : '⏳ Just Started'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Score Details Modal */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
                <h3 className="text-lg font-semibold">
                  {selectedTeam.judge.name}'s Score for {selectedTeam.team.teamName}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {Object.entries(selectedTeam.scoreData.criteria).map(([criterion, score]) => (
                    <div key={criterion}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{criterion}</span>
                        <span className="font-medium">{score}/10</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{getScoreLabel(score)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Final Score</span>
                    <span className={`${getScoreColor(Math.round(selectedTeam.scoreData.finalScore))} text-lg font-bold`}>{selectedTeam.scoreData.finalScore.toFixed(2)}</span>
                  </div>
                  {selectedTeam.scoreData.comment && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Comment</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedTeam.scoreData.comment}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="w-full mt-6 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoringOverview;