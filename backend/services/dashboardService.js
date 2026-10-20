const dashboardModel = require('../models/dashboardModel');
const ApiError = require('../utils/ApiError');

// Helper wrapper แปลง callback ของ mysql2 ให้รองรับ Promise
const queryAsync = (modelFn) => {
    return new Promise((resolve, reject) => {
        modelFn((err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const queryAsyncWithParams = (modelFn, year, month) => {
    return new Promise((resolve, reject) => {
        modelFn(year, month, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const findAlldashboard = async () => {
    try {
        // ดึงข้อมูลทั้ง 6 Query พร้อมกันแบบ Parallel
        const [ revenueResult, ordersResult, statusResult, chartResult, countResult, itemResult] = await Promise.all([

            queryAsync(dashboardModel.findTotal_revenue),
            queryAsync(dashboardModel.findTotal_orders),
            queryAsync(dashboardModel.findOrder_status),
            queryAsync(dashboardModel.yearly_revenue_chart),
            queryAsync(dashboardModel.findTotal_count),
            queryAsync(dashboardModel.findItem)
        ]);

        // 1. Extract total_revenue
        const totalRevenue = revenueResult?.[0]?.today_total_amount 
            ? parseFloat(revenueResult[0].today_total_amount) 
            : 0;
        
        const totalProfit = revenueResult?.[0].today_total_profit
            ? parseFloat(revenueResult[0].today_total_profit)
            : 0;

        // 2. Extract total_orders
        const totalOrders = ordersResult?.[0]?.count_order 
            ? Number(ordersResult[0].count_order) 
            : 0;

        // 3. Extract order_status (ถ้า MySQL คืนค่า JSON_OBJECT เป็น String ให้ parse ก่อน)
        let orderStatus = { pending: 0, delivering: 0, delivered: 0 };
        if (statusResult?.[0]?.order_status) {
            const rawStatus = statusResult[0].order_status;
            orderStatus = typeof rawStatus === 'string' ? JSON.parse(rawStatus) : rawStatus;
        }

        // 4. Map yearly_revenue_chart ให้อยู่ในฟอร์แมต { month, revenue, profit }
        const yearlyRevenueChart = chartResult.map(row => ({
            month: row.sale_month,
            revenue: parseFloat(row.total_revenue || 0),
            profit: parseFloat(row.total_profit || 0)
        }));

        // 5. Extract low_stock_items & total_count
        const totalCount = countResult?.[0]?.total_count 
            ? Number(countResult[0].total_count) 
            : itemResult.length;

        const lowStockItems = itemResult.map(item => ({
            item_id: String(item.product_id),
            name: item.product_name,
            quantity: Number(item.stock_qty),
            unit: item.category === 'gas' ? 'ถัง' : 'เส้น'
        }));

        // วันที่ปัจจุบันรูปแบบ YYYY-MM-DD
        const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' });

        // ประกอบร่างข้อมูลส่งกลับ Controller ตามโครงสร้าง JSON ที่ต้องการ
        return {
            data: {
                today_summary: {
                    date: todayStr,
                    total_revenue: totalRevenue,
                    total_profit: totalProfit,
                    total_orders: totalOrders,
                    order_status: {
                        pending: Number(orderStatus.pending || 0),
                        delivering: Number(orderStatus.delivering || 0),
                        delivered: Number(orderStatus.delivered || 0)
                    }
                },
                yearly_revenue_chart: yearlyRevenueChart,
                low_stock_items: {
                    total_count: totalCount,
                    items: lowStockItems
                }
            }
        };

    } catch (err) {
        throw new ApiError(500, err.message || 'Error fetching dashboard data');
    }
};

const findDashboard2 = async (year, month) => {
    try {
        const [ summaryResult, weeklyResult, bestResult, worstResult, historyResult ] = await Promise.all([

            queryAsyncWithParams(dashboardModel.findmonthly_summary, year, month),
            queryAsyncWithParams(dashboardModel.findWeeklyBreakdown, year, month),
            queryAsyncWithParams(dashboardModel.findBestSellers, year, month),
            queryAsyncWithParams(dashboardModel.findWorstSellers, year, month),
            queryAsyncWithParams(dashboardModel.findDeliveredHistory, year, month)
        ]);

        const summary = summaryResult?.[0] || {};
        const monthlySummary = {
            total_revenue: parseFloat(summary.total_revenue || 0),
            total_profit: parseFloat(summary.total_profit || 0),
            total_delivered_orders: Number(summary.total_delivered_orders || 0)
        };

        const weeklyBreakdown = weeklyResult.map(row => ({
            week: row.week,
            start_date: row.start_date ? String(row.start_date).slice(0, 10) : null, 
            end_date: row.end_date ? String(row.end_date).slice(0, 10) : null,  
            revenue: parseFloat(row.revenue || 0),
            profit: parseFloat(row.profit || 0)
        }));

        const bestSellers = bestResult.map(row => ({
            item_id: row.item_id ? String(row.item_id) : "",
            name: row.name,
            quantity_sold: Number(row.quantity_sold || 0),
            revenue: parseFloat(row.revenue || 0)
        }));

        const worstSellers = worstResult.map(row => ({
            item_id: row.item_id ? String(row.item_id) : "",
            name: row.name,
            quantity_sold: Number(row.quantity_sold || 0),
            revenue: parseFloat(row.revenue || 0)
        }));

        const deliveredHistory = historyResult.map(row => ({
            order_id: row.order_id,
            delivered_at: row.delivered_at,
            customer_name: row.customer_name,
            items_count: Number(row.items_count || 0),
            total_amount: parseFloat(row.total_amount || 0)
        }));

        const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;

        return {
            data: {
                month: formattedMonth,
                monthly_summary: monthlySummary,
                weekly_breakdown: weeklyBreakdown,
                product_performance: {
                    best_sellers: bestSellers,
                    worst_sellers: worstSellers
                },
                delivered_history: deliveredHistory
            }
        };

    } catch (err) {
        throw new ApiError(500, err.message || 'Error fetching dashboard 2 data');
    }
};

module.exports = {
    findAlldashboard,
    findDashboard2
};