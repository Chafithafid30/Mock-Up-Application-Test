import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { isAuth, username, logout } = useAuth();
  const location = useLocation();

  if (!isAuth && location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 shadow">
      <div className="max-w-6xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link to={isAuth ? '/items' : '/login'} className="text-xl font-bold">
            POS App
          </Link>
          {isAuth && username && (
            <span className="text-sm text-slate-300">Halo, {username}</span>
          )}
        </div>

        {isAuth ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/items" className="px-3 py-2 rounded hover:bg-slate-800 transition">
              Items
            </Link>
            <Link to="/pos" className="px-3 py-2 rounded hover:bg-slate-800 transition">
              POS
            </Link>
            <Link to="/reports" className="px-3 py-2 rounded hover:bg-slate-800 transition">
              Reports
            </Link>
            <Link to="/stock" className="px-3 py-2 rounded hover:bg-slate-800 transition">
              Stock
            </Link>
            <button
              onClick={logout}
              className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-3 py-2 rounded hover:bg-slate-800 transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}