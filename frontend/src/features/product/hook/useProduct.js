import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";

export const useProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);

    // 1. ดึงข้อมูลสินค้า
    const fetchingData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/product');

            if (response.status === 200) {
                const formattedProducts = (response.data.data || []).map((item) => ({
                    ...item,
                    cost_price: Number(item.cost_price) || 0,
                    current_price: Number(item.current_price) || 0,
                    stock_qty: Number(item.stock_qty) || 0,
                }));
                setData(formattedProducts);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchingData();
    }, [fetchingData]);

    // 2. เพิ่มสินค้าใหม่ (Create)
    const addProduct = async (productData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.post('/product', productData);
            await fetchingData(); // โหลดข้อมูลใหม่หลังเพิ่มสำเร็จ
            return response.data;
        } catch (err) {
            alert(err.response?.data?.message || err.message);
            throw err; // ส่ง error ออกไปเผื่อ component นำไปจัดการต่อ (เช่น แสดง Alert)
        } finally {
            setLoading(false);
        }
    };

    // 3. แก้ไขสินค้า (Update)
    const updateProduct = async (id, productData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.put(`/product/${id}`, productData);
            await fetchingData(); // โหลดข้อมูลใหม่หลังแก้ไขสำเร็จ
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 4. ลบสินค้า (Delete)
    const deleteProduct = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.delete(`/product/${id}`);
            await fetchingData(); // โหลดข้อมูลใหม่หลังลบสำเร็จ
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { 
        data, 
        loading, 
        error, 
        refetch: fetchingData, 
        addProduct, 
        updateProduct, 
        deleteProduct 
    };
};