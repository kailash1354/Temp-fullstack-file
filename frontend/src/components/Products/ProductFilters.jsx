import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from 'lucide-react';

const ProductFilters = ({ filters, onFilterChange, availableFilters }) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    availability: true,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    onFilterChange({
      ...filters,
      [type]: numValue,
    });
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 999999,
      inStock: false,
    });
  };

  const hasActiveFilters = 
    filters.category || 
    filters.brand || 
    filters.minPrice > 0 || 
    filters.maxPrice < 999999 || 
    filters.inStock;

  const FilterSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );

  const FilterContent = () => (
    <>
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mb-6">
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}

      {/* Categories */}
      {availableFilters.categories && (
        <FilterSection
          title="Categories"
          isOpen={openSections.category}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableFilters.categories.map((category) => (
              <label
                key={category._id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={filters.category === category.slug}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="text-black focus:ring-black"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({category.count || 0})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {availableFilters.brands && availableFilters.brands.length > 0 && (
        <FilterSection
          title="Brands"
          isOpen={openSections.brand}
          onToggle={() => toggleSection('brand')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableFilters.brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={brand}
                  checked={filters.brand === brand}
                  onChange={(e) => handleFilterChange('brand', e.target.checked ? brand : '')}
                  className="text-black focus:ring-black rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isOpen={openSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Min Price: ${filters.minPrice}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Max Price: ${filters.maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        isOpen={openSections.availability}
        onToggle={() => toggleSection('availability')}
      >
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="text-black focus:ring-black rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              In Stock Only
            </span>
          </label>
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear All
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilters;