import React from 'react';

export default function Home() {
  return (
    <div className="text-center p-8">
      <div className="p-8 mb-16 bg-white rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-out">
        <h1 className="text-5xl text-[#333] mb-6">Welcome to SmartAgriNode</h1>
        <p className="text-xl text-[#666] max-w-[600px] mx-auto leading-relaxed">
          Your intelligent farming companion for better crop management and sustainable agriculture
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 my-16">
        <div className="bg-white p-8 rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-out hover:-translate-y-1">
          <h3 className="text-[#E01709] mb-4 text-2xl">Smart Dashboard</h3>
          <p className="text-[#666] leading-normal">Monitor your farm's vital statistics and get real-time insights</p>
        </div>

        <div className="bg-white p-8 rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-out hover:-translate-y-1">
          <h3 className="text-[#E01709] mb-4 text-2xl">AI-Powered Recommendations</h3>
          <p className="text-[#666] leading-normal">Get personalized crop recommendations based on your soil and climate conditions</p>
        </div>

        <div className="bg-white p-8 rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-out hover:-translate-y-1">
          <h3 className="text-[#E01709] mb-4 text-2xl">Weed Detection</h3>
          <p className="text-[#666] leading-normal">Advanced image processing to identify and manage unwanted plant growth</p>
        </div>
      </div>
    </div>
  );
}