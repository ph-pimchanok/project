import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";

export function useLocation() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ดึงข้อมูลตำแหน่งร้านค้า
    const fetchLocation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/location");
            setData(response.data.data || response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // อัปเดตตำแหน่งร้านค้า (แมตช์กับ Controller updateStorelocation)
    const updateLocation = useCallback(async (latitude, longitude) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.put("/location", { latitude, longitude });

            // ดึงข้อมูลใหม่หลังจากอัปเดตสำเร็จ
            await fetchLocation();
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [fetchLocation]);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return {
        data,
        loading,
        error,
        refetch: fetchLocation,
        updateLocation,
    };
}