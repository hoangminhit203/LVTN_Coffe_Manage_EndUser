# ☕ LVTN Coffee Management System

> Hệ thống quản lý quán cà phê toàn diện - Đồ án tốt nghiệp

## 📂 Cấu trúc Dự án

Dự án bao gồm **2 ứng dụng frontend** chính:

```
LVTN_Coffe_Manage_EndUser/
├── 📱 LVTN_FE_Coffe/          # Frontend End User (Khách hàng)
└── 🎛️ LVTV_Admin_Coffe/       # Admin Dashboard (Quản trị)
```

---

## 📱 1. LVTN_FE_Coffe - Frontend End User

### 🎯 Mục đích

Giao diện người dùng cuối (khách hàng) để duyệt menu, đặt hàng, quản lý giỏ hàng và theo dõi đơn hàng.

### 🛠️ Tech Stack

- ⚛️ **React 19.2.0** - UI Framework
- 🎨 **Tailwind CSS 4.1.17** - Styling
- 📍 **React Router DOM 7.10.1** - Routing
- 🌐 **Axios 1.13.2** - HTTP Client
- 🔐 **JWT Decode 4.0.0** - Authentication
- 🎭 **AOS (Animate On Scroll)** - Animations
- 🎪 **React Slick** - Carousel/Slider
- ⚡ **Vite 7.2.4** - Build Tool

### 📄 Các Trang (Pages)

#### Trang Công cộng

- **HomePage.jsx** - Trang chủ với banner, sản phẩm nổi bật
- **AboutPage.jsx** - Giới thiệu về quán cà phê
- **MenuPage.jsx** - Menu đầy đủ các sản phẩm
- **ProductList.jsx** - Danh sách sản phẩm có phân loại
- **ProductDetailPage.jsx** - Chi tiết sản phẩm
- **ContactPage.jsx** - Thông tin liên hệ
- **NewsPage.jsx** - Tin tức, blog

#### Xác thực

- **LoginPage.jsx** - Đăng nhập
- **RegisterPage.jsx** - Đăng ký tài khoản
- **ForgotPasswordPage.jsx** - Quên mật khẩu

#### Khách hàng đã đăng nhập

- **DashboardPage.jsx** - Dashboard cá nhân
- **ProfilePage.jsx** - Quản lý thông tin cá nhân
- **CartPage.jsx** - Giỏ hàng
- **CheckoutPage.jsx** - Thanh toán
- **PaymentCallback.jsx** - Xử lý callback thanh toán online
- **OrderHistoryPage.jsx** - Lịch sử đơn hàng
- **Wishlist.jsx** - Danh sách yêu thích

### 🔌 API Services (src/components/Api/)

- **user.js** - API người dùng (đăng ký, đăng nhập, profile)
- **products.js** - API sản phẩm
- **catelogry.js** - API danh mục
- **order.js** - API đơn hàng
- **review.js** - API đánh giá
- **ShippingAddress.js** - API địa chỉ giao hàng

### 🧩 Components chính

- **Navbar.jsx** - Thanh điều hướng
- **Footer.jsx** - Footer
- **Banner.jsx** - Banner/Hero section
- **Services.jsx** - Giới thiệu dịch vụ
- **Review.jsx / Reviews.jsx** - Đánh giá sản phẩm
- **Toast** - Hệ thống thông báo
- **ConfirmDialog** - Dialog xác nhận

### 🚀 Lệnh chạy

```bash
cd LVTN_FE_Coffe
npm install
npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview bản build
```

---

## 🎛️ 2. LVTV_Admin_Coffe - Admin Dashboard

### 🎯 Mục đích

Bảng điều khiển quản trị viên để quản lý toàn bộ hệ thống: sản phẩm, đơn hàng, khách hàng, banner, khuyến mãi...

### 🛠️ Tech Stack

- ⚛️ **React 19.2.0** - UI Framework
- 🎨 **Tailwind CSS 3.4.18** - Styling
- 📍 **React Router DOM 7.10.1** - Routing
- 🌐 **Axios 1.13.2** - HTTP Client
- 🔐 **JWT Decode 4.0.0** - Authentication
- 📋 **React Hook Form 7.69.0** - Form Management
- 🔥 **React Hot Toast 2.6.0** - Notifications
- 📊 **Recharts 3.5.1** - Data Visualization
- 🎭 **Lucide React 0.561.0** - Icons
- ⚡ **Vite 7.2.4** - Build Tool

### 📊 Routes/Pages (src/routes/)

#### Dashboard & Analytics

- **dashboard/** - Trang tổng quan hệ thống
- **analytics/** - Phân tích thống kê, báo cáo

#### Quản lý Sản phẩm

- **product/** - Quản lý sản phẩm cà phê
  - NewProduct - Thêm sản phẩm mới
  - EditProduct - Sửa sản phẩm
- **categories/** - Quản lý danh mục sản phẩm
- **flavorNote/** - Quản lý hương vị (Flavor Notes)
- **brewingmethod/** - Quản lý phương pháp pha chế

#### Quản lý Đơn hàng & Khách hàng

- **order/** - Quản lý đơn hàng
  - Order - Chi tiết đơn hàng
  - OrderReturnPage - Đơn hàng hoàn trả
- **customers/** - Quản lý khách hàng
- **user/** - Quản lý người dùng hệ thống

#### Marketing & Giao diện

- **banner/** - Quản lý banner trang chủ
- **promotion/** - Quản lý khuyến mãi

### 🔌 Services (src/service/)

- **userService.js** - Quản lý người dùng
- **productService.js** - Quản lý sản phẩm
- **categoryService.js** - Quản lý danh mục
- **orderService.js** - Quản lý đơn hàng
- **flavorNoteService.js** - Quản lý hương vị
- **brewingMethodsService.js** - Quản lý phương pháp pha
- **promotionService.js** - Quản lý khuyến mãi
- **bannerService.js** - Quản lý banner
- **statisticsService.js** - Thống kê
- **imgService.js** - Quản lý hình ảnh

### 🧩 Components chính (src/components/)

#### Layout

- **sidebar.jsx** - Sidebar navigation
- **header.jsx** - Header
- **footer.jsx** - Footer

#### Feature Components

- **product/** - Dialog, table, form sản phẩm
- **user/** - Dialog, table quản lý user
- **order/** - Table, chi tiết đơn hàng
- **category/** - Dialog, table danh mục
- **banner/** - Dialog, table, view banner
- **promotion/** - Dialog, table khuyến mãi
- **flavorNote/** - Quản lý flavor notes
- **brewingmethod/** - Quản lý phương pháp pha
- **pagination/** - Component phân trang

### 🎨 Contexts & Hooks

- **theme-context.jsx** - Dark/Light mode
- **use-theme.jsx** - Hook sử dụng theme
- **use-click-outside.jsx** - Detect click outside
- **useFormFields.js** - Custom form hook

### 🚀 Lệnh chạy

```bash
cd LVTV_Admin_Coffe
npm install
npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview bản build
npm run lint       # Chạy ESLint
```

---

## 🔐 Authentication

Cả hai ứng dụng sử dụng:

- **JWT (JSON Web Token)** cho xác thực
- **Local Storage** lưu trữ token
- **jwt-decode** để decode token và lấy thông tin user

---

## 📡 API Integration

### Base URL Configuration

Cả 2 app đều sử dụng Axios instance với cấu hình:

- **Frontend**: `src/components/Api/` chứa các API calls
- **Admin**: `src/utils/axios.js` và `src/service/` chứa services

### API Endpoints chính

#### User/Auth

- POST `/register` - Đăng ký
- POST `/login` - Đăng nhập
- GET `/AspNetUsers` - Danh sách users (Admin)
- PUT `/AspNetUsers/{id}` - Cập nhật user

#### Products

- GET `/products` - Danh sách sản phẩm
- GET `/products/{id}` - Chi tiết sản phẩm
- POST `/products` - Thêm sản phẩm (Admin)
- PUT `/products/{id}` - Cập nhật sản phẩm (Admin)
- DELETE `/products/{id}` - Xóa sản phẩm (Admin)

#### Orders

- GET `/orders` - Danh sách đơn hàng
- POST `/orders` - Tạo đơn hàng
- PUT `/orders/{id}` - Cập nhật đơn hàng (Admin)

#### Categories

- GET `/categories` - Danh sách danh mục
- POST `/categories` - Thêm danh mục (Admin)

---

## 🎨 UI/UX Features

### LVTN_FE_Coffe (User)

- ✨ Animations với AOS
- 🎪 Product carousels với React Slick
- 📱 Responsive design với Tailwind CSS
- 🛒 Real-time cart updates
- ⭐ Product reviews & ratings
- 💝 Wishlist functionality

### LVTV_Admin_Coffe (Admin)

- 🌓 Dark/Light mode toggle
- 📊 Charts & statistics với Recharts
- 📋 Advanced data tables
- 🔍 Search & filter
- 📄 Pagination
- 🎨 Form validation với React Hook Form
- 🔔 Toast notifications

---

## 📦 Cài đặt & Triển khai

### Prerequisites

- Node.js >= 18.x
- npm hoặc yarn

### Clone & Install

```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục dự án
cd LVTN_Coffe_Manage_EndUser

# Cài đặt dependencies cho Frontend User
cd LVTN_FE_Coffe
npm install

# Cài đặt dependencies cho Admin
cd ../LVTV_Admin_Coffe
npm install
```

### Development

```bash
# Terminal 1 - Chạy Frontend User
cd LVTN_FE_Coffe
npm run dev
# → http://localhost:5173

# Terminal 2 - Chạy Admin Dashboard
cd LVTV_Admin_Coffe
npm run dev
# → http://localhost:5174
```

### Production Build

```bash
# Build Frontend User
cd LVTN_FE_Coffe
npm run build

# Build Admin
cd LVTV_Admin_Coffe
npm run build
```

---

## 🔧 Configuration

### Environment Variables (Cần tạo)

#### LVTN_FE_Coffe/.env

```env
VITE_API_URL=http://your-backend-api.com/api
```

#### LVTV_Admin_Coffe/.env

```env
VITE_API_URL=http://your-backend-api.com/api
```

---

## 📋 Tính năng chính

### 👥 End User (LVTN_FE_Coffe)

- ✅ Đăng ký/Đăng nhập
- ✅ Duyệt menu sản phẩm
- ✅ Tìm kiếm & lọc sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Thanh toán online
- ✅ Theo dõi đơn hàng
- ✅ Đánh giá sản phẩm
- ✅ Quản lý profile
- ✅ Wishlist

### 🎛️ Admin (LVTV_Admin_Coffe)

- ✅ Dashboard thống kê tổng quan
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Quản lý user & phân quyền
- ✅ Quản lý banner
- ✅ Quản lý khuyến mãi
- ✅ Thống kê & báo cáo
- ✅ Quản lý phương pháp pha chế
- ✅ Quản lý hương vị cà phê

---

## 🐛 Debug & Common Issues

### API Connection

Kiểm tra file cấu hình axios:

- Frontend: `LVTN_FE_Coffe/src/components/Api/*.js`
- Admin: `LVTV_Admin_Coffe/src/utils/axios.js`

### Authentication Issues

- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify JWT decode

### Build Issues

```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Code Structure

### Frontend User

```
LVTN_FE_Coffe/
├── src/
│   ├── pages/          # Các trang
│   ├── components/     # Components tái sử dụng
│   │   ├── Api/       # API calls
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   └── ...
│   ├── hooks/         # Custom hooks
│   └── utils/         # Utilities
```

### Admin Dashboard

```
LVTV_Admin_Coffe/
├── src/
│   ├── routes/        # Pages theo route
│   ├── components/    # Components theo feature
│   ├── service/       # API services
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   ├── layouts/       # Layout components
│   ├── config/        # Cấu hình
│   └── utils/         # Utilities
```

---

## 👨‍💻 Development Guidelines

### Naming Conventions

- Components: PascalCase (e.g., `UserDialog.jsx`)
- Files: camelCase hoặc kebab-case
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE

### Git Workflow

```bash
# Feature branch
git checkout -b feature/ten-tinh-nang

# Commit
git commit -m "feat: mô tả tính năng"

# Push
git push origin feature/ten-tinh-nang
```

---

## 📚 Resources

### Documentation

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

### Icons & UI

- [Lucide Icons](https://lucide.dev/) (Admin)
- [React Icons](https://react-icons.github.io/react-icons/) (Frontend)

---

## 📄 License

Private - Đồ án tốt nghiệp

## 👥 Team Members

_[Thêm thông tin team members]_

---

**📅 Last Updated:** February 2026

**🔖 Version:** 1.0.0
