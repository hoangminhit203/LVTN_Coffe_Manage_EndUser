import { useEffect, useState } from "react";
import { getFlavorNotes, createdFlavorNote, updateFlavorNote, deleteFlavorNote, getFlavorNoteById } from "../../service/flavorNoteService";
import FlavorNoteDialog from "../../components/flavorNote/flavorNote-dialog";
import FlavorNoteViewDialog from "../../components/flavorNote/flavorNote-view-dialog";
import FlavorNoteTable from "../../components/flavorNote/flavorNote-table";
import Pagination from "../../components/pagination/Pagination";
import { Loader2, Plus, CheckCircle, XCircle, Search } from "lucide-react";

const FlavorNotePage = () => {
  const [flavorNotes, setFlavorNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paging, setPaging] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlavorNote, setEditingFlavorNote] = useState(null);
  const [viewFlavorNote, setViewFlavorNote] = useState({ show: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    fetchFlavorNotes();
  }, [paging.pageNumber, paging.pageSize, searchTerm]);

  // Auto hide notification after 3 seconds 
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);
// lấy api flavor notes
  const fetchFlavorNotes = async () => {
    try {
      setLoading(true);
      const res = await getFlavorNotes({
        ...paging,
        searchTerm: searchTerm.trim()
      });

      console.log("API RESPONSE:", res);

      setFlavorNotes(res.data.records);
      setPaging((prev) => ({
        ...prev,
        totalPages: res.data.totalPages,
        totalRecords: res.data.totalRecords,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
// Handle create/update flavor note
  const handleSubmit = async (data) => {
    try {
      if (editingFlavorNote) {
        await updateFlavorNote(editingFlavorNote.flavorNoteId, data);
        setNotification({
          show: true,
          type: "success",
          message: "Ghi chú hương vị đã được cập nhật thành công!"
        });
      } else {
        await createdFlavorNote(data);
        setNotification({
          show: true,
          type: "success",
          message: "Ghi chú hương vị đã được thêm thành công!"
        });
      }
      setOpenDialog(false);
      setEditingFlavorNote(null);
      fetchFlavorNotes(); 
    } catch (error) {
      console.error("Save failed:", error);
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Operation failed!"
      });
    }
  };

  // Handle edit button click
  const handleEdit = (flavorNote) => {
    setEditingFlavorNote(flavorNote);
    setOpenDialog(true);
  };

  // Handle view button click
  const handleView = async (id) => {
    try {
      const data = await getFlavorNoteById(id);
      setViewFlavorNote({ show: true, data });
    } catch (error) {
      console.error("Get flavor note failed:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to load flavor note details!"
      });
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    try {
      await deleteFlavorNote(deleteConfirm.id);
      setNotification({
        show: true,
        type: "success",
        message: "Ghi chú hương vị đã được xóa thành công!"
      });
      setDeleteConfirm({ show: false, id: null });
      fetchFlavorNotes();
    } catch (error) {
      console.error("Delete failed:", error);
      setNotification({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Delete failed!"
      });
      setDeleteConfirm({ show: false, id: null });
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingFlavorNote(null);
  };
  return (
    <div className="p-6 min-h-screen bg-white dark:bg-slate-900 transition-colors">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-2 duration-300 pointer-events-auto">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors">
          Ghi Chú Hương Vị
        </h1>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg dark:bg-blue-600 dark:hover:bg-blue-700 font-medium"
        >
          <Plus size={20} />
          Thêm Mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search by flavor note name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPaging(prev => ({ ...prev, pageNumber: 1 }));
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
          />
        </div>
      </div>

      <FlavorNoteDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        editData={editingFlavorNote}
      />

      {/* View Flavor Note Dialog */}
      <FlavorNoteViewDialog
        open={viewFlavorNote.show}
        onClose={() => setViewFlavorNote({ show: false, data: null })}
        flavorNote={viewFlavorNote.data}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Confirm Delete
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this flavor note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-blue-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading data...</p>
        </div>
      ) : (
        <>
          <FlavorNoteTable 
            flavorNotes={flavorNotes} 
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
          <Pagination paging={paging} setPaging={setPaging} />
        </>
      )}
    </div>
  );
};

export default FlavorNotePage;
