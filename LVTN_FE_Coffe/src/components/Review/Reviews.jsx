import React, { useEffect, useState, useMemo, useRef } from 'react';
import { reviewApi } from '../Api/review';
import { orderApi } from '../Api/order';
import { useToast } from '../Toast/ToastContext';

// --- Component Ngôi sao: Chuyển sang tông Vàng Đồng/Hổ Phách ---
const Star = ({ fillPercent = 0, size = 20 }) => {
  const id = useMemo(() => `starGrad_${Math.random().toString(36).substr(2, 9)}`, []);
  const percent = Math.max(0, Math.min(100, fillPercent));

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id}>
          {/* Màu vàng đồng đậm chất cà phê */}
          <stop offset={`${percent}%`} stopColor="#B45309" /> 
          <stop offset={`${percent}%`} stopColor="#E7E5E4" />
        </linearGradient>
      </defs>
      <path 
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.402 8.172L12 18.896l-6.336 3.852 1.402-8.172L1.132 9.21l8.2-1.192L12 .587z" 
        fill={`url(#${id})`}
      />
    </svg>
  );
};

const Reviews = ({ variantId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, show: false });
  
  const [comment, setComment] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const toast = useToast();
  const starContainerRef = useRef(null);

  useEffect(() => {
    if (variantId) {
      fetchReviews();
      checkHasPurchased();
    } else {
      setReviews([]);
      setHasPurchased(false);
    }
  }, [variantId]);

  // --- Logic cũ giữ nguyên ---
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getByVariant(variantId);
      const data = res?.data || res;
      let list = [];
      if (data?.value?.records) list = data.value.records;
      else if (data?.records) list = data.records;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data)) list = data;
      else if (data?.data?.records) list = data.data.records;
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      toast?.error?.('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const checkHasPurchased = async () => {
    if (!variantId) return setHasPurchased(false);
    try {
      setCheckingPurchase(true);
      const res = await orderApi.getHistory();
      const data = res?.data || res || [];
      const orders = Array.isArray(data) ? data : [];
      const found = orders.some((o) => {
        const status = String(o.status || '').toLowerCase();
        if (status !== 'delivered') return false;
        const items = o.items || o.orderItems || [];
        return items.some(it => String(it.productVariantId) === String(variantId));
      });
      setHasPurchased(found);
    } catch (err) {
      setHasPurchased(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const handleMouseMove = (e) => {
    const rect = starContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let val = (x / rect.width) * 5;
    val = Math.ceil(val * 10) / 10;
    val = Math.max(0.1, Math.min(5, val));
    setHoverRating(val);
    setTooltipPos({ x: e.clientX, y: e.clientY - 40, show: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast?.warning?.('Vui lòng nhập nội dung');
    try {
      setSubmitting(true);
      await reviewApi.create({ variantId, rating: Number(rating), comment: comment.trim() });
      toast?.success?.('Cảm ơn bạn đã đánh giá!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      toast?.error?.(err?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, size = 18) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => {
          let fill = 0;
          if (value >= i) fill = 100;
          else if (value > i - 1) fill = (value - (i - 1)) * 100;
          return <Star key={i} fillPercent={fill} size={size} />;
        })}
      </div>
    );
  };

  const avgRating = useMemo(() => {
    return reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0;
  }, [reviews]);

  return (
    // Container: Nền trắng sạch, chữ màu tối, không gradient
    <div className="max-w-5xl mx-auto font-sans text-stone-800 mt-10">
      
      {/* Tooltip đơn giản */}
      {tooltipPos.show && (
        <div 
          className="fixed z-50 bg-stone-800 text-white px-3 py-1 text-xs font-medium rounded shadow-xl transform -translate-x-1/2 pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {hoverRating} / 5
        </div>
      )}

      {/* Header: Chữ in hoa, font serif nếu có thể, border dưới mảnh */}
      <div className="border-b border-stone-200 pb-4 mb-8 flex items-end justify-between">
        <h2 className="text-2xl font-serif font-bold uppercase tracking-wide text-stone-900">
          Đánh giá từ khách hàng
        </h2>
        <span className="text-sm text-stone-500 font-medium">
          ({reviews.length} đánh giá)
        </span>
      </div>
      
      {/* Dashboard Tổng quan */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Cột điểm số bên trái */}
        <div className="flex flex-col items-center justify-center p-6 bg-stone-50 rounded-sm border border-stone-100 min-w-[200px]">
          <div className="text-5xl font-serif font-bold text-stone-900 mb-2">{avgRating.toFixed(1)}</div>
          <div className="mb-2">{renderStars(avgRating, 20)}</div>
          <div className="text-xs text-stone-500 uppercase tracking-wider">Điểm trung bình</div>
        </div>

        {/* Cột nhập liệu bên phải */}
        <div className="flex-1">
          {hasPurchased ? (
             <div className="bg-white">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-stone-700 uppercase tracking-wide mb-2">
                    Chọn mức độ hài lòng
                  </label>
                  <div className="flex items-center gap-4">
                    <div 
                      ref={starContainerRef}
                      className="cursor-pointer py-2 inline-flex"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => { setHoverRating(0); setTooltipPos(prev => ({ ...prev, show: false })); }}
                      onClick={() => setRating(hoverRating)}
                    >
                      {renderStars(hoverRating || rating, 28)}
                    </div>
                    <span className="text-xl font-serif font-bold text-stone-800">{hoverRating || rating}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    className="w-full p-4 border border-stone-300 rounded-sm focus:ring-1 focus:ring-stone-500 focus:border-stone-500 outline-none mb-4 min-h-[120px] text-sm text-stone-800 placeholder:text-stone-400 bg-white transition-colors"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-stone-900 hover:bg-stone-700 text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
             </div>
          ) : (
            !checkingPurchase && (
              <div className="h-full flex flex-col justify-center items-center text-stone-500 bg-stone-50 border border-dashed border-stone-200 p-6 rounded-sm text-center">
                 <span className="text-2xl mb-2 opacity-50">☕</span>
                 <p className="text-sm">Bạn cần mua sản phẩm này để viết đánh giá.</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Danh sách đánh giá: Clean & Minimal */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-stone-400 text-sm">Đang tải dữ liệu...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 border-t border-stone-100">
            <p className="text-stone-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="pb-6 border-b border-stone-100 last:border-0 animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* Avatar đơn giản: Vuông hoặc tròn nhẹ, màu đậm */}
                  <div className="w-10 h-10 bg-stone-800 text-white rounded-sm flex items-center justify-center font-serif font-bold text-lg">
                    {(r.userName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      {r.userName || 'Khách hàng'}
                      <span className="text-[10px] border border-stone-300 text-stone-500 px-1 rounded-sm">Đã mua</span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {new Date(r.createdAt || r.addedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                {/* Rating nhỏ gọn */}
                <div className="flex items-center gap-2">
                   {renderStars(r.rating || 0, 14)}
                </div>
              </div>
              
              <div className="pl-13 ml-13 md:ml-0 mt-3 text-stone-700 text-sm leading-relaxed">
                {r.comment}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;