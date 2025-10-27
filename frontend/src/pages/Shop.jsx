import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import productsAPI from '../api/products';
import ProductCard from '../components/Products/ProductCard';
import ProductFilters from '../components/Products/ProductFilters';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Pagination from '../components/UI/Pagination';
import { motion } from 'framer-motion';

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    sort: searchParams.get('sort') || '-createdAt',
    category: category || searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: parseFloat(searchParams.get('minPrice')) || 0,
    maxPrice: parseFloat(searchParams.get('maxPrice')) || 999999,
    search: searchParams.get('search') || '',
    inStock: searchParams.get('inStock') === 'true',
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch products
  const { data: productsData, isLoading, isError } = useQuery(
    ['products', filters],
    () => productsAPI.getProducts(filters),
    { keepPreviousData: true }
  );

  // Fetch filters
  const { data: filtersData } = useQuery('product-filters', () =>
    productsAPI.getFilters()
  );

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};
  const totalPages = pagination.pages || 1;

  useEffect(() => {
    // Update URL params when filters change
    const newParams = new URLSearchParams();
    
    if (filters.page > 1) newParams.set('page', filters.page.toString());
    if (filters.sort !== '-createdAt') newParams.set('sort', filters.sort);
    if (filters.category) newParams.set('category', filters.category);
    if (filters.brand) newParams.set('brand', filters.brand);
    if (filters.minPrice > 0) newParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 999999) newParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.search) newParams.set('search', filters.search);
    if (filters.inStock) newParams.set('inStock', 'true');
    
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading products</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection` : 'All Products'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Discover our curated selection of luxury fashion and premium lifestyle products,
            each piece carefully selected to bring elegance and sophistication to your wardrobe.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              availableFilters={filtersData?.data || {}}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Sort and View Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0"
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  {pagination.total || 0} products found
                </span>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Sort Options */}
                <select
                  value={filters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-300 text-base shadow-soft"
                >
                  <option value="-createdAt">Newest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-ratings.average">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-soft">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-luxury-gold text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-luxury-gold hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-luxury-gold text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-luxury-gold hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-label="List view"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20"
              >
                <h3 className="text-3xl font-display font-semibold text-gray-900 dark:text-white mb-4">
                  No products found
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={
                  viewMode === 'grid'
                    ? 'product-grid-luxury'
                    : 'space-y-8'
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16"
              >
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;