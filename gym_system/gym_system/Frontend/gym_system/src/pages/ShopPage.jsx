import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import productService from "../services/product.service";
import categoryService from "../services/category.service";
import authService from "../services/auth.service";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const images =
    product.images && product.images.length > 0 ? product.images : [];

  const handlePrev = (e) => {
    e.preventDefault();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleAddCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    await addToCart(product._id || product.id, 1);
    setIsAdding(false);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="group bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden flex flex-col hover:border-red-600/50 transition-all duration-500 shadow-xl relative">
      <div
        onClick={() => navigate(`/product/${product._id || product.id}`)}
        className="relative h-64 overflow-hidden bg-black flex items-center justify-center cursor-pointer"
      >
        {images.length > 0 ? (
          <img
            src={authService.getImageUrl(images[currentImageIndex])}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="text-gray-600 text-[10px] uppercase font-black tracking-widest">
            No Image Available
          </div>
        )}

        {(!product.isAvailable || product.quantity <= 0) && (
          <div className="absolute top-4 left-4 bg-red-600/90 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-sm uppercase z-20 shadow-lg">
            Out of Stock
          </div>
        )}

        {/* Quick View Quick Add UI Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <button
            onClick={handleAddCart}
            disabled={!product.isAvailable || product.quantity <= 0 || isAdding}
            className={`pointer-events-auto bg-white text-black font-black text-[10px] tracking-widest px-6 py-2.5 rounded-full hover:bg-red-600 hover:text-white transition-colors uppercase translate-y-4 group-hover:translate-y-0 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>

        {/* Image Slider Controls (Only show if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-20 opacity-0 group-hover:opacity-100 pointer-events-auto shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-20 opacity-0 group-hover:opacity-100 pointer-events-auto shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentImageIndex
                      ? "w-4 bg-red-600"
                      : "w-1.5 bg-white/40"
                  }`}
                ></div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow z-20 bg-[#1a1a1a]">
        <div className="flex justify-between items-start mb-2 gap-2">
          <span className="text-[12px] font-bold text-red-600 uppercase tracking-widest truncate">
            {product.category_id?.name || "Uncategorized"}
          </span>
          <div className="flex flex-col items-end">
            <div className="flex gap-0.5 text-yellow-500 text-[12px] flex-shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={
                    s <= Math.round(product.avgRating || 0)
                      ? "block"
                      : "opacity-20"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            {product.numReviews > 0 ? (
              <span className="text-[12px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">
                ({product.numReviews} REVIEWS)
              </span>
            ) : (
              <span className="text-[12px] text-gray-600 font-bold uppercase tracking-tight mt-0.5">
                NO REVIEWS
              </span>
            )}
          </div>
        </div>
        <h3
          onClick={() => navigate(`/product/${product._id || product.id}`)}
          className="text-sm font-black text-white italic tracking-tight mb-2 group-hover:text-red-500 transition-colors uppercase line-clamp-2 cursor-pointer"
        >
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 font-light line-clamp-2 mb-4">
          {product.description ||
            "Premium gym product designed for excellence."}
        </p>
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-800/50">
          <div className="text-lg font-black text-white flex items-center">
            <span className="text-[12px] font-bold text-gray-500 mr-1 italic">
              Rs
            </span>
            {Number(product.amount).toLocaleString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCart}
              disabled={
                !product.isAvailable || product.quantity <= 0 || isAdding
              }
              className="bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 p-2.5 rounded-lg transition-colors group/btn"
              title="Add to Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 group-hover/btn:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={
                !product.isAvailable || product.quantity <= 0 || isAdding
              }
              className="bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 text-white font-black text-[10px] tracking-widest px-4 py-2.5 rounded-lg uppercase transition-colors shadow-lg shadow-red-600/20"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          categoryService.getAllCategories(),
          productService.getAllProducts({ limit: 1000 }),
        ]);

        if (catsRes && catsRes.categories) {
          setCategories([{ _id: "All", name: "All" }, ...catsRes.categories]);
        } else if (catsRes && Array.isArray(catsRes.data)) {
          setCategories([{ _id: "All", name: "All" }, ...catsRes.data]);
        } else if (catsRes && Array.isArray(catsRes)) {
          setCategories([{ _id: "All", name: "All" }, ...catsRes]);
        } else {
          setCategories([{ _id: "All", name: "All" }]); // Fallback
        }

        if (prodsRes && prodsRes.products) {
          setProducts(prodsRes.products);
        } else if (prodsRes && Array.isArray(prodsRes.data)) {
          setProducts(prodsRes.data);
        } else if (prodsRes && Array.isArray(prodsRes)) {
          setProducts(prodsRes);
        }
      } catch (err) {
        console.error("Failed to load shop data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      activeCategory === "All" ||
      p.category_id?._id === activeCategory ||
      p.category_id?.name === activeCategory;
    const searchMatch =
      !searchQuery ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      {/* Shop Header */}
      <section className="pt-32 pb-16 px-6 md:px-16 bg-[#1a1a1a] border-b border-gray-900">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            CYLON <span className="text-red-600">STORE</span>
          </h1>
          <p className="text-gray-400 max-w-xl font-light text-sm md:text-base">
            Equip yourself with the best gear and nutrition. Premium quality
            products designed for maximum performance and faster recovery.
          </p>
        </div>
      </section>

      {/* Categories & Filter */}
      <section className="py-8 px-6 md:px-16 container mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2">
              Filter By:
            </span>
            {categories.map((cat) => {
              const catId = cat._id || cat.name; // Use ID if available, else name
              return (
                <button
                  key={catId}
                  onClick={() => setActiveCategory(catId)}
                  className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeCategory === catId
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 text-white text-[10px] font-bold tracking-widest px-4 py-3 pl-10 rounded-full focus:outline-none focus:border-red-600 transition-colors uppercase placeholder-gray-600"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-8 pb-24 px-6 md:px-16 container mx-auto flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 text-[10px] uppercase tracking-widest font-black">
              Loading Store...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-red-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-[10px] font-black transition-all border ${
                      currentPage === i + 1
                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20"
                        : "bg-[#1a1a1a] border-gray-800 text-gray-500 hover:border-red-600 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-red-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-700 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">
                  No products found.
                </h3>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ShopPage;
