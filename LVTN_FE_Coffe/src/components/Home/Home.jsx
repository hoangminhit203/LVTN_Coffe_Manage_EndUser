import React from 'react'
import HeroImg from '../../assets/HeroCoffe.png'

const Home = () => {
  return (
    <div className='min-h-[500px] sm:min-h-[600px] bg-brand-dark flex justify-center items-center text-white overflow-hidden'>
      <div className='container pb-8 sm:pb-0'>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
          
          {/* Text Content Section */}
          <div className='order-2 sm:order-1 flex flex-col justify-center gap-6'>
            <h1 data-aos="fade-down" data-aos-once="true"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold">
              We serve the richest{" "}
              <span data-aos="fade-down" data-aos-once="true" data-aos-delay="300"
                className='text-primary' style={{ fontFamily: 'Pacifico, cursive' }}>
                coffee
              </span>{" "}
              in the city 
            </h1>

            <div data-aos="fade-down" data-aos-delay="500" >
              <button className='bg-gradient-to-r from-primary to-secondary border-2 border-primary rounded-full px-4 py-3 text-white hover:scale-105 duration-200'>
                Coffee Best Seller            
              </button>
            </div>
          </div>
          
          {/* Image Section */}
          <div data-aos="zoom-in"
            className='min-h-[450px] flex justify-center items-center order-1 sm:order-2 relative overflow-hidden'>
            <img
              src={HeroImg}
              alt="Hero Coffee"
              className='max-w-full w-[250px] sm:w-[380px] lg:w-[420px] h-auto object-contain mx-auto spin'
            />
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home
