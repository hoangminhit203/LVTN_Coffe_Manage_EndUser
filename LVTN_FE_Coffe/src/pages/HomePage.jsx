import React from 'react';
import Home from '../components/Home/Home';
import Services from '../components/Services/Services';
import Banner from '../components/Banner/Banner';
import Review from '../components/Review/Review';

const HomePage = () => {
  return (
    <>
      <Home />
      <Services />
      <Banner />
      <Review />
    </>
  );
};

export default HomePage;
