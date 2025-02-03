import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Calculator from './components/Calculator';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/calculator">Calculator</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>

        <div className="hero">
          <h1>EcoTrack 🌱</h1>
          <p>Calculate and reduce your environmental footprint</p>
        </div>

        <div className="container">
          <Routes>
            <Route path="/" element={
              <section className="calculator-section">
                <h2>Carbon Footprint Calculator</h2>
                <Calculator />
              </section>
            }/>
            <Route path="/about" element={
              <section className="about-section">
                <h2>About EcoTrack</h2>
                <p>Learn how small changes can make a big difference...</p>
              </section>
            }/>
          </Routes>
        </div>

        <footer className="footer">
          <p>© 2024 EcoTrack | Sustainable Solutions for a Better Tomorrow</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;