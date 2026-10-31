import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useVehicles } from "../vehicle/hook/useVehicle";
import { useVehicleBrands } from "../vehiclebrand/hook/useVehicleBrand";
import EmployeeFormFields from "./components/EmployeeFormFields";
import DriverVehicleSelect from "./components/DriverVehicleSelect";

const ROLE_MAP = {
  "ผู้จัดการร้าน": "1",
  "ผู้จัดการ": "1",
  "แอดมินรับโทรศัพท์": "2",
  "แอดมิน": "2",
  "คนขับรถส่งแก๊ส": "3",
};

export default function EmployeeSlideOver({ isOpen, onClose, onSave, initialData }) {
  const { vehicles = [], vehicleIsNull = [], refetch } = useVehicles() || {};
  const { brands = [] } = useVehicleBrands() || {};

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role_id: "1",
    vehicle_id: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDriver = String(formData.role_id) === "3";

  const getRoleId = (data) => {
    if (!data) return "1";
    const rawVal = typeof data === "object" ? (data.role_id || data.id || data.name) : data;
    const strVal = String(rawVal).trim();
    if (["1", "2", "3"].includes(strVal)) return strVal;
    if (ROLE_MAP[strVal]) return ROLE_MAP[strVal];
    return "1";
  };

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      let matchedVehicleId = initialData.vehicle_id ? String(initialData.vehicle_id) : "";

      if (!matchedVehicleId && initialData.license_plate && Array.isArray(vehicles)) {
        const matchedVehicle = vehicles.find(
          (v) => v.license_plate === initialData.license_plate
        );
        if (matchedVehicle) matchedVehicleId = String(matchedVehicle.vehicle_id);
      }

      const rawRole = initialData.role_id ?? initialData.role ?? initialData.role_name;

      setFormData({
        name: initialData.name || "",
        phone: initialData.phone ? String(initialData.phone).replace(/\D/g, "").slice(0, 10) : "",
        email: initialData.email || "",
        role_id: getRoleId(rawRole),
        vehicle_id: matchedVehicleId,
        status: initialData.status || "active",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        role_id: "1",
        vehicle_id: "",
        status: "active",
      });
    }
    setError(null);
  }, [initialData, isOpen, vehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // กรองเบอร์โทรศัพท์ให้รับเฉพาะตัวเลข และจำกัดความยาวไม่เกิน 10 หลัก (ไม่มีขีด)
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: numericValue }));
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "role_id" && value !== "3") {
        updated.vehicle_id = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ตรวจสอบความถูกต้องของเบอร์โทรศัพท์ (ต้องเป็นตัวเลข 10 หลักเป๊ะๆ ไม่มีขีด)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง เป็นตัวเลข 10 หลัก (ไม่มีขีด)");
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      role_id: Number(formData.role_id),
      vehicle_id: isDriver && formData.vehicle_id ? Number(formData.vehicle_id) : null,
      status: formData.status,
    };

    try {
      await onSave(payload);
      onClose();
      if (refetch) refetch();
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 h-screen transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {initialData ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* ฟิลด์ข้อมูลหลัก */}
            <EmployeeFormFields formData={formData} handleChange={handleChange} />

            {/* ส่วนเลือกยานพาหนะเฉพาะคนขับรถ */}
            {isDriver && (
              <DriverVehicleSelect
                formData={formData}
                handleChange={handleChange}
                vehicles={vehicles}
                vehicleIsNull={vehicleIsNull}
                brands={brands}
              />
            )}
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}