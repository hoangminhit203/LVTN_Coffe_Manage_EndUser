import React from 'react';
import Img2 from '../../assets/HeroCoffe.png';

const ServicesData = [
  {
    id: 1,
    img: Img2,
    name: "Espresso",
    description: "Strong and bold coffee served in small quantities.",
    aosDelay: "100",
  },
  {
    id: 2,
    img: Img2,
    name: "Americano",
    description: "Americano diluted with hot water for a milder taste.",
    aosDelay: "300",
  },
  {
    id: 3,
    img: Img2,
    name: "Cappuccino",
    description: "Espresso with steamed milk and a layer of froth.",
    aosDelay: "500",
  }
];

const Services = () => {
  return (
    <>
      <span id="services"></span>
      <div className='py-10'>
        <div className="container">
          {/* header title */}
          <div className='text-center mb-20'>
            <h1 className='text-4xl font-bold text-gray-800' style={{ fontFamily: 'Pacifico, cursive' }}>
              Best Coffee For You
            </h1>
          </div>

          {/* service card section */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14 md:gap-5 place-items-center'>
            {ServicesData.map((data) => (
              <div
                data-aos="fade-up"
                data-aos-delay={data.aosDelay}
                key={data.id}
                className='rounded-2xl bg-white hover:bg-primary hover:text-white shadow-xl duration-200 max-w-[300px] group relative overflow-visible'
              >
                {/* img section */}
                <div className='h-[122px] overflow-visible'>
                  <img
                    src={data.img}
                    alt={data.name}
                    className='max-w-[200px] block mx-auto transform -translate-y-14 group-hover:scale-110 group-hover:rotate-6 duration-300'
                  />
                </div>

                {/* text content */}
                <div className='p-4 text-center'>
                  <h1 className='text-xl font-bold'>
                    {data.name}
                  </h1>
                  <p className='text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2'>
                    {data.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
