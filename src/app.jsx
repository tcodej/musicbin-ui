import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApplicationProvider } from './contexts/application';
import Passcode from './components/passcode';
import Header from './components/header';
import Home from './pages/home';
import './assets/styles/main.scss';

export default function App() {
  const [authenticated, setAuthenticated] = useState(sessionStorage.getItem('authenticated'));

  const unlock = () => {
    setAuthenticated(true);
  }

  return (
    <ApplicationProvider>
      <BrowserRouter basename="/">
      { authenticated ?
        <>
          <Header />
          <div id="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/*" element={<Home />} />
            </Routes>
          </div>
        </>
      :
        <Passcode onUnlock={unlock} />
      }
      </BrowserRouter>
    </ApplicationProvider>
  )
}
