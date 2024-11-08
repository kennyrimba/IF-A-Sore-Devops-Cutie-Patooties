'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import { useRouter } from 'next/navigation';

const OrderTracking = () => {
    const router = useRouter();
    const [orderId, setOrderId] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [showTrackingResult, setShowTrackingResult] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in on component mount
    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            setIsLoggedIn(true);
            fetchOrders(userId); // Fetch orders if the user is logged in
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleTrackOrder = async (e) => {
        e.preventDefault();
      
        const userId = localStorage.getItem('user_id');
        
        const response = await fetch('/api/track-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId, userId }), // Pass user_id along with orderId
        });
      
        const data = await response.json();
        if (response.ok) {
          setOrderDetails(data); // Show order details if the user is authorized
          setShowTrackingResult(true);
        } else {
          setOrderDetails(null);
          setShowTrackingResult(true);
          alert(data.error || 'An error occurred while tracking the order.');
        }
      };      

    const fetchOrders = async (userId) => {
        try {
          const response = await fetch(`/api/get-orders?user_id=${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
      
          if (response.ok) {
            const data = await response.json();
            setUserOrders(data); // Display only the logged-in user's orders
          } else {
            setUserOrders([]);
            console.warn("No orders found for this user.");
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      };
      

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUserOrders([]);
        setShowTrackingResult(false); // Reset to show welcome message
        router.push('/login'); // Redirect to login page after logout
    };

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Order Tracking' subHeading='Order Tracking' />
            </div>
            <div className="order-tracking md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col">
                        {/* Left Section: Order List */}
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Order Tracking</div>
                            {isLoggedIn ? (
                                userOrders.length > 0 ? (
                                    <div className="mt-4">
                                        <div className="heading4">Your Orders:</div>
                                        <ul className="order-list mt-2 grid grid-cols-1 gap-4">
                                            {userOrders.map(order => (
                                                <li key={order.order_id} className="border p-4 rounded-lg shadow-sm bg-gray-100">
                                                    <p><strong>Order ID:</strong> {order.order_id}</p>
                                                    {/* <p><strong>Status:</strong> {order.order_status}</p> */}
                                                    <p><strong>Product ID:</strong> {order.product_id}</p>
                                                    <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                                                    <button
                                                        className="button-main mt-2"
                                                        onClick={() => {
                                                            setOrderId(order.order_id);
                                                            handleTrackOrder({ preventDefault: () => {} });
                                                        }}
                                                    >
                                                        Track Order
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="mt-4">You have no orders yet.</p>
                                )
                            ) : (
                                <div>
                                    <p>Please log in to view your orders.</p>
                                    <div className="block-button md:mt-7 mt-4">
                                        <Link href={'/login'} className="button-main">Login</Link>
                                    </div>
                                </div>
                            )}


                            {isLoggedIn && !userOrders.length && (
                                <form className="md:mt-7 mt-4" onSubmit={handleTrackOrder}>
                                    <div className="order-id">
                                        <input 
                                            className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                                            id="orderId" 
                                            type="text" 
                                            placeholder="Order ID *" 
                                            value={orderId} 
                                            onChange={(e) => setOrderId(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="block-button md:mt-7 mt-4">
                                        <button 
                                            className="button-main px-6 py-3 bg-blue-600 text-black bg-purple rounded-lg hover:bg-blue-700"
                                            type="submit"
                                        >
                                            Track Order
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Right Section: Order Details */}
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px]">
                            <div className="text-content">
                                {showTrackingResult && orderDetails ? (
                                    <div className="p-6 bg-white shadow rounded-lg">
                                        <div className="heading4">Order Details:</div>
                                        <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
                                        <p><strong>Status:</strong> {orderDetails.order_status}</p>
                                        <p><strong>Order Date:</strong> {new Date(orderDetails.order_date).toLocaleDateString()}</p>
                                        <p><strong>Product ID:</strong> {orderDetails.product_id}</p>
                                        <p><strong>Shipping Address:</strong> {orderDetails.street_address}, {orderDetails.city}, {orderDetails.state}, {orderDetails.country}</p>
                                        <p><strong>Contact:</strong> {orderDetails.phone_number}</p>
                                    </div>
                                ) : showTrackingResult ? (
                                    <div>
                                        <div className="heading4">Order Status:</div>
                                        <p>{orderDetails ? 'Order details not found. Please check your Order ID.' : 'Order not found.'}</p>
                                    </div>
                                ) : (
                                    <>
                                        {isLoggedIn ? (
                                            <>
                                                <div className="heading4">Welcome, {localStorage.getItem('username')}!</div>
                                                <div className="block-button md:mt-7 mt-4">
                                                    <button onClick={handleLogout} className="button-main">Logout</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="heading4">New Customer?</div>
                                                <div className="mt-2 text-secondary">
                                                    Join us today for exclusive benefits and personalized experiences.
                                                </div>
                                                <div className="block-button md:mt-7 mt-4">
                                                    <Link href={'/register'} className="button-main">Register</Link>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderTracking;
