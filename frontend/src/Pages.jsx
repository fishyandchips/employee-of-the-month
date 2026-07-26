import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css'

import Directory from './components/Directory';
import Profile from './components/Profile';
import Login from './components/Login';
// import Register from './components/Register';

function Pages() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
    </>
  )
}

export default Pages
