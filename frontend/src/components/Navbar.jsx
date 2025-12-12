import { useNavigate } from 'react-router-dom';

function Navbar({ role, onLogout, logo }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white text-gray-800 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-32">
          <div className="flex items-center">
            <img src={logo} alt="WeThinkCode" className="h-20" />
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xl text-gray-600">Welcome, {role}</span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 px-8 py-4 rounded-md text-xl font-medium text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;