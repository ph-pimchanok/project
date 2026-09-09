import React, { useState, useMemo, useEffect } from 'react';
import { useOrder } from '../hook/useOrder'; // ปรับ Path ตามโครงสร้างโฟลเดอร์จริง
import OrderSlideOver from '../OrderSlideOver'; // อัปเดต Path ชี้ไปที่ features ใหม่
import OrderStatusBadge from '../components/OrderStatusBadge';
import toast, { Toaster } from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  ShoppingCart,
  DollarSign,
  UserCheck,
  PackageCheck,
  Pencil,
  Clock,
  Truck,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function Order() {
  const { data: orders = [], loading, error, createOrder, updateOrderItems, refetch, cancelOrder, deleteOrderItem } = useOrder();

  // State สำหรับ SlideOver & Modal Mode (เพิ่ม/ดูรายละเอียดออเดอร์)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectItemId, setSelectItemId] = useState(null);

  // State สำหรับ Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveOrder = async (payload) => {
    console.log("Payload to save:", payload);

    try {
        if (selectedOrder) {
            const itemsToUpdate = payload.items || payload;
            await updateOrderItems(selectedOrder.order_id, itemsToUpdate);
            toast.success("อัปเดตรายการสินค้าสำเร็จ!");
        } else {
            const result = await createOrder(payload);

            if (result?.success === false) {
                if (result.insufficient_items?.length) {
                    const names = result.insufficient_items
                        .map((i) => `#${i.product_id} (ขอ ${i.requested}, เหลือ ${i.available})`)
                        .join(", ");
                    toast.error(`สินค้าไม่พอ: ${names}`);

                    await refetch();
                } else {
                    toast.error(result.message || "สร้างออเดอร์ไม่สำเร็จ");
                    await refetch();
                }
                return;
            }

            toast.success("สร้างออเดอร์ใหม่สำเร็จ!");
        }

        refetch();
        setIsSlideOverOpen(false);

    } catch (err) {
        console.error("เกิดข้อผิดพลาดในการบันทึกออเดอร์:", err);
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  useEffect(() => {
    if(error) {
      refetch();
    }
  }, [error]);

  const filteredOrders = useMemo(() => { 
    return orders.filter((item) => {
      const matchesSearch = 
        item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.order_id).includes(searchTerm);
      return matchesSearch;
    });
  }, [orders, searchTerm]);

const stats = useMemo(() => {

    const activeOrders = orders.filter(order => order.delivery_status !== 'cancelled');

    const totalCount = activeOrders.length;
    const totalRevenue = activeOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const totalItemsCount = activeOrders.reduce((sum, order) => {
      const items = order.items || [];
      return sum + items.reduce((iSum, item) => iSum + (Number(item.quantity) || 0), 0);
    }, 0);

    return { totalCount, totalRevenue, totalItemsCount };
  }, [orders]);

  // ฟังก์ชันยกเลิกออเดอร์
  const handleCancelOrder = async (id) => {
    if (window.confirm(`คุณต้องการยกเลิกออเดอร์ ID: ${id} ใช่หรือไม่?`)) {
      try {
        await cancelOrder(id);
        await refetch();
        toast.success(`ยกเลิกออเดอร์ #${id} เรียบร้อยแล้ว`);
      } catch (err) {
        console.error(err);
        toast.error("ไม่สามารถยกเลิกออเดอร์ได้");
      }
    }
  };

  const handleDeleteOrderItem = async (itemId) => {
    if(!itemId) { return; }

    if(window.confirm(`คุณต้องการลบรายการสินค้า ID: ${itemId} ใช่หรือไม่?`)) {
       try {
        await deleteOrderItem(itemId);
        await refetch();
        toast.success(`ลบรายการสินค้า #${itemId} สำเร็จ`);
       } catch(err) {
        console.error(err);
        toast.error("ไม่สามารถลบรายการสินค้าได้");
       }
    }
  };

  return (
    <div className="max-w-7xl max-h-screen min-h-screen p-6 mx-auto space-y-6 bg-gray-50/30 text-gray-800 overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการคำสั่งซื้อ (Orders)</h1>
          <p className="text-sm text-gray-500 mt-0.5">ระบบติดตามรายการสั่งซื้อแก๊สและอุปกรณ์ของพนักงาน</p>
        </div>
        <button
          onClick={() => {
            setSelectedOrder(null);
            setIsSlideOverOpen(true);
          }}
          className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-medium text-sm rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> สร้างออเดอร์ใหม่
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-lg text-[#1A1A1A]">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">คำสั่งซื้อทั้งหมด</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.totalCount}{" "}
              <span className="text-xs font-normal text-neutral-500">รายการ</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">ยอดขายรวมทั้งหมด</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}{" "}
              <span className="text-xs font-normal text-neutral-500">บาท</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">สินค้าที่ถูกสั่งซื้อรวม</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.totalItemsCount.toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-500">ชิ้น</span>
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ค้นหาตามรหัสออเดอร์ หรือ ชื่อลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#373737] placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="text-xs text-gray-500 whitespace-nowrap">
            แสดงผล {filteredOrders.length} จากทั้งหมด {orders.length} รายการ
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> กำลังโหลดข้อมูลคำสั่งซื้อ...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" /> เกิดข้อผิดพลาด: {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">ไม่พบรายการคำสั่งซื้อที่ค้นหา</div>
        ) : (
          <div className="overflow-x-auto max-h-[55vh] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8FB] border-b border-neutral-200 text-xs font-semibold text-[#545454] uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">รหัสออเดอร์ (ID)</th>
                  <th className="py-3.5 px-4">ชื่อลูกค้า</th>
                  <th className="py-3.5 px-4 text-center">จำนวนรายการสินค้า</th>
                  <th className="py-3.5 px-4 text-right">ยอดรวมทั้งหมด (บาท)</th>
                  <th className="py-3.5 px-4 text-right">วันที่สั่งซื้อ</th>
                  <th className="py-3.5 px-4 text-center">สถานะการจัดส่ง</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredOrders.map((order, index) => {
                  const itemsCount = (order.items || []).length;
                  const isCancelled = order.delivery_status === 'cancelled';
                  const isDelivered = order.delivery_status === 'delivered';
                  return (
                    <tr key={`${order.order_id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-gray-600">
                        {index + 1}
                      </td>
                      
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        #{order.order_id}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-700 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        {order.customer_name || 'ไม่ระบุชื่อ'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium rounded-md">
                          {itemsCount} รายการสินค้า
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-sky-700">
                        {Number(order.total_amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right text-gray-600">
                        {new Date(order.order_date).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <OrderStatusBadge status={order.delivery_status} />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsSlideOverOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="ดูรายละเอียดสินค้าในออเดอร์"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* แสดงปุ่มยกเลิก (XCircle) เฉพาะเมื่อสถานะยังไม่เป็น cancelled */}
                            {!isCancelled && !isDelivered && (
                              <button
                                onClick={() => handleCancelOrder(order.order_id)}
                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="ยกเลิกออเดอร์"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SlideOver Component สำหรับสร้างหรือดูรายละเอียด Order */}
      <OrderSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        initialData={selectedOrder}
        onSave={handleSaveOrder}
        onDelete={handleDeleteOrderItem}
      />
    </div>
  );
}