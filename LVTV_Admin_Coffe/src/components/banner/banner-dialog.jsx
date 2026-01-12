import { useEffect, useState } from "react";

const BannerDialog = ({ open, onClose, onSubmit, editData }) => {
    const [file, setFile] = useState(null);
    const [position, setPosition] = useState(1);
    const [isActive, setIsActive] = useState(true);
    const [type, setType] = useState(0);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        // Defer state updates slightly to avoid synchronous setState-in-effect warnings
        setTimeout(() => {
            if (editData) {
                setPosition(editData.position ?? 1);
                setIsActive(editData.isActive ?? true);
                setType(editData.type ?? 0);
                setPreview(editData.imageUrl ?? null);
                setFile(null);
            } else {
                setPosition(1);
                setIsActive(true);
                setType(0);
                setTitle("");
                setDescription("");
                setPreview(null);
                setFile(null);
            }
        }, 0);
    }, [editData, open]);

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        // Defer preview assignment to avoid synchronous setState-in-effect warning
        const t = setTimeout(() => setPreview(url), 0);
        return () => {
            clearTimeout(t);
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const f = e.target.files && e.target.files[0];
        setFile(f);
        setError("");
    };

    const handleSubmit = () => {
        setError("");

        // Validation: require image on create
        if (!file && !(editData && editData.publicId)) {
            setError("Please choose an image file.");
            return;
        }

        // If file provided, validate type and size (<=5MB)
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please choose a valid image file.");
                return;
            }
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError("Image must be smaller than 5MB.");
                return;
            }
        }

        const formData = new FormData();
        if (file) {
            formData.append("File", file);
        } else if (editData && editData.publicId) {
            // keep existing publicId so backend knows not to replace image
            formData.append("publicId", editData.publicId);
        }
        formData.append("IsActive", isActive);
        formData.append("Position", position);
        formData.append("Type", type);
        // Append CreatedDate when creating, UpdateDate when editing so backend can record timestamps
        if (editData) {
            formData.append("UpdateDate", new Date().toISOString());
        } else {
            formData.append("CreatedDate", new Date().toISOString());
        }
        // Caller will handle create vs update based on editData
        onSubmit && onSubmit(formData);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl transition-colors">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">{editData ? "Edit Banner" : "New Banner"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image</label>
                        <div className="mt-2">
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                        </div>
                        {preview && (
                            <div className="mt-3">
                                <img src={preview} alt="preview" className="h-36 w-full object-cover rounded-md" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
                        <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white dark:bg-slate-900" />

                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-4">Type</label>
                        <select value={type} onChange={(e) => setType(Number(e.target.value))} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white dark:bg-slate-900">
                            <option value={0}>MainSlider</option>
                            <option value={1}>SubCard</option>
                        </select>



                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-4">Active</label>
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => setIsActive((prev) => !prev)}
                                aria-pressed={isActive}
                                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

export default BannerDialog;