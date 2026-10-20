import React from "react";
import {
  X,
  User,
  Truck,
  CreditCard,
  Package,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

export default function OrderDetailsSlideOver({ isOpen, onClose, order }) {
  const safeOrder = order || {};

  // กำหนด URL ของ Backend จาก Environment Variable
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // ฟังก์ชันแปลง Path ให้เป็น Full URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_URL}/${imagePath.replace(/^\//, "")}`;
  };

  const finalImageUrl = getFullImageUrl(safeOrder.imageUrl);

  // 💡 ฟังก์ชันแปลงสถานะเป็นภาษาไทยและกำหนดสีป้ายสถานะ
  const getDeliveryStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return { text: "จัดส่งสำเร็จ", className: "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full" };
      case "delivering":
        return { text: "กำลังจัดส่ง", className: "bg-blue-50 text-blue-700 border border-blue-200 rounded-full" };
      case "pending":
        return { text: "รอดำเนินการ", className: "bg-amber-50 text-amber-700 border border-amber-200 rounded-full" };
      case "cancelled":
        return { text: "ยกเลิก", className: "bg-rose-50 text-rose-700 border border-rose-200 rounded-full" };
      default:
        return { text: status || "-", className: "bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full" };
    }
  };

  const statusConfig = getDeliveryStatusConfig(safeOrder.delivery_status);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 h-screen transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              รายละเอียดออเดอร์ #{safeOrder.order_id || ""}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              วันที่สั่งซื้อ:{" "}
              {safeOrder.order_date
                ? new Date(safeOrder.order_date.replace(" ","T")).toLocaleString("th-TH")
                : "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 custom-scrollbar overflow-y-auto p-6 space-y-6">
          {/* Status & Payment Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl items-center">
            <div className="border-r border-neutral-200 pr-4">
              <span className="text-xs text-neutral-500 block mb-1.5">
                สถานะการจัดส่ง
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${statusConfig.className}`}
              >
                {statusConfig.text}
              </span>
            </div>
            <div>
              <span className="text-xs text-neutral-500 block mb-1.5">
                วิธีชำระเงิน
              </span>
              <span className="text-sm font-medium text-[#1A1A1A] uppercase flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-neutral-400" />
                {safeOrder.payment_method || "-"}
              </span>
            </div>
          </div>

          {/* Customer & Driver Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              ข้อมูลผู้รับและจัดส่ง
            </h3>
            <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-neutral-400" /> ลูกค้า (ผู้รับ)
                </span>
                <span className="font-medium text-[#1A1A1A]">
                  {safeOrder.customer_name || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-neutral-500 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-neutral-400" /> พนักงานจัดส่ง
                </span>
                <span className="font-medium text-[#1A1A1A]">
                  {safeOrder.employee_name || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-neutral-500" />{" "}
                รายการสินค้าในออเดอร์
              </h3>
              <span className="text-xs text-neutral-500">
                {safeOrder.items_snapshot?.length || 0} รายการ
              </span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-200 bg-white">
              {safeOrder.items_snapshot &&
              safeOrder.items_snapshot.length > 0 ? (
                safeOrder.items_snapshot.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center justify-between text-sm hover:bg-neutral-50/50"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-[#1A1A1A]">
                        {item.product_name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        ราคาต่อหน่วย:{" "}
                        {Number(item.unit_price || 0).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        บาท
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1A1A1A]">
                        {(
                          Number(item.unit_price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ฿
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        x{item.quantity}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-neutral-400">
                  ไม่มีข้อมูลรายการสินค้า
                </div>
              )}
            </div>
          </div>

          {/* Proof Image */}
          {finalImageUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-neutral-500" />{" "}
                หลักฐานการจัดส่ง
              </h3>
              <div className="border border-neutral-200 rounded-xl p-2 bg-neutral-50">
                <a
                  href={finalImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative rounded-lg overflow-hidden group border border-neutral-200 bg-white"
                >
                  <img
                    src={finalImageUrl}
                    alt="Delivery Proof"
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                    <ExternalLink className="w-4 h-4" /> ดูรูปขนาดเต็ม
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
          <div>
            <span className="text-neutral-800 font-bold">
              ยอดรวมทั้งสิ้น
            </span>
          </div>
          <div>
            <span className="text-lg font-bold text-[#3a66cc]">
              {Number(safeOrder.total_amount || 0).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}{" "}
              บาท 
            </span>
          </div>
        </div>
      </div>
    </>
  );
}