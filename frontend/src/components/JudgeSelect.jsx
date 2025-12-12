import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../api';
import wethinkcodeLogo from '../assets/wethinkcode-logo.png';

function JudgeSelect() {
  const [judges, setJudges] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [fading, setFading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/judges`);
      setJudges(response.data);
    } catch (error) {
      console.error('Failed to fetch judges:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedJudge) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: selectedJudge,
          password: 'password123'
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', 'JUDGE');
        const judge = judges.find(j => j.email === selectedJudge);
        localStorage.setItem('judge', judge ? judge.name : selectedJudge);
        setShowWelcome(true);
      } catch (error) {
        alert('Login failed: ' + (error.response?.data || error.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Select Judge</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose your judge identity:</label>
            <select
              value={selectedJudge}
              onChange={(e) => setSelectedJudge(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Judge</option>
              {judges.map(judge => (
                <option key={judge.email} value={judge.email}>{judge.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Enter as {selectedJudge ? judges.find(j => j.email === selectedJudge)?.name || selectedJudge : 'Judge'}
          </button>
        </form>
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className={`fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <img src={wethinkcodeLogo} alt="WeThinkCode" className="absolute top-4 left-4 w-16 h-auto" />
          <div className="text-center text-white p-8 max-w-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome</h2>
              <h1 className="text-4xl font-extrabold mb-6">{judges.find(j => j.email === selectedJudge)?.name || 'Judge'}</h1>
            </div>
            <p className="text-lg mb-8 leading-relaxed">
              🦙 Get ready to judge some amazing projects in the Llama Innovation Challenge! Your expertise matters.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-indigo-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Let's Start Judging! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JudgeSelect;