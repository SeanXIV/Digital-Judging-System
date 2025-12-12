import { useNavigate } from 'react-router-dom';
import wethinkcodeLogo from '../assets/wethinkcode-logo.png';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <img src={wethinkcodeLogo} alt="WeThinkCode" className="mx-auto h-16 mb-8" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hackathon Judging System</h1>
        <p className="text-gray-600 mb-8">Choose your role to get started</p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            🏢 Organizer Login
          </button>
          <button
            onClick={() => navigate('/judge-select')}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            👨‍⚖️ Judge Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;