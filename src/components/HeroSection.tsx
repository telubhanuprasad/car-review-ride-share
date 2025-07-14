
import React from 'react';
import { Sparkles } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-blue-100/60 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <Sparkles size={16} />
        Premium Car Collection
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
        Find Your Perfect
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Drive</span>
      </h2>
      <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
        Discover our curated collection of premium vehicles, tailored for every journey and occasion.
      </p>
    </div>
  );
};

export default HeroSection;
