import React, { useState, useEffect } from 'react'
import { X, Loader2, MapPin, ExternalLink } from 'lucide-react'

export default function CustomerSlideOver({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    delivery_note: '',
    latitude: '',
    longitude: '',
  })
  
  // State สำหรับช่องวางพิกัดด่วนจาก Google Maps
  const [mapInput, setMapInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        customer_name: initialData.customer_name || '',
        phone: initialData.phone ? String(initialData.phone).replace(/\D/g, "").slice(0, 10) : '',
        address: initialData.address || '',
        delivery_note: initialData.delivery_note || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
      })
      setMapInput(initialData.latitude && initialData.longitude ? `${initialData.latitude}, ${initialData.longitude}` : '')
    } else {
      setFormData({
        customer_name: '',
        phone: '',
        address: '',
        delivery_note: '',
        latitude: '',
        longitude: '',
      })
      setMapInput('')
    }
    setError(null)
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target

    // กรองเบอร์โทรศัพท์ให้รับเฉพาะตัวเลข และจำกัดความยาวไม่เกิน 10 หลัก (ไม่มีขีด)
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10)
      setFormData((prev) => ({ ...prev, phone: numericValue }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ฟังก์ชันช่วยจัดการเมื่อผู้ใช้นำพิกัดหรือลิงก์จาก Google Maps มาวาง
  const handleMapPasteInput = (e) => {
    const value = e.target.value
    setMapInput(value)

    // พยายามดึง Lat, Lng จากข้อความที่ผู้ใช้วาง (รองรับทั้งแบบพิกัดตรงๆ เช่น 13.7563, 100.5017 หรือลิงก์ Google Maps)
    const coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/
    const match = value.match(coordRegex)

    if (match) {
      setFormData((prev) => ({
        ...prev,
        latitude: match[1],
        longitude: match[2],
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // ตรวจสอบความถูกต้องของเบอร์โทรศัพท์ (ต้องเป็นตัวเลข 10 หลักเป๊ะๆ ไม่มีขีด)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.phone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง เป็นตัวเลข 10 หลัก (ไม่มีขีด)")
      return
    }

    setLoading(true)

    try {
      // ส่งข้อมูลก้อนเดิมออกไปหลังบ้านตามปกติ (ไม่ต้องแก้หลังบ้าน)
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 h-screen transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {initialData ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1  flex flex-col justify-between min-h-0">
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                ชื่อลูกค้า / ร้านค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                required
                placeholder="เช่น เจ๊เพ็ญ ก๋วยเตี๋ยวเรือ"
                value={formData.customer_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                inputMode="numeric"
                placeholder="เช่น 0891112222"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                ที่อยู่จัดส่ง
              </label>
              <textarea
                name="address"
                rows={3}
                placeholder="ระบุบ้านเลขที่ ถนน ซอย หรือจุดสังเกต"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] resize-none"
              />
            </div>

            {/* ส่วนเลือกพิกัดจาก Google Maps แบบง่าย */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> เลือกพิกัดจาก Google Maps
                </span>
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2.5 py-1 rounded-md shadow-sm transition-colors"
                >
                  <span>เปิด Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  วางพิกัด หรือ ลิงก์ Google Maps ที่นี่ (ระบบจะแยกให้อัตโนมัติ)
                </label>
                <input
                  type="text"
                  placeholder="เช่น 13.7563, 100.5017 หรือวางลิงก์ Maps"
                  value={mapInput}
                  onChange={handleMapPasteInput}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="13.7563..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="100.5017..."
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                หมายเหตุการจัดส่ง
              </label>
              <textarea
                name="delivery_note"
                rows={2}
                placeholder="เช่น ร้านอยู่ล็อกกลาง ติดร้านน้ำแข็ง"
                value={formData.delivery_note}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] resize-none"
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/2 px-4 py-2 justify-center text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1A1A1A] hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}