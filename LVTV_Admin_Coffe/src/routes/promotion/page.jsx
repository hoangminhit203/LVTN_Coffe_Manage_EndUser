import { useEffect, useState } from "react";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "../../service/promotionService";
import PromotionTable from "../../components/promotion/promotion-table";
import PromotionDialog from "../../components/promotion/promotion-dialog";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import Pagination from "../../components/pagination/Pagination";

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [notification, setNotification] = useState({ show: false, type: "", message: "" });
    const [paging, setPaging] = useState({ pageNumber: 1, pageSize: 10, totalPages: 0, totalRecords: 0 });
    const [updatingIds, setUpdatingIds] = useState([]);

    useEffect(() => {
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (notification.show) {
            const t = setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
            return () => clearTimeout(t);
        }
    }, [notification.show]);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const res = await getPromotions();
            // API structure: { isSuccess, message, data }
            const list = res.data || res;
            setPromotions(list.records ?? list);
            if (list.totalPages !== undefined || list.totalRecords !== undefined) {
                setPaging((prev) => ({ ...prev, totalPages: list.totalPages ?? prev.totalPages, totalRecords: list.totalRecords ?? prev.totalRecords }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            if (editingPromotion) {
                // Update
                setUpdatingIds((prev) => [...prev, editingPromotion.id]);
                await updatePromotion(editingPromotion.id, formData);
                setNotification({ show: true, type: "success", message: "Khuyến mãi đã được cập nhật" });
                setEditingPromotion(null);
            } else {
                // Create
                await createPromotion(formData);
                setNotification({ show: true, type: "success", message: "Khuyến mãi đã được thêm thành công!" });
            }
            setOpenDialog(false);
            fetchPromotions();
        } catch (error) {
            console.error(error);
            setNotification({ show: true, type: "error", message: error.response?.data?.message ?? "Save failed" });
        } finally {
            if (editingPromotion) setUpdatingIds((prev) => prev.filter((id) => id !== editingPromotion.id));
        }
    };

    // Toggle enable/disable promotion
    const handleToggle = async (promotion) => {
        try {
            setUpdatingIds((prev) => [...prev, promotion.id]);
            const payload = { ...promotion, isEnabled: !promotion.isEnabled };
            await updatePromotion(promotion.id, payload);
            setPromotions((prev) => prev.map((p) => (p.id === promotion.id ? { ...p, isEnabled: !p.isEnabled } : p)));
            setNotification({ show: true, type: "success", message: "Khuyến mãi đã được cập nhật" });
        } catch (error) {
            console.error(error);
            setNotification({ show: true, type: "error", message: error.response?.data?.message ?? "Update failed" });
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== promotion.id));
        }
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        setOpenDialog(true);
    };

    const handleDeleteClick = (promotion) => {
        setDeleteConfirm({ show: true, id: promotion.id });
    };

    const handleDeleteConfirm = async () => {
        try {
            setUpdatingIds((prev) => [...prev, deleteConfirm.id]);
            await deletePromotion(deleteConfirm.id);
            setNotification({ show: true, type: "success", message: "Xóa khuyến mãi thành công!" });
            setDeleteConfirm({ show: false, id: null });
            fetchPromotions();
        } catch (error) {
            console.error(error);
            setNotification({ show: true, type: "error", message: error.response?.data?.message ?? "Delete failed" });
            setDeleteConfirm({ show: false, id: null });
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== deleteConfirm.id));
        }
    };

    return (
        <div className="p-6 min-h-screen bg-white dark:bg-slate-900 transition-colors">
            {notification.show && (
                <div className={`fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300 pointer-events-auto`}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                        {notification.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Khuyến Mãi</h1>
                <button onClick={() => { setOpenDialog(true); setEditingPromotion(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg">
                    <Plus size={20} /> Thêm Mới
                </button>
            </div>

            {loading ? (
                <div className="py-16 text-center text-slate-600 dark:text-slate-300">Loading...</div>
            ) : (
                <>
                    <PromotionTable promotions={promotions} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDeleteClick} updatingIds={updatingIds} />
                    <div className="mt-4">
                        <Pagination paging={paging} setPaging={setPaging} />
                    </div>
                </>
            )}

            <PromotionDialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingPromotion(null); }} onSubmit={handleCreate} editData={editingPromotion} />

            {/* Delete Confirmation */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl transition-colors">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Confirm Delete</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to delete this promotion? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirm({ show: false, id: null })} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromotionPage;
