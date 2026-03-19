"use client";
import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Dashboard() {
  const [items, setItems] = useState('');
  const [recipe, setRecipe] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [chatSession, setChatSession] = useState<any>(null);

  // Use Gemini API key from environment variable
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
  if (!API_KEY) {
    throw new Error("Gemini API key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.");
  }
  const genAI = new GoogleGenerativeAI(API_KEY);

  const generateRecipe = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const session = model.startChat({ history: [] });
      setChatSession(session);

      const prompt = `I have ${items}. Give me a recipe.`;
      const result = await session.sendMessage(prompt);
      setRecipe(result.response.text());
    } catch (e) {
      alert("Error: Check your API Key!");
    }
  };

  const askChef = async () => {
    if (!chatInput || !chatSession) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    const result = await chatSession.sendMessage(userMsg);
    setChatHistory(prev => [...prev, { role: 'chef', text: result.response.text() }]);
  };

    return (
      <div className="p-4 md:p-10 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-black text-orange-500 mb-2 text-center">Dashboard Loaded Successfully</h1>

        {/* 1. INPUT AREA */}
        <section className="border-2 border-black rounded-2xl p-6 bg-white shadow-md">
          <h2 className="text-xl font-bold mb-4">Step 1: Ingredients</h2>
          <input
            placeholder="Type ingredients..."
            onChange={(e) => setItems(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-orange-400 outline-none mb-4"
          />
          <button
            onClick={generateRecipe}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition-all"
          >
            Generate Recipe
          </button>
        </section>

        {/* 2. RECIPE AREA */}
        <section className="border-2 border-blue-400 rounded-2xl p-6 bg-blue-50 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Step 2: Recipe</h2>
          <div className="whitespace-pre-wrap bg-white p-4 rounded-xl min-h-[80px] text-slate-800">
            {recipe || "Recipe will show here..."}
          </div>
        </section>

        {/* 3. CHATBOX AREA */}
        <section className="border-4 border-red-400 rounded-2xl p-6 bg-white shadow-md">
          <h2 className="text-xl font-bold mb-4 text-red-500">Step 3: Chatbox</h2>
          <div className="h-48 overflow-y-scroll bg-slate-50 border border-slate-200 rounded-lg mb-4 p-3">
            {chatHistory.map((m, i) => (
              <p key={i}><b>{m.role}:</b> {m.text}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the chef something..."
              className="flex-1 p-3 rounded-xl border border-slate-200 focus:border-orange-400 outline-none"
            />
            <button
              onClick={askChef}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition-all"
            >
              Ask
            </button>
          </div>
        </section>
      </div>
    );
}