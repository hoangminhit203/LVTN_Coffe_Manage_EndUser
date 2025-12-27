import React from 'react';
import ProductList from './ProductList';

const MenuPage = () => {
  return (
    <div className="pt-8">
      {/* Page title */}
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-6">Thực Đơn</h1>
        <p className="text-lg text-gray-600 text-center mb-8">Khám phá các loại cà phê đặc sắc của chúng tôi.</p>
      </div>

      {/* Reuse existing ProductList (banner + grid) */}
      <ProductList showTitle={false} />
    </div>
  );
};

export default MenuPage;
