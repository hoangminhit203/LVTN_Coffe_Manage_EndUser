import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="flex min-h-full flex-col items-center justify-center py-12">
            <div className="text-center">
                <p className="text-base font-semibold text-blue-600 dark:text-blue-400">404</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    Không tìm thấy trang
                </h1>
                <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        to="/"
                        className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        Về trang chủ
                    </Link>
                    <Link
                        to="/"
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Liên hệ hỗ trợ <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
            <div className="mt-12">
                <svg
                    className="h-64 w-64 text-slate-300 dark:text-slate-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
        </div>
    );
};

export default NotFoundPage;
