# Pinpoint 📌 — Personal Bookmarks Dashboard

Pinpoint is a premium, personal bookmarks application designed as a "linktree meets pocket" utility. Users can sign up, manage private bookmarks, and claim a unique `@handle` username to share public bookmarks on their minimal portfolio page.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Supabase (Auth & Database)**, **Resend (Email Delivery)**, and **Vanilla CSS** (dark mode glassmorphic styling).

---

## Live URL
*(Provide your deployed Vercel URL here)*

---

## How to Run Locally

### 1. Prerequisites
- **Node.js 22.x+** and **NPM** installed.
- A free **Supabase** account.
- A free **Resend** account.

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/Sahil12kevlani/Home-Build-Task.git
cd Home-Build-Task
npm install
```

### 3. Database Initialization (Supabase)
1. Create a new project in your [Supabase Dashboard](https://database.new).
2. Go to the **SQL Editor** in Supabase.
3. Open the file [supabase_schema.sql](./supabase_schema.sql) in this repository, copy its contents, paste them into the SQL Editor, and click **Run**.
4. This script sets up:
   - The `profiles` and `bookmarks` tables.
   - Database triggers to automatically sync auth user signups to user profile handles.
   - Row Level Security (RLS) policies enforcing that users can only view/mutate their own bookmarks, while public profiles remain publicly fetchable.

### 4. Configuration (.env.local)
Create a `.env.local` file in the root directory and populate it with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Resend API key for onboarding welcome emails
RESEND_API_KEY=re_your_api_key_here
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## AI Agent Pairing Reflections

### Where the AI agent got something wrong, and how it was resolved:
1. **styled-jsx in Server Components:** The agent attempted to write a `<style jsx>` block inside the Server Component (`page.tsx`) to implement screen overrides, which failed during the Turbopack build phase. I caught this from the error log, removed the inline style blocks, and unified all media queries and overrides inside our main Vanilla CSS stylesheet (`src/app/globals.css`).
2. **Next.js 16 Convention Deprecations:** The agent initially set up route protection in `src/middleware.ts`. However, Next.js 16 deprecated this convention in favor of a network edge boundary named `src/proxy.ts` exporting a `proxy` function. The compiler emitted a warning; we resolved it by moving the file to `src/proxy.ts` and updating the export.
3. **useActionState Types:** Toggling the signup and login functions dynamically in the `useActionState` hook caused a TypeScript overload type-check error due to differing return signatures. We resolved this by creating a unified `handleAuth` wrapper method that types both operations cleanly.
4. **Dynamic Redirect Host Verification:** The verification links in the confirmation emails were failing because they initially defaulted to `localhost:3000`. We solved this by using Next.js `headers()` to dynamically resolve the request's protocol and host, ensuring email redirect URLs link correctly to Vercel or local hosts.
5. **Backend Verification Checks:** To prevent accounts from being used without verifying their email address (in case verification checks are bypassed in local configs), we added explicit sign-in checks checking the `email_confirmed_at` timestamp and blocking sessions for unverified registrations.

---

## Future Improvements

If given more time, I would implement **automated open-graph metadata scraping**. When a user adds a bookmark URL, a background API route would fetch the website's title, description, and preview image (Open Graph tags). This would transform the bookmarks list from a text-based grid into a rich visual feed with thumbnail cards, significantly elevating the user experience.
