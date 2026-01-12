import { Edit3, Trash2, Eye } from "lucide-react";

const BannerTable = ({ banners = [], onToggle, onEdit, onDelete, onView, updatingIds = [] }) => {
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
                        <th className="px-4 py-3">Image</th>
                        <th className="px-4 py-3">Position</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.length === 0 && (
                        <tr>
                            <td className="px-4 py-4" colSpan={7}>
                                No banners found
                            </td>
                        </tr>
                    )}
                    {banners.map((b, idx) => (
                        <tr key={b.id} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="px-4 py-3">{idx + 1}</td>
                            <td className="px-4 py-3">
                                {b.imageUrl ? (
                                    <img src={b.imageUrl} alt={`banner-${b.id}`} className="h-12 w-32 object-cover rounded-md" />
                                ) : (
                                    <div className="h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">No image</div>
                                )}
                            </td>
                            <td className="px-4 py-3">{b.position}</td>
                            <td className="px-4 py-3">{b.type === 0 ? 'MainSlider' : b.type === 1 ? 'SubCard' : b.type}</td>
                            <td className="px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => onToggle && !updatingIds.includes(b.id) && onToggle(b)}
                                    disabled={updatingIds.includes(b.id)}
                                    aria-pressed={!!b.isActive}
                                    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${b.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'} ${updatingIds.includes(b.id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${b.isActive ? 'translate-x-5' : 'translate-x-1'}`}
                                    />
                                </button>
                            </td>
                            <td className="px-4 py-3">{formatDate(b.createdAt)}</td>
                            <td className="px-4 py-3 flex items-center gap-2">
                                <button onClick={() => onEdit && onEdit(b)} disabled={updatingIds.includes(b.id)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => onDelete && onDelete(b)} disabled={updatingIds.includes(b.id)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => onView && onView(b)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BannerTable;