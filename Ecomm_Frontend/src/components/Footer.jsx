import { Link } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="mt-10 border-t border-[var(--border)] bg-white/85 backdrop-blur-xl md:mt-20">
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 md:py-12 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Urban <span className="text-rose-600">Threads</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Style-first fashion for college, office, and everyday wear.
            Discover reliable fits, clean design, and smooth shopping.
          </p>

          <div className="flex gap-4 pt-2">
            <button className="rounded-full border border-[var(--border)] bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:text-rose-700">
              <FaFacebookF size={14} />
            </button>
            <button className="rounded-full border border-[var(--border)] bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:text-rose-700">
              <FaInstagram size={14} />
            </button>
            <button className="rounded-full border border-[var(--border)] bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:text-rose-700">
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
              <Link to="/" className="transition hover:text-rose-700">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition hover:text-rose-700">
                Shop All
              </Link>
            </li>
            <li>
              <Link to="/products?keyword=t-shirt" className="transition hover:text-rose-700">
                T-Shirts
              </Link>
            </li>
            <li>
              <Link to="/products?keyword=jeans" className="transition hover:text-rose-700">
                Jeans
              </Link>
            </li>
            <li>
              <Link to="/orders" className="transition hover:text-rose-700">
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Customer Care
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="cursor-pointer transition hover:text-rose-700">Help Center</li>
            <li className="cursor-pointer transition hover:text-rose-700">Shipping Information</li>
            <li className="cursor-pointer transition hover:text-rose-700">Returns and Exchanges</li>
            <li className="cursor-pointer transition hover:text-rose-700">Privacy and Security</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Contact
          </h3>
          <p className="text-sm text-slate-700">Agra, Uttar Pradesh, India</p>
          <p className="mt-2 text-sm text-slate-700">support@urbanthreads.com</p>
          <p className="mt-2 text-sm text-slate-700">+91 98765 43210</p>
          <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-xs font-semibold text-slate-600">
            Secure checkout and order updates for every purchase.
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] py-5 text-center text-sm text-slate-500">
        Copyright {new Date().getFullYear()} Urban Threads. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
