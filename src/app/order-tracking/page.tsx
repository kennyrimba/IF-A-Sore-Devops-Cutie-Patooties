'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import { useRouter } from 'next/navigation';

// Define interfaces for type safety
interface OrderDetails {
    order_id: number;
    order_status: string;
    order_date: string;
    product_id: number;
    street_address: string;
    city: string;
    state: string;
    country: string;
    phone_number: string;
}

interface Order {
    order_id: number;
    product_id: number;
    order_date: string;
    order_status: string;
}

const OrderTracking = () => {
    const router = useRouter();
    const [orderId, setOrderId] = useState<string>('');
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [showTrackingResult, setShowTrackingResult] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            setIsLoggedIn(true);
            fetchOrders(userId);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleTrackOrder = async (e: React.FormEvent<HTMLFormElement> | { preventDefault: () => void }) => {
        e.preventDefault();
        
        const userId = localStorage.getItem('user_id');
        
        try {
            const response = await fetch('/api/track-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId, userId }),
            });
        
            const data = await response.json();
            if (response.ok) {
                setOrderDetails(data);
                setShowTrackingResult(true);
            } else {
                setOrderDetails(null);
                setShowTrackingResult(true);
                alert(data.error || 'An error occurred while tracking the order.');
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            alert('An error occurred while tracking the order.');
        }
    };

    const fetchOrders = async (userId: string) => {
        try {
            const response = await fetch(`/api/get-orders?user_id=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        
            if (response.ok) {
                const data = await response.json();
                setUserOrders(data);
            } else {
                setUserOrders([]);
                console.warn("No orders found for this user.");
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUserOrders([]);
        setShowTrackingResult(false);
        router.push('/login');
    };

    // The JSX remains the same, just updating the onChange handler type
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Order Tracking' subHeading='Order Tracking' />
            </div>
            {/* Rest of your JSX code remains the same, just updating the input onChange handler */}
            <div className="order-tracking md:py-20 py-10">
                {/* ... existing JSX ... */}
                <input 
                    className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                    id="orderId" 
                    type="text" 
                    placeholder="Order ID *" 
                    value={orderId} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderId(e.target.value)} 
                    required 
                />
                {/* ... rest of your existing JSX ... */}
            </div>
            <Footer />
        </>
    );
};

export default OrderTracking;