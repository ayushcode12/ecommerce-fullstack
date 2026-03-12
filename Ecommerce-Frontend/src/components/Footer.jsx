import { Link } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-[var(--border)] bg-white/80 backdrop-blur-xl md:mt-20">
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 md:py-12 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Home <span className="text-teal-600">Chemicals</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Premium cleaning solutions trusted by thousands across India.
            Quality, safety, and performance in every product.
          </p>

          <div className="flex gap-4 pt-2">
            <button className="rounded-full border border-[var(--border)] bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:text-teal-700">
              <FaFacebookF size={14} />
            </button>
            <button className="rounded-full border border-[var(--border)] bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:text-teal-700">
              <FaInstagram size={14} />
            </button>
            <button className="rounded-full border border-[var(--border)] bg-white p-2 text-slate-600 transition hover:border-teal-200 hover:text-teal-700">
              <FaTwitter size={14} />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>
              <Link to="/" className="transition hover:text-teal-700">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition hover:text-teal-700">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/cart" className="transition hover:text-teal-700">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="transition hover:text-teal-700">
                Orders
              </Link>
            </li>
            <li>
              <Link to="/addresses/new" className="transition hover:text-teal-700">
                Add Address
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Customer Service
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="cursor-pointer transition hover:text-teal-700">Contact Us</li>
            <li className="cursor-pointer transition hover:text-teal-700">Shipping Policy</li>
            <li className="cursor-pointer transition hover:text-teal-700">Refund Policy</li>
            <li className="cursor-pointer transition hover:text-teal-700">Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Contact
          </h3>
          <p className="text-sm text-slate-700">Agra, Uttar Pradesh, India</p>
          <p className="mt-2 text-sm text-slate-700">support@homechemicals.com</p>
          <p className="mt-2 text-sm text-slate-700">+91 98765 43210</p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] py-5 text-center text-sm text-slate-500">
        Copyright {new Date().getFullYear()} Home Chemicals. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
