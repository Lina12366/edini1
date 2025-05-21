import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAlternateEmail } from 'react-icons/md';
import { FaFingerprint } from 'react-icons/fa';
import { IoMdEyeOff, IoMdEye } from 'react-icons/io';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      
      const response = await fetch('http://localhost/ediniticketbooking/src/serveur/api/admin/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Store admin info in localStorage
        localStorage.setItem('admin', JSON.stringify(data.admin));
        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className='w-full h-screen flex items-center justify-center relative'
      style={{ backgroundImage: "url('src/assets/hero1.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute w-full h-full bg-red-900/30 backdrop-blur-md"></div>
      <form onSubmit={handleSubmit} className='relative w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-red-600 flex-col flex items-center gap-3 rounded-xl shadow-red-900/60 shadow-lg'>
        
        <h1 className='text-lg md:text-xl font-semibold text-white'>Admin Login</h1>
        <p className='text-xs md:text-sm text-center font-thin text-white'>Welcome back to the admin panel</p>

        {error && (
          <div className='w-full p-2 bg-red-100 text-red-600 text-sm rounded-lg'>
            {error}
          </div>
        )}

        <div className='w-full flex flex-col gap-3'>
          <div className='w-full flex items-center bg-red-100 p-2 rounded-xl gap-2'>
            <MdAlternateEmail className='text-red-600' />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder='Email account'
              className='bg-transparent border-0 w-full outline-none text-sm md:text-base text-red-600 placeholder-red-400'
              required
            />
          </div>

          <div className='w-full flex items-center bg-white/90 p-2 rounded-xl gap-2 relative'>
            <FaFingerprint className='text-red-600' />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder='Password'
              className='bg-transparent border-0 w-full outline-none text-sm md:text-base'
              required
            />
            {showPassword ? (
              <IoMdEyeOff
                className='absolute right-5 cursor-pointer text-red-600'
                onClick={togglePasswordVisibility}
              />
            ) : (
              <IoMdEye
                className='absolute right-5 cursor-pointer text-red-600'
                onClick={togglePasswordVisibility}
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className='w-full bg-red-700 text-white font-semibold p-2 rounded-xl hover:bg-red-800 transition-colors'
        >
          {loading ? 'Logging in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 