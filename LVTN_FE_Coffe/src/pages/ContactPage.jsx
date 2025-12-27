import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

const ContactPage = () => {
  const [formStatus, setFormStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('Cảm ơn bạn! Tin nhắn của bạn đã được gửi đi.');
    // Logic gửi mail hoặc lưu DB sẽ thực hiện ở đây
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gray-900 py-16 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-black italic mb-4">LIÊN HỆ VỚI CHÚNG TÔI</h1>
        <p className="text-gray-400 max-w-2xl mx-auto px-4">
          Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp và giải đáp mọi thắc mắc của bạn về sản phẩm và dịch vụ.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Thông tin chi tiết */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Thông Tin</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-3 rounded-xl text-yellow-700">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4 className="font-bold">Địa chỉ trụ sở</h4>
                    <p className="text-gray-600 text-sm">180 Cao Lỗ, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <h4 className="font-bold">Hotline</h4>
                    <p className="text-gray-600 text-sm">1900 6000 (8:00 - 21:00)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-xl text-red-700">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4 className="font-bold">Email hỗ trợ</h4>
                    <p className="text-gray-600 text-sm">support@caphenangluong.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-xl text-green-700">
                    <FaClock />
                  </div>
                  <div>
                    <h4 className="font-bold">Giờ làm việc</h4>
                    <p className="text-gray-600 text-sm">Thứ 2 - Chủ Nhật: 06:30 - 22:00</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="font-bold mb-4">Kết nối với chúng tôi</h4>
                <div className="flex gap-4">
                  <a href="#" className="text-2xl text-blue-600 hover:scale-110 transition"><FaFacebook /></a>
                  <a href="#" className="text-2xl text-pink-600 hover:scale-110 transition"><FaInstagram /></a>
                  <a href="#" className="text-2xl text-red-600 hover:scale-110 transition"><FaYoutube /></a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Biểu mẫu liên hệ */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Gửi Tin Nhắn Cho Chúng Tôi</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input 
                      type="tel" required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition"
                      placeholder="09xx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ Email</label>
                  <input 
                    type="email" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung lời nhắn</label>
                  <textarea 
                    rows="5" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 outline-none transition"
                    placeholder="Bạn cần hỗ trợ điều gì?"
                  ></textarea>
                </div>

                {formStatus && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl font-medium">
                    {formStatus}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full md:w-max px-12 py-4 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 shadow-lg shadow-yellow-200 transition-all active:scale-95"
                >
                  GỬI YÊU CẦU
                </button>
              </form>
            </div>

            {/* Google Maps nhúng tạm */}
            <div className="mt-8 rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-64">
              <iframe 
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460232428343!2d106.691741!3d10.776019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3af1032331%3A0x673479a377d64d50!2zQsO5aSBUaG7MasterCBYdcOibiwgUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
                className="w-full h-full border-none"
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;