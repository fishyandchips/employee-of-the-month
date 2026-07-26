import { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard`, {
          withCredentials: true
        });

        setLeaderboard(data.leaderboard);
      } catch (err) {
        console.log(err.response.data.error);
      }
    };

    fetchLeaderboard();
  }, []);

  const getBackgroundColor = (i) => {
    if (i === 0) {
      return "#F0D265";
    } else if (i === 1) {
      return "#D4D4D4";
    } else if (i === 2) {
      return "#EDAF7B";
    } else {
      return "#FFFFFF";
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5 px-10 py-5">
        <h1 className="text-2xl font-bold">
          Leaderboard
        </h1>

        <div className="flex flex-col gap-2">
          {leaderboard.map((employee, i) => (
            <div
              key={employee.id}
              className="flex justify-between p-5"
              style={{ backgroundColor: getBackgroundColor(i) }}
            >
              <div className="flex gap-12">
                <span>{i + 1}</span>
                <span>{employee.name}</span>
              </div>
              
              <span>{employee.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Leaderboard;
