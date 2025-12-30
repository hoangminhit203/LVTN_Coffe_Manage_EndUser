import { useState } from "react"

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    type: "warning",
  })

  const confirm = ({
    title,
    message,
    onConfirm,
    confirmText,
    cancelText,
    type,
  }) => {
    setConfirmState({
      isOpen: true,
      title: title || "Xác nhận",
      message: message || "Bạn có chắc chắn muốn thực hiện hành động này?",
      onConfirm,
      confirmText: confirmText || "Xác nhận",
      cancelText: cancelText || "Hủy",
      type: type || "warning",
    })
  }

  const handleClose = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleConfirm = () => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm()
    }
    handleClose()
  }

  return {
    confirmState,
    confirm,
    handleClose,
    handleConfirm,
  }
}
