import React, { useState, useMemo } from 'react'
import { useCustomer } from '../hooks/useCustomer'
import CustomerSlideOver from '../CustomerSlideOver'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Users, Search, MapPin, ExternalLink } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function Customer() {
  const {
    data: customers = [],
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomer()

  // เก็บ ID ของลูกค้าที่กำลังดำเนินการลบ
  // ใช้ควบคุมไอคอนหมุนและปิดใช้งานปุ่มลบของแถวนั้น
  const [actionLoading, setActionLoading] = useState(null)

  // เก็บสถานะเปิดหรือปิดฟอร์มเพิ่ม/แก้ไขลูกค้า
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)

  // เก็บข้อมูลลูกค้าที่เลือกแก้ไข
  // null หมายถึงยังไม่ได้เลือกลูกค้า หรือกำลังจะเพิ่มลูกค้าใหม่
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // เก็บข้อความที่ผู้ใช้พิมพ์ในช่องค้นหา
  const [searchTerm, setSearchTerm] = useState('')

  // คำนวณรายชื่อลูกค้าที่ตรงกับคำค้นหา
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers
    const term = searchTerm.toLowerCase() //ให้การค้นหาชื่อและที่อยู่ภาษาอังกฤษไม่สนใจตัวพิมพ์เล็ก/ใหญ่
    return customers.filter(
      // วนตรวจสอบ
      (c) =>
        c.customer_name?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.address?.toLowerCase().includes(term)
    )
  }, [customers, searchTerm])
//ปิดฟอร์มเพิ่มและแก้ไขลูกค้า
  const handleOpenAdd = () => {
    setSelectedCustomer(null)
    setIsSlideOverOpen(true)
  }
  const handleOpenEdit = (customer) => {
     // เก็บข้อมูลลูกค้าที่ผู้ใช้เลือก เพื่อส่งให้ฟอร์มแสดงข้อมูลเดิม
    setSelectedCustomer(customer)
    setIsSlideOverOpen(true)
  }
//บันทึกข้อมูลลูกค้า
const handleSaveCustomer = async (formData) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.customer_id, formData)
      toast.success(`แก้ไขข้อมูลลูกค้า #${selectedCustomer.customer_id} สำเร็จ`)
    } else {
      await addCustomer(formData)
      toast.success('เพิ่มลูกค้าใหม่สำเร็จ')
    }
  }
// ลบข้อมูลลูกค้า
const handleDelete = async (id, name) => {
    if (!window.confirm(`คุณต้องการลบข้อมูลลูกค้า "${name}" ใช่หรือไม่?`)) return

    try {
      setActionLoading(id)
      await deleteCustomer(id)
      toast.success(`ลบลูกค้า #${name} สำเร็จ`);
    } catch (err) {
      toast.error(`เกิดข้อผิดพลาด`);
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">ข้อมูลลูกค้า</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full">
              {customers.length} ราย
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">จัดการข้อมูลรายชื่อลูกค้าและรายละเอียดการจัดส่งสินค้า</p>
        </div>
        {/* เมื่อกดปุ่ม จะเรียก handleOpenAdd เพื่อเปิดฟอร์มเพิ่มลูกค้า */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มลูกค้าใหม่</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-lg text-[#1A1A1A]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">จำนวนลูกค้าทั้งหมด</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {customers.length}{' '}
              <span className="text-xs font-normal text-neutral-500">ราย</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">ระบุพิกัด GPS แล้ว</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {customers.filter((c) => c.latitude && c.longitude).length}{' '}
              <span className="text-xs font-normal text-neutral-500">ราย</span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, เบอร์โทร, ที่อยู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5b5b5b] text-[#1A1A1A]"
            />
          </div>
          <div className="text-xs text-neutral-500">
            แสดงผล <span className="font-semibold text-[#1A1A1A]">{filteredCustomers.length}</span> จากทั้งหมด{' '}
            <span className="font-semibold text-[#1A1A1A]">{customers.length}</span> ราย
          </div>
        </div>

        {loading && customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
            <p className="text-sm">กำลังโหลดข้อมูลลูกค้า...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm">
              {searchTerm ? 'ไม่พบข้อมูลลูกค้าที่ตรงกับการค้นหา' : 'ไม่พบข้อมูลลูกค้าในระบบ'}
            </p>
          </div>
        ) : (
          <div className="max-h-[55vh] overflow-y-scroll custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8FB] border-b border-neutral-200 text-xs font-semibold text-[#545454] uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">ชื่อลูกค้า / ร้านค้า</th>
                  <th className="py-3.5 px-4">เบอร์โทรศัพท์</th>
                  <th className="py-3.5 px-4">ที่อยู่</th>
                  <th className="py-3.5 px-4">พิกัด GPS</th>
                  <th className="py-3.5 px-4">หมายเหตุการจัดส่ง</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              {/* {ส่วนตารางข้อมูลลูกค้า} */}
              <tbody className="divide-y divide-neutral-200 text-sm text-[#1A1A1A]">
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.customer_id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* ใช้ customer_id เป็น Key เพื่อให้ React แยกแต่ละแถวได้ */}
                    <td className="py-3.5 px-4 text-neutral-500">{index + 1}</td>  {/* ลำดับของลูกค้าในรายการที่แสดง */}
                    <td className="py-3.5 px-4 font-medium">{customer.customer_name}</td>
                    <td className="py-3.5 px-4 text-neutral-600">{customer.phone}</td>
                    <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate" title={customer.address}>
                      {customer.address || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {customer.latitude && customer.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>ดูแผนที่</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-400 text-xs">- ไม่มีพิกัด -</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate" title={customer.delivery_note}>
                      {customer.delivery_note || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          className="p-1.5 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.customer_id, customer.customer_name)}
                          disabled={actionLoading === customer.customer_id}
                          className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="ลบข้อมูล"
                        >
                          {actionLoading === customer.customer_id ? (
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

      <CustomerSlideOver  
      // ส่วนเชื่อมต่อกับฟอร์ม
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        onSave={handleSaveCustomer}
        initialData={selectedCustomer}
      />
    </div>
  )
}