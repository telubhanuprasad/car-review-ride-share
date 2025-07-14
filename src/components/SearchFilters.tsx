
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceFilter: string;
  setPriceFilter: (filter: string) => void;
  brandFilter: string;
  setBrandFilter: (filter: string) => void;
  uniqueBrands: string[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  priceFilter,
  setPriceFilter,
  brandFilter,
  setBrandFilter,
  uniqueBrands
}) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
          <Filter size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Find Your Ideal Car</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search by car, brand, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
        
        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm">
            <SelectItem value="all" className="rounded-xl">All Prices</SelectItem>
            <SelectItem value="under75" className="rounded-xl">Under $75/day</SelectItem>
            <SelectItem value="75to150" className="rounded-xl">$75 - $150/day</SelectItem>
            <SelectItem value="over150" className="rounded-xl">Over $150/day</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm">
            <SelectItem value="all" className="rounded-xl">All Brands</SelectItem>
            {uniqueBrands.map(brand => (
              <SelectItem key={brand} value={brand} className="rounded-xl">{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilters;
