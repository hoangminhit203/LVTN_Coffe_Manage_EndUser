import React, { useState } from 'react';

// Dữ liệu mẫu cho cửa hàng cà phê
const blogPosts = [
  {
    id: 1,
    category: "Hướng dẫn",
    title: "Cách pha Pour-over chuẩn vị tại nhà với bộ V60",
    summary: "Bí quyết để kiểm soát dòng nước và nhiệt độ, giúp làm nổi bật hương vị trái cây của hạt Arabica.",
    date: "15/01/2026",
    author: "Barista Tuấn",
    image: "https://images.unsplash.com/photo-1544787210-2211d44b565a?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: 2,
    category: "Kiến thức",
    title: "Phân biệt Arabica và Robusta: Bạn thuộc team nào?",
    summary: "Tìm hiểu sự khác biệt từ độ cao canh tác đến hàm lượng caffeine bên trong từng hạt cà phê.",
    date: "12/01/2026",
    author: "Admin",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: 3,
    category: "Review",
    title: "Đánh giá máy xay Timemore C3 mới nhất 2026",
    summary: "Chiếc máy xay tay 'quốc dân' có thực sự tốt cho cả Espresso và Cold Brew như lời đồn?",
    date: "10/01/2026",
    author: "Kỹ thuật viên",
    image: "https://images.unsplash.com/photo-1508253100312-341ef94df993?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: 4,
    category: "Cửa hàng",
    title: "Top 5 dụng cụ pha cà phê không thể thiếu cho dân văn phòng",
    summary: "Gọn nhẹ, dễ vệ sinh nhưng vẫn đảm bảo chất lượng cà phê tuyệt hảo mỗi buổi sáng.",
    date: "05/01/2026",
    author: "Hà Nguyễn",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: 5,
    category: "Hướng dẫn",
    title: "Mẹo bảo quản cà phê hạt giữ hương thơm lâu nhất",
    summary: "Đừng để cà phê của bạn mất mùi! Hãy học cách bảo quản đúng cách với túi van 1 chiều và lọ hút chân không.",
    date: "02/01/2026",
    author: "Admin",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: 6,
    category: "Kiến thức",
    title: "Nghệ thuật Espresso: Áp suất và thời gian chiết xuất",
    summary: "Tại sao 9 bar lại là con số vàng trong pha chế Espresso? Cùng tìm hiểu sâu về kỹ thuật này.",
    date: "01/01/2026",
    author: "Barista Tuấn",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
    featured: false
  }
];

const categories = ["Tất cả", "Hướng dẫn", "Kiến thức", "Review", "Cửa hàng"];

const NewsPage = () => {
  const [filter, setFilter] = useState("Tất cả");

  const filteredPosts = filter === "Tất cả" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
          Tạp chí Cà phê & Dụng cụ
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Cập nhật những kỹ thuật pha chế mới nhất, đánh giá dụng cụ và câu chuyện về những hạt cà phê đặc sản.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2 rounded-full border transition-all ${
              filter === cat 
              ? "bg-brown-600 bg-orange-800 text-white border-orange-800 shadow-lg" 
              : "bg-white text-gray-700 border-gray-200 hover:border-orange-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article 
            key={post.id} 
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-900 rounded">
                {post.category}
              </span>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.author}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-orange-800 cursor-pointer line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {post.summary}
              </p>
              <div className="mt-auto">
                <button className="text-orange-800 font-semibold text-sm flex items-center hover:gap-2 transition-all">
                  ĐỌC CHI TIẾT <span>&rarr;</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      
    </div>
  );
};

export default NewsPage;