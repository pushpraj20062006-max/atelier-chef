"use client";
import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Dashboard() {
  const [items, setItems] = useState('');
  const [recipe, setRecipe] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const [chatSession, setChatSession] = useState<any>(null);

  // ⚠️ PASTE YOUR KEY HERE
  const API_KEY = "YOUR_GEMINI_API_KEY"; 
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
    <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ color: 'orange' }}>Dashboard Loaded Successfully</h1>
      
      {/* 1. INPUT AREA */}
      <section style={{ border: '2px solid black', padding: '20px' }}>
        <h2>Step 1: Ingredients</h2>
        <input 
          placeholder="Type ingredients..." 
          onChange={(e) => setItems(e.target.value)} 
          style={{ width: '100%', padding: '10px' }}
        />
        <button onClick={generateRecipe} style={{ marginTop: '10px', padding: '10px', background: 'orange' }}>
          Generate Recipe
        </button>
      </section>

      {/* 2. RECIPE AREA */}
      <section style={{ border: '2px solid blue', padding: '20px' }}>
        <h2>Step 2: Recipe</h2>
        <div style={{ whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px' }}>
          {recipe || "Recipe will show here..."}
        </div>
      </section>

      {/* 3. CHATBOX AREA (RED BORDER SO YOU CAN'T MISS IT) */}
      <section style={{ border: '5px solid red', padding: '20px' }}>
        <h2>Step 3: CHATBOX (This is it!)</h2>
        <div style={{ height: '200px', overflowY: 'scroll', background: 'white', border: '1px solid #ccc', marginBottom: '10px' }}>
          {chatHistory.map((m, i) => (
            <p key={i}><b>{m.role}:</b> {m.text}</p>
          ))}
        </div>
        <input 
          value={chatInput} 
          onChange={(e) => setChatInput(e.target.value)} 
          placeholder="Ask the chef something..." 
          style={{ width: '80%', padding: '10px' }}
        />
        <button onClick={askChef} style={{ width: '15%', padding: '10px' }}>Ask</button>
      </section>
    </div>
  );
}