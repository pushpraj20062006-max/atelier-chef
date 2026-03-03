"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Utensils, AlertTriangle, LogOut, Loader2, Sparkles, Carrot, 
  MessageSquare, Send, Activity, Zap, Heart, GlassWater, Flame, 
  Clock, Play, Pause, RotateCcw, X, Coffee, BookOpen, Download, History, CheckCircle,
  Candy // Added for Sweets
} from 'lucide-react'; 
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { getRecipe, startChatSession, getNutrition } from '../lib/gemini'; 
import { supabase } from '../lib/supabase';

const LOADING_MESSAGES = [
  "Gathering fresh ingredients...",
  "Checking for allergies...",
  "Preheating the virtual oven...",
  "Whisking the data...",
  "Plating your masterpiece..."
];

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  
  // --- AUTH STATES ---
  const [user, setUser] = useState<any>(null);
  
  const [foodType, setFoodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'none' | 'timer' | 'chat'>('none');

  // Persistence States
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);

  // Nutrition & Timer States
  const [nutrition, setNutrition] = useState('');
  const [nutriLoading, setNutriLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isActive, setIsActive] = useState(false);
  const [timerInput, setTimerInput] = useState(0);

  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatSession, setChatSession] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Slideshow State
  const [currentImg, setCurrentImg] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1476500882210-a24835697b33?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80"
  ];

  // Added "Sweets" to the moods array
  const moods = [
    { label: "Flash", value: "quick and easy under 15 minutes", icon: <Zap size={16} />, color: "bg-yellow-400" },
    { label: "Healthy", value: "nutritious and low calorie", icon: <Heart size={16} />, color: "bg-emerald-400" },
    { label: "Fancy", value: "gourmet dinner party style", icon: <GlassWater size={16} />, color: "bg-purple-400" },
    { label: "Comfort", value: "hearty soul food", icon: <Flame size={16} />, color: "bg-orange-400" },
    { label: "Sweets", value: "desserts and sweet treats", icon: <Candy size={16} />, color: "bg-pink-400" },
  ];

  useEffect(() => { 
    setHasMounted(true); 
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error("Auth error:", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(9); // Increased limit for the grid
    if (!error && data) setSavedRecipes(data);
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, isSaved]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    } else {
      setLoadingIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      alert("🍳 Dish is Ready!");
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const cleanText = recipe.replace(/[#*]/g, ''); 
    doc.setFont("helvetica", "bold");
    doc.text(`Chef ${user?.user_metadata.full_name}'s Atelier Recipe`, 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(cleanText, 170);
    doc.text(splitText, 20, 30);
    doc.save(`recipe.pdf`);
  };

  const handleGenerate = async () => {
    if (!ingredients.trim() || !user) return;
    setLoading(true);
    setRecipe(''); 
    setNutrition('');
    setIsSaved(false);
    try {
      const result = await getRecipe(ingredients.split(','), foodType, allergies);
      setRecipe(result);

      const { error } = await supabase.from('recipes').insert([{ 
        title: `${foodType || 'Chef'} Creation`, 
        content: result, 
        ingredients: ingredients.split(','), 
        food_type: foodType, 
        user_email: user.email 
      }]);
      if (!error) setIsSaved(true);

      setChatSession(startChatSession([
        { role: "user", parts: [{ text: ingredients }] }, 
        { role: "model", parts: [{ text: result }] }
      ]));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleGetNutrition = async () => {
    if (!recipe) return;
    setNutriLoading(true);
    try {
      const result = await getNutrition(recipe);
      setNutrition(result);
    } catch (error) { console.error(error); } finally { setNutriLoading(false); }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSession) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);
    try {
      const result = await chatSession.sendMessage(userMsg);
      const responseText = await result.response.text();
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I lost my whisk!" }]);
    } finally { setChatLoading(false); }
  };

  if (!hasMounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/20 shadow-2xl max-w-md w-full text-center">
          <motion.div whileHover={{ rotate: 15 }} className="inline-block bg-gradient-to-tr from-orange-400 to-red-600 p-5 rounded-3xl mb-6 shadow-xl text-white">
            <ChefHat size={48} />
          </motion.div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Atelier <span className="text-orange-500">Chef</span></h1>
          <p className="text-gray-400 mb-8">Elevate your kitchen experience.</p>
          <button onClick={handleLogin} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 hover:bg-orange-50 transition-all active:scale-95">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-32 text-slate-900 selection:bg-orange-100 selection:text-orange-600">
      <div className="h-[55vh] w-full relative overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div key={currentImg} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 0.6, scale: 1.25 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 2 }, scale: { duration: 10, ease: "linear" } }} className="absolute inset-0">
            <img src={heroImages[currentImg]} className="w-full h-full object-cover" alt="Hero" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80" />
        <button onClick={handleLogout} className="absolute top-8 right-8 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold hover:bg-red-500 transition-all flex items-center gap-2 border border-white/20">
          <LogOut size={14} /> Leave Kitchen
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="z-10">
            <span className="px-4 py-1.5 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 rounded-full text-orange-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Premium AI Atelier
            </span>
            <h2 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter drop-shadow-2xl">
              Bienvenue, {user?.user_metadata.full_name?.split(' ')[0]}
            </h2>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-24 px-6 relative z-10">
        {/* Input Card */}
        <motion.div layout className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-14 border border-white overflow-hidden">
          <AnimatePresence mode="wait">
            {!loading ? (
              <motion.div key="input-fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-12">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" /> Select Culinary Intent
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> {/* Changed to grid-cols-5 for 5 moods */}
                    {moods.map((mood) => (
                      <button key={mood.label} onClick={() => setFoodType(mood.value)}
                        className={`relative p-4 rounded-3xl border-2 transition-all ${foodType === mood.value ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-100 bg-white'}`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3 ${mood.color} text-white`}>{mood.icon}</div>
                        <span className={`font-bold block text-xs ${foodType === mood.value ? 'text-orange-600' : 'text-slate-600'}`}>{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <input type="text" placeholder="Cuisine Style (e.g. Italian, Sweets)" value={foodType} onChange={(e) => setFoodType(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-orange-500 outline-none text-black" />
                    <input type="text" placeholder="Allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-red-400 outline-none text-black" />
                  </div>
                  <textarea placeholder="Ingredients separated by commas..." rows={6} value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full p-5 bg-slate-50 rounded-[2.5rem] border-2 border-transparent focus:border-orange-500 outline-none text-black" />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate}
                  className="w-full mt-12 bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-3"><ChefHat /> Compose Recipe</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="loading-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                <div className="relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-32 h-32 border-4 border-dashed border-orange-500 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center"><ChefHat size={48} className="text-orange-500 animate-bounce" /></div>
                </div>
                <div className="space-y-4 w-full max-sm:max-w-xs">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-orange-500" initial={{ width: "0%" }} animate={{ width: `${((loadingIndex + 1) / LOADING_MESSAGES.length) * 100}%` }} />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p key={loadingIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xl font-bold text-slate-800">{LOADING_MESSAGES[loadingIndex]}</motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- OUTPUT SECTION --- */}
        <AnimatePresence>
          {recipe && !loading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-16 space-y-10">
              <div className="bg-white rounded-[3.5rem] shadow-xl p-10 md:p-16 border border-slate-100 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-50 pb-8">
                  <div className="flex flex-col gap-1">
                    {isSaved && (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                        <CheckCircle size={14} className="animate-pulse" /> Cloud Sync Active
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">Recipe Identity: {foodType || "Signature Dish"}</p>
                  </div>
                  <button onClick={downloadPDF} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-orange-500 transition-all shadow-lg flex items-center gap-2 text-sm font-bold">
                    <Download size={18} /> Get PDF
                  </button>
                </div>

                <div className="prose prose-slate max-w-none text-black">
                  <ReactMarkdown components={{
                    h1: ({...props}) => <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8" {...props} />,
                    h2: ({...props}) => <h2 className="text-2xl font-bold text-orange-500 mt-12 mb-6" {...props} />,
                    li: ({...props}) => <li className="text-lg text-slate-600 mb-4 list-none pl-6 border-l-4 border-orange-100 hover:border-orange-500 transition-colors" {...props} />,
                  }}>{recipe}</ReactMarkdown>
                </div>
              </div>

              {/* Nutrition Block */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-50/50 backdrop-blur-sm p-8 rounded-[3rem] border border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                   <div className="bg-emerald-500 p-4 rounded-3xl text-white shadow-xl shadow-emerald-200/50"><Activity size={28} /></div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Macro Analysis</h3>
                     <p className="text-emerald-700 text-sm font-semibold italic">Powered by Atelier Intelligence</p>
                   </div>
                </div>
                {!nutrition ? (
                  <button onClick={handleGetNutrition} className="px-10 py-4 bg-white text-emerald-600 rounded-[2rem] font-black shadow-md border border-emerald-100">{nutriLoading ? <Loader2 className="animate-spin" /> : "Analyze Nutrition"}</button>
                ) : (
                  <div className="bg-white p-8 rounded-[2rem] w-full shadow-inner text-black"><ReactMarkdown>{nutrition}</ReactMarkdown></div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CULINARY ARCHIVE GRID --- */}
        {savedRecipes.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                <History className="text-orange-500"/> Culinary Archive
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{savedRecipes.length} Creations</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedRecipes.map((item) => (
                <motion.div 
                  key={item.id} 
                  whileHover={{ y: -8, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} 
                  onClick={() => { setRecipe(item.content); setFoodType(item.food_type); window.scrollTo({ top: 500, behavior: 'smooth' }); }} 
                  className="group p-8 bg-white rounded-[2.5rem] border border-slate-100 cursor-pointer hover:border-orange-200 transition-all flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest ${
                      item.food_type?.toLowerCase().includes('sweet') ? 'bg-pink-100 text-pink-600' : 
                      item.food_type?.toLowerCase().includes('quick') ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {item.food_type?.split(' ')[0] || "Chef"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition-colors line-clamp-1 capitalize">
                    {item.title}
                  </h4>
                  
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {item.content.replace(/[#*]/g, '').substring(0, 120)}...
                  </p>
                  
                  <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-tighter">
                    Revisit Recipe <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Tools (Timer/Chat) */}
      {recipe && !loading && (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-5">
          <AnimatePresence>
            {activeTab === 'timer' && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="bg-white/90 backdrop-blur-2xl w-80 p-8 rounded-[2.5rem] shadow-2xl border border-white mb-2">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 text-blue-600 font-black"><Clock size={20}/> Timer</div>
                  <button onClick={() => setActiveTab('none')}><X size={20}/></button>
                </div>
                <div className="text-5xl font-mono font-black text-center text-slate-900 bg-slate-50 py-8 rounded-[2rem] mb-6">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
                <div className="flex gap-3">
                  {!isActive && timeLeft === 0 && (
                    <input type="number" placeholder="Min" className="w-24 p-4 bg-slate-100 rounded-2xl outline-none text-center font-bold text-black" onChange={(e) => setTimerInput(Number(e.target.value))} />
                  )}
                  <button onClick={() => { if(timeLeft === 0 && timerInput > 0) setTimeLeft(timerInput * 60); setIsActive(!isActive); }} className={`flex-1 py-4 rounded-2xl text-white font-black transition-all ${isActive ? 'bg-red-500' : 'bg-blue-600'}`}>
                    {isActive ? <Pause /> : <Play />}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="bg-white/90 backdrop-blur-2xl w-80 md:w-[400px] rounded-[2.5rem] shadow-2xl border border-white overflow-hidden mb-2 text-black">
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center font-black"><Coffee size={20}/> Atelier Chat <button onClick={() => setActiveTab('none')}><X size={20}/></button></div>
                <div className="h-80 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>{msg.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChat} className="p-4 bg-white border-t flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask anything..." className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl outline-none text-black" />
                  <button className="bg-orange-500 text-white p-3 rounded-xl shadow-md transition-all active:scale-95"><Send size={18}/></button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-xl border border-white/50">
            <button onClick={() => setActiveTab(activeTab === 'timer' ? 'none' : 'timer')} className={`p-5 rounded-full text-white transition-all ${isActive ? 'bg-blue-600 animate-pulse' : 'bg-slate-900 hover:bg-blue-600'}`}>
              <Clock size={28} />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'chat' ? 'none' : 'chat')} className={`p-5 rounded-full text-white transition-all ${activeTab === 'chat' ? 'bg-orange-500' : 'bg-slate-900 hover:bg-orange-500'}`}>
              <MessageSquare size={28} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// Helper icon component
function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}