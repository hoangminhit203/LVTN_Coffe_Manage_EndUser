import React from 'react';
import { FaLeaf, FaCoffee, FaGlobeAsia, FaUsers, FaQuoteLeft } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section: Hình ảnh lớn truyền cảm hứng */}
      <div className="relative h-[500px] bg-black flex items-center justify-center text-white">
        <div className="absolute inset-0 opacity-60 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070" 
            alt="Coffee Plantation" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black italic mb-4 tracking-tighter">
            HÀNH TRÌNH TỈNH THỨC
          </h1>
          <p className="text-lg md:text-2xl tracking-[0.3em] uppercase font-light">
            Khơi nguồn sáng tạo từ hạt cà phê Việt
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* 2. Brand Story: Câu chuyện thương hiệu */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <FaQuoteLeft className="text-yellow-600 text-4xl mx-auto mb-6 opacity-50" />
          <h2 className="text-4xl font-bold mb-8 text-gray-900">Câu Chuyện Của Chúng Tôi</h2>
          <p className="text-xl text-gray-600 leading-relaxed italic font-serif">
            "Bắt đầu từ những triền đồi đất đỏ bazan tại Buôn Ma Thuột – thủ phủ cà phê của thế giới, 
            chúng tôi mang trong mình sứ mệnh tôn vinh hạt cà phê Robusta Việt Nam. 
            Mỗi tách cà phê là một tác phẩm nghệ thuật, kết tinh từ giọt mồ hôi của người nông dân 
            và tâm huyết của những nghệ nhân rang xay bậc thầy."
          </p>
        </div>

        {/* 3. Core Values: Giá trị cốt lõi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-yellow-600 hover:text-white transition-all duration-300">
            <div className="text-yellow-600 group-hover:text-white text-5xl mb-6 transition-colors">
              <FaLeaf />
            </div>
            <h3 className="text-xl font-bold mb-3">Nguyên liệu sạch</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Tuyển chọn từng hạt cà phê chín đỏ, canh tác bền vững theo tiêu chuẩn hữu cơ quốc tế.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-yellow-600 hover:text-white transition-all duration-300">
            <div className="text-yellow-600 group-hover:text-white text-5xl mb-6 transition-colors">
              <FaCoffee />
            </div>
            <h3 className="text-xl font-bold mb-3">Bí quyết độc bản</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Công nghệ rang xay hiện đại kết hợp bí quyết phương Đông huyền bí tạo nên hương vị khác biệt.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-yellow-600 hover:text-white transition-all duration-300">
            <div className="text-yellow-600 group-hover:text-white text-5xl mb-6 transition-colors">
              <FaUsers />
            </div>
            <h3 className="text-xl font-bold mb-3">Cộng đồng sáng tạo</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Xây dựng không gian kết nối những tâm hồn đam mê tri thức và khát khao đổi mới.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-gray-50 hover:bg-yellow-600 hover:text-white transition-all duration-300">
            <div className="text-yellow-600 group-hover:text-white text-5xl mb-6 transition-colors">
              <FaGlobeAsia />
            </div>
            <h3 className="text-xl font-bold mb-3">Vươn tầm quốc tế</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Tự hào mang thương hiệu Việt chinh phục trái tim của những người yêu cà phê trên khắp toàn cầu.
            </p>
          </div>
        </div>

        {/* 4. Vision Section: Hình ảnh kết hợp nội dung */}
        <div className="flex flex-col md:flex-row items-center gap-16 bg-gray-900 rounded-[40px] overflow-hidden text-white shadow-2xl">
          <div className="md:w-1/2 h-[400px] md:h-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1961" 
              alt="Art of Coffee" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8 md:p-16 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 italic">Tầm Nhìn & Sứ Mệnh</h2>
              <div className="w-20 h-1 bg-yellow-500"></div>
            </div>
            <p className="text-xl leading-relaxed text-gray-300">
              "Trở thành một hệ sinh thái cà phê năng lượng hàng đầu, nơi mỗi sản phẩm đều mang lại sức mạnh cho trí tuệ và sự tỉnh thức."
            </p>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Nghiên cứu ứng dụng khoa học vào quy trình rang xay.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Phát triển chuỗi giá trị cà phê công bằng và bền vững.
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Truyền cảm hứng về lối sống tỉnh thức qua từng tách cà phê.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;