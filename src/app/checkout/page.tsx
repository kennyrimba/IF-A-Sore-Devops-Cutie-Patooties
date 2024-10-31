'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import { ProductType } from '@/type/ProductType'
import productData from '@/data/Product.json'
import Product from '@/components/Product/Product'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from '@/context/CartContext'
import { useSearchParams, useRouter } from 'next/navigation';


const Checkout = () => {
    const searchParams = useSearchParams()
    const discount = Number(searchParams.get('discount')) || 0;
    const shippingFee = Number(searchParams.get('ship')) || 0;
    const router = useRouter(); // Initialize useRouter

    const { cartState } = useCart();
    let [totalCart, setTotalCart] = useState<number>(0);
    const [activePayment, setActivePayment] = useState<string>('credit-card');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        country: '',
        city: '',
        streetAddress: '',
        state: '',
        postalCode: '',
        note: '',
    });
    const [message, setMessage] = useState('');
    // Calculate total cart amount
    cartState.cartArray.forEach(item => totalCart += item.price * item.quantity);

    const handlePayment = (item: string) => {
        setActivePayment(item);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { firstName, lastName, email, phoneNumber, country, city, streetAddress, state, postalCode, note } = formData;

        const checkoutData = {
            cartItems: cartState.cartArray,
            shippingInfo: {
                first_name: firstName,
                last_name: lastName,
                email,
                phone_number: phoneNumber,
                country,
                city,
                street_address: streetAddress,
                state,
                postal_code: postalCode,
                note,
            },
            paymentInfo: {
                method: activePayment,
            },
            discount,
            shippingFee,
            userId: 1, // Replace with actual user ID from context or state
        };

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Checkout successful! Redirecting to the home page...');
                // Redirect to root after 3 seconds
                setTimeout(() => {
                    router.push('/'); // Redirect to home
                }, 3000);
            } else {
                setMessage(data.error || 'Something went wrong during checkout.');
            }
        } catch (error) {
            setMessage('Error connecting to the server. Please try again later.');
        }
    };

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Shopping cart' subHeading='Shopping cart' />
            </div>
            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex justify-between">
                        <div className="left w-1/2">
                            <div className="form-login-block mt-3">
                                <form className="p-5 border border-line rounded-lg" onSubmit={handleSubmit}>
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="email ">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="firstName" type="text" placeholder="First Name *" required onChange={handleChange} />
                                        </div>
                                        <div className="pass ">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="lastName" type="text" placeholder="Last Name *" required onChange={handleChange} />
                                        </div>
                                        <div className="">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="email" type="email" placeholder="Email Address *" required onChange={handleChange} />
                                        </div>
                                        <div className="">
                                            <input className="border-line px-4 pt-3 pb-3 w-full rounded-lg" id="phoneNumber" type="number" placeholder="Phone Numbers *" required onChange={handleChange} />
                                        </div>
                                        <div className="col-span-full select-block">
                                            <select className="border border-line px-4 py-3 w-full rounded-lg" id="country" name="country" defaultValue={'default'} onChange={handleChange}>
                                                <option value="default" disabled>Choose Country/Region</option>
                                                <option value="India">United States</option>
                                                <option value="India">Indonesia</option>
                                                <option value="France">France</option>
                                                <option value="Singapore">Singapore</option>
                                            </select>
                                            <Icon.CaretDown className='arrow-down' />
                                        </div>
                                        <div className="">
                                            <input className="border-line px-4 py-3 w-full rounded-lg" id="city" type="text" placeholder="Town/City *" required onChange={handleChange} />
                                        </div>
                                        <div className="">
                                            <input className="border-line px-4 py-3 w-full rounded-lg" id="streetAddress" type="text" placeholder="Street,..." required onChange={handleChange} />
                                        </div>
                                        <div className="">
                                            <input className="border-line px-4 py-3 w-full rounded-lg" id="state" type="text" placeholder="State *" required onChange={handleChange} />
                                        </div>
                                        <div className="">
                                            <input className="border-line px-4 py-3 w-full rounded-lg" id="postalCode" type="text" placeholder="Postal Code *" required onChange={handleChange} />
                                        </div>
                                        <div className="col-span-full">
                                            <textarea className="border border-line px-4 py-3 w-full rounded-lg" id="note" name="note" placeholder="Write note..." onChange={handleChange}></textarea>
                                        </div>
                                    </div>
                                    <div className="payment-block md:mt-10 mt-6">
                                        <div className="heading5">Choose payment Option:</div>
                                        <div className="list-payment mt-5">
                                            <div className={`type bg-surface p-5 border border-line rounded-lg ${activePayment === 'credit-card' ? 'open' : ''}`}>
                                                <input className="cursor-pointer" type="radio" id="credit" name="payment" checked={activePayment === 'credit-card'} onChange={() => handlePayment('credit-card')} />
                                                <label className="text-button pl-2 cursor-pointer" htmlFor="credit">Credit Card</label>
                                                <div className="infor">
                                                    <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                    <div className="row">
                                                        <div className="col-12 mt-3">
                                                            <label htmlFor="cardNumberCredit">Card Numbers</label>
                                                            <input className="cursor-pointer border-line px-4 py-3 w-full rounded mt-2" type="text" id="cardNumberCredit" placeholder="ex.1234567290" required />
                                                        </div>
                                                        <div className=" mt-3">
                                                            <label htmlFor="dateCredit">Date</label>
                                                            <input className="border-line px-4 py-3 w-full rounded mt-2" type="text" id="dateCredit" required />
                                                        </div>
                                                        <div className="col-12 mt-3">
                                                            <label htmlFor="cvvCredit">CVV</label>
                                                            <input className="border-line px-4 py-3 w-full rounded mt-2" type="text" id="cvvCredit" placeholder="ex. 123" required />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`type bg-surface p-5 border border-line rounded-lg ${activePayment === 'bank-transfer' ? 'open' : ''}`}>
                                                <input className="cursor-pointer" type="radio" id="bankTransfer" name="payment" checked={activePayment === 'bank-transfer'} onChange={() => handlePayment('bank-transfer')} />
                                                <label className="text-button pl-2 cursor-pointer" htmlFor="bankTransfer">Bank Transfer</label>
                                                <div className="infor">
                                                    <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                </div>
                                            </div>
                                            <div className={`type bg-surface p-5 border border-line rounded-lg ${activePayment === 'paypal' ? 'open' : ''}`}>
                                                <input className="cursor-pointer" type="radio" id="paypal" name="payment" checked={activePayment === 'paypal'} onChange={() => handlePayment('paypal')} />
                                                <label className="text-button pl-2 cursor-pointer" htmlFor="paypal">Paypal</label>
                                                <div className="infor">
                                                    <div className="text-on-surface-variant1 pt-4">Make your payment directly into our bank account. Your order will not be shipped until the funds have cleared in our account.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-button md:mt-7 mt-4">
                                        <button 
                                            className="button-main px-6 py-3 bg-blue-600 text-black bg-purple rounded-lg hover:bg-blue-700"
                                            type="submit"
                                        >
                                            Finalise Checkout
                                        </button>
                                    </div>
                                    {message && <p className="text-red-600 mt-4">{message}</p>}
                                </form>
                            </div>
                        </div>
                        <div className="right w-1/2">
                            <h2 className="heading2 mb-5">Your cart</h2>
                            <div className="table-cart border border-line rounded-lg">
                                {cartState.cartArray.map((item: ProductType) => (
                                    <Product key={item.id} data={item} {...item} />
                                ))}
                                <div className="bottom-cart border-t border-line flex justify-between">
                                    <span className="font-bold">Subtotal:</span>
                                    <span className="text-primary">{totalCart} $</span>
                                </div>
                                <div className="bottom-cart border-t border-line flex justify-between">
                                    <span className="font-bold">Discount:</span>
                                    <span className="text-primary">- {discount} $</span>
                                </div>
                                <div className="bottom-cart border-t border-line flex justify-between">
                                    <span className="font-bold">Shipping Fee:</span>
                                    <span className="text-primary">{shippingFee} $</span>
                                </div>
                                <div className="bottom-cart border-t border-line flex justify-between font-bold">
                                    <span className="font-bold">Total:</span>
                                    <span className="text-primary">{totalCart - discount + shippingFee} $</span>
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

export default Checkout;
