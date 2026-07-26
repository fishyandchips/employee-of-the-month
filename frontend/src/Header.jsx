import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Header = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth`, {
          withCredentials: true
        });
        
        setAuthenticated(data.authenticated);
        setUserId(data.userId);
      } catch (err) {
        console.log(err.response.data.error);
      }
    }

    checkAuth();
  }, [location.pathname]);

  const logOut = async () => {
    setAuthenticated(false);
    setUserId("");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        {
          withCredentials: true
        }
      );

      navigate("/login");
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <>
      {authenticated ? (
        <header className="flex w-full px-20 py-5 items-center bg-blue-500">
          <div className="flex w-full justify-between">
            <div className="flex gap-10">
              <h1 className="font-bold text-xl select-none">REDACTED</h1>
              <Link to="/directory">Directory</Link>
              <Link to={`/profile/${userId}`}>Profile</Link>
            </div>

            <button onClick={logOut}>Log out</button>
          </div>
        </header>
      ) : (
        <header className="flex w-full px-20 py-5 items-center bg-blue-500">
          <div className="flex w-full">
            <h1 className="font-bold text-xl select-none">REDACTED</h1>
          </div>
        </header>
      )}
    </>
  );
}

export default Header;
