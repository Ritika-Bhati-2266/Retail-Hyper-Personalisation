import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE_URL = "https://retail-hyper-personalisation-new.onrender.com/api";

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
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    try {
      const res = await fetch(
        `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);

      // fire and forget (don’t block UI)
      logBehavior('search', { queryText: query });
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PERSONALIZATION
  // =========================
  const fetchPersonalizedData = async () => {
    try {
      const recRes = await fetch(
        `${API_BASE_URL}/products/recommendations?sessionId=${sessionId}`,
        { headers: getHeaders() }
      );
      const recData = await recRes.json();

      if (Array.isArray(recData)) setRecommendations(recData);

      const offRes = await fetch(
        `${API_BASE_URL}/offers?sessionId=${sessionId}`,
        { headers: getHeaders() }
      );
      const offData = await offRes.json();

      if (Array.isArray(offData)) setOffers(offData);
    } catch (err) {
      console.log("Personalization error:", err.message);
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

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const init = async () => {
      fetchProducts();
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);