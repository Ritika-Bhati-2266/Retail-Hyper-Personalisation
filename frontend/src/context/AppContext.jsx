import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE_URL = "https://retail-hyper-personalisation-new.onrender.com/api";
// Generate session ID if not already present
const getOrCreateSessionId = () => {
  let sId = localStorage.getItem('retail_session_id');
  if (!sId) {
    sId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('retail_session_id', sId);
  }
  return sId;
};

export const AppProvider = ({ children }) => {
  const [sessionId] = useState(getOrCreateSessionId);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('retail_token') || null);
  const [currentSegment, setCurrentSegment] = useState('new_users');
  const [categoryAffinity, setCategoryAffinity] = useState({});
  const [cart, setCart] = useState([]);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('retail_theme') || 'dark');

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('retail_theme', next);
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  
  // Catalogs and personal lists
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set up Authorization headers
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. Log behavior event to backend and update segment state in real time
  const logBehavior = async (eventType, details = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/behaviors/log`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sessionId,
          eventType,
          details
        })
      });
      const data = await response.json();
      if (data.success) {
        if (data.segment) {
          setCurrentSegment(data.segment);
        }
        if (data.affinity) {
          setCategoryAffinity(data.affinity);
        }
        // Refresh personalized lists
        fetchPersonalizedData();
      }
    } catch (err) {
      console.error('Failed to log behavioral event:', err);
    }
  };

  // 2. Fetch products catalog
  const fetchProducts = async (category = '') => {
    setLoading(true);
    try {
      const url = category 
        ? `${API_BASE_URL}/products?category=${category}`
        : `${API_BASE_URL}/products`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Could not load products. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Search products and log search event
  const searchProducts = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setProducts(data);
      
      // Log search behavior
      logBehavior('search', { queryText: query });
    } catch (err) {
      console.error('Search query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch user-specific recommendations & banners
  const fetchPersonalizedData = async () => {
    if (!sessionId) return;
    try {
      // Fetch recommendations
      const recResponse = await fetch(`${API_BASE_URL}/products/recommendations?sessionId=${sessionId}`, {
        headers: getHeaders()
      });
      const recData = await recResponse.json();
      if (Array.isArray(recData)) {
        setRecommendations(recData);
      }

      // Fetch dynamic offers
      const offResponse = await fetch(`${API_BASE_URL}/offers?sessionId=${sessionId}`, {
        headers: getHeaders()
      });
      const offData = await offResponse.json();
      if (Array.isArray(offData)) {
        setOffers(offData);
      }
    } catch (err) {
      console.error('Failed to load personalized content:', err);
    }
  };

  // 5. Auth operations
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('retail_token', data.token);
      localStorage.setItem('retail_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Log login event
      logBehavior('click', { action: 'user_login', userEmail: email });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      localStorage.setItem('retail_token', data.token);
      localStorage.setItem('retail_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Log registration click event
      logBehavior('click', { action: 'user_registered', userEmail: email });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('retail_token');
    localStorage.removeItem('retail_user');
    setToken(null);
    setUser(null);
    setCurrentSegment('new_users');
    setCategoryAffinity({});
    setRecommendations([]);
    setOffers([]);
  };

  const verifyToken = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      logout();
    }
  };

  // 6. Cart functions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Log cart additions for recommendation scoring
    logBehavior('cart', {
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const checkout = async () => {
    // Log purchase events for all cart items
    for (const item of cart) {
      await logBehavior('purchase', {
        productId: item.product._id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      });
    }
    setCart([]);
    alert('Purchase completed successfully! Your preference profile has updated to match your new order!');
  };

  // Clear demo data helper
  const clearDemoData = async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/behaviors/clear`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) {
        setCurrentSegment('new_users');
        setCategoryAffinity({});
        setCart([]);
        fetchProducts();
        fetchPersonalizedData();
        alert('Behavior logs cleared! Experience reset to guest baseline.');
      }
    } catch (err) {
      console.error('Failed to reset behaviors:', err);
    }
  };

  // Initialize and verify authentication on boot
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem('retail_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (token) {
        await verifyToken();
      }
      fetchProducts();
      fetchPersonalizedData();
    };
    restoreSession();
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        sessionId,
        user,
        token,
        currentSegment,
        categoryAffinity,
        cart,
        products,
        recommendations,
        offers,
        loading,
        error,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        fetchProducts,
        searchProducts,
        logBehavior,
        addToCart,
        removeFromCart,
        checkout,
        clearDemoData,
        refreshPersonalization: fetchPersonalizedData,
        apiBaseUrl: API_BASE_URL
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
