import React from 'react'
import Slider from 'react-slick'
const TestimonialData = [
  {
    id: 1,
    name: "John Doe",
    text: "Amazing coffee! The espresso here is the best I've ever tasted. The ambiance is cozy and perfect for working or relaxing.",
    img: "https://picsum.photos/101/101",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    text: "I'm a regular customer and I love their cappuccino. The staff is friendly and the service is quick. Highly recommended!",
    img: "https://picsum.photos/102/102",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    text: "Great place for coffee lovers! Their cold brew is exceptional and the pastries are fresh. Will definitely come back.",
    img: "https://picsum.photos/103/103",
    rating: 4,
  },
  {
    id: 4,
    name: "Emily Williams",
    text: "The best coffee shop in town! Love their seasonal drinks and the cozy atmosphere. Perfect spot for meeting friends.",
    img: "https://picsum.photos/104/104",
    rating: 5,
  },
  {
    id: 5,
    name: "David Martinez",
    text: "Excellent quality coffee and great customer service. Their latte art is impressive and tastes as good as it looks!",
    img: "https://picsum.photos/105/105",
    rating: 5,
  },
];

const Testimonial = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    resposive: [
      {
        breakpoint: 1000,
        setiings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        setiings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          inintalSlide: 2,
        },
      },
       {
        breakpoint: 640,
        setiings: {
          slidesToShow: 1,
          slidesToScroll: 1,   
        },
      },
    ]
  }
  return (
    <div className='py-10 mb-10'>
      <div className='container'>
        {/* Header section */}
        <div className='text-center mb-20 max-w-[600px] mx-auto'>
            <h1 className='text-4xl font-bold text-gray-800' style={{ fontFamily: 'Pacifico, cursive' }}>
              Customer Reviews
            </h1>
          </div>
        {/* Testimonial content can be added here */} 
        <div>
          <Slider {...settings}>
            {
              TestimonialData.map((data,index) => {
                return (
                  <div className='my-6' key={data.id}>
                    <div className='flex flex-col gap-4 shadow-lg py-8 px-6 mx-4 rounded-xl
                    bg-primary/10 relative'>
                      {/* image section */}
                      <div className='mb-4'>
                        <img src={data.img} alt=""
                        className='rounded-full w-20 h-20 '/>
                      </div>
                      {/* content section */}
                      <div className='flex flex-col items-center gap-4'>
                        <div className='space-y-3'>
                          <p className='text-xs text-gray-500'>{data.text}</p>
                          <h1 className='text-xl font-bold text-black/60 '  style={{ fontFamily: 'Pacifico, cursive' }}>{data.name}</h1>
                        </div>
                      </div>
                       <p className='text-black/20 text-9xl font-serif absolute top-0 right-0'>, ,</p>
                    </div>
                  </div>
                  )
              })
            }
          </Slider>
        </div>
       </div>
    </div>
  )
}

export default Testimonial
