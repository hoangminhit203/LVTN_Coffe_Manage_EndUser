import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ paging, setPaging }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600 dark:text-slate-400">Hiện:</label>
        <select
          value={paging.pageSize}
          onChange={(e) =>
            setPaging((p) => ({
              ...p,
              pageSize: Number(e.target.value),
              pageNumber: 1,
            }))
          }
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Tổng: {paging.totalRecords} mục
        </span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          disabled={paging.pageNumber === 1}
          onClick={() =>
            setPaging((p) => ({ ...p, pageNumber: p.pageNumber - 1 }))
          }
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-blue-600 dark:hover:bg-blue-700"
          title="Previous"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {[...Array(paging.totalPages)].map((_, index) => {
            const pageNum = index + 1;
            // Show first, last, current, and adjacent pages
            if (
              pageNum === 1 ||
              pageNum === paging.totalPages ||
              (pageNum >= paging.pageNumber - 1 && pageNum <= paging.pageNumber + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPaging((p) => ({ ...p, pageNumber: pageNum }))}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    paging.pageNumber === pageNum
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (
              pageNum === paging.pageNumber - 2 ||
              pageNum === paging.pageNumber + 2
            ) {
              return (
                <span key={pageNum} className="px-2 text-slate-400">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          disabled={paging.pageNumber === paging.totalPages}
          onClick={() =>
            setPaging((p) => ({ ...p, pageNumber: p.pageNumber + 1 }))
          }
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-blue-600 dark:hover:bg-blue-700"
          title="Next"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
