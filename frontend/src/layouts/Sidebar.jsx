import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  UserCheck,
  LogOut,
  Truck,
  Receipt,
  Wrench,
  Flame,
  ClipboardList,
  ChevronDown,
  Bike,
  Bus,
  Lock,
  Settings,
  History,
  Home
} from "lucide-react";

// กำหนด roles ที่มีสิทธิ์เห็นแต่ละเมนู ([1] = เจ้าของ, [2] = แอดมิน)
const menuSections = [
  {
    category: "ทั่วไป",
    collapsible: false,
    items: [
      { title: "Dashboard", path: "/", icon: LayoutDashboard, exact: true, roles: [1] },
    ],
  },
  {
    category: "จัดการคลังแก๊ส",
    collapsible: false,
    items: [
      { title: "จัดการสินค้า", path: "/product", icon: Package, roles: [1, 2] },
    ],
  },
  {
    category: "ออเดอร์ & จัดส่ง",
    collapsible: false,
    items: [
      { title: "ออเดอร์", path: "/order", icon: BarChart3, roles: [1, 2] },
      { title: "รายการการจัดส่ง", path: "/delivery", icon: Truck, roles: [1, 2] },
    ],
  },
  {
    category: "ลูกค้า",
    collapsible: false,
    items: [
      { title: "ข้อมูลลูกค้า", path: "/customer", icon: Users, roles: [1, 2] },
    ],
  },
  {
    category: "บิล / การค้างถัง",
    collapsible: true,
    items: [
      { title: "บิลถังซ่อม", path: "/Maintenance", icon: Wrench, roles: [1] },
      { title: "บิลถังบรรจุ", path: "/FillingOrder", icon: Flame, roles: [1] },
      { title: "รายการถังค้าง", path: "/cylinderdeposit", icon: ClipboardList, roles: [1] },
    ],
  },
  {
    category: "ตั้งค่าระบบ",
    collapsible: true,
    items: [
      { title: "ข้อมูลพนักงาน", path: "/employee", icon: UserCheck, roles: [1] },
      { title: "รายการยานพาหนะ", path: "/vehicles", icon: Bike, roles: [1, 2] },
      { title: "ข้อมูลยานพาหนะ", path: "/vehiclebrand", icon: Bus, roles: [1, 2] },
      { title: "จัดการรหัสผ่าน", path: "/security", icon: Lock, roles: [1] },
      { title: "ประวัติการสั่งซื้อ", path: "/history", icon: History, roles: [1, 2] },
      { title: "ตำแหน่งร้านค้า", path: "/Location", icon: Home, roles: [1, 2] },
    ],
  }
];

// mapping ตำแหน่งแบบ static
const ROLE_NAME_MAP = {
  1: "เจ้าของ",
  2: "แอดมิน",
};

export default function Sidebar() {
  const { logout, role, employeeName } = useAuth();
  const navigate = useNavigate();

  const userRole = Number(role);
  const roleName = ROLE_NAME_MAP[userRole] || "-";

  // กรองเมนูเฉพาะอันที่มีสิทธิ์ และซ่อนหมวดหมู่ที่ไม่มีรายการเมนูเหลืออยู่
  const filteredMenuSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0);

  // 🌟 ตั้งค่าเริ่มต้นให้ปิดดรอปดาวน์ไว้ทั้งหมด (false)
  const [openSections, setOpenSections] = useState(
    Object.fromEntries(
      filteredMenuSections.filter((s) => s.collapsible).map((s) => [s.category, false]),
    ),
  );

  const toggleSection = (category) => {
    setOpenSections((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 hidden md:flex  bg-[#F5F8FB] text-slate-200 h-screen p-2  flex-col justify-between shadow-lg shrink-0 overflow-hidden">
      <div className="text-xl font-bold p-3 mb-3 border-b border-neutral-700 text-[#1A1A1A] flex items-center gap-2 shrink-0">
        <span>ระบบจัดการร้านแก๊ส</span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 min-h-0  overflow-y-auto custom-scrollbar space-y-2 px-2 border border-neutral-200 rounded-md py-2">
        {filteredMenuSections.map((section) => {
          const isOpen = section.collapsible
            ? openSections[section.category]
            : true;

          return (
            <div key={section.category}>
              {section.collapsible ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.category)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#545454] uppercase tracking-wider hover:text-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 h-8 flex justify-start items-end">
                    {section.category === "ตั้งค่าระบบ" && <Settings className="w-3.5 h-3.5" />}
                    {section.category}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <h3 className="px-4 text-xs h-8 flex justify-start items-end  font-semibold text-[#545454] uppercase tracking-wider mb-2">
                  {section.category}
                </h3>
              )}

              <nav
                className={`space-y-1 overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-6 py-2.5 rounded-[5px] text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-neutral-200 text-[#1A1A1A]"
                            : "hover:bg-neutral-200 text-[#1A1A1A]"
                        }`
                      }
                    >
                      <IconComponent className="w-4 h-5 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* Profile & Logout Footer */}
      <div className="pt-3 space-y-3 shrink-0 mt-2">
        {/* กรอบโปรไฟล์ผู้ใช้ */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-neutral-200 rounded-lg"
          style={{ backgroundColor: "#EEF3FF" }}
        >
          <div className="w-9 h-9 rounded-full bg-[#A5B0C6] flex items-center justify-center text-sm font-semibold text-[#090909] shrink-0">
            {employeeName ? employeeName.charAt(0).toUpperCase() : "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {employeeName || "ไม่ทราบชื่อ"}
            </p>
            <p className="text-xs text-[#0c0c0c] truncate">{roleName}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-neutral-700 hover:bg-red-700 text-slate-200 hover:text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}