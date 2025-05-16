import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './sidebar';
import Dashboard from './components/dashboard';
import Profile from './components/profile';
import Add from './components/add';
import Search from './components/search';
import { AccountProvider } from './Provider';

const App = () => {
  return (
    <AccountProvider>
      <Router>
        <div className='app-container'>
          <Sidebar />
          <main className='main-container'>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/add' element={<Add />} />
              <Route path='/search' element={<Search />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AccountProvider>
  );
};

export default App;
