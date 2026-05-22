import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Search, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown, 
  Trash2,
  Cpu,
  Sparkles,
  Tag,
  Smile,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { 
    user, 
    logout, 
    currentSegment, 
    categoryAffinity, 
    cart, 
    removeFromCart, 
    checkout,
    searchProducts,
    theme,
    toggleTheme
  } = useApp();
  
  const [searchVal, setSearchVal] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showAffinities, setShowAffinities] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchProducts(searchVal);
    navigate('/');
    setShowMobileMenu(false);
  };

  const getSegmentBadge = () => {
    switch (currentSegment) {
      case 'electronics_lovers':
        return { 
          label: 'Tech Enthusiast', 
          icon: <Cpu className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />, 
          color: 'bg-brand-purple/10 border-brand-purple/35 text-brand-purple dark:text-purple-300' 
        };
      case 'fashion_lovers':
        return { 
          label: 'Trendsetter', 
          icon: <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-pink" />, 
          color: 'bg-brand-pink/10 border-brand-pink/35 text-brand-pink dark:text-pink-300' 
        };
      case 'bargain_hunters':
        return { 
          label: 'Bargain Hunter', 
          icon: <Tag className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />, 
          color: 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-300' 
        };
      default:
        return { 
          label: 'Welcomed Guest', 
          icon: <Smile className="w-3.5 h-3.5 mr-1.5 text-brand-indigo" />, 
          color: 'bg-brand-indigo/10 border-brand-indigo/35 text-brand-indigo dark:text-indigo-300' 
        };
    }
  };

  const badge = getSegmentBadge();
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * (1 - (item.product.discountPercent || 0) / 100)) * item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-custom bg-bg-primary/75 backdrop-blur-lg transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent hover:opacity-90 transition">
              PersonalShop
            </span>
          </Link>

          {/* Search bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden md:block">
            <input
              type="text"
              placeholder="Search products, categories, tags..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-10 px-4 pl-10 rounded-full bg-bg-secondary/60 border border-border-custom text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-all"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
          </form>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Real-time segment indicator */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowAffinities(!showAffinities);
                  setShowCart(false);
                }}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.color} cursor-pointer hover:scale-102 transition`}
              >
                {badge.icon}
                <span className="hidden sm:inline">{badge.label}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>

              {/* Affinity Details Dropdown */}
              {showAffinities && (
                <div className="absolute right-0 mt-2.5 w-64 rounded-2xl border border-border-custom bg-bg-secondary/95 backdrop-blur-md p-4 shadow-xl animate-scale-in">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Live Interest Scorecard</h4>
                  {Object.keys(categoryAffinity).length === 0 ? (
                    <p className="text-xs text-text-muted py-2">No interactions tracked. Browse categories to seed your preference vector.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(categoryAffinity).map(([category, score]) => (
                        <div key={category}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary font-medium">{category}</span>
                            <span className="text-brand-indigo font-bold">{score} pts</span>
                          </div>
                          <div className="w-full bg-bg-primary h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-brand-indigo h-full rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, (score / 15) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 border-t border-border-custom pt-2.5 text-[9px] text-text-muted leading-relaxed">
                    Personalization adjusts instantly: Click (+1), Cart (+5), Checkout (+10).
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light mode switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-brand-indigo transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin Dashboard */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-brand-indigo transition-all"
                title="Admin Analytics Portal"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
            )}

            {/* Shopping Cart */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowCart(!showCart);
                  setShowAffinities(false);
                }}
                className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-brand-indigo transition-all relative cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink text-[9px] font-bold text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Shopping Cart Dropdown */}
              {showCart && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-border-custom bg-bg-secondary/95 backdrop-blur-md p-4 shadow-xl animate-scale-in">
                  <h3 className="font-semibold text-sm mb-3">Shopping Cart</h3>
                  {cart.length === 0 ? (
                    <p className="text-xs text-text-muted py-6 text-center">Your cart is currently empty.</p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
                        {cart.map((item) => {
                          const discPrice = item.product.price * (1 - (item.product.discountPercent || 0) / 100);
                          return (
                            <div key={item.product._id} className="flex justify-between items-center gap-3">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="w-10 h-10 object-cover rounded-lg bg-bg-primary border border-border-custom"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-text-primary truncate">{item.product.name}</h4>
                                <p className="text-[10px] text-text-secondary mt-0.5">Qty: {item.quantity} × ${discPrice.toFixed(2)}</p>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.product._id)}
                                className="text-text-muted hover:text-brand-pink p-1 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t border-border-custom pt-3 mb-3.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary font-medium">Subtotal:</span>
                          <span className="font-bold text-brand-pink text-sm">${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          checkout();
                          setShowCart(false);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25"
                      >
                        Proceed to Checkout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-border-custom">
                  <span className="text-xs text-text-secondary font-medium">{user.username}</span>
                  <button 
                    onClick={logout}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-brand-pink hover:bg-bg-secondary transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-secondary hover:bg-bg-secondary/80 border border-border-custom text-text-primary transition"
                >
                  <User className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary md:hidden cursor-pointer"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu side-drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-border-custom bg-bg-primary/95 backdrop-blur-md px-4 py-6 space-y-6 shadow-xl animate-scale-in">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-10 px-4 pl-10 rounded-xl bg-bg-secondary border border-border-custom text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
          </form>

          {/* User profile list */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Account & Session</h4>
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-custom">
                <div>
                  <p className="text-xs font-bold text-text-primary">{user.username}</p>
                  <p className="text-[10px] text-text-muted">{user.email}</p>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-950/20 text-red-400 border border-red-500/20 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-brand-indigo text-white text-xs font-bold shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25 transition"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
