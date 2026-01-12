import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

import CoffeeMain from "../../assets/bannerCofffe.jpg";
import Tea from "../../assets/banner1.jpg";
import News from "../../assets/banner2.jpg";
import About from "../../assets/banner3.jpg";
import Contact from "../../assets/coffe-white.jpg";

const Home = () => {
  const [mainSlides, setMainSlides] = useState([]);
  const [subCards, setSubCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [, setLoading] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_API_BASE_URL || "/api";
        const res = await fetch(`${base}/Banner?page=1&pageSize=20`, { method: "GET" });
        const json = await res.json();
        // API may return { isSuccess, message, data: [...] } or array or { data: { records: [...] } }
        let records = [];
        if (Array.isArray(json)) {
          if (json.length && Array.isArray(json[0]?.data)) records = json[0].data;
          else if (json.every((x) => x && x.id !== undefined)) records = json;
        } else if (json && typeof json === "object") {
          if (Array.isArray(json.data)) records = json.data;
          else if (Array.isArray(json.records)) records = json.records;
          else if (Array.isArray(json.data?.records)) records = json.data.records;
        }

        // filter active and split by type (0 = MainSlider, 1 = SubCard), sort by position
        const active = (records || []).filter((r) => r?.isActive).sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
        const main = active.filter((r) => Number(r.type) === 0);
        const subs = active.filter((r) => Number(r.type) === 1);
        setMainSlides(main);
        setSubCards(subs);
        setIndex(0);
      } catch (err) {
        console.error("Failed to load banners", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // autoplay
  useEffect(() => {
    if (!mainSlides.length) return;
    const id = setInterval(() => {
      if (!paused) setIndex((i) => (i + 1) % mainSlides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [mainSlides, paused]);

  const prev = () => setIndex((i) => (i - 1 + mainSlides.length) % mainSlides.length);
  const next = () => setIndex((i) => (i + 1) % mainSlides.length);

  const heroImg = mainSlides[index]?.imageUrl || CoffeeMain;
  const heroTitle = mainSlides[index]?.title;
  const heroDesc = mainSlides[index]?.description; 

  return (
    <div className="w-full px-6 py-6">
      <div className="flex gap-4 h-[520px]">

        {/* BANNER LỚN (carousel) */}
        <div
          className="w-[60%] relative rounded-xl overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <img
            src={heroImg}
            alt={heroTitle ? heroTitle : `Banner ${mainSlides[index]?.id ?? "hero"}`}
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Text overlay */}
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center pl-14">
            <h1 className="text-5xl font-bold text-white mb-4 max-w-xl">
              {heroTitle ?? "Thưởng thức cà phê"}
            </h1>
            <p className="text-white/90 max-w-lg mb-6">
              {heroDesc ?? "Nơi cuộc hẹn trọn đầy với cà phê, món ăn nhẹ và không gian cảm hứng."}
            </p>
            <span className="text-white border-b-2 border-red-500 w-fit cursor-pointer">
              XEM NGAY
            </span>
          </div>

          {/* nav buttons */}
          {mainSlides.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full">
                ‹
              </button>
              <button onClick={next} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white p-2 rounded-full">
                ›
              </button>

              {/* indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {mainSlides.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setIndex(idx)}
                    className={`h-2 w-8 rounded-full transition-all ${idx === index ? 'bg-white' : 'bg-white/40'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 4 BANNER NHỎ (2x2) */}
        <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-4">
          {(() => {
            // Prepare up to 4 small cards; fill missing with defaults
            const defaults = [
              { imageUrl: Tea, title: 'Sản Phẩm', description: 'Không chỉ có cà phê' },
              { imageUrl: News, title: 'Tin tức', description: 'Cập nhật mới nhất' },
              { imageUrl: About, title: 'Giới thiệu', description: 'Chúng tôi là ai' },
              { imageUrl: Contact, title: 'Liên hệ', description: 'Nhắn gì với chúng tôi' },
            ];

            const getLinkForTitle = (t) => {
              if (!t) return '/';
              const s = t.toLowerCase();
              if (s.includes('trà') || s.includes('tra') || s.includes('cà phê') || s.includes('càphe') || s.includes('sản phẩm') || s.includes('menu')) return '/menu';
              if (s.includes('liên')) return '/contact';
              if (s.includes('giới')) return '/about';
              if (s.includes('tin') || s.includes('news')) return '/about';
              // default to home
              return '/';
            };

            const used = [];
            for (let i = 0; i < 4; i++) {
              const s = subCards && subCards[i];
              if (s) {
                const title = s.title ?? defaults[i].title;
                used.push({
                  imageUrl: s.imageUrl,
                  title,
                  description: s.description ?? defaults[i].description,
                  link: getLinkForTitle(title),
                });
              } else {
                const title = defaults[i].title;
                used.push({ ...defaults[i], link: getLinkForTitle(title) });
              }
            }

            return used.map((c, idx) => (
              <Link
                to={c.link}
                key={idx}
                className="block h-full rounded-xl overflow-hidden group transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <SmallCard img={c.imageUrl} title={c.title} desc={c.description} />
              </Link>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

const SmallCard = ({ img, title, desc }) => (
  <div className="relative rounded-xl overflow-hidden h-full transform transition-shadow duration-300">
    <img
      src={img}
      alt={title}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 px-4 py-4 flex flex-col justify-end transition-colors duration-300">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/80">{desc}</p>
      <span className="text-sm text-white border-b border-red-500 w-fit mt-1">
        XEM NGAY
      </span>
    </div>
  </div>
);

export default Home;
