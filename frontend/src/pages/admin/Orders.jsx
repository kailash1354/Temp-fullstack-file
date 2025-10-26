import React from "react";
import { Helmet } from "react-helmet-async";

const Orders = () => {
  return (
    <>
      <Helmet>
        <title>Admin Orders - Luxe Heritage</title>
      </Helmet>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Order Management
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders</h2>
          <p className="text-gray-700">
            Order management interface will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
};

export default Orders;
