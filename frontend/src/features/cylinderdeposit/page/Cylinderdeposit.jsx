import React, { useState, useMemo } from 'react'
import { useCylinderdeposit } from '../hooks/useCylinderdeposit'
import { Package, Search, Loader2, AlertCircle, Pencil, CheckCircle2, Clock } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import CylinderdepositSlideOver from '../CylinderdepositSlideOver'

export default function Cylinderdeposit() {
  const {
    data: deposits = [],
    loading,
    error,
    updateDeposit,
  } = useCylinderdeposit()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'completed' | 'pending'
  
  const [isEditing, setIsEditing] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState(null)

  // คำนวณจำนวนในแต่ละสถานะสำหรับแสดงในกล่องสถิติ
  const stats = useMemo(() => {
    const total = deposits.length
    const completed = deposits.filter(d => Number(d.qty_return) >= Number(d.qty_out)).length
    const pending = total - completed
    return { total, completed, pending }
  }, [deposits])

  // กรองข้อมูลตามคำค้นหาและสถานะ
  const filteredDeposits = useMemo(() => {
    const filtered = deposits.filter((d) => {
      const isCompleted = Number(d.qty_return) >= Number(d.qty_out)
      if (filterStatus === 'completed' && !isCompleted) return false
      if (filterStatus === 'pending' && isCompleted) return false

      if (!searchTerm.trim()) return true
      const term = searchTerm.toLowerCase()
      return (
        d.customer_name?.toLowerCase().includes(term) ||
        d.product_name?.toLowerCase().includes(term) ||

        String(d.deposit_id)?.includes(term)
      )
    })

    // ใช้ [...filtered] เพื่อสร้างอาเรย์ใหม่ แล้วเรียงจากวันที่ล่าสุดไปเก่าสุด (Newest -> Oldest)
    return [...filtered].sort((a, b) => {
      const dateA = a.deposit_date ? new Date(a.deposit_date).getTime() : 0
      const dateB = b.deposit_date ? new Date(b.deposit_date).getTime() : 0
      return dateB - dateA // เอาวันที่ใหม่กว่าขึ้นข้างบน
    })
  }, [deposits, searchTerm, filterStatus])

  const handleOpenEdit = (deposit) => {
    setSelectedDeposit(deposit)
    setIsEditing(true)
  }

  const handleSaveEdit = async (depositId, returnVal) => {
    await updateDeposit(depositId, returnVal)
  }

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">จัดการถังฝาก (Cylinder Deposit)</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full">
              {deposits.length} รายการ
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">ติดตามยอดถังออก ยอดถังคืน และสถานะการหมุนเวียนถัง</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-neutral-100 rounded-lg text-[#1A1A1A]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">รายการทั้งหมด</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{stats.total} <span className="text-xs font-normal text-neutral-500">รายการ</span></p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">คืนครบแล้ว</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed} <span className="text-xs font-normal text-neutral-500">รายการ</span></p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">ค้างคืน / ยังไม่ครบ</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending} <span className="text-xs font-normal text-neutral-500">รายการ</span></p>
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
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อลูกค้า, ชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5b5b5b] text-[#1A1A1A]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterStatus === 'all'
                    ? 'btn-primary shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                ทั้งหมด ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterStatus === 'completed'
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                คืนครบแล้ว ({stats.completed})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  filterStatus === 'pending'
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                ค้างคืน / ยังไม่ครบ ({stats.pending})
              </button>
            </div>
          </div>

          <div className="text-xs text-neutral-500 shrink-0">
            แสดงผล <span className="font-semibold text-[#1A1A1A]">{filteredDeposits.length}</span> จากทั้งหมด{' '}
            <span className="font-semibold text-[#1A1A1A]">{deposits.length}</span> รายการ
          </div>
        </div>

        {loading && deposits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
            <p className="text-sm">กำลังโหลดข้อมูลถังฝาก...</p>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm">
              {searchTerm || filterStatus !== 'all' ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' : 'ไม่พบข้อมูลถังฝากในระบบ'}
            </p>
          </div>
        ) : (
          <div className="max-h-[55vh] overflow-y-scroll custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8FB] border-b border-neutral-200 text-xs font-semibold text-[#545454] uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">ชื่อลูกค้า / ร้านค้า</th>
                  <th className="py-3.5 px-4">สินค้า</th>
                  <th className="py-3.5 px-4 text-center">ยอดออก (Qty Out)</th>
                  <th className="py-3.5 px-4 text-center">ยอดคืน (Qty Return)</th>
                  <th className="py-3.5 px-4">วันที่ฝาก</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm text-[#1A1A1A]">
                {filteredDeposits.map((item, index) => (
                  <tr key={item.deposit_id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-neutral-500">{index + 1}</td>
                    <td className="py-3.5 px-4 font-medium text-neutral-800">{item.customer_name}</td>
                    <td className="py-3.5 px-4 text-neutral-600">{item.product_name}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-orange-600">{item.qty_out}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-green-600">{item.qty_return}</td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {item.deposit_date 
                        ? new Date(item.deposit_date).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="แก้ไขยอดคืน"
                        >
                          <Pencil className="w-4 h-4" />
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

      {/* เรียกใช้งานคอมโพเนนต์ Slide-over ที่แยกออกมา */}
      <CylinderdepositSlideOver
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSaveEdit}
        deposit={selectedDeposit}
      />
    </div>
  )
}