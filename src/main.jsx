import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LoopController from './components/LoopController.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <LoopController />
  </React.StrictMode>,
);
