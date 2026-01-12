# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Banner manager (Admin)

This admin UI provides CRUD for Banners with image upload (multipart/form-data).

Example API usage (adjust host/port):

- Create banner (multipart form-data with `File`, `IsActive`, `Position`, `CreatedDate`):

  curl -X 'POST' \
    'https://localhost:44384/api/Banner' \
    -H 'accept: text/plain' \
    -H 'Content-Type: multipart/form-data' \
    -F 'File=@6b087a04718275c2943f0b227295745c.jpg;type=image/jpeg' \
    -F 'IsActive=true' \
    -F 'Position=1' \
    -F 'CreatedDate=2026-01-12T03:06:10.313Z'

- Get banner by id:

  curl -X 'GET' 'https://localhost:44384/api/Banner/1' -H 'accept: text/plain'

- Update banner (multipart form-data; include `publicId` to keep unchanged image):

  curl -X 'PUT' \
    'https://localhost:44384/api/Banner/1' \
    -H 'accept: text/plain' \
    -H 'Content-Type: multipart/form-data' \
    -F 'publicId=productsImage/n0bpc3npjbbrmkay2x7s' \
    -F 'File=@DH52111843.JPG;type=image/jpeg' \
    -F 'IsActive=true' \
    -F 'Position=2' \
    -F 'UpdateDate=2026-01-12T03:08:35.127Z'

- Delete banner:

  curl -X 'DELETE' 'https://localhost:44384/api/Banner/2' -H 'accept: text/plain'

Notes:
- Client-side enforces image type and max size 5MB.
- Admin route: `/banners` in the admin panel.
- Components: `src/components/banner/*`, service: `src/service/bannerService.js`, page: `src/routes/banner/page.jsx`.

