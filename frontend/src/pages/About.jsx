import React from "react";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Luxe Heritage</title>
        <meta
          name="description"
          content="Learn about Luxe Heritage, our mission, and our commitment to luxury fashion."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About Luxe Heritage
            </h1>
            <p className="text-xl text-gray-600">Redefining Luxury Fashion</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 mb-4">
              Founded with a vision to bring the finest luxury fashion to
              discerning customers worldwide, Luxe Heritage represents the
              pinnacle of elegance and sophistication.
            </p>
            <p className="text-gray-700">
              Our curated collection features handpicked pieces from the world's
              most renowned designers, ensuring that every item in our catalog
              meets the highest standards of quality and craftsmanship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Our Mission
              </h3>
              <p className="text-gray-700">
                To provide an unparalleled shopping experience that celebrates
                individuality, craftsmanship, and the timeless art of luxury
                fashion.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Our Values
              </h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Authenticity and Quality</li>
                <li>• Exceptional Customer Service</li>
                <li>• Sustainable Luxury</li>
                <li>• Innovation and Tradition</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Customer Service
                </h4>
                <p className="text-gray-600">support@luxeheritage.com</p>
                <p className="text-gray-600">1-800-LUXE-HER</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Business Hours
                </h4>
                <p className="text-gray-600">Monday - Friday: 9AM - 6PM EST</p>
                <p className="text-gray-600">
                  Saturday - Sunday: 10AM - 4PM EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
