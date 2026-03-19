👨‍🍳 Atelier Chef: AI-Powered Culinary Studio

Atelier Chef is a premium, full-stack web application that transforms the cooking experience. Powered by Google Gemini AI and Supabase, it enables users to generate gourmet recipes from available ingredients, analyze nutritional data, chat with an AI chef, and maintain a persistent personal culinary archive—all with a beautiful, modern UI.

**Security Note:** All API keys and URLs are now managed via environment variables in `.env.local` for best practices and security.

🌟 Key Features
🪄 Intelligent Recipe Composition: Generates complete, formatted recipes based on ingredients, dietary restrictions, and "Culinary Intent" (Flash, Healthy, Fancy, Comfort, or Sweets).

❤️ Favorites Engine: A seamless "Heart" toggle system that syncs with a PostgreSQL database, allowing users to curate and filter their personal recipe collection.

📊 Nutrition Intelligence: One-click macro-nutrient analysis powered by AI to track calories, protein, fats, and carbs.

⏲️ Interactive Kitchen Tools: A floating utility suite featuring a real-time countdown timer and a dedicated AI Sous-Chef chat for cooking advice.

📄 Professional PDF Export: Cleanly formatted recipe downloads for offline kitchen use or printing.

🔐 Cloud Synchronization: Secure Google OAuth authentication ensures your recipe archive is private and available on any device.


🛠️ Technical Architecture
The project is built with a modern "Serverless" stack to ensure high performance and real-time updates.







🚀 Getting Started
1. Clone & Install
Bash
git clone https://github.com/YOUR_USERNAME/atelier-chef.git
cd atelier-chef
npm install


2. Environment Setup
Create a `.env.local` file in the root directory and add your secret keys (never commit real secrets to version control):

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Database Configuration
To enable the Favorites and History features, run the following SQL in your Supabase SQL Editor:

SQL
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

4. Run Development Server

```bash
npm run dev
```

---

## Improvements & Best Practices

- All sensitive keys and URLs are now loaded from environment variables.
- Site metadata and SEO have been improved for professionalism.
- UI/UX is modern and responsive.
- Error handling and user feedback are enhanced.
- Codebase follows Next.js and React best practices.

For questions or contributions, please open an issue or pull request.

Open http://localhost:3000 to view your Atelier Chef.

## 📸 Project Gallery

The Atelier Chef interface focuses on a "distraction-free" culinary experience, featuring dynamic hero animations and integrated utility panels.

| 1. App Dashboard (Ken Burns Hero & Input) | 2. AI Recipe Generation View |
| :---: | :---: |
| ![Atelier Chef Home Interface](https://images.imageeditor.googleapi.com/a9776d54-b590-482a-a9e9-d40536c4b953.png) | ![Atelier Chef Recipe View](https://images.imageeditor.googleapi.com/46ff1758-c26c-4b61-9c60-a29d45305141.png) |

---

### 3. Integrated Kitchen Tools (Floating UI)

This view demonstrates the core interaction model: a floating utility suite that allows users to manage a real-time countdown timer and access an AI Sous-Chef chat without leaving the recipe view.

![Atelier Chef Floating Kitchen Tools](https://images.imageeditor.googleapi.com/605501ae-d60f-4886-9a29-d40536c4f82a.png)