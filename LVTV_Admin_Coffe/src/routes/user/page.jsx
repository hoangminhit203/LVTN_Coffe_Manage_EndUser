import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, getUserById } from "../../service/userService";
import UserDialog from "../../components/user/user-dialog";
import UserViewDialog from "../../components/user/user-view-dialog";
import UserTable from "../../components/user/user-table";
import Pagination from "../../components/pagination/Pagination";
import { Loader2, Plus, Search } from "lucide-react";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paging, setPaging] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalRecords: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUser, setViewUser] = useState({ show: false, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchUsers();
  }, [paging.pageNumber, paging.pageSize, searchTerm]);

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        ...paging,
        searchTerm: searchTerm.trim()
      });

      console.log("API RESPONSE:", res);

      setUsers(res.records);
      setPaging((prev) => ({
        ...prev,
        totalPages: res.totalPages,
        totalRecords: res.totalRecords,
      }));
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // Handle create/update user
  const handleSubmit = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        alert(`Cập nhật người dùng "${data.userName}" thành công!`);
      } else {
        await createUser(data);
        alert(`Thêm người dùng "${data.userName}" thành công!`);
      }
      setOpenDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Save failed:", error);
      alert(` ${error.response?.data?.message || "Thao tác thất bại! Vui lòng thử lại."}`);
    }
  };

  // Handle edit button click
  const handleEdit = (user) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  // Handle view button click
  const handleView = async (id) => {
    try {
      const data = await getUserById(id);
      setViewUser({ show: true, data });
    } catch (error) {
      console.error("Load user detail failed:", error);
      alert(" Không thể tải thông tin người dùng!");
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await deleteUser(deleteConfirm.id);
      alert("✅ Xóa người dùng thành công!");
      setDeleteConfirm({ show: false, id: null });
      fetchUsers();
    } catch (error) {
      console.error("Delete failed:", error);
      alert(` ${error.response?.data?.message || "Xóa thất bại!"}`);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPaging((prev) => ({ ...prev, pageNumber: page }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPaging((prev) => ({ ...prev, pageNumber: 1 }));
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Quản lý người dùng
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Quản lý danh sách người dùng hệ thống
          </p>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
            </div>
          </form>

          {/* Add Button */}
          <button
            onClick={() => setOpenDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Thêm người dùng</span>
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm transition-colors">
              <UserTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onView={handleView}
              />
            </div>

            {/* Pagination */}
            {paging.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={paging.pageNumber}
                  totalPages={paging.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <UserDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        editData={editingUser}
      />

      <UserViewDialog
        open={viewUser.show}
        onClose={() => setViewUser({ show: false, data: null })}
        user={viewUser.data}
      />

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={cancelDelete}
          />

          {/* Confirmation Dialog */}
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
