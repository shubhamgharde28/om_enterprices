# OM Enterprises

A modern, responsive water purifier sales and service platform built with React, Vite, Chakra UI, Redux Toolkit, and Supabase-ready architecture.

## Features

- Customer storefront for products and services
- Product search and filtering
- Admin-managed compatible spare parts shown on the home and product detail pages
- Service booking workflow
- Profile and booking management
- Custom admin dashboard and role-aware access flow
- Chakra UI design system and responsive layouts
- Supabase-ready service layer with mock fallback data for local development

## Getting started

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file in the project root based on `.env.example`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Important: Never expose the Supabase service role key in frontend code. Keep it only in a secure server-side environment.

## Supabase setup

1. Create a Supabase project and open **SQL Editor** in its dashboard.
2. For a new project, open `supabase/schema.sql` in this repository, copy its contents into a new SQL Editor query, then select **Run**. This creates the application tables, indexes, signup profile trigger, Storage bucket, and Row Level Security policies.
   For an existing project, apply only migrations that have not already been applied. Apply `20261028_add_product_spare_parts.sql` to enable compatible spare-part management and `20261029_allow_empty_spare_part_links.sql` to allow creating spare-part products without linked parts. The `20261028_repair_profiles_and_product_bucket.sql` migration repairs older profile columns and configures the `product` Storage bucket. Do not run every historical migration on top of `schema.sql`; the base schema already includes those features.
3. In **Authentication → Providers**, enable email/password sign-in.
4. In **Project Settings → API**, copy the project URL and public anon/publishable key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never put the service role key in frontend code.
5. Create the first account using the app's signup page. The database trigger automatically creates a customer profile.
6. In SQL Editor, promote only the intended account to admin, replacing the email below with the account you created:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (
     select id from auth.users where email = 'admin@example.com'
   );
   ```

7. Sign in at `/admin/login`. Public catalog tables will be empty until you add categories, products, and services.

## First admin user

Use Supabase Auth to create the first admin account, then assign the user an `admin` or `staff` role in the `profiles` table or an equivalent authorization table.

## Project structure

- `src/pages/public` – customer-facing pages
- `src/pages/admin` – custom admin pages
- `src/components` – reusable UI components
- `src/redux` – Redux Toolkit slices and store
- `src/services` – Supabase integration and fallback services
- `src/data` – seed/mock data for local development
- `src/theme` – centralized Chakra theme tokens

## Deployment

Build the production bundle:

```bash
npm run build
```

Deploy the generated `dist` directory to any static host, or connect it to a hosting platform compatible with Vite and React.
