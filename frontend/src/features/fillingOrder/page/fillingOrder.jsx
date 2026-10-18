import React, { useState, useMemo } from 'react';
import { FolderOpen, Plus, Trash2, AlertCircle, Loader2, Calendar, X } from 'lucide-react';
import { useFillingOrder } from '../hook/useFillingOrder'; 
import FillingOrderSlideOver from '../FillingOrderSlideOver'; 

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function FillingOrder() {
  const { data: orders, loading, error, createFillingOrder, deleteFillingOrder, refetch } = useFillingOrder();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreateOrder = async ({ orderDate, imageFile }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await convertFileToBase64(imageFile);
      }

      await createFillingOrder(orderDate, imageBase64);
      
      setIsSlideOverOpen(false);
      refetch();
    } catch (err) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        await deleteFillingOrder(id);
      } catch (err) {
        alert('ลบไม่สำเร็จ: ' + err.message);
      }
    }
  };

  // 💡 ฟังก์ชันแปลง Path รูปภาพ (รองรับทั้ง Cloudinary URL และ Path เก่า)
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // ถ้าเป็นลิงก์ Cloudinary เต็มรูปแบบแล้ว ให้ใช้ตรงๆ ทันที
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // กรณีข้อมูลเก่าที่เป็น Local Path บนเซิร์ฟเวอร์
    const cleanBaseUrl = (API_BASE_URL || "").replace(/\/+$/, "");
    const formattedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${cleanBaseUrl}${formattedPath}`;
  };

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => {
      if (!selectedDate) return true;
      const orderDateOnly = o.order_date ? o.order_date.split('T')[0] : "";
      return orderDateOnly === selectedDate;
    });
  }, [orders, selectedDate]);

  return (
    <div className="max-w-7xl mx-auto p-4 h-screen sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">แฟ้มประวัติการเติมแก๊ส</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                {filteredOrders.length} รายการ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">จัดการและเรียกดูรูปภาพบิลเติมแก๊สทั้งหมด</p>
          </div>
        </div>

        {/* Action Controls (Filter Date & Save Button) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-44 pl-9 pr-8 py-2.5 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5b5b5b] text-[#1A1A1A]"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                title="ล้างวันที่"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSlideOverOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 btn-primary text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกบิลใหม่</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="max-h-[75vh] overflow-hidden overflow-y-scroll custom-scrollbar">
        {/* Content Body */}
        {loading && (!orders || orders.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-[#3a66cc] animate-spin mb-3" />
            <p className="text-sm text-neutral-500 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredOrders.map((order) => {
              const imageUrl = getFullImageUrl(order.imageUrl);
              return (
                <div 
                  key={order.filling_order_id} 
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="p-3.5 sm:p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#1A1A1A]">
                      วันที่: {order.order_date?.split('T')[0]}
                    </span>
                    <button
                      onClick={() => handleDelete(order.filling_order_id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบรายการ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* ส่วนรูปภาพ: รองรับทั้ง Cloudinary และ Local Path เก่า */}
                  <div 
                    className={`p-4 flex-1 flex items-center justify-center bg-[#FAFAFA] min-h-[150px] sm:min-h-[180px] ${imageUrl ? 'cursor-pointer group' : ''}`}
                    onClick={() => imageUrl && window.open(imageUrl, '_blank')}
                    title={imageUrl ? "คลิกเพื่อเปิดรูปในแท็บใหม่" : ""}
                  >
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt="Bill" 
                        className="max-h-44 object-contain rounded-lg transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-xs text-neutral-400">ไม่มีรูปภาพ</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm px-4 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <p className="text-base font-bold text-neutral-700">
              {selectedDate ? "ไม่พบประวัติการเติมแก๊สในวันที่เลือก" : "ยังไม่มีแฟ้มประวัติการเติมแก๊ส"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {selectedDate ? "ลองเลือกวันอื่น หรือกดปุ่มกากบาทเพื่อดูทั้งหมด" : 'กดปุ่ม "บันทึกบิลใหม่" ด้านบนเพื่อเริ่มเก็บประวัติ'}
            </p>
          </div>
        )}
      </div>

      {/* SlideOver Modal */}
      <FillingOrderSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSubmit={handleCreateOrder}
        loading={submitting}
        error={submitError}
      />
    </div>
  );
}