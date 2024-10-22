'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNavOne from '@/components/Header/TopNav/TopNavOne';
import MenuOne from '@/components/Header/Menu/MenuOne';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import Footer from '@/components/Footer/Footer';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // Redirect ke halaman lain jika sudah login, misalnya ke dashboard
        router.push('/');  // Ubah dengan halaman yang diinginkan
    }
  }, [router]);

// if (typeof window !== 'undefined') {
//     const isLoggedIn = localStorage.getItem('isLoggedIn');
//     if (isLoggedIn === 'true') {
//     // Redirect lebih cepat, langsung di tahap ini sebelum komponen dirender
//     router.push('/');
//     return null; // Jangan render komponen saat redirect
//     }
// }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input
    if (!email || !password) {
      setErrorMessage('Email dan password harus diisi.');
      return;
    }

    // Mengirim permintaan ke API login
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    if (res.status === 200) {
      // Jika login berhasil, simpan informasi login dan tampilkan pesan
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', data.username); // simpan username atau token sesuai kebutuhan
      setIsLoggedIn(true);
      setErrorMessage(''); // Hapus error jika login berhasil
      router.push('/');
    } else {
      // Jika login gagal, tampilkan pesan error
      setErrorMessage(data.error || 'Login gagal, periksa email atau password Anda.');
    }
  };

  // Mengecek status login dari localStorage
  React.useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className='relative w-full'>
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading='Login' subHeading='Login' />
      </div>
      <div className="login-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex gap-y-8 max-md:flex-col">
            <div className="left md:w-1/2 w-full lg:pr-[60px] md:pr-[40px] md:border-r border-line">
              <div className="heading4">Login</div>

              {/* Menampilkan pesan jika login gagal */}
              {errorMessage && (
                <div className="bg-red-500 text-white p-2 rounded-md mb-4">
                  {errorMessage}
                </div>
              )}

              {/* Form login */}
              {!isLoggedIn ? (
                <form className="md:mt-7 mt-4" onSubmit={handleLogin}>
                  <div className="email">
                    <input 
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                      id="email" 
                      type="email" 
                      placeholder="Email address *" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="pass mt-5">
                    <input 
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg" 
                      id="password" 
                      type="password" 
                      placeholder="Password *" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="block-button md:mt-7 mt-4">
                    <button className="button-main">Login</button>
                  </div>
                </form>
              ) : (
                <div className="md:mt-7 mt-4">
                  <p className="text-green-500 font-semibold">Anda sudah login sebagai {localStorage.getItem('username')}</p>
                  <button 
                    className="button-main mt-4" 
                    onClick={() => {
                      localStorage.removeItem('isLoggedIn');
                      localStorage.removeItem('username');
                      setIsLoggedIn(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}

            </div>
            <div className="right md:w-1/2 w-full lg:pl-[60px] md:pl-[40px] flex items-center">
              <div className="text-content">
                <div className="heading4">New Customer</div>
                <div className="mt-2 text-secondary">Be part of our growing family of new customers! Join us today and unlock a world of exclusive benefits, offers, and personalized experiences.</div>
                <div className="block-button md:mt-7 mt-4">
                  <Link href={'/register'} className="button-main">Register</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
