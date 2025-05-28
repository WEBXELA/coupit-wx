import React, { useState, useEffect } from 'react';
import { Menu, X, Target, User, LogOut, ChevronDown, Unlink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { revokeSquareToken } from '../../lib/square';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('email, square_merchant_id, square_token_expires_at')
        .eq('id', user.id)
        .single();
      
      if (data?.square_merchant_id) {
        setConnectedAccount(data);
      }
    }
  };

  const handleDisconnectSquare = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // First try to revoke the token
      try {
        await revokeSquareToken(user.id);
      } catch (revokeError: any) {
        console.error('Error revoking token:', revokeError);
        // If token revocation fails, we'll still try to clear the local data
      }

      // Clear the local data regardless of token revocation success
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          square_access_token: null,
          square_refresh_token: null,
          square_token_expires_at: null,
          square_merchant_id: null,
          square_environment: null,
          square_connected_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      setConnectedAccount(null);
      
      // Show success message
      alert('Square account disconnected successfully');
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error('Error disconnecting Square account:', error);
      alert(`Failed to disconnect Square account: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setConnectedAccount(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed w-full z-50 bg-[#f7f7f7] border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <Target className="w-8 h-8 text-[#1A1A1C]" />
            <span className="text-2xl font-bold text-[#2B2C30]">Coupit.</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/contact" className="text-[#2B2C30] hover:text-[#1A1A1C] px-4 py-2">Contact Us</Link>
            <Link to="/pricing" className="text-[#2B2C30] hover:text-[#1A1A1C] px-4 py-2">Pricing</Link>
            {!isAuthenticated ? (
              <Link 
                to="/square/onboarding" 
                className="primary-button"
              >
                Get Started
              </Link>
            ) : (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  aria-label="Account menu"
                >
                  <div className="bg-[#2B2C30] p-2 rounded-full">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#2B2C30]" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-[#2B2C30]">{connectedAccount?.email}</p>
                    <p className="text-sm text-gray-500">
                      Merchant ID: {connectedAccount?.square_merchant_id || 'Not available'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Connected: {connectedAccount?.square_token_expires_at ? new Date(connectedAccount.square_token_expires_at).toLocaleString() : 'Not connected'}
                    </p>
                  </div>
                  <div className="p-2 space-y-1">
                    {connectedAccount?.square_merchant_id && (
                      <button
                        onClick={handleDisconnectSquare}
                        disabled={loading}
                        className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                      >
                        <Unlink className="w-5 h-5" />
                        {loading ? 'Disconnecting...' : 'Disconnect Square'}
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#2B2C30]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col gap-4">
              <button onClick={() => handleNavigation('/contact')} className="text-[#2B2C30] hover:text-[#1A1A1C] px-4 py-2">Contact Us</button>
              <button onClick={() => handleNavigation('/pricing')} className="text-[#2B2C30] hover:text-[#1A1A1C] px-4 py-2">Pricing</button>
              {!isAuthenticated ? (
                <button onClick={() => handleNavigation('/square/onboarding')} className="primary-button w-full text-center">Get Started</button>
              ) : connectedAccount && (
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <p className="font-medium text-[#2B2C30] mb-2">{connectedAccount.email}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Merchant ID: {connectedAccount.square_merchant_id || 'Not available'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Connected: {new Date(connectedAccount.square_token_expires_at).toLocaleString()}
                  </p>
                  {connectedAccount.square_merchant_id && (
                    <button
                      onClick={handleDisconnectSquare}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 mb-2"
                    >
                      <Unlink className="w-5 h-5" />
                      {loading ? 'Disconnecting...' : 'Disconnect Square'}
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}