import { Link } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"

const Footer = () => {

  return (
    <footer className="bg-slate-950 text-slate-300 mt-24 border-t border-slate-800">

      <div className="max-w-[1600px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Home <span className="text-emerald-500">Chemicals</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Premium cleaning solutions trusted by thousands across India.
            Quality, safety, and performance in every product.
          </p>

          <div className="flex gap-4 pt-2">
            <FaFacebookF className="cursor-pointer hover:text-white transition" />
            <FaInstagram className="cursor-pointer hover:text-white transition" />
            <FaTwitter className="cursor-pointer hover:text-white transition" />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-white transition">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white transition">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white transition">
                Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-white font-semibold mb-4">Customer Service</h3>
          <ul className="space-y-3 text-sm">
            <li className="hover:text-white transition cursor-pointer">
              Contact Us
            </li>
            <li className="hover:text-white transition cursor-pointer">
              Shipping Policy
            </li>
            <li className="hover:text-white transition cursor-pointer">
              Refund Policy
            </li>
            <li className="hover:text-white transition cursor-pointer">
              Privacy Policy
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <p className="text-sm text-slate-400">
            📍 Agra, Uttar Pradesh, India
          </p>
          <p className="text-sm text-slate-400 mt-2">
            📧 support@homechemicals.com
          </p>
          <p className="text-sm text-slate-400 mt-2">
            📞 +91 98765 43210
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Home Chemicals. All rights reserved.
      </div>

    </footer>
  )
}

export default Footer