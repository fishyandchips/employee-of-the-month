import { useState, useEffect } from 'react';
import axios from 'axios';

const Transfer = () => {
  const [score, setScore] = useState(0);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/score`, {
          withCredentials: true
        });

        setScore(data.score);
      } catch (err) {
        console.log(err.response.data.error);
      }
    };

    fetchScore();
  }, []);

  const transferPoints = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/score`,
        {
          recipientId,
          amount,
        },
        {
          withCredentials: true
        }
      );

      setScore(data.score);
      setRecipientId("");
      setAmount("");
      setError("");
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 px-10 py-5">
        <h1 className="text-2xl font-bold">
          Transfer
        </h1>

        <p>
          Current score: {score.toLocaleString()}
        </p>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">
            Error: {error}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            transferPoints();
          }}
          className="flex flex-col gap-4"
        >
          <input
            className="px-5 py-3 rounded-md border"
            placeholder="Recipient ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />

          <input
            className="px-5 py-3 rounded-md border"
            type="number"
            min="1"
            max="5000000"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button 
            type="submit" 
            className="text-white px-5 py-3 rounded-md bg-blue-500 cursor-pointer hover:bg-blue-600"
          >
            Transfer
          </button>
        </form>
      </div>
    </>
  );
}

export default Transfer;
