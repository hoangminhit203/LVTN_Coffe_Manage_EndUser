import { X, Package, DollarSign, Boxes, Scale, MapPin, Award } from "lucide-react";

const VariantViewDialog = ({ open, onClose, variant }) => {
  if (!open || !variant) return null;

  // Helper format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Helper định nghĩa roast level color
  const getRoastLevelColor = (level) => {
    const colors = {
      Light: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      Dark: "bg-brown-100 text-brown-800 dark:bg-brown-900/30 dark:text-brown-400",
    };
    return colors[level] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl p-6 m-4 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
              <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Chi tiết Variant
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {variant.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Images Section */}
        {variant.images && variant.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Hình ảnh sản phẩm
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {variant.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group"
                >
                  <img
                    src={img.imageUrl}
                    alt={`Variant ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.isMain && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
                      Chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Variant ID */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Variant ID</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.variantId}
              </p>
            </div>

            {/* SKU */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SKU</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.sku}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase">Giá bán</span>
              </div>
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                {formatPrice(variant.price)}
              </p>
            </div>

            {/* Stock */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Boxes className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tồn kho</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.stock} sản phẩm
              </p>
            </div>

            {/* Weight */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Khối lượng</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.weight} g
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Roast Level */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Độ rang</span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoastLevelColor(variant.roastLevel)}`}>
                {variant.roastLevel}
              </span>
            </div>

            {/* Bean Type */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại hạt</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.beanType || "Chưa cập nhật"}
              </p>
            </div>

            {/* Origin */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Xuất xứ</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.origin || "Chưa cập nhật"}
              </p>
            </div>

            {/* Acidity */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Độ chua</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${(variant.acidity / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {variant.acidity}/10
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chứng nhận</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {variant.certifications || "Không có"}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ngày tạo</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(variant.createdAt).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          {variant.updatedAt && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cập nhật lần cuối</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(variant.updatedAt).toLocaleString("vi-VN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantViewDialog;
