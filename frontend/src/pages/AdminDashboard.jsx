import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { 
  Users, 
  ShoppingBag, 
  Tag, 
  Activity, 
  Plus, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Info,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, apiBaseUrl, clearDemoData } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, offers

  // Form states for creating a product
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCat, setProdCat] = useState('Electronics');
  const [prodImg, setProdImg] = useState('');
  const [prodTags, setProdTags] = useState('');
  const [prodDisc, setProdDisc] = useState('0');
  const [prodStock, setProdStock] = useState('10');

  // Form states for creating an offer
  const [offTitle, setOffTitle] = useState('');
  const [offDesc, setOffDesc] = useState('');
  const [offCode, setOffCode] = useState('');
  const [offSeg, setOffSeg] = useState('all');
  const [offImg, setOffImg] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/analytics`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: prodName,
          description: prodDesc,
          price: prodPrice,
          category: prodCat,
          image: prodImg || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
          tags: prodTags,
          discountPercent: prodDisc,
          stock: prodStock
        })
      });

      if (response.ok) {
        alert('Product added to catalog successfully!');
        setProdName('');
        setProdDesc('');
        setProdPrice('');
        setProdImg('');
        setProdTags('');
        setProdDisc('0');
        setProdStock('10');
        fetchAnalytics();
      } else {
        const error = await response.json();
        alert(`Failed to add product: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl}/admin/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: offTitle,
          description: offDesc,
          discountCode: offCode,
          targetSegment: offSeg,
          bannerImage: offImg || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000'
        })
      });

      if (response.ok) {
        alert('Segmented promo banner launched successfully!');
        setOffTitle('');
        setOffDesc('');
        setOffCode('');
        setOffImg('');
        fetchAnalytics();
      } else {
        const error = await response.json();
        alert(`Failed to launch offer: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <RefreshCw className="w-8 h-8 text-brand-indigo animate-spin" />
        </div>
      </div>
    );
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'click':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      case 'cart':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      case 'purchase':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      case 'search':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-500';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  const getSegmentLabel = (seg) => {
    switch (seg) {
      case 'electronics_lovers': return 'Tech Enthusiast';
      case 'fashion_lovers': return 'Trendsetter';
      case 'bargain_hunters': return 'Bargain Hunter';
      default: return 'New User';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="gradient-glow-orb top-[-100px] left-[-50px] w-[350px] h-[350px] bg-brand-indigo/10" />

      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-text-primary">Hyper-Personalisation Admin</h1>
            <p className="text-xs text-text-secondary mt-1">Review tracking events, affinity profiles, and catalogs.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAnalytics}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-bg-secondary border border-border-custom text-text-primary hover:bg-bg-secondary/80 cursor-pointer transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stats</span>
            </button>
            <button 
              onClick={clearDemoData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 cursor-pointer transition animate-pulse shadow-sm"
              title="Wipe behavior profiles to reset sandbox"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Sandbox</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-custom">
          {['overview', 'products', 'offers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-semibold capitalize border-b-2 cursor-pointer transition ${
                activeTab === tab ? 'border-brand-indigo text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Customers</p>
                  <h3 className="text-xl font-bold mt-1 text-text-primary">{analytics?.summary.totalUsers}</h3>
                </div>
                <div className="p-3 rounded-xl bg-brand-indigo/10 text-brand-indigo">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Products</p>
                  <h3 className="text-xl font-bold mt-1 text-text-primary">{analytics?.summary.totalProducts}</h3>
                </div>
                <div className="p-3 rounded-xl bg-brand-pink/10 text-brand-pink">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Active Banners</p>
                  <h3 className="text-xl font-bold mt-1 text-text-primary">{analytics?.summary.totalOffers}</h3>
                </div>
                <div className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple">
                  <Tag className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Behavior logs</p>
                  <h3 className="text-xl font-bold mt-1 text-text-primary">{analytics?.summary.totalEvents}</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Visual Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Category distribution */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 flex flex-col gap-4 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-indigo" />
                  <span>Category Affinity Distribution</span>
                </h3>
                
                {analytics?.categoryDistribution.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">No categories views tracked yet.</p>
                ) : (
                  <div className="space-y-3.5 flex-1">
                    {analytics?.categoryDistribution.map((item) => {
                      const maxVal = Math.max(...analytics.categoryDistribution.map(c => c.value), 1);
                      const pct = (item.value / maxVal) * 100;
                      return (
                        <div key={item.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary font-medium">{item.name}</span>
                            <span className="text-brand-indigo font-bold">{item.value} weight</span>
                          </div>
                          <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-custom/30">
                            <div 
                              className="bg-brand-indigo h-full rounded-full transition-all duration-500" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Segment distributions */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 flex flex-col gap-4 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-pink" />
                  <span>Customer Segmentation Summary</span>
                </h3>
                
                <div className="space-y-3.5 flex-1">
                  {analytics?.segmentDistribution.map((item) => {
                    const maxVal = Math.max(...analytics.segmentDistribution.map(s => s.value), 1);
                    const pct = (item.value / maxVal) * 100;
                    return (
                      <div key={item.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary font-medium">{getSegmentLabel(item.name)}</span>
                          <span className="text-brand-pink font-bold">{item.value} users</span>
                        </div>
                        <div className="w-full bg-bg-primary h-2 rounded-full overflow-hidden border border-border-custom/30">
                          <div 
                            className="bg-brand-pink h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Searches */}
              <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 flex flex-col gap-4 shadow-sm">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-purple" />
                  <span>Popular Search Queries</span>
                </h3>
                
                {analytics?.popularSearches.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">No search terms tracked yet.</p>
                ) : (
                  <div className="space-y-3 flex-1">
                    {analytics?.popularSearches.map((item) => (
                      <div key={item.term} className="flex items-center justify-between text-xs py-1.5 border-b border-border-custom/50">
                        <span className="font-mono text-text-primary font-medium">"{item.term}"</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[10px]">
                          {item.count} searches
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Real-time Tracking Feed */}
            <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Live Event Tracking Stream</span>
              </h3>

              {analytics?.recentLogs.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">No events tracked. Go browse products to see real-time updates.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-text-secondary">
                    <thead>
                      <tr className="border-b border-border-custom text-text-muted font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Time</th>
                        <th className="py-2.5">Event</th>
                        <th className="py-2.5">Session ID</th>
                        <th className="py-2.5">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom/50">
                      {analytics?.recentLogs.map((log) => {
                        const time = new Date(log.timestamp || log.createdAt).toLocaleTimeString();
                        return (
                          <tr key={log._id} className="hover:bg-bg-secondary/35 transition-colors">
                            <td className="py-3 text-text-muted">{time}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getEventBadge(log.eventType)}`}>
                                {log.eventType}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-text-muted text-[10px] truncate max-w-[120px]">{log.sessionId}</td>
                            <td className="py-3 text-text-primary truncate max-w-sm">
                              {log.eventType === 'search' && `Searched "${log.details?.queryText}"`}
                              {log.eventType === 'click' && `Clicked product "${log.details?.name}"`}
                              {log.eventType === 'cart' && `Added "${log.details?.name}" to Cart`}
                              {log.eventType === 'purchase' && `Bought "${log.details?.name}" × ${log.details?.quantity || 1}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Product Form */}
            <div className="md:col-span-2 rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 space-y-4 shadow-sm animate-scale-in">
              <h3 className="text-sm font-semibold text-text-primary">Catalog Insertion Form</h3>
              
              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroPod Max"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Category</label>
                    <select
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary font-semibold">Description</label>
                  <textarea
                    required
                    placeholder="Enter key features, metrics, design materials..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    rows="3"
                    className="w-full p-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Discount (%)</label>
                    <input
                      type="number"
                      value={prodDisc}
                      onChange={(e) => setProdDisc(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Stock Quantity</label>
                    <input
                      type="number"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary font-semibold">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={prodImg}
                    onChange={(e) => setProdImg(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary font-semibold">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="audio, premium, bluetooth"
                    value={prodTags}
                    onChange={(e) => setProdTags(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-xl font-semibold shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Product</span>
                </button>
              </form>
            </div>

            {/* Tips panel */}
            <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 space-y-4 shadow-sm animate-scale-in">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1">
                <Info className="w-4 h-4 text-brand-indigo" />
                <span>Simulation Rules</span>
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add products under specific categories. When customer sessions click on these products in the catalog, their <strong>Category Affinity vectors</strong> increase in weight.
              </p>
              <p className="text-xs text-text-secondary leading-relaxed">
                Provide matching tags (e.g. <code>premium</code>, <code>runners</code>, <code>cinema</code>). Tag matches can boost products in recommendations if the terms are queried in the search bar.
              </p>
            </div>

          </div>
        )}

        {activeTab === 'offers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Offer Form */}
            <div className="md:col-span-2 rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 space-y-4 shadow-sm animate-scale-in">
              <h3 className="text-sm font-semibold text-text-primary">Segmented Promo Campaign Creator</h3>
              
              <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Offer Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Watch Promotion"
                      value={offTitle}
                      onChange={(e) => setOffTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Target Segment</label>
                    <select
                      value={offSeg}
                      onChange={(e) => setOffSeg(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    >
                      <option value="all">All Visitors</option>
                      <option value="electronics_lovers">Tech Enthusiast</option>
                      <option value="fashion_lovers">Trendsetter</option>
                      <option value="bargain_hunters">Bargain Hunter</option>
                      <option value="new_users">New Customers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary font-semibold">Campaign Description</label>
                  <textarea
                    required
                    placeholder="Enter voucher description, why they qualify, terms..."
                    value={offDesc}
                    onChange={(e) => setOffDesc(e.target.value)}
                    rows="3"
                    className="w-full p-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Voucher Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WATCH20"
                      value={offCode}
                      onChange={(e) => setOffCode(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo uppercase font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-text-secondary font-semibold">Banner Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={offImg}
                      onChange={(e) => setOffImg(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-bg-secondary border border-border-custom text-text-primary focus:outline-none focus:border-brand-indigo"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-xl font-semibold shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch Campaign</span>
                </button>
              </form>
            </div>

            {/* Campaign info */}
            <div className="rounded-2xl border border-border-custom bg-bg-secondary/40 backdrop-blur-md p-6 space-y-4 shadow-sm animate-scale-in">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1">
                <Info className="w-4 h-4 text-brand-indigo" />
                <span>Segment Targeting Mechanics</span>
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Banners launched with specific target segments are sorted first on customer feeds if the user's affinity scores match the segment:
              </p>
              <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
                <li><strong>Tech Enthusiast</strong>: Triggered if Electronics affinity is highest.</li>
                <li><strong>Trendsetter</strong>: Triggered if Fashion affinity is highest.</li>
                <li><strong>Bargain Hunter</strong>: Assigned based on search keywords or clicked discount levels.</li>
              </ul>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
