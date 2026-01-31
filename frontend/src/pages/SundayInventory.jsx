import { useState, useEffect } from 'react';
import axios from 'axios';
import { productService } from '../services/product/productService';
import {
  Package, PlusCircle, Search, Database, Loader2,
  CheckCircle2, AlertCircle, TrendingUp, Activity, Sandwich, Trash2
} from 'lucide-react';

function SundayInventory() {
  const [formData, setFormData] = useState({ userName: '', product_name: '', amount: 0 });
  const [products, setProducts] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [totalAmount, setTotalAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [error, setError] = useState(null);
  const [isDbLive, setIsDbLive] = useState(false);

  useEffect(() => {
    fetchProducts();

    const checkDbHealth = async () => {
      try {
        const response = await axios.get('http://localhost:30001/health');
        setIsDbLive(response.data.status === 'connected');
      } catch (err) {
        setIsDbLive(false);
      }
    };

    checkDbHealth();
    const interval = setInterval(checkDbHealth, 5000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchProducts() {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await productService.createProduct(formData);
      if (result.success) {
        setSuccessMsg(true);
        setFormData({ userName: '', product_name: '', amount: 0 });
        fetchProducts();
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(name) {
    try {
      const result = await productService.deleteProduct(name);
      if (result.success) {
        setProducts(products.filter(p => p.product_name !== name));
      }
    } catch (err) {
      setError("Failed to delete product.");
    }
  }

  async function handleCheckStock() {
    if (!searchName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAmountByName(searchName);
      setTotalAmount(data.amount);
    } catch (err) {
      setError("Could not fetch stock data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/11 min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20 rotate-3">
              <Sandwich />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Sunday<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Inventory</span>
              </h1>
              <p style={{ marginTop: '7.5px' }} className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Management System v1.2</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 bg-slate-800/40 backdrop-blur-md border px-5 py-2.5 rounded-2xl transition-all duration-500 ${isDbLive ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${isDbLive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              {isDbLive && (
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isDbLive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isDbLive ? 'Postgres Connected' : 'Postgres Offline'}
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-8 md:p-10 shadow-2xl transition-all hover:border-blue-500/30">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Add A New Product</h2>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">User Name</label>
                    <input required className="w-full px-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input required className="w-full px-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                  <input type="number" required className="w-full px-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white text-xl font-mono" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })} />
                </div>
                <button disabled={loading} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><Database className="w-5 h-5" />Add Product</>}
                </button>
                {successMsg && (
                  <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 justify-center animate-in zoom-in-95">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold">Transaction Confirmed</span>
                  </div>
                )}
              </form>
            </div>

            <div className="bg-slate-800/20 backdrop-blur-md rounded-[2.5rem] border border-slate-700/30 p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Package className="w-5 h-5 text-slate-400" /> Current Inventory
              </h3>
              <div className="grid gap-3">
                {products.length === 0 ? <p className="text-slate-500 italic text-sm">No items in database.</p> :
                  products.map((p) => (
                    <div key={p.id} className="flex items-center p-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl group hover:border-slate-500 transition-all">
                      <div className="flex-1 text-left">
                        <p className="text-white font-bold leading-tight">{p.product_name}</p>
                        <p className="text-slate-500 text-[12px] font-bold uppercase tracking-wider mt-1">
                          ID: {p.id} • User: {p.user_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-right min-w-[50px]">
                          <span className="text-blue-400 font-mono font-black text-lg">x{p.amount}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(p.product_name)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:border-indigo-500/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Search className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Inventory Lookup</h2>
              </div>
              <div className="space-y-5">
                <input className="w-full px-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-white transition-all" placeholder="Search item..." value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                <button onClick={handleCheckStock} className="w-full py-4 bg-slate-700/50 text-indigo-300 border border-slate-600 font-bold rounded-2xl hover:bg-slate-700 transition-all active:scale-[0.98]">GET Amount</button>
              </div>
              {totalAmount !== null && (
                <div className="mt-8 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 relative overflow-hidden animate-in slide-in-from-top-4">
                  <Activity className="absolute -right-2 -top-2 w-20 h-20 text-blue-500/10" />
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Stock Level</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-white">{totalAmount}</span>
                    <span className="text-blue-400 font-bold text-sm uppercase">Units</span>
                  </div>
                </div>
              )}
            </div>

            <div className="group relative bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20 overflow-hidden">
              <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md mb-6 border border-white/10">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-xl mb-2 tracking-tight">K8s Orchestration</h3>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-medium">
                  Your data is being routed through a Docker-containerized backend and managed by a Kubernetes operator called EtherealPod!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SundayInventory;