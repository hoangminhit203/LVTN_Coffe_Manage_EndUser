import { useEffect, useState } from "react";
import { getBanners, createBanner, updateBanner, deleteBanner, getBannerById } from "../../service/bannerService";
import BannerTable from "../../components/banner/banner-table";
import BannerDialog from "../../components/banner/banner-dialog";
import BannerViewDialog from "../../components/banner/banner-view-dialog";
import { Plus, CheckCircle, XCircle } from "lucide-react";

const BannerPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [viewBanner, setViewBanner] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [notification, setNotification] = useState({ show: false, type: "", message: "" });
    const [updatingIds, setUpdatingIds] = useState([]);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        if (notification.show) {
            const t = setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
            return () => clearTimeout(t);
        }
    }, [notification.show]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await getBanners();
            // Diagnostic log to inspect API response shape
            console.debug("getBanners raw:", res);

            let records = [];

            // Case A: API returned an array
            if (Array.isArray(res)) {
                // Sometimes API returns [ { isSuccess, message, data: [...] } ]
                if (res.length > 0) {
                    if (Array.isArray(res[0]?.data)) records = res[0].data;
                    else if (Array.isArray(res[0]?.records)) records = res[0].records;
                    else if (res.every((r) => r && r.id !== undefined)) records = res; // already array of banners
                }
            }

            // Case B: API returned object wrapper
            else if (res && typeof res === "object") {
                if (Array.isArray(res.data)) records = res.data;
                else if (Array.isArray(res.records)) records = res.records;
                else if (Array.isArray(res.data?.records)) records = res.data.records;
            }

            // Case C: fallback - recursively find first array of objects
            if (!records.length) {
                const findArray = (obj) => {
                    if (!obj || typeof obj !== "object") return null;
                    for (const key of Object.keys(obj)) {
                        if (Array.isArray(obj[key]) && obj[key].length && typeof obj[key][0] === "object") return obj[key];
                        if (typeof obj[key] === "object") {
                            const found = findArray(obj[key]);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                const nested = findArray(res);
                if (nested) records = nested;
            }

            console.debug("getBanners records count:", records.length, records.slice(0, 3));

            setBanners(records);
        } catch (error) {
            console.error("Error fetching banners:", error);
            setNotification({ show: true, type: "error", message: "Failed to load banners" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (formData) => {
        try {
            if (editingBanner) {
                setUpdatingIds((prev) => [...prev, editingBanner.id]);
                const res = await updateBanner(editingBanner.id, formData);
                console.debug("updateBanner response:", res);
                if (res && res.isSuccess === false) {
                    setNotification({ show: true, type: "error", message: res.message || "Update failed" });
                } else {
                    setNotification({ show: true, type: "success", message: "Banner updated successfully" });
                    setEditingBanner(null);
                    setOpenDialog(false);
                    fetchBanners();
                }
            } else {
                const res = await createBanner(formData);
                console.debug("createBanner response:", res);
                if (res && res.isSuccess === false) {
                    setNotification({ show: true, type: "error", message: res.message || "Create failed" });
                } else {
                    setNotification({ show: true, type: "success", message: "Banner created successfully" });
                    setOpenDialog(false);
                    fetchBanners();
                }
            }
        } catch (error) {
            console.error(error);
            setNotification({ show: true, type: "error", message: error.response?.data?.message ?? "Save failed" });
        } finally {
            if (editingBanner) setUpdatingIds((prev) => prev.filter((id) => id !== editingBanner.id));
        }
    };

    const handleToggle = async (banner) => {
        try {
            setUpdatingIds((prev) => [...prev, banner.id]);
            const payload = new FormData();
            payload.append("IsActive", !banner.isActive);
            payload.append("publicId", banner.publicId ?? "");
            payload.append("Position", banner.position ?? 1);
            payload.append("Type", banner.type ?? 0);
            await updateBanner(banner.id, payload);
            setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)));
            setNotification({ show: true, type: "success", message: "Banner updated" });
        } catch (error) {
            console.error(error);
            setNotification({ show: true, type: "error", message: error.response?.data?.message ?? "Update failed" });
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== banner.id));
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setOpenDialog(true);
    };

    const handleView = async (banner) => {
        try {
            const res = await getBannerById(banner.id);
            const data = res.data || res;
            setViewBanner(data);
            setOpenView(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteClick = (banner) => {
        setDeleteConfirm({ show: true, id: banner.id });
    };

    const handleDeleteConfirm = async () => {
        try {
            setUpdatingIds((prev) => [...prev, deleteConfirm.id]);
            await deleteBanner(deleteConfirm.id);
            setNotification({ show: true, type: "success", message: "Banner deleted" });
            setDeleteConfirm({ show: false, id: null });
            fetchBanners();
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Biểu Ngữ</h1>
                <button onClick={() => { setOpenDialog(true); setEditingBanner(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg">
                    <Plus size={20} /> Thêm Mới
                </button>
            </div>

            {loading ? (
                <div className="py-16 text-center text-slate-600 dark:text-slate-300">Loading...</div>
            ) : (
                <>
                    <BannerTable banners={banners} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDeleteClick} onView={handleView} updatingIds={updatingIds} />
                </>
            )}

            <BannerDialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingBanner(null); }} onSubmit={handleCreateOrUpdate} editData={editingBanner} />

            <BannerViewDialog open={openView} onClose={() => setOpenView(false)} data={viewBanner} />

            {/* Delete Confirmation */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl transition-colors">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Confirm Delete</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to delete this banner? This action cannot be undone.</p>
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

export default BannerPage;