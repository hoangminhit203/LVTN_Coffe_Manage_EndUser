import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import AOS from 'aos';

import "aos/dist/aos.css";
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import MenuPage from './pages/MenuPage';
import ContactPage from './pages/ContactPage';

const App = () => {
  useEffect(() => {
    AOS.init(
      {
        offset: 100,
        duration: 1000,
        easing: 'ease-in',
        delay: 200,
      });
  }, []);
  
  return (
    <div className='overflow-x-hidden'>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;