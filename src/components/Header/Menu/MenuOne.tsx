'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname } from 'next/navigation';
import Product from '@/components/Product/Product';
import productData from '@/data/Product.json'
import useLoginPopup from '@/store/useLoginPopup';
import useMenuMobile from '@/store/useMenuMobile';
import { useModalCartContext } from '@/context/ModalCartContext';
import { useModalWishlistContext } from '@/context/ModalWishlistContext';
import { useModalSearchContext } from '@/context/ModalSearchContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface Props {
    props: string;
}

const MenuOne: React.FC<Props> = ({ props }) => {
    const router = useRouter()
    const pathname = usePathname()
    const [isLoggedIn, setIsLoggedIn] = useState(false); // cek apakah user login
    let [selectedType, setSelectedType] = useState<string | null>()
    const { openLoginPopup, handleLoginPopup } = useLoginPopup()
    //const { openMenuMobile, handleMenuMobile } = useMenuMobile()
    //const [openSubNavMobile, setOpenSubNavMobile] = useState<number | null>(null)
    const { openModalCart } = useModalCartContext()
    const { cartState } = useCart()
    const { openModalWishlist } = useModalWishlistContext()
    const { openModalSearch } = useModalSearchContext()

    // const handleOpenSubNavMobile = (index: number) => {
    //     setOpenSubNavMobile(openSubNavMobile === index ? null : index)
    // }

    const [fixedHeader, setFixedHeader] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setFixedHeader(scrollPosition > 0 && scrollPosition < lastScrollPosition);
            setLastScrollPosition(scrollPosition);
        };

        // Gắn sự kiện cuộn khi component được mount
        window.addEventListener('scroll', handleScroll);

        // Hủy sự kiện khi component bị unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollPosition]);

    // Mengecek status login dari localStorage
    useEffect(() => {
        const loggedInStatus = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedInStatus === 'true');
    }, []);

    // Fungsi untuk logout
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username'); // Jika ingin menghapus data username juga
        setIsLoggedIn(false);
        // Menampilkan alert setelah logout
        window.alert('You have successfully logged out!');
        router.push('/'); // Redirect ke halaman utama setelah logout
    };

    const handleGenderClick = (gender: string) => {
        router.push(`/shop/breadcrumb1?gender=${gender}`);
    };

    const handleCategoryClick = (category: string) => {
        router.push(`/shop/breadcrumb1?category=${category}`);
    };

    const handleTypeClick = (type: string) => {
        setSelectedType(type)
        router.push(`/shop/breadcrumb1?type=${type}`);
    };

    return (
        <>
            <div className={`header-menu style-one ${fixedHeader ? 'fixed' : 'absolute'} top-0 left-0 right-0 w-full md:h-[74px] h-[56px] ${props}`}>
                <div className="container mx-auto h-full">
                    <div className="header-main flex justify-between h-full">
                        <div className="menu-mobile-icon flex items-center">
                            <i className="icon-category text-2xl"></i>
                        </div>
                        <div className="left flex items-center gap-16">
                            <Link href={'/'} className='flex items-center'>
                                <div className="heading4">Anvogue</div>
                            </Link>
                            <div className="menu-main h-full ">
                                <ul className='flex items-center gap-8 h-full'>
                                    <li className='h-full relative'>
                                        <Link
                                            href="#!"
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center gap-1 ${pathname === '/' ? 'active' : ''}`}
                                        >
                                            Products
                                        </Link>
                                        <div className="sub-menu py-3 px-5 -left-10 w-max absolute grid grid-cols-4 gap-5 bg-white rounded-b-xl">
                                            <ul>
                                                <li>
                                                    <div
                                                        onClick={() => handleGenderClick('men')}
                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname.includes('gender=men') ? 'active' : ''}`}
                                                    >
                                                        Men Fashion
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        onClick={() => handleGenderClick('women')}
                                                        className={`link text-secondary duration-300 cursor-pointer ${pathname.includes('gender=women') ? 'active' : ''}`}
                                                    >
                                                        Women Fashion
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                    <li className='h-full'>
                                        <Link
                                            href={'/order-tracking'}
                                            className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes('/order-tracking') ? 'active' : ''}`}
                                        >
                                            Order Tracking
                                        </Link>
                                    </li>
                                    <li className='h-full relative'>
                                        <Link href="/pages/about" className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes('/about') ? 'active' : ''}`}>
                                            About Us
                                        </Link>
                                    </li>
                                    <li className='h-full relative'>
                                        <Link href="/pages/faqs" className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes('/faqs') ? 'active' : ''}`}>
                                            FAQs
                                        </Link>
                                    </li>
                                </ul>

                            </div>
                        </div>
                        <div className="right flex gap-12">
                            <div className="max-md:hidden search-icon flex items-center cursor-pointer relative">
                                <Icon.MagnifyingGlass size={24} color='black' onClick={openModalSearch} />
                                <div className="line absolute bg-line w-px h-6 -right-6"></div>
                            </div>
                            <div className="list-action flex items-center gap-4">
                                {isLoggedIn && (
                                    <Link href={'/add-item'}>
                                        <div className="max-md:hidden search-icon flex items-center cursor-pointer relative">
                                            <Icon.PlusCircle size={24} color='black'></Icon.PlusCircle>
                                        </div>
                                    </Link>
                                )}

                                {/* <div className="user-icon flex items-center justify-center cursor-pointer">
                                    <Icon.User size={24} color='black' onClick={handleLoginPopup} />
                                    <div
                                        className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm 
                                            ${openLoginPopup ? 'open' : ''}`}
                                    >
                                        <Link href={'/login'} className="button-main w-full text-center">Login</Link>
                                        <div className="text-secondary text-center mt-3 pb-4">Don’t have an account?
                                            <Link href={'/register'} className='text-black pl-1 hover:underline'>Register</Link>
                                        </div>
                                        <div className="bottom pt-4 border-t border-line"></div>
                                        <Link href={'#!'} className='body1 hover:underline'>Support</Link>
                                    </div>
                                </div> */}

                                {/* Icon User */}
                                <div className="user-icon flex items-center justify-center cursor-pointer">
                                    <Icon.User size={24} color='black' onClick={handleLoginPopup} />
                                    <div
                                        className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm 
                                            ${openLoginPopup ? 'open' : ''}`}
                                    >
                                        {isLoggedIn ? (
                                            // Jika sudah login, tampilkan tombol Logout dan Support
                                            <>
                                                <button className="button-main w-full text-center" onClick={handleLogout}>Logout</button>
                                                <div className="bottom pt-4 border-t border-line"></div>
                                                <Link href={'/support'} className='body1 hover:underline'>Support</Link>
                                            </>
                                        ) : (
                                            // Jika belum login, tampilkan Login dan Register
                                            <>
                                                <Link href={'/login'} className="button-main w-full text-center">Login</Link>
                                                <div className="text-secondary text-center mt-3 pb-4">Don’t have an account?
                                                    <Link href={'/register'} className='text-black pl-1 hover:underline'>Register</Link>
                                                </div>
                                                <div className="bottom pt-4 border-t border-line"></div>
                                                <Link href={'/support'} className='body1 hover:underline'>Support</Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isLoggedIn && (
                                    <>
                                        <div className="max-md:hidden wishlist-icon flex items-center cursor-pointer" onClick={openModalWishlist}>
                                            <Icon.Heart size={24} color='black' />
                                        </div>
                                        <div className="cart-icon flex items-center relative cursor-pointer" onClick={openModalCart}>
                                            <Icon.Handbag size={24} color='black' />
                                            <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">
                                                {cartState.cartArray.length}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MenuOne