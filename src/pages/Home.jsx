import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchNearbyUsers = async () => {
      try {
        // User location is stored in GeoJSON format in DB: coordinates: [long, lat]
        // But we need to pass lat/long to API. 
        // Since we don't have user's current location in state (only in DB), 
        // we can either fetch it again or use the one from registration (stored in user object if we returned it).
        // For simplicity, let's assume we use the browser's current location again or the one from the user object if available.
        
        // Let's use browser location for real-time "nearby"
        navigator.geolocation.getCurrentPosition(async (position) => {
           const { latitude, longitude } = position.coords;
           const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/nearby-users?latitude=${latitude}&longitude=${longitude}&userId=${user._id}`);
           setNearbyUsers(data);
        });

      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchNearbyUsers();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-500">Dating App</h1>
        <div className="flex items-center space-x-4">
          <span>Welcome, {user?.name}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        <h2 className="text-2xl font-semibold mb-4">Nearby Users</h2>
        {nearbyUsers.length === 0 ? (
          <p className="text-gray-400">No users found nearby.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyUsers.map((u) => (
              <div key={u._id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 border border-gray-700">
                <h3 className="text-xl font-bold text-white">{u.name}</h3>
                <p className="text-gray-400">{u.gender}, {u.age} years old</p>
                {/* Distance could be calculated here if returned from API */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
