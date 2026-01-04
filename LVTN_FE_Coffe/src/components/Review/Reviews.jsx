import React, { useEffect, useState, useMemo, useRef } from 'react';
import { reviewApi } from '../Api/review';
import { orderApi } from '../Api/order';
import { useToast } from '../Toast/ToastContext';

// --- Component Ngôi sao hỗ trợ đổ màu lẻ (4.2, 4.5,...) ---
const Star = ({ fillPercent = 0, size = 24 }) => {
  const id = useMemo(() => `starGrad_${Math.random().toString(36).substr(2, 9)}`, []);
  const percent = Math.max(0, Math.min(100, fillPercent));

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${percent}%`} stopColor="#F59E0B" />
          <stop offset={`${percent}%`} stopColor="#E5E7EB" />
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
  
  // State cho Đánh giá sao
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

  // --- Logic lấy dữ liệu (Giữ nguyên logic cũ của bạn để không mất data) ---
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getByVariant(variantId);
      const data = res?.data || res;

      let list = [];
      if (data?.value?.records) {
        list = data.value.records;
      } else if (data?.records) {
        list = data.records;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      } else if (data?.data?.records) {
        list = data.data.records;
      }

      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
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

  // --- Logic tương tác sao lẻ ---
  const handleMouseMove = (e) => {
    const rect = starContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let val = (x / rect.width) * 5;
    val = Math.ceil(val * 10) / 10; // Làm tròn tới 0.1
    val = Math.max(0.1, Math.min(5, val));
    
    setHoverRating(val);
    setTooltipPos({ x: e.clientX, y: e.clientY - 35, show: true });
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
      <div className="flex items-center gap-0.5">
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
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-12 max-w-4xl mx-auto font-sans">
      {/* Tooltip số sao */}
      {tooltipPos.show && (
        <div 
          className="fixed z-50 bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-bold pointer-events-none transform -translate-x-1/2 shadow-xl"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {hoverRating} sao
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá & Nhận xét</h2>
      
      <div className="flex flex-col md:flex-row gap-8 mb-10 items-center bg-orange-50/30 p-8 rounded-3xl border border-orange-100/50">
        <div className="text-center md:border-r md:pr-10 border-orange-200/50">
          <div className="text-6xl font-black text-yellow-500 leading-tight">{avgRating.toFixed(1)}</div>
          <div className="mt-2">{renderStars(avgRating, 28)}</div>
          <div className="text-gray-500 text-sm mt-2 font-medium">{reviews.length} nhận xét</div>
        </div>

        {hasPurchased && (
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-3">Bạn chấm sản phẩm này bao nhiêu sao?</label>
            <div className="flex items-center gap-6">
              <div 
                ref={starContainerRef}
                className="relative cursor-pointer py-2 inline-block transition-transform active:scale-95"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { setHoverRating(0); setTooltipPos(prev => ({ ...prev, show: false })); }}
                onClick={() => setRating(hoverRating)}
              >
                {renderStars(hoverRating || rating, 44)}
              </div>
              <div className="text-3xl font-black text-gray-300">
                <span className="text-yellow-500">{hoverRating || rating}</span>/5
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 italic font-medium">● Rê chuột để chọn sao lẻ ● Click để chốt điểm</p>
          </div>
        )}
      </div>

      {hasPurchased ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            className="w-full p-5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none mb-4 min-h-[130px] transition-all bg-gray-50/30"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-gray-200 active:translate-y-0.5"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá ngay'}
            </button>
          </div>
        </form>
      ) : (
        !checkingPurchase && (
            <div className="mb-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-blue-600 font-medium">
                Bạn cần mua sản phẩm này để có thể để lại đánh giá.
            </div>
        )
      )}

      {/* Danh sách đánh giá (Mục bạn đang bị mất data) */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 text-gray-400 font-medium animate-pulse">Đang nạp dữ liệu...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-3xl bg-gray-50/50">
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-2xl flex items-center justify-center font-bold shadow-sm">
                    {(r.userName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-base">{r.userName || r.guestKey?.slice(0,6) || 'Khách hàng'}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(r.createdAt || r.addedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(r.rating || 0, 18)}
                  <span className="text-[11px] font-black text-yellow-600 mt-1 block">{(r.rating || 0).toFixed(1)}/5.0</span>
                </div>
              </div>
              <p className="text-gray-600 text-[15px] leading-relaxed pl-1">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;