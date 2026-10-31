import { createContext, useState } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    // usestateเก็บสถานะที่เปลี่ยนแปลงได้ ex สถานะพนักงาน
    // localStorage.getItem('gas-token') อ่าน Token ที่เคยบันทึกไว้ใน Browser
    const [token, setToken] = useState(() => localStorage.getItem('gas-token'))
    // เก็บบทบาทของผู้ใช้ เช่น เจ้าของร้านหรือพนักงานรับออเดอร์ ตามรหัส Roleจะได้เข้า
    const [role, setRole] = useState(() => {
        const savedRole = localStorage.getItem('gas-role_ID')
        return savedRole ? JSON.parse(savedRole) : null
    })
    
    //อ่านชื่อพนักงาน 
    const [employeeName, setEmployeeName] = useState(() => {
        const savedName = localStorage.getItem('gas-employee_name')
        // เช็คว่ามีค่า และไม่ใช่ string ว่าง หรือคำว่า "null" / "undefined"
        return savedName && savedName !== 'null' && savedName !== 'undefined' ? savedName : null
    })

    // เข้าสู่ระบบสำเร็จบันทึกข้อมูลผู้ใช้
    const login = (newToken, role_ID, employee_name = null) => {
        // ตรวจสอบค่าที่จะนำไปบันทึก
        const nameToSave = employee_name || ''

        localStorage.setItem('gas-token', newToken)
        localStorage.setItem('gas-role_ID', JSON.stringify(role_ID))
        localStorage.setItem('gas-employee_name', nameToSave)

        setToken(newToken)
        setRole(role_ID)
        setEmployeeName(nameToSave)
    }

    //ออกจากระบบแล้วลบทุกค่าตั้งnull 
    const logout = () => {
        localStorage.removeItem('gas-token')
        localStorage.removeItem('gas-role_ID')
        localStorage.removeItem('gas-employee_name')

        setToken(null)
        setRole(null)
        setEmployeeName(null)
    }

    return (
        <AuthContext.Provider value={{ token, role, employeeName, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}