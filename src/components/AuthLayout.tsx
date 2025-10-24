import React from 'react';
import backgroundImage from '../assets/ljubomir-zarkovic-bt_ZtkCxLs4-unsplash.webp';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
      <div className="absolute top-10 left-10 text-white text-5xl font-extrabold ">
        CRM<span className="font-light italic">Toolbar</span>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
