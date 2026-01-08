import { Edit3, Trash2 } from "lucide-react";

const PromotionTable = ({ promotions = [], onToggle, onEdit, onDelete, updatingIds = [] }) => {
    const formatDate = (iso) => {
        if (!iso) return "";
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch {
            return iso;
        }
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Discount</th>
                        <th className="px-4 py-3">Min Order</th>
                        <th className="px-4 py-3">Start</th>
                        <th className="px-4 py-3">End</th>
                        <th className="px-4 py-3">Enabled</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.length === 0 && (
                        <tr>
                            <td className="px-4 py-4" colSpan={9}>
                                No promotions found
                            </td>
                        </tr>
                    )}
                    {promotions.map((p, idx) => (
                        <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="px-4 py-3">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium">{p.code}</td>
                            <td className="px-4 py-3">{p.description}</td>
                            <td className="px-4 py-3">{p.discountValue}{p.discountType === 0 ? "%" : " đ"}</td>
                            <td className="px-4 py-3">{p.minOrderValue ?? "-"}</td>
                            <td className="px-4 py-3">{formatDate(p.startDate)}</td>
                            <td className="px-4 py-3">{formatDate(p.endDate)}</td>
                            <td className="px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => onToggle && !updatingIds.includes(p.id) && onToggle(p)}
                                    disabled={updatingIds.includes(p.id)}
                                    aria-pressed={!!p.isEnabled}
                                    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${p.isEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} ${updatingIds.includes(p.id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${p.isEnabled ? 'translate-x-5' : 'translate-x-1'}`}
                                    />
                                </button>
                            </td>
                            <td className="px-4 py-3 flex items-center gap-2">
                                <button onClick={() => onEdit && onEdit(p)} disabled={updatingIds.includes(p.id)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => onDelete && onDelete(p)} disabled={updatingIds.includes(p.id)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PromotionTable;
