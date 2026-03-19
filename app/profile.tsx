"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setEmail(data.user?.email || "");
      setName(data.user?.user_metadata?.full_name || "");
    };
    fetchUser();
  }, []);

  return (
    <main className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg" aria-label="User Profile">
      <h1 className="text-2xl font-black mb-6 text-orange-500">Profile & Settings</h1>
      {user ? (
        <>
          <div className="mb-4">
            <label htmlFor="profile-email" className="block text-sm font-bold mb-2">Email</label>
            <input id="profile-email" value={email} disabled className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700" />
          </div>
          <div className="mb-4">
            <label htmlFor="profile-name" className="block text-sm font-bold mb-2">Name</label>
            <input id="profile-name" value={name} disabled className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700" />
          </div>
          <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow hover:bg-orange-600 transition-all mt-6" aria-label="Logout" onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}>Logout</button>
        </>
      ) : (
        <p className="text-slate-500">Loading profile...</p>
      )}
    </main>
  );
}
