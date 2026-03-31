import React, { useState } from 'react';
import { ShoppingCart, LayoutDashboard, Package, Users, Receipt, BarChart3, LogOut, Sun, Moon } from 'lucide-react';
import apiService from './utils/apiService';

// Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Sales from './components/Sales';
import Reports from './components/Reports';
import POS from './components/POS';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  // Auth form state
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    // Restore session from localStorage
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user) {
      apiService.token = token;
      setIsAuthenticated(true);
      setIsAdmin(user.role === 'admin');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError('');
    setAuthSuccess('');
  };

  // ── Login ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const data = await apiService.login(email, password);
      apiService.setToken(data.token);
      localStorage.setItem('user', JSON.stringify({ role: data.role, name: data.name }));
      setIsAdmin(data.role === 'admin');
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const name = e.target.regName.value.trim();
    const email = e.target.regEmail.value.trim();
    const password = e.target.regPassword.value;
    const confirmPassword = e.target.regConfirm.value;
    const role = e.target.regRole.value;

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      await apiService.register({ name, email, password, role });
      setAuthSuccess(`✓ Account created for ${name}! Redirecting to sign in...`);
      e.target.reset();
      setTimeout(() => switchMode('login'), 2200);
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────
  const handleLogout = () => {
    apiService.clearToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthMode('login');
    setAuthError('');
    setAuthSuccess('');
  };

  // ── Page router ────────────────────────────────────────
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} isAdmin={isAdmin} />;
      case 'inventory': return <Inventory isAdmin={isAdmin} />;
      case 'customers': return <Customers isAdmin={isAdmin} />;
      case 'sales':     return <Sales isAdmin={isAdmin} />;
      case 'reports':   return isAdmin ? <Reports /> : <Dashboard setActivePage={setActivePage} isAdmin={isAdmin} />;
      case 'pos':       return <POS />;
      default:
        return (
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p>Page {activePage} not found.</p>
          </div>
        );
    }
  };

  // ══════════════════════════════════════════════════════
  // AUTH SCREEN
  // ══════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div id="authContainer" className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <video autoPlay muted loop id="authVideo" className="absolute inset-0 w-full h-full object-cover -z-20">
          <source src="/assets/image/Opticalshop.mp4" type="video/mp4" />
        </video>
        <div id="authOverlay" className="absolute inset-0 bg-slate-900/70 backdrop-blur-md -z-10"></div>

        <div className="w-full max-w-md p-4">
          <div className="auth-card p-8 space-y-5">

            {/* Branding */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-1 text-slate-400 text-sm">
                {authMode === 'login' ? 'Sign in to OptiManager' : 'Register a new team member'}
              </p>
            </div>

            {/* Mode toggle tabs */}
            <div className="flex rounded-lg overflow-hidden border border-white/20">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  authMode === 'login'
                    ? 'bg-white/20 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  authMode === 'register'
                    ? 'bg-white/20 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Register
              </button>
            </div>

            {/* ── LOGIN FORM ── */}
            {authMode === 'login' && (
              <form className="space-y-4" onSubmit={handleLogin}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  className="glowing-input w-full"
                />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Password"
                  className="glowing-input w-full"
                />
                {authError && (
                  <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn btn-primary w-full !py-3"
                >
                  {authLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <p className="text-center text-slate-400 text-xs">
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-[hsl(var(--c-primary))] hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {authMode === 'register' && (
              <form className="space-y-3" onSubmit={handleRegister}>
                <input
                  type="text"
                  name="regName"
                  required
                  placeholder="Full name"
                  className="glowing-input w-full"
                />
                <input
                  type="email"
                  name="regEmail"
                  required
                  placeholder="Email address"
                  className="glowing-input w-full"
                />
                <input
                  type="password"
                  name="regPassword"
                  required
                  placeholder="Password (min 6 chars)"
                  className="glowing-input w-full"
                />
                <input
                  type="password"
                  name="regConfirm"
                  required
                  placeholder="Confirm password"
                  className="glowing-input w-full"
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1 ml-1">Role</label>
                  <select name="regRole" className="glowing-input w-full" defaultValue="employee">
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                {authError && (
                  <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
                    {authError}
                  </p>
                )}
                {authSuccess && (
                  <p className="text-green-400 text-sm text-center bg-green-500/10 rounded-lg py-2 px-3">
                    {authSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn btn-primary w-full !py-3"
                >
                  {authLoading ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="text-center text-slate-400 text-xs">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[hsl(var(--c-primary))] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // MAIN APP
  // ══════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <aside className="sidebar fixed top-4 left-4 bottom-4 w-64 p-4 z-40">
        <div className="glass-card flex flex-col h-full p-4">
          <div className="sidebar-header flex items-center gap-3 p-4 border-b border-[hsl(var(--c-border))]">
            <h1 className="text-xl font-bold">OptiManager</h1>
          </div>
          <nav className="sidebar-nav flex-1 space-y-1 mt-4">
            <button onClick={() => setActivePage('pos')} className={`nav-link w-full flex items-center gap-3 px-4 py-2 ${activePage === 'pos' ? 'active' : ''}`}><ShoppingCart className="w-5 h-5"/><span>Point of Sale</span></button>
            <button onClick={() => setActivePage('dashboard')} className={`nav-link w-full flex items-center gap-3 px-4 py-2 ${activePage === 'dashboard' ? 'active' : ''}`}><LayoutDashboard className="w-5 h-5"/><span>Dashboard</span></button>
            <button onClick={() => setActivePage('inventory')} className={`nav-link w-full flex items-center gap-3 px-4 py-2 ${activePage === 'inventory' ? 'active' : ''}`}><Package className="w-5 h-5"/><span>Inventory</span></button>
            <button onClick={() => setActivePage('customers')} className={`nav-link w-full flex items-center gap-3 px-4 py-2 ${activePage === 'customers' ? 'active' : ''}`}><Users className="w-5 h-5"/><span>Customers</span></button>
            <button onClick={() => setActivePage('sales')} className={`nav-link w-full flex items-center gap-3 px-4 py-2 ${activePage === 'sales' ? 'active' : ''}`}><Receipt className="w-5 h-5"/><span>Sales</span></button>
            {isAdmin && (
              <button onClick={() => setActivePage('reports')} className={`nav-link w-full flex items-center gap-3 px-4 py-2 ${activePage === 'reports' ? 'active' : ''}`}><BarChart3 className="w-5 h-5"/><span>Reports</span></button>
            )}
          </nav>
          <div className="sidebar-footer mt-auto border-t border-[hsl(var(--c-border))] pt-4">
            <button
              onClick={handleLogout}
              className="nav-link w-full !justify-start hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="w-5 h-5"/><span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content ml-[18rem] p-4">
        <header className="header sticky top-4 z-30 mb-6">
          <div className="glass-card p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold capitalize">{activePage.replace('-', ' ')}</h1>
            <button onClick={toggleTheme} className="btn-icon">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="main-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
