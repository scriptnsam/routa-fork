import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Routa</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Fast & Reliable
                <span className="text-blue-600"> Delivery</span>
                <br />
                At Your Fingertips
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Send packages across the city with ease. Real-time tracking,
                affordable prices, and trusted drivers ready to deliver.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                >
                  Send a Package
                </Link>
                <Link
                  to="/register?role=driver"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition text-center font-semibold"
                >
                  Become a Driver
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl">🚚</span>
                  <p className="text-blue-600 font-semibold mt-4">
                    Delivering Happiness
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Routa?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Get your packages delivered within hours. Our drivers are always
                ready to pick up and deliver.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Real-Time Tracking
              </h3>
              <p className="text-gray-600">
                Track your package in real-time. Know exactly where your delivery
                is at any moment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Affordable Prices
              </h3>
              <p className="text-gray-600">
                Transparent pricing with no hidden fees. Pay only for the distance
                covered.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Secure & Safe
              </h3>
              <p className="text-gray-600">
                All our drivers are verified. Your packages are in safe hands
                throughout the journey.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🚗</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Multiple Vehicles
              </h3>
              <p className="text-gray-600">
                From bikes to trucks, choose the right vehicle for your package
                size and urgency.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Easy to Use
              </h3>
              <p className="text-gray-600">
                Simple and intuitive interface. Book a delivery in just a few
                clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Create Order
              </h3>
              <p className="text-gray-600">
                Enter pickup and dropoff locations with package details
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Get Matched
              </h3>
              <p className="text-gray-600">
                A nearby driver accepts your delivery request
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Track Live
              </h3>
              <p className="text-gray-600">
                Watch your package move in real-time on the map
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delivered!
              </h3>
              <p className="text-gray-600">
                Package delivered safely to the destination
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-2">10K+</p>
              <p className="text-blue-100">Deliveries Made</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">500+</p>
              <p className="text-blue-100">Active Drivers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">50+</p>
              <p className="text-blue-100">Cities Covered</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">4.8★</p>
              <p className="text-blue-100">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Driver CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Want to Earn Money?
                </h2>
                <p className="text-green-100 mb-6">
                  Join our team of drivers and start earning. Flexible hours,
                  competitive pay, and instant withdrawals.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-white">
                    <span>✓</span> Work on your own schedule
                  </li>
                  <li className="flex items-center gap-2 text-white">
                    <span>✓</span> Get paid weekly
                  </li>
                  <li className="flex items-center gap-2 text-white">
                    <span>✓</span> Use any vehicle type
                  </li>
                  <li className="flex items-center gap-2 text-white">
                    <span>✓</span> 24/7 support
                  </li>
                </ul>
                <Link
                  to="/register?role=driver"
                  className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition font-semibold"
                >
                  Start Driving Today
                </Link>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="text-center">
                  <span className="text-9xl">🏍️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            No hidden fees. Pay only for what you use.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">🏍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bike</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                ₦500 <span className="text-sm text-gray-500">base</span>
              </p>
              <p className="text-gray-600">+ ₦100/km</p>
              <p className="text-sm text-gray-500 mt-4">
                Best for small packages
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center border-2 border-blue-600 relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Popular
              </span>
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Car</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                ₦800 <span className="text-sm text-gray-500">base</span>
              </p>
              <p className="text-gray-600">+ ₦150/km</p>
              <p className="text-sm text-gray-500 mt-4">
                Best for medium packages
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Van/Truck</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                ₦1500 <span className="text-sm text-gray-500">base</span>
              </p>
              <p className="text-gray-600">+ ₦200/km</p>
              <p className="text-sm text-gray-500 mt-4">
                Best for large items
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Routa saved my business! I can now deliver to my customers same
                day without worrying about logistics."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span>👩</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Amina O.</p>
                  <p className="text-sm text-gray-500">Business Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "As a driver, I love the flexibility. I work when I want and
                earn good money. The app is super easy to use."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span>👨</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Chidi E.</p>
                  <p className="text-sm text-gray-500">Routa Driver</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The real-time tracking is amazing! I always know where my
                package is. Highly recommend Routa."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span>👩</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Funke A.</p>
                  <p className="text-sm text-gray-500">Regular Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of users who trust Routa for their deliveries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Routa</h3>
              <p className="text-gray-400">
                Fast, reliable delivery service at your fingertips.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Routa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;