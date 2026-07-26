import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css'

import Directory from './components/Directory';
import Profile from './components/Profile';
import Login from './components/Login';
import Transfer from './components/Transfer';
import Leaderboard from './components/Leaderboard';

function Pages() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </>
  )
}

export default Pages
