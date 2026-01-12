const BannerViewDialog = ({ open, onClose, data }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-lg p-6 m-4 shadow-xl transition-colors">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Banner</h3>

                <div className="mb-4">
                    {data?.imageUrl ? (
                        <img src={data.imageUrl} alt="banner" className="w-full h-48 object-cover rounded-md" />
                    ) : (
                        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">No image</div>
                    )}
                </div>

                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div><strong>Position:</strong> {data?.position}</div>
                    <div><strong>Type:</strong> {data?.type === 0 ? 'MainSlider' : data?.type === 1 ? 'SubCard' : data?.type}</div>
                    <div><strong>Active:</strong> {data?.isActive ? "Yes" : "No"}</div>
                    <div><strong>Created:</strong> {data?.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}</div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg">Close</button>
                </div>
            </div>
        </div>
    );
};

export default BannerViewDialog;