import React, { useEffect, useState, useMemo, useRef } from 'react';
import { reviewApi } from '../Api/review';
import { orderApi } from '../Api/order';
import { useToast } from '../Toast/ToastContext';

// --- Component Ngôi sao hỗ trợ đổ màu lẻ (4.2, 4.5,...) ---
const Star = ({ fillPercent = 0, size = 24 }) => {
  const id = useMemo(() => `starGrad_${Math.random().toString(36).substr(2, 9)}`, []);
  const percent = Math.max(0, Math.min(100, fillPercent));

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block transition-transform hover:scale-110 duration-200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${percent}%`} stopColor="#FBBF24" />
          <stop offset={`${percent}%`} stopColor="#D1D5DB" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2"/>
        </filter>
      </defs>
      <path 
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.402 8.172L12 18.896l-6.336 3.852 1.402-8.172L1.132 9.21l8.2-1.192L12 .587z" 
        fill={`url(#${id})`}
        filter="url(#shadow)"
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
    <div className="bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 rounded-2xl p-5 md:p-6 border border-orange-100 shadow-lg mt-8 max-w-4xl mx-auto font-sans backdrop-blur-sm">
      {/* Tooltip số sao */}
      {tooltipPos.show && (
        <div 
          className="fixed z-50 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-2 py-1 rounded-md text-xs font-bold pointer-events-none transform -translate-x-1/2 shadow-xl border border-amber-400/50"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          ⭐ {hoverRating}
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-orange-600 to-amber-600 flex items-center gap-2">
        <span className="text-xl">📝</span> Đánh giá & Nhận xét
      </h2>
      
      <div className="flex flex-col md:flex-row gap-5 mb-6 items-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-5 rounded-2xl border border-amber-200/60 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="text-center md:border-r md:pr-6 border-orange-300/50 md:min-w-[140px]">
          <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent leading-tight">{avgRating.toFixed(1)}</div>
          <div className="mt-2 flex justify-center">{renderStars(avgRating, 22)}</div>
          <div className="text-gray-600 text-xs mt-2 font-semibold flex items-center justify-center gap-1">
            <span className="text-orange-500">📊</span> {reviews.length} nhận xét
          </div>
        </div>

        {hasPurchased && (
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <span className="text-base">⭐</span> Bạn chấm sản phẩm này bao nhiêu sao?
            </label>
            <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-amber-200/50 backdrop-blur-sm">
              <div 
                ref={starContainerRef}
                className="relative cursor-pointer py-1 inline-block transition-all hover:scale-105 active:scale-95 duration-200"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { setHoverRating(0); setTooltipPos(prev => ({ ...prev, show: false })); }}
                onClick={() => setRating(hoverRating)}
              >
                {renderStars(hoverRating || rating, 32)}
              </div>
              <div className="text-2xl font-black">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{hoverRating || rating}</span>
                <span className="text-gray-300">/5</span>
              </div>
            </div>
            <p className="text-[10px] text-amber-700 mt-2 italic font-medium flex items-center gap-1 bg-amber-50/50 px-2 py-1 rounded-md border border-amber-200/30">
              <span>💡</span> Rê chuột để chọn sao lẻ • Click để chốt điểm
            </p>
          </div>
        )}
      </div>

      {hasPurchased ? (
        <form onSubmit={handleSubmit} className="mb-6 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-md">
          <div className="mb-1.5 flex items-center gap-1.5 text-gray-700 font-semibold text-sm">
            <span>✍️</span>
            <span>Viết đánh giá của bạn</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            className="w-full p-3 border border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none mb-3 min-h-[100px] transition-all bg-white/80 text-sm text-gray-800 placeholder:text-gray-400 hover:border-orange-300"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 active:scale-95 duration-200 flex items-center gap-2 group"
            >
              {submitting ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <span className="group-hover:rotate-12 transition-transform duration-200 text-sm">🚀</span>
                  <span>Gửi đánh giá</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        !checkingPurchase && (
            <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 text-xs text-blue-700 font-medium shadow-sm flex items-center gap-2 hover:shadow-md transition-shadow">
                <span className="text-lg">ℹ️</span>
                <div className="text-blue-600">Bạn cần mua và nhận sản phẩm này trước để có thể để lại đánh giá.</div>
            </div>
        )
      )}

      {/* Danh sách đánh giá (Mục bạn đang bị mất data) */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-semibold flex flex-col items-center gap-2 animate-pulse">
            <div className="text-3xl animate-bounce">⏳</div>
            <div className="text-sm">Đang tải đánh giá...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500 border-2 border-dashed border-orange-200 rounded-2xl bg-gradient-to-br from-orange-50/30 to-amber-50/30 hover:border-orange-300 transition-all">
            <div className="text-4xl mb-3">📝</div>
            <div className="font-bold text-base mb-1 text-gray-700">Chưa có đánh giá nào</div>
            <div className="text-sm text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này!</div>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-gradient-to-br from-white via-white to-orange-50/20 border border-orange-100/60 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 group hover:-translate-y-0.5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 text-white rounded-xl flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform duration-300">
                    {(r.userName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                      {r.userName || r.guestKey?.slice(0,6) || 'Khách hàng'}
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">✓</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                      <span>🕐</span>
                      {new Date(r.createdAt || r.addedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="text-right bg-amber-50/50 px-2 py-1.5 rounded-lg border border-amber-200/50">
                  {renderStars(r.rating || 0, 16)}
                  <div className="text-[11px] font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mt-1">{(r.rating || 0).toFixed(1)}/5</div>
                </div>
              </div>
              <div className="pl-0.5 bg-white/40 backdrop-blur-sm p-3 rounded-lg border border-orange-100/40">
                <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;