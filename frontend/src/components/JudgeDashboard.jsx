import { useState, useEffect } from 'react';
import axios from 'axios';
import llamaImg from '../assets/Llama.jpg';
import wethinkcodeLogo from '../assets/wethinkcode-logo.png';
import Navbar from './Navbar';

function JudgeDashboard({ onLogout, logo }) {
  const [teamsToScore, setTeamsToScore] = useState([]);
  const [scoredTeams, setScoredTeams] = useState([]);
  const [scoringTeam, setScoringTeam] = useState(null);
  const [viewingScore, setViewingScore] = useState(null);
  const [scores, setScores] = useState({ innovation: 5, technicalComplexity: 5, uxui: 5, feasibility: 5, presentation: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const judgeName = localStorage.getItem('judge') || 'Judge';

  useEffect(() => {
    fetchTeamsToScore();
  }, []);


  const fetchTeamsToScore = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [teamsRes, scoredRes] = await Promise.all([
        axios.get('http://localhost:8081/judge/teams', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8081/judge/scored-teams', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setTeamsToScore(teamsRes.data);
      setScoredTeams(scoredRes.data);
    } catch (error) {
      console.error(error);
      setTeamsToScore([]);
      setScoredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const criteriaScores = {
        Innovation: scores.innovation,
        'Technical Complexity': scores.technicalComplexity,
        'UX/UI': scores.uxui,
        Feasibility: scores.feasibility,
        Presentation: scores.presentation
      };
      await axios.post(`http://localhost:8081/judge/teams/${scoringTeam.id}/score`, {
        ...criteriaScores,
        comment: scores.comment,
        judgeName: judgeName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScoringTeam(null);
      setScores({ innovation: 5, technicalComplexity: 5, uxui: 5, feasibility: 5, presentation: 5, comment: '' });
      fetchTeamsToScore();
    } catch (error) {
      alert('Error submitting score: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const progress = scoredTeams.length + teamsToScore.length > 0 ? scoredTeams.length / (scoredTeams.length + teamsToScore.length) * 100 : 0;

  const getScoreColor = (score) => {
    if (score <= 2) return 'text-red-600';
    if (score <= 4) return 'text-orange-600';
    if (score <= 6) return 'text-yellow-600';
    if (score <= 8) return 'text-lime-600';
    return 'text-green-600';
  };

  const getSliderColor = (score) => {
    if (score <= 2) return '#ef4444'; // red-500
    if (score <= 4) return '#f97316'; // orange-500
    if (score <= 6) return '#eab308'; // yellow-500
    if (score <= 8) return '#84cc16'; // lime-500
    return '#22c55e'; // green-500
  };

  const getProgressColor = (percent) => {
    if (percent < 25) return 'bg-red-600';
    if (percent < 50) return 'bg-orange-600';
    if (percent < 75) return 'bg-yellow-600';
    return 'bg-green-600';
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar role="JUDGE" onLogout={onLogout} logo={logo} />
      <div className="relative bg-cover bg-center text-white p-8 rounded-2xl shadow-2xl mb-8 text-left mx-auto max-w-4xl" style={{ backgroundImage: 'url(' + llamaImg + ')', height: '300px' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl"></div>
        <div className="relative z-10 pt-4 pl-16">
          <h1 className="text-4xl font-extrabold mb-6 animate-pulse"></h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Judging Progress</h2>
          <div className="mb-2">
            <span className="text-sm text-gray-600">Scored: {scoredTeams.length} / {scoredTeams.length + teamsToScore.length} teams</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={getProgressColor(progress) + ' h-2 rounded-full'} style={{ width: progress + '%' }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Teams to Score</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ul className="space-y-3">
                {teamsToScore.map(team => (
                  <li key={team.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{team.teamName}</span>
                      <p className="text-sm text-gray-600">{team.description}</p>
                    </div>
                    <button
                      onClick={() => setScoringTeam(team)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Score
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Already Scored</h3>
            <div className="space-y-3">
              {scoredTeams.map(item => (
                <div key={item.team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.team.teamName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.team.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className={'text-lg font-bold ' + getScoreColor(Math.round(item.score))}>{item.score.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Final Score</div>
                      </div>
                      {item.comment && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{item.comment}"</p>
                      )}
                    </div>
                    <button
                      onClick={() => setViewingScore(item)}
                      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {scoringTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold mb-4">Score Team: {scoringTeam.teamName}</h3>
              <p className="text-gray-600 mb-6">{scoringTeam.description}</p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Innovation</label>
                    <span className={'text-lg font-bold ' + getScoreColor(scores.innovation)}>
                      {scores.innovation}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{getScoreLabel(scores.innovation)}</p>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-200"
                        style={{
                          width: ((scores.innovation - 1) / 9) * 100 + '%',
                          backgroundColor: getSliderColor(scores.innovation)
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores.innovation}
                      onChange={(e) => setScores({...scores, innovation: parseInt(e.target.value)})}
                      className="absolute top-0 w-full h-2 cursor-pointer"
                      style={{ accentColor: getSliderColor(scores.innovation) }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Technical Complexity</label>
                    <span className={'text-lg font-bold ' + getScoreColor(scores.technicalComplexity)}>
                      {scores.technicalComplexity}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{getScoreLabel(scores.technicalComplexity)}</p>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-200"
                        style={{
                          width: ((scores.technicalComplexity - 1) / 9) * 100 + '%',
                          backgroundColor: getSliderColor(scores.technicalComplexity)
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores.technicalComplexity}
                      onChange={(e) => setScores({...scores, technicalComplexity: parseInt(e.target.value)})}
                      className="absolute top-0 w-full h-2 cursor-pointer"
                      style={{ accentColor: getSliderColor(scores.technicalComplexity) }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">UX/UI</label>
                    <span className={'text-lg font-bold ' + getScoreColor(scores.uxui)}>
                      {scores.uxui}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{getScoreLabel(scores.uxui)}</p>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-200"
                        style={{
                          width: ((scores.uxui - 1) / 9) * 100 + '%',
                          backgroundColor: getSliderColor(scores.uxui)
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores.uxui}
                      onChange={(e) => setScores({...scores, uxui: parseInt(e.target.value)})}
                      className="absolute top-0 w-full h-2 cursor-pointer"
                      style={{ accentColor: getSliderColor(scores.uxui) }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Feasibility</label>
                    <span className={'text-lg font-bold ' + getScoreColor(scores.feasibility)}>
                      {scores.feasibility}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{getScoreLabel(scores.feasibility)}</p>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-200"
                        style={{
                          width: ((scores.feasibility - 1) / 9) * 100 + '%',
                          backgroundColor: getSliderColor(scores.feasibility)
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores.feasibility}
                      onChange={(e) => setScores({...scores, feasibility: parseInt(e.target.value)})}
                      className="absolute top-0 w-full h-2 cursor-pointer"
                      style={{ accentColor: getSliderColor(scores.feasibility) }}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">Presentation</label>
                    <span className={'text-lg font-bold ' + getScoreColor(scores.presentation)}>
                      {scores.presentation}/10
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{getScoreLabel(scores.presentation)}</p>
                  <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all duration-200"
                        style={{
                          width: ((scores.presentation - 1) / 9) * 100 + '%',
                          backgroundColor: getSliderColor(scores.presentation)
                        }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores.presentation}
                      onChange={(e) => setScores({...scores, presentation: parseInt(e.target.value)})}
                      className="absolute top-0 w-full h-2 cursor-pointer"
                      style={{ accentColor: getSliderColor(scores.presentation) }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                  <textarea
                    placeholder="Optional comment"
                    value={scores.comment}
                    onChange={(e) => setScores({...scores, comment: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={submitScore}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Score'}
                </button>
                <button
                  onClick={() => setScoringTeam(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {viewingScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">
                My Score for {viewingScore.team.teamName}
              </h3>
              <p className="text-sm opacity-90 mt-1">Detailed breakdown of your evaluation</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Criterion Scores</h4>
                <div className="space-y-3">
                  {Object.entries(viewingScore.criteria).map((entry) => {
                    const criterion = entry[0];
                    const score = entry[1];
                    return (
                      <div key={criterion} className="py-2 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{criterion}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-indigo-600">{score}</span>
                            </div>
                            <span className="text-sm text-gray-500">/10</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{getScoreLabel(score)}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-700">Final Weighted Score</span>
                  <span className={getScoreColor(Math.round(viewingScore.score)) + ' text-xl font-bold'}>{viewingScore.score.toFixed(2)}</span>
                </div>
                {viewingScore.comment && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Your Comment</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 italic">"{viewingScore.comment}"</p>
                    </div>
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Scored on {new Date(viewingScore.timestamp).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setViewingScore(null)}
                className="w-full mt-6 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  }
export default JudgeDashboard;