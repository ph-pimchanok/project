import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Image as ImageIcon,
  Upload,
  Loader2,
  CheckCircle,
  Plus,
  AlertCircle,
} from "lucide-react";

export default function MaintenanceSlideOver({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
}) {
  const [receivedDate, setReceivedDate] = useState(
    new Date().toLocaleDateString("sv-SE")
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // รีเซ็ตค่าฟอร์มเมื่อเปิด/ปิด SlideOver
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccessMessage("");
      setReceivedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccessMessage("");
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("กรุณาแนบรูปถ่ายประวัติการซ่อมบำรุง");
      return;
    }

    try {
      // ส่งค่าไปทำงานที่ Component แม่ (ซึ่งจะเรียกใช้ Custom Hook ต่อ)
      await onSubmit({
        receivedDate,
        imageFile: selectedFile,
      });

      setSuccessMessage("บันทึกข้อมูลสำเร็จ!");

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide Panel */}
        <div
          className={`w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3a66cc]/10 flex items-center justify-center text-[#3a66cc]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A]">
                  เพิ่มประวัติการซ่อมบำรุง
                </h2>
                <p className="text-xs text-neutral-500">
                  อัปโหลดรูปและระบุวันที่รับซ่อมบำรุง
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col justify-between min-h-0"
          >
            <div className="p-6 space-y-5 overflow-y-auto">
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-500" />{" "}
                  วันที่รับซ่อมบำรุง
                </label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3a66cc] text-sm"
                />
              </div>

              {/* File Upload Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-neutral-500" />{" "}
                  รูปถ่ายประวัติการซ่อมบำรุง
                </label>

                {!previewUrl ? (
                  <label className="border-2 border-dashed border-neutral-300 hover:border-[#3a66cc] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-neutral-50 hover:bg-blue-50/30 transition-colors">
                    <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                    <span className="text-sm font-medium text-neutral-700">
                      คลิกเพื่ออัปโหลดรูปภาพ
                    </span>
                    <span className="text-xs text-neutral-400 mt-1">
                      รองรับไฟล์ PNG, JPG, JPEG
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative border border-neutral-200 rounded-xl overflow-hidden bg-neutral-100 p-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-60 object-contain rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-1/2 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 flex justify-center items-center gap-2 py-2.5 text-sm font-medium btn-primary rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>บันทึกข้อมูล</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}