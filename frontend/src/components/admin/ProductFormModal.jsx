import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  UploadCloud,
  Trash2,
  Maximize2,
  Minimize2,
  Check,
  DollarSign,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "./RichTextEditor"; // Correct relative import for files within the same folder
import toast from "react-hot-toast";

// --- Mock Data/Helpers for demonstration ---
const MOCK_CATEGORIES = [
  {
    _id: "1",
    name: "Women",
    slug: "women",
    subcategories: ["Dresses", "Tops", "Skirts"],
  },
  {
    _id: "2",
    name: "Men",
    slug: "men",
    subcategories: ["Shirts", "Pants", "Jackets"],
  },
  {
    _id: "3",
    name: "Accessories",
    slug: "accessories",
    subcategories: ["Bags", "Jewelry", "Watches"],
  },
];
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const AVAILABLE_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Navy", hex: "#000080" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Gold", hex: "#BFA76F" },
];

const ProductFormModal = ({ isOpen, onClose, productToEdit, onSubmit }) => {
  const isEditing = !!productToEdit;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: useMemo(
      () => ({
        name: "",
        description: "",
        category: MOCK_CATEGORIES[0]?.slug || "",
        subcategory: "",
        price: 0,
        discount: 0,
        stock: 0,
        isAvailable: true,
        colors: [],
        sizes: [],
        images: [], // For existing images
        status: "published",
        showQuantityLeft: true,
        ...productToEdit,
        // Format existing images for the form state
        images:
          productToEdit?.images?.map((img) => ({
            url: img.url,
            isNew: false,
            file: null,
            publicId: img.publicId,
          })) || [],
      }),
      [productToEdit]
    ),
  });

  // Watch fields for price calculation and subcategory filtering
  const [price, discount, categorySlug] = watch([
    "price",
    "discount",
    "category",
  ]);
  const currentImages = watch("images") || [];

  const finalPrice = useMemo(() => {
    const p = parseFloat(price);
    const d = parseFloat(discount);
    if (isNaN(p) || p <= 0) return 0;
    if (isNaN(d) || d < 0 || d >= 100) return p.toFixed(2);
    return (p - p * (d / 100)).toFixed(2);
  }, [price, discount]);

  // Handle image selection and previews
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImageObjects = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true,
    }));

    // Append new images to form state
    setValue("images", [...currentImages, ...newImageObjects], {
      shouldDirty: true,
    });

    // Clear file input value to allow selecting the same file again
    e.target.value = null;
  };

  const removeImage = (index) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue("images", updatedImages, { shouldDirty: true });
  };

  const getSubcategories = useMemo(() => {
    const selectedCategory = MOCK_CATEGORIES.find(
      (c) => c.slug === categorySlug
    );
    return selectedCategory ? selectedCategory.subcategories : [];
  }, [categorySlug]);

  // Effect to reset form on open/close/edit product change
  useEffect(() => {
    if (productToEdit) {
      reset({
        ...productToEdit,
        price: productToEdit.price || 0,
        discount: productToEdit.discount || 0,
        stock: productToEdit.stock || 0,
        images:
          productToEdit?.images?.map((img) => ({
            url: img.url,
            isNew: false,
            file: null,
            publicId: img.publicId,
          })) || [],
      });
    } else if (isOpen) {
      // Reset to initial empty state for a new product
      reset({
        name: "",
        description: "",
        category: MOCK_CATEGORIES[0]?.slug || "",
        subcategory: "",
        price: 0,
        discount: 0,
        stock: 0,
        isAvailable: true,
        colors: [],
        sizes: [],
        images: [],
        status: "published",
        showQuantityLeft: true,
      });
    }
  }, [productToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const handleModalSubmit = (data) => {
    // Separate new files from existing image data for the API
    const newFiles = data.images
      .filter((img) => img.isNew)
      .map((img) => img.file);
    const existingImages = data.images
      .filter((img) => !img.isNew)
      .map((img) => ({
        url: img.url,
        publicId: img.publicId, // Keep original publicId for existing images
      }));

    const finalData = {
      ...data,
      price: parseFloat(data.price),
      discount: parseFloat(data.discount),
      stock: parseInt(data.stock, 10),
      finalPrice: parseFloat(finalPrice),
      isNewProduct: !isEditing,
      // Data structure for the API call
      images: existingImages,
      newImageFiles: newFiles, // The backend would handle uploading these files
    };

    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 z-10 flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(handleModalSubmit)}
          className="p-6 space-y-8"
        >
          {/* --- Product Details Section --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Name */}
              <div className="form-group">
                <label
                  htmlFor="name"
                  className="form-label font-semibold text-sm"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", {
                    required: "Product name is required",
                  })}
                  className="form-input"
                  placeholder="e.g., Silk Maxi Dress"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description (Rich Text Editor Placeholder) */}
              <Controller
                name="description"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <RichTextEditor
                    label="Description"
                    placeholder="Enter a detailed product description..."
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}

              {/* Price & Discount */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="form-group">
                  <label
                    htmlFor="price"
                    className="form-label font-semibold text-sm"
                  >
                    Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      {...register("price", {
                        required: "Price is required",
                        min: {
                          value: 0.01,
                          message: "Price must be greater than 0",
                        },
                      })}
                      className="form-input pl-10"
                      placeholder="99.99"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label
                    htmlFor="discount"
                    className="form-label font-semibold text-sm"
                  >
                    Discount (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id="discount"
                      min="0"
                      max="99"
                      {...register("discount", {
                        min: { value: 0, message: "Min 0%" },
                        max: { value: 99, message: "Max 99%" },
                      })}
                      className="form-input pl-10"
                      placeholder="0"
                    />
                  </div>
                  {errors.discount && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.discount.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label font-semibold text-sm">
                    Final Price ($)
                  </label>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-300 dark:border-gray-600">
                    <span className="font-bold text-lg text-black dark:text-white">
                      ${finalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Sidebar (Category, Stock, Status) --- */}
            <div className="lg:col-span-1 space-y-6">
              {/* Category */}
              <div className="form-group p-4 bg-white dark:bg-gray-800 rounded-lg shadow-subtle border border-gray-200 dark:border-gray-700">
                <label
                  htmlFor="category"
                  className="form-label font-semibold text-sm"
                >
                  Category
                </label>
                <select
                  id="category"
                  {...register("category")}
                  className="form-input"
                >
                  {MOCK_CATEGORIES.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {getSubcategories.length > 0 && (
                <div className="form-group p-4 bg-white dark:bg-gray-800 rounded-lg shadow-subtle border border-gray-200 dark:border-gray-700">
                  <label
                    htmlFor="subcategory"
                    className="form-label font-semibold text-sm"
                  >
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    {...register("subcategory")}
                    className="form-input"
                  >
                    <option value="">Select Subcategory (Optional)</option>
                    {getSubcategories.map((sub) => (
                      <option
                        key={sub}
                        value={sub.toLowerCase().replace(/\s/g, "-")}
                      >
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Stock and Availability */}
              <div className="form-group p-4 bg-white dark:bg-gray-800 rounded-lg shadow-subtle border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="form-group">
                  <label
                    htmlFor="stock"
                    className="form-label font-semibold text-sm"
                  >
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    id="stock"
                    min="0"
                    {...register("stock", {
                      required: "Stock is required",
                      min: { value: 0, message: "Stock cannot be negative" },
                    })}
                    className="form-input"
                    placeholder="100"
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="isAvailable"
                    className="form-label font-semibold text-sm mb-0"
                  >
                    Available to Sell
                  </label>
                  <Controller
                    name="isAvailable"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-black dark:peer-focus:ring-white dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black" />
                      </label>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="showQuantityLeft"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="showQuantityLeft"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    )}
                  />
                  <label
                    htmlFor="showQuantityLeft"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Show "Quantity Left" on site
                  </label>
                </div>

                <div className="form-group pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label
                    htmlFor="status"
                    className="form-label font-semibold text-sm"
                  >
                    Product Status
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className="form-input"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="hidden">Hidden (Internal Only)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* --- Variants (Colors & Sizes) Section --- */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              Variants <Minimize2 className="w-5 h-5 ml-2 text-gray-500" />
            </h3>

            {/* Colors */}
            <div className="mb-6">
              <label className="form-label font-semibold text-sm mb-2 block">
                Available Colors (Multi-Select)
              </label>
              <Controller
                name="colors"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_COLORS.map((color) => (
                      <label
                        key={color.name}
                        className={`flex items-center space-x-2 p-2 border rounded-full cursor-pointer transition-all ${
                          field.value.includes(color.name)
                            ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700 shadow-md"
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={field.value.includes(color.name)}
                          onChange={() => {
                            if (field.value.includes(color.name)) {
                              field.onChange(
                                field.value.filter((c) => c !== color.name)
                              );
                            } else {
                              field.onChange([...field.value, color.name]);
                            }
                          }}
                          className="sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded-full border border-gray-400 dark:border-gray-500"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {color.name}
                        </span>
                        {field.value.includes(color.name) && (
                          <Check className="w-4 h-4 text-black dark:text-white" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="form-label font-semibold text-sm mb-2 block">
                Available Sizes (Multi-Select)
              </label>
              <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_SIZES.map((size) => (
                      <label
                        key={size}
                        className={`flex items-center justify-center min-w-14 h-10 px-3 border rounded-lg cursor-pointer transition-all font-medium text-sm ${
                          field.value.includes(size)
                            ? "border-black dark:border-white bg-black text-white shadow-md"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={field.value.includes(size)}
                          onChange={() => {
                            if (field.value.includes(size)) {
                              field.onChange(
                                field.value.filter((s) => s !== size)
                              );
                            } else {
                              field.onChange([...field.value, size]);
                            }
                          }}
                          className="sr-only"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* --- Images Section (Upload Multiple with Preview) --- */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              Product Images{" "}
              <Maximize2 className="w-5 h-5 ml-2 text-gray-500" />
            </h3>

            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {field.value.map((img, index) => (
                      <div
                        key={img.url + index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm"
                      >
                        <img
                          src={img.url}
                          alt={`Product Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {img.isNew && (
                          <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* File Input */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, up to 5MB each
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                </>
              )}
            />
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-6 py-3"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-6 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="spinner-luxury w-5 h-5 mr-2" />
                  {isEditing ? "Saving..." : "Creating..."}
                </div>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductFormModal;
