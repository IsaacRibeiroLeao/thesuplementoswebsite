-- =============================================
-- THE's Suplementos - Supabase Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  category text not null default 'geral',
  image_url text not null default '',
  in_stock boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Combos table
create table if not exists combos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  products text[] not null default '{}',
  original_price numeric(10,2) not null,
  combo_price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customer profiles table (optional registration)
create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  phone text not null default '',
  city text not null default '',
  created_at timestamptz not null default now()
);

-- Orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  customer_city text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Testimonials table
create table if not exists testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  text text not null,
  rating integer not null default 5,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_products_active on products(active);
create index if not exists idx_products_category on products(category);

-- Enable Row Level Security
alter table products enable row level security;
alter table combos enable row level security;
alter table orders enable row level security;
alter table testimonials enable row level security;
alter table customer_profiles enable row level security;

-- Public read access for products, combos, approved testimonials
create policy "Public read products" on products for select using (active = true);
create policy "Public read combos" on combos for select using (active = true);
create policy "Public read testimonials" on testimonials for select using (approved = true);

-- Public insert for orders (anyone can place an order)
create policy "Public insert orders" on orders for insert with check (true);

-- Users can read their own orders
create policy "Users read own orders" on orders for select using (auth.uid() = user_id);

-- Customer profiles: users manage their own profile
create policy "Users manage own profile" on customer_profiles for all using (auth.uid() = id);
create policy "Public insert profile" on customer_profiles for insert with check (true);

-- Authenticated full access (for admin dashboard)
create policy "Auth full access products" on products for all using (auth.role() = 'authenticated');
create policy "Auth full access combos" on combos for all using (auth.role() = 'authenticated');
create policy "Auth full access orders" on orders for all using (auth.role() = 'authenticated');
create policy "Auth full access testimonials" on testimonials for all using (auth.role() = 'authenticated');
create policy "Auth full access profiles" on customer_profiles for all using (auth.role() = 'authenticated');

-- Monthly sales view (for dashboard)
create or replace view monthly_sales as
select
  date_trunc('month', created_at) as month,
  count(*) as total_orders,
  sum(total) as revenue,
  avg(total) as avg_ticket
from orders
where status != 'cancelled'
group by date_trunc('month', created_at)
order by month desc;

-- Daily sales view (current month)
create or replace view daily_sales as
select
  date_trunc('day', created_at) as day,
  count(*) as total_orders,
  sum(total) as revenue
from orders
where
  status != 'cancelled'
  and created_at >= date_trunc('month', now())
group by date_trunc('day', created_at)
order by day;

-- Top products view
create or replace view top_products as
select
  item->>'name' as product_name,
  sum((item->>'quantity')::int) as total_sold,
  sum((item->>'price')::numeric * (item->>'quantity')::int) as total_revenue
from orders, jsonb_array_elements(items) as item
where status != 'cancelled'
  and created_at >= date_trunc('month', now())
group by item->>'name'
order by total_sold desc
limit 10;
