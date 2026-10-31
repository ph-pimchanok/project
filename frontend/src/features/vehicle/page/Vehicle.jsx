
import React, { useState, useMemo } from "react";
// useState ใช้เก็บสถานะ เช่น เปิด/ปิดฟอร์ม และข้อมูลรถที่เลือก
// useMemo ใช้คำนวณสถิติใหม่เมื่อข้อมูลรถเปลี่ยน

import { useVehicles } from "../hook/useVehicle";
// Custom Hook สำหรับดึงข้อมูลรถ เพิ่มรถ แก้ไขรถ และลบรถ

import { useVehicleBrands } from "../../vehiclebrand/hook/useVehicleBrand";
// Custom Hook สำหรับดึงข้อมูลยี่ห้อหรือประเภทรถ

import VehicleSlideOver from "../VehicleSlideOver";
// ฟอร์มแบบแผงด้านข้างสำหรับเพิ่มและแก้ไขข้อมูลรถ

import toast, { Toaster } from "react-hot-toast";
// toast ใช้แจ้งผลการทำงาน เช่น เพิ่มสำเร็จหรือลบไม่สำเร็จ
// Toaster เป็นพื้นที่แสดงข้อความแจ้งเตือน

import {
  Plus,        // ไอคอนเพิ่มข้อมูล
  Pencil,      // ไอคอนแก้ไข
  Trash2,      // ไอคอนลบ
  Loader2,     // ไอคอนกำลังโหลด
  AlertCircle, // ไอคอนแจ้งข้อผิดพลาด
  Truck,       // ไอคอนรถ
  CheckCircle2,// ไอคอนพร้อมใช้งาน
  Clock,       // ไอคอนกำลังทำงาน
  Wrench,      // ไอคอนซ่อมบำรุง
  UserX        // ไอคอนไม่มีพนักงาน
} from "lucide-react";

export default function Vehicles() {

  // ดึงข้อมูลและฟังก์ชันจัดการรถจาก Custom Hook
  const {
    vehicles,      // รายการรถที่ได้รับจากระบบ
    loading,       // สถานะกำลังโหลดข้อมูล
    error,         // ข้อผิดพลาดที่เกิดขึ้น
    addVehicle,    // ฟังก์ชันเพิ่มรถ
    updateVehicle, // ฟังก์ชันแก้ไขรถ
    deleteVehicle  // ฟังก์ชันลบรถ
  } = useVehicles();

  // ดึงรายการยี่ห้อหรือประเภทรถ
  const { brands } = useVehicleBrands();

  // เก็บ ID ของรถที่กำลังดำเนินการ เช่น กำลังลบ
  const [actionLoading, setActionLoading] = useState(null);

  // true = เปิดฟอร์มด้านข้าง, false = ปิดฟอร์ม
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // เก็บข้อมูลรถที่เลือกแก้ไข
  // null หมายถึงยังไม่ได้เลือกรถเพื่อแก้ไข หรือกำลังเพิ่มรถใหม่
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // คำนวณสถิติรถแยกตามสถานะ
  const stats = useMemo(() => {

    // นับจำนวนรถทั้งหมด
    const total = vehicles.length;

    // นับรถที่มีสถานะพร้อมใช้งาน
    const available = vehicles.filter(
      (v) => v.status === "available"
    ).length;

    // นับรถที่กำลังส่งของ
    const inUse = vehicles.filter(
      (v) => v.status === "in_use"
    ).length;

    // นับรถที่อยู่ระหว่างซ่อมบำรุง
    const maintenance = vehicles.filter(
      (v) => v.status === "maintenance"
    ).length;

    // ส่งผลการคำนวณกลับไปใช้แสดงบนหน้าเว็บ
    return { total, available, inUse, maintenance };

  }, [vehicles]); // คำนวณใหม่เมื่อ vehicles เปลี่ยน

  // ค้นหาชื่อยี่ห้อจาก brand_id ของรถ
  const getBrandName = (brandId) => {

    // ค้นหารายการยี่ห้อที่มี ID ตรงกัน
    const brand = brands.find(
      (b) => b.brand_id === brandId
    );

    // ถ้าพบ ให้แสดงชื่อยี่ห้อ/ประเภทรถ
    // ถ้าไม่พบ ให้แสดงหมายเลข ID แทน
    return brand
      ? brand.brand_type
      : `ยี่ห้อ ID: ${brandId}`;
  };

  // สร้างป้ายแสดงสถานะของรถแต่ละคัน
  const renderStatusBadge = (vehicle) => {

    // อ่านสถานะของรถ
    const status = vehicle.status;

    // ตรวจว่ามีข้อมูลพนักงานผูกกับรถหรือไม่
    const hasEmployee =
      vehicle.employee_id ||
      vehicle.employee ||
      vehicle.employee_name;

    // ถ้ารถพร้อมใช้งาน แต่ไม่มีข้อมูลพนักงาน
    // ให้แสดงข้อความ "ไม่มีพนักงาน"
    if (status === "available" && !hasEmployee) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
          <UserX className="w-3 h-3 text-neutral-400" />
          ไม่มีพนักงาน
        </span>
      );
    }

    // เลือกข้อความตามสถานะของรถ
    switch (status) {

      case "available":
        // รถพร้อมใช้งาน
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            พร้อมใช้งาน
          </span>
        );

      case "in_use":
        // รถกำลังส่งของ
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            กำลังส่งของ
          </span>
        );

      case "maintenance":
        // รถอยู่ระหว่างซ่อมบำรุง
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            ซ่อมบำรุง
          </span>
        );

      default:
        // ถ้าเป็นสถานะอื่น ให้แสดงค่าที่ได้รับมา
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  // เตรียมเปิดฟอร์มสำหรับเพิ่มรถใหม่
  const handleOpenAdd = () => {

    // ล้างข้อมูลรถที่เลือกแก้ไข
    setSelectedVehicle(null);

    // เปิดฟอร์มด้านข้าง
    setIsSlideOverOpen(true);
  };

  // เตรียมเปิดฟอร์มแก้ไขรถที่เลือก
  const handleOpenEdit = (vehicle) => {

    // เก็บข้อมูลรถคันที่ผู้ใช้เลือก
    setSelectedVehicle(vehicle);

    // เปิดฟอร์มด้านข้าง
    setIsSlideOverOpen(true);
  };

  // บันทึกข้อมูลจากฟอร์ม
  const handleSave = async (formData) => {

    try {

      // ถ้ามีรถที่เลือกไว้ แสดงว่าเป็นการแก้ไขข้อมูลเดิม
      if (selectedVehicle) {

        // ส่ง ID รถและข้อมูลใหม่ไปให้ฟังก์ชันแก้ไข
        await updateVehicle(
          selectedVehicle.vehicle_id,
          formData
        );

        // แจ้งผลเมื่อแก้ไขสำเร็จ
        toast.success("อัปเดตข้อมูลรถสำเร็จ");

      } else {

        // ถ้าไม่มีรถที่เลือก ให้เพิ่มรถใหม่
        await addVehicle(formData);

        // แจ้งผลเมื่อเพิ่มสำเร็จ
        toast.success("เพิ่มรถใหม่สำเร็จ");
      }

    } catch (err) {

      // แสดงข้อความผิดพลาดจาก API ถ้ามี
      // หากไม่มี จะใช้ข้อความจาก err.message
      toast.error(
        "เกิดข้อผิดพลาด: " +
        (err.response?.data?.message || err.message)
      );

      // ส่งข้อผิดพลาดต่อให้ส่วนที่เรียกฟังก์ชันนี้จัดการต่อ
      throw err;
    }
  };

  // ลบรถ โดยรับ ID และทะเบียนรถ
  const handleDelete = async (id, licensePlate) => {

    // ขอคำยืนยันก่อนลบ
    // หากผู้ใช้กดยกเลิก จะหยุดการทำงานทันที
    if (!window.confirm(
      `คุณต้องการลบรถทะเบียน "${licensePlate}" ใช่หรือไม่?`
    )) return;

    try {

      // ระบุว่ารถคันนี้กำลังถูกลบ
      setActionLoading(id);

      // เรียกฟังก์ชันลบรถจาก Custom Hook
      await deleteVehicle(id);

      // แจ้งผลเมื่อลบสำเร็จ
      toast.success(`ลบรถทะเบียน "${licensePlate}" สำเร็จ`);

    } catch (err) {

      // แจ้งสาเหตุหากลบไม่สำเร็จ
      toast.error(
        "ไม่สามารถลบข้อมูลได้: " +
        (err.response?.data?.message || err.message)
      );

    } finally {

      // ล้างสถานะกำลังโหลด ไม่ว่าจะลบสำเร็จหรือไม่
      setActionLoading(null);
    }
  };

  return (

    // กล่องหลักของหน้า ใช้กำหนดระยะห่างและความกว้าง
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* พื้นที่แสดงข้อความแจ้งเตือน */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* ส่วนหัวของหน้า */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">

            {/* ชื่อหน้าจัดการรถ */}
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              ข้อมูลยานพาหนะ
            </h1>

            {/* แสดงจำนวนรถทั้งหมด */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              {stats.total} คัน
            </span>

          </div>

          <p className="text-sm text-neutral-500 mt-1">
            จัดการข้อมูลรายการรถ น้ำหนักบรรทุกสูงสุด และติดตามสถานะการทำงาน
          </p>
        </div>

        {/* คลิกแล้วเรียก handleOpenAdd เพื่อเปิดฟอร์มเพิ่มรถ */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรถใหม่</span>
        </button>
      </div>

      {/* กล่องสรุปสถิติรถ 4 ประเภท */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* จำนวนรถทั้งหมด */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">จำนวนรถทั้งหมด</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {stats.total}
              </span>
              <span className="text-xs text-neutral-500">คัน</span>
            </div>
          </div>
        </div>

        {/* จำนวนรถพร้อมใช้งาน */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">พร้อมใช้งาน</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {stats.available}
              </span>
              <span className="text-xs text-neutral-500">คัน</span>
            </div>
          </div>
        </div>

        {/* จำนวนรถที่กำลังส่งของ */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">กำลังส่งของ</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {stats.inUse}
              </span>
              <span className="text-xs text-neutral-500">คัน</span>
            </div>
          </div>
        </div>

        {/* จำนวนรถที่ซ่อมบำรุง */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">ซ่อมบำรุง</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {stats.maintenance}
              </span>
              <span className="text-xs text-neutral-500">คัน</span>
            </div>
          </div>
        </div>
      </div>

      {/* ถ้ามีข้อผิดพลาดในการโหลดข้อมูล ให้แสดงข้อความแจ้งเตือน */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</span>
        </div>
      )}

      {/* ส่วนตารางรายการรถ */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">

        {/* เงื่อนไขที่ 1: กำลังโหลดและยังไม่มีข้อมูล */}
        {loading && vehicles.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
            <p className="text-sm">กำลังโหลดข้อมูลรถ...</p>
          </div>

        ) : vehicles.length === 0 ? (

          // เงื่อนไขที่ 2: ไม่มีข้อมูลรถให้แสดง
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm">ไม่พบข้อมูลยานพาหนะในระบบ</p>
          </div>

        ) : (

          // เงื่อนไขที่ 3: มีข้อมูลรถ จึงแสดงตาราง
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              {/* หัวตาราง */}
              <thead>
                <tr className="bg-[#F5F8FB] border-b border-neutral-200 text-xs font-semibold text-[#545454] uppercase tracking-wider">
                  <th className="py-3.5 px-4">ทะเบียนรถ</th>
                  <th className="py-3.5 px-4">ยี่ห้อ / ประเภทรถ</th>
                  <th className="py-3.5 px-4">ความจุ / น้ำหนักบรรทุกสูงสุด</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200 text-sm text-[#1A1A1A]">

                {/* วนแสดงข้อมูลรถทีละรายการตามลำดับใน Array vehicles
                    map() ในส่วนนี้ไม่ได้เรียงข้อมูลใหม่เอง */}
                {vehicles.map((v) => (

                  <tr
                    key={v.vehicle_id}
                    className="hover:bg-neutral-50/60 transition-colors"
                  >

                    {/* แสดงทะเบียนรถ */}
                    <td className="py-3.5 px-4 font-semibold flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-500" />
                      <span>{v.license_plate}</span>
                    </td>

                    {/* แปลง brand_id เป็นชื่อยี่ห้อ/ประเภทรถ */}
                    <td className="py-3.5 px-4 text-neutral-600">
                      {getBrandName(v.brand_id)}
                    </td>

                    {/* แสดงน้ำหนักบรรทุกสูงสุด พร้อมคั่นหลักพัน
                        ถ้าไม่มีค่าหรือเป็น 0 จะแสดงเครื่องหมาย - */}
                    <td className="py-3.5 px-4 font-mono text-neutral-700">
                      {v.capacity_kg
                        ? `${v.capacity_kg.toLocaleString()} กก.`
                        : "-"}
                    </td>

                    {/* แสดงป้ายสถานะรถ */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(v)}
                    </td>

                    {/* ปุ่มจัดการข้อมูลรถ */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">

                        {/* ปุ่มแก้ไข: ส่งข้อมูลรถแถวนี้ไปเปิดฟอร์ม */}
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="แก้ไข"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* ปุ่มลบ: ส่ง ID และทะเบียนรถไปให้ handleDelete */}
                        {/* ถ้ากำลังลบรถคันนี้ จะปิดการกดปุ่มชั่วคราว */}
                        <button
                          onClick={() =>
                            handleDelete(v.vehicle_id, v.license_plate)
                          }
                          disabled={actionLoading === v.vehicle_id}
                          className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                          title="ลบ"
                        >
                          {/* ระหว่างลบ แสดงไอคอนหมุนแทนถังขยะ */}
                          {actionLoading === v.vehicle_id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ฟอร์มด้านข้างสำหรับเพิ่มหรือแก้ไขรถ */}
      <VehicleSlideOver
        isOpen={isSlideOverOpen}
        // ส่งสถานะเปิด/ปิดฟอร์มให้ component ลูก

        onClose={() => setIsSlideOverOpen(false)}
        // เมื่อปิดฟอร์ม ให้เปลี่ยนสถานะเป็น false

        onSave={handleSave}
        // ส่งฟังก์ชันบันทึกข้อมูลให้ฟอร์มเรียกใช้

        initialData={selectedVehicle}
        // null = เพิ่มรถใหม่
        // มีข้อมูลรถ = แก้ไขรถที่เลือก
      />

    </div>
  );
}
