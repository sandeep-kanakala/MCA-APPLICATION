// src/pages/Error404.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center px-4">
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-9xl font-extrabold text-gray-800 dark:text-gray-100"
      >
        404
      </motion.h1>

      <p className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
        Oops! Page not found
      </p>

      <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
        The page you're looking for doesn’t exist or has been moved. Check the URL or go back to the
        homepage.
      </p>

      <button
        onClick={() => navigate('/')}
        className="mt-8 cursor-pointer px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-md"
      >
        Go Home
      </button>
    </div>
  );
};

export default Error404;
