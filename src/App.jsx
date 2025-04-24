import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContractDetails from './pages/ContractDetails';
import ClientForm from './pages/ClientForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sistema de Gestão de Contratos</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contract/:id" element={<ContractDetails />} />
            <Route path="/form/:ids" element={<ClientForm />} />
          </Routes>
        </main>
        <footer>
          <p>© {new Date().getFullYear()} - Sistema de Gestão de Contratos</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
