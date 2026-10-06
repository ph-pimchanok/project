import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import MainLayout from '../layouts/MainLayout'
import Login from '../features/login/page/Login'
import Dashboard from '../features/dashboard/page/Dashboard'
import Customer from '../features/customers/page/Customer'
import Employees from '../features/employee/page/Employees'
import Vehicles from '../features/vehicle/page/Vehicle'
import VehicleBrand from '../features/vehiclebrand/page/VehicleBrand'
import Product from '../features/product/page/Product'
import Security from '../features/security/page/Security'
import Order from '../features/order/page/Order'
import Delivery from '../features/delivery/page/Delivery'
import Cylinderdeposit from '../features/cylinderdeposit/page/Cylinderdeposit'
import History from '../features/history/page/History'
import FillingOrder from '../features/fillingOrder/page/fillingOrder'
import Maintenance from '../features/maintenance/page/Maintenance'
import Location from '../features/location/page/Location'

const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/" }) => {
    const { token, role } = useAuth()
    const userRole = Number(role)

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to={redirectTo} replace />
    }

    return children
}

const PublicRoute = ({ children }) => {
    const { token } = useAuth()
    return token ? <Navigate to="/" replace /> : children
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <PublicRoute>
                <Login />
            </PublicRoute>
        )
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute allowedRoles={[1]} redirectTo="/order">
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: '/customer',
                element: <Customer />
            },
            {
                path: '/employee',
                element: (
                    <ProtectedRoute allowedRoles={[1]} redirectTo="/order">
                        <Employees />
                    </ProtectedRoute>
                )
            },
            {
                path: '/vehicles',
                element: <Vehicles />
            },
            {
                path: '/vehiclebrand',
                element: <VehicleBrand />
            },
            {
                path: '/product',
                element: <Product />
            },
            {
                path: '/security',
                element: (
                    <ProtectedRoute allowedRoles={[1]} redirectTo="/order">
                        <Security />
                    </ProtectedRoute>
                )
            },
            {
                path: '/order',
                element: <Order />
            },
            {
                path: '/delivery',
                element: <Delivery />
            },
            {
                path: '/cylinderdeposit',
                element: (
                    <ProtectedRoute allowedRoles={[1]} redirectTo="/order">
                        <Cylinderdeposit />
                    </ProtectedRoute>
                )
            },
            {
                path: '/history',
                element: <History />
            },
            {
                path: '/FillingOrder',
                element: (
                    <ProtectedRoute allowedRoles={[1]} redirectTo="/order">
                        <FillingOrder />
                    </ProtectedRoute>
                )
            },
            {
                path: '/Maintenance',
                element: (
                    <ProtectedRoute allowedRoles={[1]} redirectTo="/order">
                        <Maintenance />
                    </ProtectedRoute>
                )
            },
            {
                path: '/Location',
                element: <Location />
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" replace />
    }
])

export default function AppRouter() {
    return <RouterProvider router={router} />
}