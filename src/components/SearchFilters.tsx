
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, DollarSign, ArrowUpDown } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceFilter: string;
  setPriceFilter: (filter: string) => void;
  brandFilter: string;
  setBrandFilter: (filter: string) => void;
  uniqueBrands: string[];
  minPrice: number;
  setMinPrice: (price: number) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  maxPriceLimit: number;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  priceFilter,
  setPriceFilter,
  brandFilter,
  setBrandFilter,
  uniqueBrands,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  priceRange,
  setPriceRange,
  sortOrder,
  setSortOrder,
  maxPriceLimit
}) => {
  // Filter out empty or falsy brand values
  const validBrands = uniqueBrands.filter(brand => brand && brand.trim() !== '');

  const handlePriceRangeChange = (newRange: number[]) => {
    const [min, max] = newRange;
    setPriceRange([min, max]);
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleMinPriceChange = (value: string) => {
    if (value === '' || value === null) {
      // If input is cleared, set to 0
      setMinPrice(0);
      setPriceRange([0, maxPrice]);
    } else {
      const numValue = parseInt(value) || 0;
      if (numValue <= maxPrice) {
        setMinPrice(numValue);
        setPriceRange([numValue, maxPrice]);
      }
    }
  };

  const handleMaxPriceChange = (value: string) => {
    if (value === '' || value === null) {
      // If input is cleared, set to maxPriceLimit
      setMaxPrice(maxPriceLimit);
      setPriceRange([minPrice, maxPriceLimit]);
    } else {
      const numValue = parseInt(value) || maxPriceLimit;
      if (numValue >= minPrice) {
        setMaxPrice(numValue);
        setPriceRange([minPrice, numValue]);
      }
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
          <Filter size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Find Your Ideal Car</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Search and Brand */}
        <div className="space-y-6">
          <div className="relative group">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search by car, brand, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
            />
          </div>
          
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm">
              <SelectItem value="all" className="rounded-xl">All Brands</SelectItem>
              {validBrands.map(brand => (
                <SelectItem key={brand} value={brand} className="rounded-xl">{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Column - Price Filters and Sorting */}
        <div className="space-y-6">
          {/* Price Range Section */}
          <div className="bg-white/40 rounded-2xl p-6 border border-white/30">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={18} className="text-blue-500" />
              <h4 className="text-sm font-semibold text-slate-700">Price Range (per day)</h4>
            </div>
            
            {/* Price Range Slider */}
            <div className="mb-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={maxPriceLimit}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Min/Max Price Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Min Price</label>
                <Input
                  type="number"
                  value={minPrice === 0 ? '' : minPrice}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                  placeholder="Min"
                  className="h-10 rounded-xl border-slate-200 bg-white/60"
                  min={0}
                  max={maxPrice}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Max Price</label>
                <Input
                  type="number"
                  value={maxPrice === maxPriceLimit ? '' : maxPrice}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                  placeholder="Max"
                  className="h-10 rounded-xl border-slate-200 bg-white/60"
                  min={minPrice}
                  max={maxPriceLimit}
                />
              </div>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={18} className="text-blue-500" />
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
                <SelectValue placeholder="Sort by Price" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm">
                <SelectItem value="lowToHigh" className="rounded-xl">Price: Low to High</SelectItem>
                <SelectItem value="highToLow" className="rounded-xl">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
