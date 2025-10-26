import React from "react";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Luxe Heritage</title>
      </Helmet>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Orders
            </h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Products
            </h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">$0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
