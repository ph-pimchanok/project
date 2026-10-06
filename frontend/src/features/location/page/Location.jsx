import React, { useState, useEffect } from "react";
import { useLocation } from "../../location/hook/useLocation"; // ปรับ path ตามโครงสร้างโฟลเดอร์ของคุณ
import {
    MapPin,
    Save,
    AlertCircle,
    CheckCircle2,
    Navigation,
    ExternalLink,
    Info,
    Compass,
    Globe,
    Loader2,
} from "lucide-react";

export default function Location() {
    const { data, loading, error, updateLocation } = useLocation();

    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingGps, setIsGettingGps] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // รองรับข้อมูลทั้งแบบ Object หรือ Array
    const currentStore = Array.isArray(data) ? data[0] : data;

    // โหลดพิกัดปัจจุบันมาใส่ในฟอร์มเริ่มต้น
    useEffect(() => {
        if (currentStore?.latitude && currentStore?.longitude) {
            setLatitude(String(currentStore.latitude));
            setLongitude(String(currentStore.longitude));
        }
    }, [currentStore]);

    // ดึงตำแหน่ง GPS ของเครื่องเบราว์เซอร์
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMessage({
                type: "error",
                text: "เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง GPS",
            });
            return;
        }

        setIsGettingGps(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(String(position.coords.latitude));
                setLongitude(String(position.coords.longitude));
                setIsGettingGps(false);
                setMessage({
                    type: "success",
                    text: "ดึงพิกัดจาก GPS ปัจจุบันสำเร็จแล้ว (อย่าลืมกดบันทึก)",
                });
            },
            (err) => {
                setIsGettingGps(false);
                setMessage({
                    type: "error",
                    text: "ไม่สามารถดึงตำแหน่ง GPS ได้: " + err.message,
                });
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (!latitude || !longitude) {
            setMessage({
                type: "error",
                text: "กรุณากรอกทั้ง ละติจูด (Latitude) และ ลองจิจูด (Longitude)",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            await updateLocation(Number(latitude), Number(longitude));
            setMessage({
                type: "success",
                text: "บันทึกและอัปเดตตำแหน่งร้านค้าสำเร็จเรียบร้อยแล้ว",
            });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.message || "เกิดข้อผิดพลาดในการอัปเดตตำแหน่ง กรุณาลองใหม่อีกครั้ง",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl p-6 space-y-6 min-h-screen text-slate-800">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold text-[#1A1A1A]">
                            ตั้งค่าตำแหน่งร้านค้า
                        </h1>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1.5 pl-0.5">
                        กำหนดพิกัดละติจูดและลองจิจูดสำหรับหมุดร้านค้าบนระบบแผนที่และการจัดส่ง
                    </p>
                </div>
            </div>

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Form Card (Left / Main Column - Span 2) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold text-[#1A1A1A]">
                                ฟอร์มแก้ไขพิกัดร้านค้า
                            </span>
                        </div>
                        <span className="text-xs text-neutral-400">
                            ช่องที่มีเครื่องหมาย <span className="text-rose-500">*</span> จำเป็นต้องกรอก
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Alert Message */}
                        {message.text && (
                            <div
                                className={`p-4 rounded-xl text-sm flex items-start gap-3 border transition-all ${message.type === "error"
                                        ? "bg-rose-50 border-rose-200 text-rose-700"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    }`}
                            >
                                {message.type === "error" ? (
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-xs">
                                        {message.type === "error" ? "พบข้อผิดพลาด" : "ดำเนินการสำเร็จ"}
                                    </p>
                                    <p className="text-xs mt-0.5 leading-relaxed">{message.text}</p>
                                </div>
                            </div>
                        )}

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Latitude */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-neutral-700">
                                    ละติจูด (Latitude) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="เช่น 13.75633"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono text-[#1A1A1A] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0B192C] placeholder:font-sans placeholder-neutral-400 transition-all"
                                    />
                                    <Compass className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                                </div>
                            </div>

                            {/* Longitude */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-neutral-700">
                                    ลองจิจูด (Longitude) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="เช่น 100.50176"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono text-[#1A1A1A] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0B192C] placeholder:font-sans placeholder-neutral-400 transition-all"
                                    />
                                    <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                                </div>
                            </div>
                        </div>

                        {/* GPS Helper Button */}
                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                                <p className="font-semibold text-neutral-700">
                                    ระบุจากตำแหน่งอุปกรณ์ปัจจุบัน
                                </p>
                                <p className="text-neutral-500">
                                    ดึงค่าพิกัดพิกัดจริงจาก GPS ของคุณมาเติมในฟอร์มอัตโนมัติ
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleGetCurrentLocation}
                                disabled={isGettingGps}
                                className="px-3.5 py-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                            >
                                {isGettingGps ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                                ) : (
                                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                )}
                                <span>ดึงตำแหน่ง GPS</span>
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E3E62] text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>กำลังบันทึก...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>บันทึกตำแหน่งใหม่</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Info (Right Column - Span 1) */}
                <div className="space-y-5">
                    {/* Current Location Preview Card */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider text-neutral-400">
                            ตำแหน่งปัจจุบันในระบบ
                        </h3>

                        {loading ? (
                            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-2 text-xs text-neutral-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>กำลังโหลดข้อมูลตำแหน่ง...</span>
                            </div>
                        ) : currentStore?.latitude && currentStore?.longitude ? (
                            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#0B192C] text-white flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="overflow-hidden space-y-1">
                                        <p className="text-xs font-bold text-[#1A1A1A]">
                                            พิกัดร้านค้า
                                        </p>
                                        <p className="text-[11px] text-neutral-600 font-mono">
                                            Lat: {currentStore.latitude}
                                        </p>
                                        <p className="text-[11px] text-neutral-600 font-mono">
                                            Lng: {currentStore.longitude}
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={`https://www.google.com/maps?q=${currentStore.latitude},${currentStore.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-200 text-[#0B192C] text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>เปิดดูบน Google Maps</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                </a>
                            </div>
                        ) : (
                            <div className="p-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400 py-6">
                                ยังไม่ได้กำหนดพิกัดตำแหน่งร้านค้า
                            </div>
                        )}
                    </div>

                    {/* Location Guidelines Card */}
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-[#0B192C]">
                            <Info className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">
                                คำแนะนำการปักหมุด
                            </h3>
                        </div>
                        <ul className="space-y-2.5 text-xs text-neutral-600">
                            <li className="flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                                <span>ตรวจสอบความถูกต้องของพิกัดก่อนกดบันทึกเสมอ</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                                <span>สามารถคัดลอกพิกัดจาก Google Maps มาวางในช่องได้โดยตรง</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                                <span>พิกัดนี้จะถูกใช้อ้างอิงสำหรับการคำนวณระยะทางจัดส่งสินค้า</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}