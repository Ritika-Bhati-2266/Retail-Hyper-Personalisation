import React, { useState, useEffect } from 'react';
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
  X,
  Compass
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
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll listener to shrink navbar and change opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          color: 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple dark:text-purple-300 hover:bg-brand-purple/15' 
        };
      case 'fashion_lovers':
        return { 
          label: 'Trendsetter', 
          icon: <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-pink" />, 
          color: 'bg-brand-pink/10 border-brand-pink/20 text-brand-pink dark:text-pink-300 hover:bg-brand-pink/15' 
        };
      case 'bargain_hunters':
        return { 
          label: 'Bargain Hunter', 
          icon: <Tag className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />, 
          color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/15' 
        };
      default:
        return { 
          label: 'Welcomed Guest', 
          icon: <Smile className="w-3.5 h-3.5 mr-1.5 text-brand-indigo" />, 
          color: 'bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo dark:text-indigo-300 hover:bg-brand-indigo/15' 
        };
    }
  };

  const badge = getSegmentBadge();
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * (1 - (item.product.discountPercent || 0) / 100)) * item.quantity, 0);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-500 border-b ${
      isScrolled 
        ? 'h-14 bg-bg-primary/80 backdrop-blur-xl border-border-custom shadow-lg shadow-black/5 dark:shadow-black/20' 
        : 'h-16 bg-bg-primary/40 backdrop-blur-md border-border-custom/50'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 relative z-10">
            <span className="text-xl font-extrabold font-display tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent hover:opacity-90 transition duration-300">
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
              className="w-full h-10 px-4 pl-11 rounded-full bg-bg-secondary/60 border border-border-custom text-xs font-medium text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/40 focus:bg-bg-secondary transition-all duration-300"
            />
            <Search className="absolute left-4 top-3 w-4 h-4 text-text-muted" />
          </form>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Real-time segment indicator */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowAffinities(!showAffinities);
                  setShowCart(false);
                }}
                className={`flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 cursor-pointer active:scale-95 ${badge.color}`}
              >
                {badge.icon}
                <span className="hidden sm:inline">{badge.label}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>

              {/* Affinity Details Dropdown */}
              {showAffinities && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-border-custom bg-bg-secondary/90 backdrop-blur-xl p-5 shadow-2xl animate-scale-in">
                  <div className="flex items-center justify-between mb-4 border-b border-border-custom/40 pb-2">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Interest Profile
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 font-bold uppercase">
                      Active
                    </span>
                  </div>
                  {Object.keys(categoryAffinity).length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-xs text-text-secondary font-medium">No behavior profile detected yet.</p>
                      <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">Interact with products (clicks, carting, queries) to train the hyper-personalization engine.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {Object.entries(categoryAffinity).map(([category, score]) => (
                        <div key={category} className="group">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-primary font-bold group-hover:text-brand-indigo transition duration-300 capitalize">{category}</span>
                            <span className="text-brand-indigo font-bold">{score} pts</span>
                          </div>
                          <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-custom/40">
                            <div 
                              className="bg-gradient-to-r from-brand-indigo to-brand-purple h-full rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${Math.min(100, (score / 15) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 border-t border-border-custom/50 pt-3 text-[9px] text-text-muted leading-relaxed">
                    AI updates vectors instantly based on:
                    <div className="grid grid-cols-3 gap-1 mt-2 font-mono text-[8px] text-center">
                      <div className="bg-bg-primary/50 py-0.5 rounded border border-border-custom/30 text-text-secondary">Click +1</div>
                      <div className="bg-bg-primary/50 py-0.5 rounded border border-border-custom/30 text-text-secondary">Cart +5</div>
                      <div className="bg-bg-primary/50 py-0.5 rounded border border-border-custom/30 text-text-secondary">Buy +10</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light mode switch */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-text-secondary hover:bg-bg-secondary/80 hover:text-brand-indigo active:scale-95 transition-all duration-300 cursor-pointer relative overflow-hidden group border border-transparent hover:border-border-custom/50"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className="transition-transform duration-500 group-hover:rotate-45">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </div>
            </button>

            {/* Admin Dashboard */}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="p-2.5 rounded-xl text-text-secondary hover:bg-bg-secondary/80 hover:text-brand-indigo transition-all border border-transparent hover:border-border-custom/50"
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
                className="p-2.5 rounded-xl text-text-secondary hover:bg-bg-secondary/80 hover:text-brand-indigo active:scale-95 transition-all relative cursor-pointer border border-transparent hover:border-border-custom/50"
              >
                <ShoppingBag className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-pink text-[9px] font-extrabold text-white shadow-sm shadow-brand-pink/50 animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Shopping Cart Dropdown */}
              {showCart && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border-custom bg-bg-secondary/90 backdrop-blur-xl p-5 shadow-2xl animate-scale-in">
                  <div className="flex items-center justify-between mb-4 border-b border-border-custom/40 pb-2">
                    <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-brand-indigo" />
                      Shopping Bag
                    </h3>
                    <span className="text-[10px] text-text-muted font-medium bg-bg-primary px-2.5 py-0.5 rounded-full border border-border-custom">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </div>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-8 h-8 text-text-muted/30 mx-auto mb-2.5" />
                      <p className="text-xs text-text-secondary font-medium">Your bag is empty.</p>
                      <p className="text-[10px] text-text-muted mt-1 leading-normal">Add products to your cart to checkout.</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto space-y-3.5 mb-4 pr-1 scrollbar-thin">
                        {cart.map((item) => {
                          const discPrice = item.product.price * (1 - (item.product.discountPercent || 0) / 100);
                          return (
                            <div key={item.product._id} className="flex justify-between items-center gap-3 group animate-scale-in">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="w-11 h-11 object-cover rounded-xl bg-bg-primary border border-border-custom/60 group-hover:border-brand-indigo/30 transition duration-300"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-indigo transition truncate">{item.product.name}</h4>
                                <p className="text-[10px] text-text-secondary mt-0.5">Qty: {item.quantity} × <strong className="text-text-primary">${discPrice.toFixed(2)}</strong></p>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.product._id)}
                                className="text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 p-1.5 rounded-lg transition cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t border-border-custom/50 pt-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-secondary font-medium">Subtotal:</span>
                          <span className="font-extrabold text-brand-pink text-base">${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          checkout();
                          setShowCart(false);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-indigo-600 hover:to-purple-600 active:scale-98 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-brand-indigo/20 hover:shadow-brand-indigo/35 cursor-pointer"
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
                  <span className="text-xs text-text-secondary font-bold">{user.username}</span>
                  <button 
                    onClick={logout}
                    className="p-2 rounded-xl text-text-secondary hover:text-brand-pink hover:bg-brand-pink/5 transition cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-bg-secondary hover:bg-bg-secondary/80 border border-border-custom text-text-primary transition-all duration-300"
                >
                  <User className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2.5 rounded-xl text-text-secondary hover:bg-bg-secondary/80 md:hidden cursor-pointer border border-transparent hover:border-border-custom/50"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu side-drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-border-custom bg-bg-primary/95 backdrop-blur-xl px-4 py-6 space-y-6 shadow-2xl animate-scale-in">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-11 px-4 pl-11 rounded-xl bg-bg-secondary border border-border-custom text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo/30"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
          </form>

          {/* User profile list */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-indigo" />
              Account & Session
            </h4>
            {user ? (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-secondary border border-border-custom/60 shadow-sm">
                <div>
                  <p className="text-xs font-extrabold text-text-primary">{user.username}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{user.email}</p>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink border border-brand-pink/20 text-xs font-bold transition-all duration-300 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-extrabold shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/35 transition duration-300"
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
