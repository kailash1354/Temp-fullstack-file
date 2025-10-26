import React from "react";
import { Helmet } from "react-helmet-async";

const Products = () => {
  return (
    <>
      <Helmet>
        <title>Admin Products - Luxe Heritage</title>
      </Helmet>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Product Management
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Products</h2>
          <p className="text-gray-700">
            Product management interface will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
};

export default Products;
