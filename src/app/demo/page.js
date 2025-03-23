'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [demoReady, setDemoReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading demo data
    const timer = setTimeout(() => {
      setIsLoading(false);
      setDemoReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const startDemo = () => {
    // In a real implementation, you would set up a demo session with mock data
    // For now, we'll just redirect to the dashboard
    // We could set a cookie or localStorage flag to indicate demo mode
    localStorage.setItem('demo_mode', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">ProductOptimizer</h1>
              <p className="text-gray-600 mt-1">Demo Version</p>
            </div>
            <a href="/" className="text-indigo-600 hover:text-indigo-800">Back to Home</a>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-indigo-600 md:w-48 flex items-center justify-center">
              <img 
                className="h-48 w-full object-cover md:w-48" 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop" 
                alt="Wireless Headphones" 
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">Product Analysis</div>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">Premium Wireless Headphones</h2>
              <p className="mt-2 text-gray-600">
                Price: $129.99 | Rating: 4.7/5 | Reviews: 87
              </p>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Optimization Score</h3>
                <div className="mt-2 relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        Good
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        76%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div style={{ width: "76%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2 text-gray-600">
                      <span className="font-medium text-gray-900">Add more relevant keywords to your title</span> to improve search visibility.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2 text-gray-600">
                      <span className="font-medium text-gray-900">Include more detailed product specifications</span> to reduce customer questions.
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="h-6 flex items-center sm:h-7">
                      <svg className="flex-shrink-0 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="ml-2 text-gray-600">
                      <span className="font-medium text-gray-900">Add lifestyle images showing the product in use</span> to increase conversion rates.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-600 mb-4">
            This is a demo version of ProductOptimizer. In the full version, you'll get complete access to all features including:
          </p>
          <div className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
            Full Analysis for All Your Products
          </div>
        </div>
      </main>
    </div>
  );
} 