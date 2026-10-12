import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCustomer } from "../customers/hooks/useCustomer";
import { useProduct } from "../product/hook/useProduct";

export default function OrderSlideOver({ isOpen, onClose, onSave, initialData, onDelete }) {
  const { data: customers = [] } = useCustomer();
  const { data: products = [] } = useProduct();

  const [formData, setFormData] = useState({
    customer_id: "",
    items: [{ product_id: "", quantity: 1, unit_price: 0 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);
    }, 0);
  }, [formData.items]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // หาชื่อลูกค้าจาก initialData เพื่อนำมาแสดงผลในช่องกรอก
      const matchedCustomer = customers.find(
        (c) =>
          Number(c.customer_id) === Number(initialData.customer_id) ||
          (c.name || c.customer_name) === initialData.customer_name
      );

      const customerValue = matchedCustomer
        ? (matchedCustomer.name || matchedCustomer.customer_name)
        : (initialData.customer_name || initialData.customer_id || "");

      const mappedItems =
        initialData.items?.length > 0
          ? initialData.items.map((i) => {
              let pId = i.product_id || "";
              let uPrice = Number(i.unit_price) || 0;

              const matched = products.find((p) =>
                pId
                  ? Number(p.product_id) === Number(pId)
                  : p.product_name === i.product_name
              );

              if (matched) {
                if (!pId) pId = matched.product_id;
                if (!uPrice || !i.product_id) {
                  uPrice = Number(matched.current_price || uPrice);
                }
              }

              return {
                item_id: i.item_id,
                product_id: pId,
                quantity: Number(i.quantity) || 1,
                unit_price: uPrice,
              };
            })
          : [{ product_id: "", quantity: 1, unit_price: 0 }];

      setFormData({ customer_id: customerValue, items: mappedItems });
    } else {
      setFormData({
        customer_id: "",
        items: [{ product_id: "", quantity: 1, unit_price: 0 }],
      });
    }

    setError(null);
  }, [initialData, isOpen, customers, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === "product_id") {
      const selectedProduct = products.find(
        (p) => Number(p.product_id) === Number(value)
      );
      newItems[index].unit_price = selectedProduct
        ? Number(selectedProduct.current_price || 0)
        : 0;
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const removeItemRow = (index) => {
    if (!index) { return; }

    if (formData.items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

    onDelete(formData.items[index].item_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ค้นหา customer_id จากชื่อที่ผู้ใช้พิมพ์เข้ามา หรือใช้ค่าเดิมหากเป็นตัวเลข
    const matchedCustomer = customers.find(
      (c) =>
        String(c.customer_id) === String(formData.customer_id) ||
        (c.name || c.customer_name)?.toLowerCase() === String(formData.customer_id).toLowerCase()
    );

    const customerIdFinal = matchedCustomer
      ? Number(matchedCustomer.customer_id)
      : (Number(formData.customer_id) || 0);

    const payload = {
      customer_id: customerIdFinal,
      total_amount: totalAmount,
      items: formData.items.map((i) => {
        const selectedProduct = products.find(
          (p) => Number(p.product_id) === Number(i.product_id)
        );
        return {
          ...(i.item_id ? { item_id: Number(i.item_id) } : {}),
          product_id: Number(i.product_id) || 0,
          quantity: Number(i.quantity) || 1,
          unit_price: selectedProduct
            ? Number(selectedProduct.current_price || 0)
            : Number(i.unit_price) || 0,
        };
      }),
    };

    await onSave(payload);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 h-screen transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#1A1A1A]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {initialData ? "แก้ไขคำสั่งซื้อ" : "สร้างออเดอร์ใหม่"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* ช่องกรอกข้อมูลลูกค้า (เปลี่ยนจาก select เป็น input + datalist) */}
            <div>
              <label className="block text-sm font-medium text-[#4b4a4a] mb-1">
                ลูกค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_id"
                required
                value={formData.customer_id}
                onChange={handleChange}
                list="customer-options"
                placeholder="พิมพ์ชื่อหรือเลือกลูกค้า..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
              />
              <datalist id="customer-options">
                {customers.map((c) => (
                  <option key={c.customer_id} value={c.name || c.customer_name}>
                    {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </datalist>
            </div>

            {/* รายการสินค้า (Items Dynamic List) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#4b4a4a]">
                  รายการสินค้า <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มรายการสินค้า
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <select
                          value={item.product_id}
                          onChange={(e) =>
                            handleItemChange(index, "product_id", e.target.value)
                          }
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
                        >
                          <option value="">-- เลือกสินค้า --</option>
                          {products.map((p) => (
                            <option key={p.product_id} value={p.product_id}>
                              {p.product_name} ({p.current_price || 0} บาท)
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-0.5">
                          จำนวน (quantity)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          required
                          className="w-full px-3 py-1.5 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-0.5">
                          ราคาต่อหน่วย (unit_price)
                        </label>
                        <input
                          type="number"
                          value={item.unit_price}
                          readOnly
                          className="w-full px-3 py-1.5 text-sm bg-neutral-100 text-neutral-600 border border-neutral-300 rounded-lg focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-col items-center justify-between gap-3 shrink-0">
            <div className="w-full p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                ยอดรวมทั้งหมด (total_amount):
              </span>
              <span className="text-lg font-bold text-blue-600">
                {totalAmount.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}{" "}
                บาท
              </span>
            </div>

            <div className="w-full gap-4 flex justify-center items-center">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-1/2 px-4 py-3 text-sm font-medium text-neutral-700 bg-white hover:bg-gray-200 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white btn-primary rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{initialData ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}