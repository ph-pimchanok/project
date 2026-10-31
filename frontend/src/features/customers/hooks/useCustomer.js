import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";

// state จัดการข้อมูล
export const useCustomer = () => {
  const [loading, setLoading] = useState(false); //เก็บสถานะว่ากำลังดึงข้อมูลอยู่หรือไม่ ค่าเริ่มต้นเป็น false หากกำลังโหลดจะเปลี่ยนเป็น true
  const [error, setError] = useState(null); //เก็บข้อความ Error หากดึงข้อมูลไม่สำเร็จ ค่าเริ่มต้นเป็น null ซึ่งหมายถึงยังไม่มี Error ที่บันทึกไว้
  const [data, setData] = useState([]); //เก็บข้อมูลลูกค้าที่ได้จาก Backend โดยเริ่มจาก Array ว่าง [] เหมาะสำหรับนำไปแสดงในตารางลูกค้า

  //ดึงข้อมูลจาก API และใช้ดึงข้อมูลลูกค้าทั้งหมด
  const fetchingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      //เรียก API ด้วย HTTP Method GET เพื่อขอข้อมูลลูกค้า
      const res = await axiosInstance.get("/customer");
      if (res.status === 200) {
        setData(res.data.data);
      }
    } catch (err) { //จัดการเมื่อเกิดerror
      setError(err.response?.data?.message || err.message);
      console.log("Error : ", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

//เพิ่มลูกค้า รับข้อมูลจากฟอร์มในตัวแปร formData
  const addCustomer = async (formData) => {
    try {
      //ส่ง Request แบบ POST ไปที่ /customer
      const res = await axiosInstance.post("/customer", formData);
      //เพิ่มข้อมูลสำเร็จ เรียก fetchingData() เพื่อดึงรายชื่อลูกค้าล่าสุด
      await fetchingData();
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // 3. PUT: แก้ไขข้อมูลลูกค้า
  const updateCustomer = async (id, formData) => {
    try {
      const res = await axiosInstance.put(`/customer/${id}`, formData);
      await fetchingData(); // อัปเดตข้อมูลตารางใหม่อัตโนมัติ
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // 4. DELETE: ลบข้อมูลลูกค้า
  const deleteCustomer = async (id) => {
    try {
      const res = await axiosInstance.delete(`/customer/${id}`);
      await fetchingData(); // อัปเดตข้อมูลตารางใหม่อัตโนมัติ
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return {
    data,
    loading,
    error,
    refetch: fetchingData,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};