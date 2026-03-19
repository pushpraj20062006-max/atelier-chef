<div align="center">
  <img src="https://images.imageeditor.googleapi.com/a9776d54-b590-482a-a9e9-d40536c4b953.png" alt="Atelier Chef Logo" width="200" />
  <h1>👨‍🍳 Atelier Chef: AI-Powered Culinary Studio</h1>
  <p><b>Next.js • Google Gemini AI • Supabase • Tailwind CSS • Netlify</b></p>
</div>

---

## Overview

Atelier Chef is a premium, full-stack web application that elevates your cooking experience. Generate gourmet recipes, analyze nutrition, chat with an AI chef, and maintain a personal culinary archive—all in a beautiful, modern interface.

---

## 🚀 Features

- **AI Recipe Generation:** Create complete, formatted recipes based on ingredients, dietary restrictions, and culinary intent.
- **Favorites Engine:** Heart and curate your personal recipe collection, synced to Supabase.
- **Nutrition Intelligence:** One-click macro-nutrient analysis powered by AI.
- **Interactive Kitchen Tools:** Floating timer and AI Sous-Chef chat for real-time cooking advice.
- **PDF Export:** Download professional, print-ready recipe PDFs.
- **Cloud Sync:** Secure Google OAuth authentication for private, cross-device access.
- **User Profile & Settings:** Manage your account and preferences.
- **Accessibility & Responsive UI:** Fully mobile-friendly and accessible.
- **Error Handling:** Custom 404 and error boundary pages.
- **Analytics:** Integrated Google Analytics for monitoring.
- **Automated Testing:** Jest and Testing Library for unit/integration tests.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth)
- **AI:** Google Gemini API
- **PDF:** jsPDF
- **Testing:** Jest, Testing Library
- **Deployment:** Netlify

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/atelier-chef.git
cd atelier-chef
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Configuration

Run this SQL in Supabase to enable Favorites and History:

```sql
CREATE TABLE IF NOT EXISTS recipes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now(),
  title text,
  content text,
  ingredients text[],
  food_type text,
  user_email text,
  is_favorite boolean DEFAULT false
);
```

### 4. Run Development Server

```bash
npm run dev
```

---

## 📸 Gallery

| Dashboard | Recipe Generation |
| :---: | :---: |
| ![Dashboard](https://images.imageeditor.googleapi.com/a9776d54-b590-482a-a9e9-d40536c4b953.png) | ![Recipe View](https://images.imageeditor.googleapi.com/46ff1758-c26c-4b61-9c60-a29d45305141.png) |

| Kitchen Tools |
| :---: |
| ![Floating Kitchen Tools](https://images.imageeditor.googleapi.com/605501ae-d60f-4886-9a29-d40536c4f82a.png) |

---

## Best Practices & Improvements

- All secrets managed via environment variables
- Professional site metadata & SEO
- Responsive, accessible UI
- Custom error handling
- Automated tests
- Analytics/monitoring
- Codebase follows Next.js and React standards

---

## Contributing

Pull requests and issues are welcome! For questions, suggestions, or bug reports, please open an issue or PR.

---

## License

MIT License