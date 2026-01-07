import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, paymentApi, promotionApi } from '../components/Api/products';
import orderApi from '../components/Api/order';
import shippingAddressApi from '../components/Api/ShippingAddress';
import { isAuthenticated } from '../utils/auth';
import { useToast } from '../components/Toast/ToastContext';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import { 
  FaTruck, FaMapMarkerAlt, FaCreditCard, FaChevronLeft, 
  FaShoppingBag, FaMoneyBillWave, FaEnvelope, FaUser, FaPhone,
  FaPlus, FaEdit, FaTrash, FaTimes, FaSave 
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
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const toast = useToast();
  const { confirmState, confirm, handleClose, handleConfirm } = useConfirm();
  
  // State dành cho khách vãng lai (Guest) thêm trường Email
  const [guestInfo, setGuestInfo] = useState({
    receiverName: '',
    phone: '',
    email: '', // Thêm email ở đây
    address: ''
  });

  // State quản lý modal địa chỉ
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressFormMode, setAddressFormMode] = useState('add'); // 'add' hoặc 'edit'
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    receiverName: '',
    phone: '',
    fullAddress: '',
    isDefault: false
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

  // Mở modal thêm địa chỉ mới
  const openAddAddressModal = () => {
    setAddressFormMode('add');
    setAddressForm({
      receiverName: '',
      phone: '',
      fullAddress: '',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  // Mở modal sửa địa chỉ
  const openEditAddressModal = (address) => {
    setAddressFormMode('edit');
    setEditingAddressId(address.id);
    setAddressForm({
      receiverName: address.receiverName,
      phone: address.phone,
      fullAddress: address.fullAddress,
      isDefault: address.isDefault
    });
    setShowAddressModal(true);
  };

  // Lưu địa chỉ (thêm hoặc sửa)
  const handleSaveAddress = async () => {
    if (!addressForm.receiverName || !addressForm.phone || !addressForm.fullAddress) {
      toast.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      if (addressFormMode === 'add') {
        await shippingAddressApi.create(addressForm);
        toast.success('Đã thêm địa chỉ mới');
      } else {
        await shippingAddressApi.update(editingAddressId, addressForm);
        toast.success('Đã cập nhật địa chỉ');
      }
      fetchAddresses();
      setShowAddressModal(false);
    } catch (err) {
      toast.error('Lỗi khi lưu địa chỉ: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (id) => {
    confirm({
      title: 'Xóa địa chỉ',
      message: 'Bạn có chắc muốn xóa địa chỉ này?',
      type: 'danger',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          await shippingAddressApi.delete(id);
          fetchAddresses();
          if (selectedAddressId === id) setSelectedAddressId(null);
          toast.success('Đã xóa địa chỉ');
        } catch (err) {
          toast.error('Lỗi khi xóa địa chỉ: ' + (err.message || 'Vui lòng thử lại'));
        }
      }
    });
  };

  // Đặt địa chỉ làm mặc định
  const handleSetDefaultAddress = async (id) => {
    try {
      await shippingAddressApi.setDefault(id);
      fetchAddresses();
      setSelectedAddressId(id);
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (err) {
      toast.error('Lỗi khi đặt địa chỉ mặc định');
    }
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
      let orderData = {};
      
      if (isUser) {
        // Lấy thông tin địa chỉ đã chọn
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
        if (!selectedAddress) {
          setError('Không tìm thấy địa chỉ đã chọn');
          setSubmitting(false);
          return;
        }
        
        orderData = {
          shippingAddressId: selectedAddressId,
          receiverName: selectedAddress.receiverName,
          receiverPhone: selectedAddress.phone,
          receiverEmail: selectedAddress.email || '', // Lấy email từ địa chỉ
          shippingAddress: selectedAddress.fullAddress,
          shippingMethod: 'GHTK',
          promotionCode: appliedVoucher || voucherCode || null,
          note: note,
          orderItems: cart.items.map(item => ({
            productVariantId: item.productVariantId || item.id,
            quantity: item.quantity
          }))
        };
      } else {
        // Guest user
        orderData = {
          shippingAddressId: null,
          receiverName: guestInfo.receiverName,
          receiverPhone: guestInfo.phone,
          receiverEmail: guestInfo.email,
          shippingAddress: guestInfo.address,
          shippingMethod: 'GHTK',
          promotionCode: appliedVoucher || voucherCode || null,
          note: note,
          orderItems: cart.items.map(item => ({
            productVariantId: item.productVariantId || item.id,
            quantity: item.quantity
          }))
        };
      }
      
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
        toast.success('Đặt hàng thành công! Thông tin đơn hàng đã được gửi tới email của bạn.', 4000);
        setTimeout(() => navigate('/product-list'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi xử lý đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold">Đang chuẩn bị đơn hàng...</div>;

  return (
    <>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
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
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">Chọn địa chỉ giao hàng</p>
                    <button 
                      onClick={openAddAddressModal}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
                    >
                      <FaPlus /> Thêm địa chỉ mới
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" className="hidden" name="addr" onChange={() => setSelectedAddressId(addr.id)} checked={selectedAddressId === addr.id} />
                        <div className="font-bold text-gray-800">{addr.receiverName}</div>
                        <div className="text-sm text-gray-500 mb-2">{addr.phone}</div>
                        <div className="text-xs text-gray-400 line-clamp-2">{addr.fullAddress}</div>
                        {addr.isDefault && <div className="mt-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded inline-block">Mặc định</div>}
                        {selectedAddressId === addr.id && <div className="absolute top-4 right-4 text-blue-500 font-bold text-xs uppercase">Chọn</div>}
                        
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button 
                            onClick={(e) => { e.preventDefault(); openEditAddressModal(addr); }}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button 
                            onClick={(e) => { e.preventDefault(); handleDeleteAddress(addr.id); }}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <FaTrash /> Xóa
                          </button>
                          {!addr.isDefault && (
                            <button 
                              onClick={(e) => { e.preventDefault(); handleSetDefaultAddress(addr.id); }}
                              className="text-xs text-green-600 hover:text-green-700 ml-auto"
                            >
                              Đặt mặc định
                            </button>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {addresses.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Chưa có địa chỉ nào. Thêm địa chỉ để tiếp tục.
                    </div>
                  )}
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

            {/* MÃ GIẢM GIÁ & GHI CHÚ */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                  🎫 Mã giảm giá
                </h2>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Nhập mã giảm giá (nếu có)" 
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  />
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!voucherCode) { toast.warning('Vui lòng nhập mã giảm giá'); return; }
                      if (!cart) { toast.error('Không có giỏ hàng'); return; }
                      try {
                        setApplyingPromo(true);
                        const orderTotal = cart.totalPrice || 0;
                        const res = await promotionApi.apply(voucherCode, orderTotal);
                        if (res && res.isSuccess) {
                          const discount = Number(res.data?.discountAmount || 0);
                          setDiscountAmount(discount);
                          setAppliedVoucher(voucherCode);
                          toast.success(res.message || 'Mã giảm giá đã được áp dụng');
                        } else {
                          const msg = (res && res.message) || 'Mã khuyến mãi không hợp lệ';
                          toast.error(msg);
                        }
                      } catch (err) {
                        toast.error(err.message || 'Lỗi khi áp dụng mã');
                      } finally {
                        setApplyingPromo(false);
                      }
                    }}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition">
                    {applyingPromo ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="mt-3 text-sm text-green-700 flex items-center gap-3">
                    <span className="font-medium">Đã áp dụng:</span>
                    <span className="px-3 py-1 bg-green-100 rounded">{appliedVoucher}</span>
                    <button onClick={(e) => { e.preventDefault(); setAppliedVoucher(null); setDiscountAmount(0); toast.info('Đã gỡ mã'); }} className="text-xs text-red-600 ml-2">Gỡ</button>
                  </div>
                )}
              </div>

              <div>
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Giảm giá</span>
                    <span className="text-green-600">-{discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-black text-red-600 pt-4">
                  <span>Tổng cộng</span>
                  <span>{Math.max(0, (cart.totalPrice - discountAmount + shippingFee)).toLocaleString()}đ</span>
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

      {/* Modal thêm/sửa địa chỉ */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
            <button 
              onClick={() => setShowAddressModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={20} />
            </button>
            
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {addressFormMode === 'add' ? '➕ Thêm địa chỉ mới' : '✏️ Sửa địa chỉ'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên người nhận *</label>
                <input 
                  type="text"
                  value={addressForm.receiverName}
                  onChange={(e) => setAddressForm({...addressForm, receiverName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập tên người nhận"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                <input 
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ chi tiết *</label>
                <textarea 
                  value={addressForm.fullAddress}
                  onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="w-5 h-5 text-blue-600"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddressModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveAddress}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaSave /> Lưu địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default CheckoutPage;