import { useState } from "react";
import { signIn, signUp, isFirebaseConfigured } from "../../services/api";
import { Lock, LogIn, UserPlus, Zap, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("ENTER BOTH EMAIL AND PASSWORD.");
      return;
    }
    try {
      setLoading(true);
      await signUp(email, password);
    } catch (err) {
      setError(err.message?.toUpperCase() || "REGISTRATION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("ENTER BOTH EMAIL AND PASSWORD.");
      return;
    }
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (err) {
      setError(err.message?.toUpperCase() || "LOGIN FAILED.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("demo@todoapp.local");
    setPassword("demo123456");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      
      {/* Outer Card Container */}
      <div className="w-full max-w-lg relative my-8">
        
        {/* Floating Sticker Top-Right */}
        <div className="absolute -top-6 -right-3 z-10 bg-[#FF6B6B] text-white border-4 border-black px-3 py-1 font-black text-xs uppercase tracking-widest rotate-6 shadow-[4px_4px_0px_#000] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 fill-white stroke-[2px]" />
          <span>SECURITY // RAW</span>
        </div>

        {/* Main Card */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]">
          
          {/* Card Header */}
          <div className="bg-[#C4B5FD] border-b-4 border-black p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-2 border-2 border-black">
                <Lock className="h-5 w-5 stroke-[3px]" />
              </div>
              <div>
                <h2 className="font-black text-xl tracking-tight uppercase leading-none text-black">
                  USER ACCESS
                </h2>
                <span className="text-xs font-bold uppercase tracking-widest text-black/80">
                  TODO SYSTEM GATEWAY
                </span>
              </div>
            </div>

            <span className="bg-white border-4 border-black px-2.5 py-1 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
              ID: 001
            </span>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Offline Demo Notice */}
            {!isFirebaseConfigured && (
              <div className="bg-[#FFD93D] border-4 border-black p-4 shadow-[4px_4px_0px_#000] -rotate-1">
                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-black">
                  <Zap className="h-4 w-4 fill-black stroke-[2px]" />
                  <span>OFFLINE DEMO ACTIVE</span>
                </div>
                <p className="mt-1.5 text-xs font-bold leading-normal text-black">
                  No Firebase configuration required. Click below to autofill demo credentials and try the app immediately:
                </p>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="btn-neo bg-white text-black border-4 border-black mt-3 px-3 py-2 text-xs font-black uppercase tracking-wider w-full shadow-[3px_3px_0px_#000]"
                >
                  ⚡ AUTOFILL DEMO CREDENTIALS
                </button>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="bg-[#FF6B6B] text-white border-4 border-black p-3.5 font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#000] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 stroke-[3px] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={login} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <label className="block font-black text-xs uppercase tracking-wider text-black">
                  EMAIL ADDRESS:
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-neo"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <label className="block font-black text-xs uppercase tracking-wider text-black">
                  PASSWORD:
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-neo"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neo bg-[#FFD93D] text-black w-full py-4 text-sm font-black tracking-wider shadow-[4px_4px_0px_#000]"
                >
                  <LogIn className="h-4 w-4 stroke-[3px]" />
                  <span>{loading ? "AUTHENTICATING..." : "LOGIN TO DASHBOARD"}</span>
                </button>

                <button
                  type="button"
                  onClick={register}
                  disabled={loading}
                  className="btn-neo bg-white text-black w-full py-3 text-xs font-black tracking-wider border-4 border-black shadow-[4px_4px_0px_#000]"
                >
                  <UserPlus className="h-4 w-4 stroke-[3px]" />
                  <span>CREATE NEW ACCOUNT</span>
                </button>
              </div>

            </form>

          </div>

          {/* Card Footer Banner */}
          <div className="bg-[#FFFDF5] border-t-4 border-black px-4 py-3 text-xs font-black text-black/70 uppercase tracking-widest text-center flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 stroke-[2px]" />
            <span>NEO-BRUTALIST PROTOCOL v2</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Auth;