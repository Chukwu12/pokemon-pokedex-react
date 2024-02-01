import React from 'react';
import './App.css';
import { Button } from 'react-bootstrap';
import HomePage from './pages/home';
function App() {
  return (
    <div className="App">
      <button>Click Me</button>
      <HomePage />
    </div>
  );
}

export default App;