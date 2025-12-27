import React from "react";

import CoffeeMain from "../../assets/bannerCofffe.jpg";
import Tea from "../../assets/banner1.jpg";
import News from "../../assets/banner2.jpg";
import About from "../../assets/banner3.jpg";
import Contact from "../../assets/coffe-white.jpg";

const Home = () => {
  return (
    <div className="w-full px-6 py-6">
      <div className="flex gap-4 h-[520px]">

        {/* BANNER LỚN */}
        <div className="w-[60%] relative rounded-xl overflow-hidden">
          <img
            src={CoffeeMain}
            alt="Coffee"
            className="w-full h-full object-cover"
          />

          {/* Text overlay */}
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center pl-14">
            <h1 className="text-5xl font-bold text-white mb-4 max-w-xl">
              Thưởng thức cà phê
            </h1>
            <p className="text-white/90 max-w-lg mb-6">
              Nơi cuộc hẹn trọn đầy với cà phê, món ăn nhẹ và không gian cảm hứng.
            </p>
            <span className="text-white border-b-2 border-red-500 w-fit cursor-pointer">
              XEM NGAY
            </span>
          </div>
        </div>

        {/* 4 BANNER NHỎ (2x2) */}
        <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-4">
          <SmallCard img={Tea} title="Trà" desc="Không chỉ có cà phê" />
          <SmallCard img={News} title="Tin tức" desc="Cập nhật mới nhất" />
          <SmallCard img={About} title="Giới thiệu" desc="Chúng tôi là ai" />
          <SmallCard img={Contact} title="Liên hệ" desc="Nhắn gì với chúng tôi" />
        </div>
      </div>
    </div>
  );
};

const SmallCard = ({ img, title, desc }) => (
  <div className="relative rounded-xl overflow-hidden">
    <img
      src={img}
      alt={title}
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/30 px-4 py-4 flex flex-col justify-end">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/80">{desc}</p>
      <span className="text-sm text-white border-b border-red-500 w-fit mt-1">
        XEM NGAY
      </span>
    </div>
  </div>
);

export default Home;
