import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE_URL = (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? "http://localhost:5000/api" : "/api";

// Session ID generator
const getOrCreateSessionId = () => {
  let sId = localStorage.getItem('retail_session_id');
  if (!sId) {
    sId =
      'sess_' +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);

    localStorage.setItem('retail_session_id', sId);
  }
  return sId;
};

export const AppProvider = ({ children }) => {
  const [sessionId] = useState(getOrCreateSessionId);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('retail_token'));
  const [currentSegment, setCurrentSegment] = useState('new_users');
  const [categoryAffinity, setCategoryAffinity] = useState({});
  const [cart, setCart] = useState([]);

  const [theme, setTheme] = useState(
    localStorage.getItem('retail_theme') || 'dark'
  );

  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Centralized search & category filtering state
  const [searchVal, setSearchVal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // theme
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('retail_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  // =========================
  // BEHAVIOR LOGGING
  // =========================
  const logBehavior = async (eventType, details = {}) => {
    try {
      const res = await fetch(`${API_BASE_URL}/behaviors/log`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sessionId,
          eventType,
          details,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        if (data.segment) setCurrentSegment(data.segment);
        if (data.affinity) setCategoryAffinity(data.affinity);

        console.log(
          `%c[Search Debug] 🔄 Behavior event '${eventType}' logged successfully. Refreshing recommendations...`,
          'color: #ec4899; font-weight: bold; font-size: 11px;',
          { segment: data.segment, affinity: data.affinity }
        );

        fetchPersonalizedData();
      }
    } catch (err) {
      console.log("Behavior log failed:", err.message);
    }
  };

  // =========================
  // PRODUCTS
  // =========================
  const fetchProducts = async (category = '') => {
    setLoading(true);
    setError(null);

    try {
      const url = category
        ? `${API_BASE_URL}/products?category=${category}`
        : `${API_BASE_URL}/products`;

      const res = await fetch(url);
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query) => {
    setLoading(true);
    setError(null);
    console.log(
      `%c[Search Debug] 🔍 Initiating search for keyword: "${query}"`,
      'color: #6366f1; font-weight: bold; font-size: 11px;'
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      const matched = Array.isArray(data) ? data : [];

      console.log(
        `%c[Search Debug] ✅ Search found ${matched.length} matching products`,
        'color: #10b981; font-weight: bold; font-size: 11px;',
        matched.map(p => ({ id: p._id, name: p.name, category: p.category, tags: p.tags }))
      );

      setProducts(matched);

      // fire and forget (don’t block UI)
      logBehavior('search', { queryText: query });
    } catch (err) {
      setError("Search failed");
      console.error('[Search Debug] ❌ Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PERSONALIZATION
  // =========================
  const fetchPersonalizedData = async () => {
    setRecLoading(true);
    console.log(
      `%c[Search Debug] 📥 Fetching updated recommendations & personalized offers...`,
      'color: #a78bfa; font-weight: bold; font-size: 11px;'
    );
    try {
      const recRes = await fetch(
        `${API_BASE_URL}/products/recommendations?sessionId=${sessionId}`,
        { headers: getHeaders() }
      );
      const recData = await recRes.json();

      if (Array.isArray(recData)) {
        setRecommendations(recData);
        console.log(
          `%c[Search Debug] ✨ Recommendations updated with ${recData.length} items.`,
          'color: #ec4899; font-weight: bold; font-size: 11px;',
          recData.map(r => ({ id: r._id, name: r.name, reason: r.recommendationReason }))
        );
      }

      const offRes = await fetch(
        `${API_BASE_URL}/offers?sessionId=${sessionId}`,
        { headers: getHeaders() }
      );
      const offData = await offRes.json();

      if (Array.isArray(offData)) setOffers(offData);
    } catch (err) {
      console.log("Personalization error:", err.message);
    } finally {
      setRecLoading(false);
    }
  };

  // =========================
  // AUTH
  // =========================
  const login = async (email, password) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('retail_token', data.token);
      setToken(data.token);
      setUser(data.user);

      logBehavior('login', { email });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('retail_token', data.token);
      setToken(data.token);
      setUser(data.user);

      logBehavior('register', { email });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setCart([]);
    setCurrentSegment('new_users');
  };

  // =========================
  // CART
  // =========================
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(
        (i) => i.product._id === product._id
      );

      if (exists) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    logBehavior('cart', { productId: product._id });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.product._id !== id));
  };

  const checkout = async () => {
    for (const item of cart) {
      await logBehavior('purchase', {
        productId: item.product._id,
        qty: item.quantity,
      });
    }

    setCart([]);
    alert("Order placed successfully 🚀");
  };

  // Centralized debounced search & category filtering
  useEffect(() => {
    const isSearchEmpty = searchVal.trim() === '';
    
    if (isSearchEmpty) {
      fetchProducts(selectedCategory);
    } else {
      setLoading(true); // Immediate loading state for better UX
      const delayDebounce = setTimeout(() => {
        searchProducts(searchVal);
      }, 500); // Slightly longer debounce for smoother experience
      return () => clearTimeout(delayDebounce);
    }
  }, [searchVal, selectedCategory]);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const init = async () => {
      fetchPersonalizedData();
    };
    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        sessionId,
        user,
        token,
        products,
        recommendations,
        recLoading,
        offers,
        loading,
        error,
        currentSegment,
        categoryAffinity,
        cart,
        theme,
        toggleTheme,
        fetchProducts,
        searchProducts,
        logBehavior,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        checkout,
        refreshPersonalization: fetchPersonalizedData,
        searchVal,
        setSearchVal,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);