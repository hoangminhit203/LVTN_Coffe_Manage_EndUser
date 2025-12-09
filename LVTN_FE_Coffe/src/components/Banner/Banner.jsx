import React from 'react';
import BannerImg from '../../assets/HeroCoffe.png';
import BgTextture from '../../assets/bannerCofffe.jpg';
import { GrSecure } from 'react-icons/gr';
import { IoFastFood } from 'react-icons/io5';
import { GiFoodTruck } from 'react-icons/gi';

const bgImage = {
  backgroundImage: `url(${BgTextture})`,
  backgroundColor: "#270c03",
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  height: '100%',
  width: '100%',
};

const Banner = () => {
  return (
    <>   
      <div style={bgImage}>
        <div className='container min-h-[550px] flex justify-center items-center py-12 sm:py-0'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {/* Image Section */}
            <div>
              <img 
                src={BannerImg} 
                alt="Banner"
                className='max-w-[430px] w-full mx-auto spin drop-shadow-xl'
              />
            </div>
                
            {/* Text content Section */}
            <div className='flex flex-col justify-center gap-6 sm:pt-0'>
              <h1 
                className='text-3xl sm:text-4xl font-bold' 
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                Premium Blend Coffee
              </h1>
              <p className='text-sm text-gray-500 tracking-wide leading-5'>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequatur aut impedit, 
                temporibus distinctio vitae ipsam, odit similique, quae et maxime rerum voluptate 
                commodi inventore eos optio quam eaque neque sequi.
              </p>
              
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-5'>
                  <div className='flex items-center gap-3'>
                    <GrSecure className='text-2xl h-12 w-12 shadow-sm p-3 rounded-full bg-red-100' />
                    <span>Premium Coffee</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <IoFastFood className='text-2xl h-12 w-12 shadow-sm p-3 rounded-full bg-orange-100' />
                    <span>Hot Coffee</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <GiFoodTruck className='text-4xl h-12 w-12 shadow-sm p-3 rounded-full bg-yellow-100' />
                    <span>Cold Coffee</span>
                  </div>
                </div>
                
                <div className='border-l-4 border-primary/50 pl-6 space-y-3'>
                  <h1 
                    className='text-2xl' 
                    style={{ fontFamily: 'Pacifico, cursive' }}
                  >
                    Tea Lover
                  </h1>
                  <p className='text-gray-500 text-sm'>
                    Mucho tea party he loved. He read the newspapers to find out what was going on 
                    in the world and enjoyed a good cup of tea while doing so.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>      
      </div>
    </>
  );
};

export default Banner;
