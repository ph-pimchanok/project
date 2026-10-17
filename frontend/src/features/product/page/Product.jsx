import React, { useState, useMemo } from 'react';
import { useProduct } from '../hook/useProduct';
import ProductSlideOver from '../ProductSlideOver';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  Package,
  Flame,
  Wrench,
  AlertTriangle,
} from "lucide-react";

// Mapping แปลงชื่อ category เป็นภาษาไทยพร้อมสี Badge
const CATEGORY_MAP = {
  gas: { label: 'แก๊ส', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  spare_part: { label: 'อะไหล่/อุปกรณ์', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function Product() {
  const { data: products, loading, error, addProduct, updateProduct, deleteProduct } = useProduct();

  // State สำหรับ SlideOver & Modal Mode
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' หรือ 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State สำหรับ Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter สินค้าจากคำค้นหา และ หมวดหมู่
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch = item.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // ตัวเลขสรุปสำหรับ Stat Cards (แยกประเภทแก๊ส, อะไหล่ และสต็อกต่ำกว่า 10)
  const stats = useMemo(() => {
    const totalCount = products.length;
    const gasCount = products.filter((p) => p.category === 'gas').length;
    const sparePartCount = products.filter((p) => p.category === 'spare_part').length;
    const lowStockCount = products.filter((p) => (Number(p.stock_qty) || 0) < 10).length;

    return { totalCount, gasCount, sparePartCount, lowStockCount };
  }, [products]);

  // ฟังก์ชันจัดการการบันทึก (เพิ่ม/แก้ไข)
  const handleSaveProduct = async (formData) => {
    try {
      if (modalMode === 'add') {
        await addProduct(formData);
      } else {
        await updateProduct(selectedProduct.product_id, formData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ฟังก์ชันจัดการการลบ
  const handleDeleteProduct = async (id) => {
    if (window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-7xl max-h-screen min-h-screen p-6 mx-auto space-y-6 bg-gray-50/30 text-gray-800 overflow-hidden">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-sm text-gray-500 mt-0.5">ระบบจัดการถังแก๊ส อุปกรณ์ และตรวจสอบสถานะสต็อกสินค้า</p>
        </div>
        <button
          onClick={() => {
            setModalMode('add');
            setSelectedProduct(null);
            setIsSlideOverOpen(true);
          }}
          className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white font-medium text-sm rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> เพิ่มสินค้าใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ช่องที่ 1: ทั้งหมด */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-lg text-[#1A1A1A]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">รายการทั้งหมด</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.totalCount}{" "}
              <span className="text-xs font-normal text-neutral-500">รายการ</span>
            </p>
          </div>
        </div>

        {/* ช่องที่ 2: แก๊ส */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">ประเภทแก๊ส</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.gasCount}{" "}
              <span className="text-xs font-normal text-neutral-500">รายการ</span>
            </p>
          </div>
        </div>

        {/* ช่องที่ 3: อะไหล่/อุปกรณ์ */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">อะไหล่ / อุปกรณ์</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.sparePartCount}{" "}
              <span className="text-xs font-normal text-neutral-500">รายการ</span>
            </p>
          </div>
        </div>

        {/* ช่องที่ 4: สต็อกใกล้หมด */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            {/* (&lt; 10)เงื่อนไขของหมด<10 */}
            <p className="text-xs font-medium text-neutral-500">สต็อกใกล้หมด </p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {stats.lowStockCount}{" "}
              <span className="text-xs font-normal text-neutral-500">รายการ</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Table รายการสินค้า พร้อมช่องค้นหาและตัวกรองติดอยู่ด้านบนสุดของตาราง */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ส่วน Search Bar & Filter อยู่ติดกับตัว Table */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* ช่องค้นหา */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#373737] placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* ตัวกรองหมวดหมู่ */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'gas', label: 'แก๊ส' },
                { id: 'spare_part', label: 'อะไหล่/อุปกรณ์' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ข้อความแสดงผลสรุปจำนวน */}
          <div className="text-xs text-gray-500 whitespace-nowrap">
            แสดงผล {filteredProducts.length} จากทั้งหมด {products.length} รายการ
          </div>
        </div>

        {/* เนื้อหาในตาราง */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> กำลังโหลดข้อมูลสินค้า...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" /> เกิดข้อผิดพลาด: {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">ไม่พบรายการสินค้าที่ค้นหา</div>
        ) : (
          <div className="overflow-x-auto  max-h-[55vh] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8FB] border-b border-neutral-200 text-xs font-semibold text-[#545454] uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">ชื่อสินค้า</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4 text-right">ราคาต้นทุน (บาท)</th>
                  <th className="py-3.5 px-4 text-right">ราคาขายปัจจุบัน (บาท)</th>
                  <th className="py-3.5 px-4 text-center">คงเหลือ (สต็อก)</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredProducts.map((product , index) => {
                  const catInfo = CATEGORY_MAP[product.category] || { label: product.category, bg: 'bg-gray-100 text-gray-600' };
                  const stockQty = Number(product.stock_qty) || 0;
                  const isLowStock = stockQty < 10;

                  return (
                    <tr key={product.product_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-gray-600">
                        {index+1}
                      </td>
                      {/* ชื่อสินค้า */}
                      <td className="py-3.5 px-4 font-medium text-gray-600">
                        {product.product_name}
                      </td>

                      {/* หมวดหมู่ Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md border ${catInfo.bg}`}>
                          {catInfo.label}
                        </span>
                      </td>

                      {/* ราคาต้นทุน */}
                      <td className="py-3.5 px-4 text-right font-medium text-gray-600">
                        {product.cost_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      {/* ราคาขายปัจจุบัน */}
                      <td className="py-3.5 px-4 text-right font-medium text-gray-600">
                        {product.current_price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      {/* จำนวนสต็อก พร้อมแจ้งเตือน < 10 */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`font-medium ${isLowStock ? 'text-rose-600' : 'text-gray-700'}`}>
                            {stockQty.toLocaleString()}
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100 mt-0.5 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> สต็อกเหลือน้อย
                            </span>
                          )}
                        </div>
                      </td>

                      {/* คอลัมน์จัดการ */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setModalMode('edit');
                              setSelectedProduct(product);
                              setIsSlideOverOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขสินค้า"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* SlideOver Component สำหรับเพิ่ม/แก้ไขสินค้า */}
      <ProductSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        mode={modalMode}
        initialData={selectedProduct}
        onSave={handleSaveProduct}
      />

    </div>
  );
}

