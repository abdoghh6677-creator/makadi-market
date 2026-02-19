# 🏖 Makadi Heights — Private Marketplace

Full-stack marketplace for Makadi Heights compound residents.
Built with Next.js + Supabase + Vercel.

---

## 🚀 DEPLOYMENT STEPS (Follow in order)

### STEP 1 — Setup Supabase Database
1. Go to https://supabase.com → your project → **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content of `supabase-setup.sql` and paste it
4. Click **Run**
5. You should see "Success" — all tables are now created

### STEP 2 — Set Yourself as Admin
1. Register on the website first using your email
2. Go back to Supabase → SQL Editor → New Query
3. Run this (replace with your email):
```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

### STEP 3 — Upload to GitHub
1. Create a new repository on GitHub named `makadi-heights`
2. Upload ALL these files to the repository
3. Make sure `.env.local` is NOT uploaded (it contains secrets)

### STEP 4 — Deploy on Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://bqjibqvhmqxrfsflqtcz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
4. Framework: Next.js (auto-detected)
5. Click Deploy!

---

## 📁 Project Structure
```
makadi-heights/
├── pages/
│   ├── _app.js          # Auth context wrapper
│   └── index.js         # Main marketplace page
├── components/
│   ├── Header.js         # Navigation header
│   ├── AuthModal.js      # Login/Register modal
│   ├── PostModal.js      # Post listing form
│   ├── PropertyCard.js   # Listing card
│   ├── PropertyDetail.js # Listing detail modal
│   └── AdminModal.js     # Admin dashboard
├── lib/
│   └── supabase.js       # Supabase client
├── styles/
│   └── globals.css       # Global styles
├── supabase-setup.sql    # Database setup (run once)
├── next.config.js
└── package.json
```

## ✅ Features
- Real authentication (Email/Password via Supabase)
- Property listings for Sale & Rent (Phase 1 & Phase 2)
- Image upload to Supabase Storage
- Admin approval system
- Save listings (heart button)
- WhatsApp contact
- Report listing
- Admin dashboard (users, pending, reports)
- Responsive design

## 🔮 Phase 2 (Coming Soon)
- Used Items Marketplace
- Services Directory
- In-app messaging
- Push notifications
