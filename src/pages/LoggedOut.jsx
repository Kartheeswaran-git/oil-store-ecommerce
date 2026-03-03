import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogIn, ShoppingBag, ArrowRight, Heart } from 'lucide-react';

const LoggedOut = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Optional: auto redirect after some time
        // const timer = setTimeout(() => navigate('/'), 10000);
        // return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full glass-panel border-glass-border shadow-2xl relative overflow-hidden p-12 text-center animate-in fade-in zoom-in duration-700">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>

                <div className="bg-gold-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-gold-500/20">
                    <Shield size={40} className="text-gold-400" />
                </div>

                <h1 className="text-3xl font-display font-black text-text-main mb-4 tracking-wide uppercase">Successfully Logged Out</h1>
                <p className="text-text-main mb-10 leading-relaxed font-medium">
                    Thank you for visiting Premium Oil Store. Your session has been securely ended.
                </p>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
                    >
                        <ShoppingBag size={20} />
                        Return to Store
                    </Link>

                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-text-main py-4 rounded-xl font-bold border border-glass-border transition-all uppercase tracking-widest text-sm"
                    >
                        <LogIn size={20} className="text-gold-400" />
                        Sign In Again
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-glass-border flex flex-col items-center gap-4">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        Made with <Heart size={10} className="text-red-500 fill-red-500" /> for Pure Quality
                    </p>
                </div>
            </div>

            {/* Quick Links Footer */}
            <div className="mt-8 flex gap-8 text-xs font-bold text-gray-600 uppercase tracking-widest transition-opacity duration-300 hover:opacity-100 opacity-60">
                <button onClick={() => navigate('/')} className="hover:text-gold-400 transition-colors">Privacy Policy</button>
                <button onClick={() => navigate('/')} className="hover:text-gold-400 transition-colors">Terms of Service</button>
                <button onClick={() => navigate('/')} className="hover:text-gold-400 transition-colors">Support</button>
            </div>
        </div>
    );
};

export default LoggedOut;
