import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, paymentApi } from '../components/Api/products';
import orderApi from '../components/Api/order';
import shippingAddressApi from '../components/Api/ShippingAddress';
import { isAuthenticated } from '../utils/auth';
import { 
  FaTruck, FaMapMarkerAlt, FaCreditCard, FaChevronLeft, 
  FaShoppingBag, FaMoneyBillWave, FaEnvelope, FaUser, FaPhone 
} from 'react-icons/fa';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingFee, setShippingFee] = useState(30000);
  const [note, setNote] = useState('');
  
  // State dành cho khách vãng lai (Guest) thêm trường Email
  const [guestInfo, setGuestInfo] = useState({
    receiverName: '',
    phone: '',
    email: '', // Thêm email ở đây
    address: ''
  });

  const navigate = useNavigate();
  const isUser = isAuthenticated(); 

  useEffect(() => {
    fetchCart();
    if (isUser) {
      fetchAddresses();
    }
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      if (!data || !data.items || data.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(data);
    } catch (err) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await shippingAddressApi.getAll();
      const addressList = response.data || [];
      setAddresses(addressList);
      const defaultAddr = addressList.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation nâng cao
    if (isUser && !selectedAddressId) return setError('Vui lòng chọn địa chỉ giao hàng');
    if (!isUser) {
      if (!guestInfo.receiverName || !guestInfo.phone || !guestInfo.address || !guestInfo.email) {
        return setError('Vui lòng điền đầy đủ thông tin và Email để nhận hóa đơn');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestInfo.email)) return setError('Email không hợp lệ');
    }

    setSubmitting(true);
    try {
      const orderData = {
        // Nếu là Member gửi ID, nếu là Guest gửi thông tin trực tiếp
        shippingAddressId: isUser ? selectedAddressId : null,
        receiverName: isUser ? null : guestInfo.receiverName,
        receiverPhone: isUser ? null : guestInfo.phone,
        receiverEmail: isUser ? null : guestInfo.email, // Gửi email xuống backend
        shippingAddress: isUser ? null : guestInfo.address, 
        
        shippingMethod: 'GHTK',
        note: note,
        orderItems: cart.items.map(item => ({
          productVariantId: item.productVariantId || item.id,
          quantity: item.quantity
        }))
      };
      
      const orderRes = await orderApi.create(orderData);
      const orderId = orderRes?.data?.id || orderRes?.id;

      if (paymentMethod === 'VNPAY') {
        const vnPayUrl = await paymentApi.createVnPayUrl(orderId);
        if (vnPayUrl) {
          await cartApi.clearCart();
          window.location.href = vnPayUrl;
        }
      } else {
        await cartApi.clearCart();
        alert('Đặt hàng thành công! Thông tin đơn hàng đã được gửi tới email của bạn.');
        navigate('/product-list');
      }
    } catch (err) {
      setError(err.message || 'Lỗi xử lý đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold">Đang chuẩn bị đơn hàng...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-semibold">
            <FaChevronLeft size={14}/> QUAY LẠI GIỎ HÀNG
          </button>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">THANH TOÁN ĐƠN HÀNG</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* THÔNG TIN NHẬN HÀNG */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div className="bg-red-100 p-2 rounded-lg"><FaMapMarkerAlt className="text-red-500" /></div>
                Thông tin nhận hàng
              </h2>

              {!isUser ? (
                <div className="grid grid-cols-1 gap-5">
                  <div className="relative">
                    <FaUser className="absolute left-4 top-4 text-gray-300" />
                    <input 
                      type="text" placeholder="Họ tên người nhận *" 
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={e => setGuestInfo({...guestInfo, receiverName: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-4 text-gray-300" />
                      <input 
                        type="text" placeholder="Số điện thoại *" 
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-4 text-gray-300" />
                      <input 
                        type="email" placeholder="Email nhận hóa đơn *" 
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <textarea 
                    placeholder="Địa chỉ chi tiết (Số nhà, tên đường, phường/xã...) *" 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                    onChange={e => setGuestInfo({...guestInfo, address: e.target.value})}
                  />
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-xs">
                    💡 Bạn có thể đăng nhập để sử dụng địa chỉ đã lưu và tích điểm thành viên.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" className="hidden" name="addr" onChange={() => setSelectedAddressId(addr.id)} checked={selectedAddressId === addr.id} />
                      <div className="font-bold text-gray-800">{addr.receiverName}</div>
                      <div className="text-sm text-gray-500 mb-2">{addr.phone}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">{addr.fullAddress}</div>
                      {selectedAddressId === addr.id && <div className="absolute top-4 right-4 text-blue-500 font-bold text-xs uppercase">Chọn</div>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* PHƯƠNG THỨC THANH TOÁN */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div className="bg-purple-100 p-2 rounded-lg"><FaMoneyBillWave className="text-purple-500" /></div>
                Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label onClick={() => setPaymentMethod('COD')} className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center gap-4 ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                  <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === 'COD' ? 'border-blue-500 bg-white' : 'border-gray-200'}`}></div>
                  <div>
                    <div className="font-bold">Thanh toán khi nhận hàng</div>
                    <div className="text-xs text-gray-400">Kiểm tra hàng trước khi trả tiền</div>
                  </div>
                </label>
                <label onClick={() => setPaymentMethod('VNPAY')} className={`p-4 border-2 rounded-2xl cursor-pointer flex items-center gap-4 ${paymentMethod === 'VNPAY' ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
                   <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === 'VNPAY' ? 'border-red-500 bg-white' : 'border-gray-200'}`}></div>
                   <div>
                    <div className="font-bold text-red-600 italic">VNPAY</div>
                    <div className="text-xs text-gray-400">Thanh toán qua ví hoặc ngân hàng</div>
                  </div>
                </label>
              </div>
            </div>

            {/* GHI CHÚ */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-lg font-bold mb-4 text-gray-700">📝 Ghi chú đơn hàng</h2>
              <input 
                type="text" 
                placeholder="Lời nhắn cho shipper..." 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-100"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8 border border-blue-50">
              <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Đơn hàng của bạn</h2>
              
              <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="text-sm">
                      <span className="font-bold text-gray-700">{item.quantity}x</span> {item.productName}
                    </div>
                    <div className="text-sm font-bold text-gray-800 whitespace-nowrap ml-4">
                      {item.subtotal.toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính</span>
                  <span>{cart.totalPrice.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-red-600 pt-4">
                  <span>Tổng cộng</span>
                  <span>{(cart.totalPrice + shippingFee).toLocaleString()}đ</span>
                </div>
              </div>

              {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium text-center">{error}</div>}

              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl mt-8 font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 active:scale-95 disabled:bg-gray-200"
              >
                {submitting ? 'ĐANG XỬ LÝ...' : (paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'HOÀN TẤT ĐẶT HÀNG')}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                🛡️ Bảo mật thanh toán 100%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;