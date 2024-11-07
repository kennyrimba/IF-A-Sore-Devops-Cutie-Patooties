'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import * as Icon from "@phosphor-icons/react/dist/ssr";

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [orderStatus, setOrderStatus] = useState('');

    const handleTrackOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // Make an API call to fetch order status
        const response = await fetch('/api/track-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
        });
    
        const data = await response.json();
        if (response.ok) {
            setOrderStatus(data.order_status); // Assuming your backend returns an object with order_status
        } else {
            setOrderStatus('Order not found. Please check your Order ID.'); // Handle error
        }
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
                        <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
                            <div className="heading4">Order Tracking</div>
                            <div className="mt-2">To track your order please enter your Order ID in the box below and press the "Track" button.</div>
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
                            {orderStatus && (
                                <div className="mt-4">
                                    <div className="heading4">Order Status:</div>
                                    <div>{orderStatus}</div>
                                </div>
                            )}
                        </div>
                        <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
                            <div className="text-content">
                                <div className="heading4">Already have an account?</div>
                                <div className="mt-2 text-secondary">Welcome back. Sign in to access your personalized experience, saved preferences, and more. We{String.raw`'re`} thrilled to have you with us again!</div>
                                <div className="block-button md:mt-7 mt-4">
                                    <Link href={'/login'} className="button-main">Login</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default OrderTracking;
