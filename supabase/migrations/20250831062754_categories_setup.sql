-- Create enum for provider types
create type provider_type as enum ('service', 'craft', 'both');

-- Create categories table
create table categories (
    id text primary key,
    name text not null,
    description text,
    type text not null check (type in ('service', 'craft')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create sub_categories table
create table sub_categories (
    id text primary key,
    category_id text references categories(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create provider_categories junction table
create table provider_categories (
    provider_id uuid references providers(id) on delete cascade,
    category_id text references categories(id) on delete cascade,
    sub_category_id text references sub_categories(id) on delete cascade,
    primary key (provider_id, category_id, sub_category_id)
);

-- Add provider_type column to providers table
alter table providers add column provider_type provider_type not null default 'service';

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_categories_updated_at
    before update on categories
    for each row
    execute procedure update_updated_at_column();

create trigger update_sub_categories_updated_at
    before update on sub_categories
    for each row
    execute procedure update_updated_at_column();

-- Insert categories and sub-categories
create or replace function insert_categories()
returns void as $$
declare
    cat record;
    subcat record;
begin
    -- Service Categories
    for cat in select * from jsonb_each_text('{
        "home-maintenance": "Home Maintenance",
        "construction": "Construction",
        "specialized-trades": "Specialized Trades",
        "automotive": "Automotive",
        "property-care": "Property Care",
        "home-improvement": "Home Improvement",
        "beauty-services": "Beauty Services",
        "wellness-services": "Wellness Services",
        "fitness-services": "Fitness Services",
        "entertainment": "Entertainment",
        "photography-video": "Photography/Video",
        "event-services": "Event Services",
        "performance-arts": "Performance Arts",
        "moving-services": "Moving Services",
        "courier-services": "Courier Services",
        "driver-services": "Driver Services",
        "electronic-repair": "Electronic Repair"
    }'::jsonb)
    loop
        insert into categories (id, name, type)
        values (cat.key, cat.value, 'service')
        on conflict (id) do nothing;
    end loop;

    -- Craft Categories
    for cat in select * from jsonb_each_text('{
        "art-decor": "Art & Decor",
        "fashion-textiles": "Fashion & Textiles",
        "pottery-ceramics": "Pottery & Ceramics",
        "woodwork": "Woodwork",
        "jewelry": "Jewelry",
        "home-products": "Home Products",
        "musical-instruments": "Musical Instruments",
        "stone-carving": "Stone Carving",
        "fiber-arts": "Fiber Arts",
        "cultural-items": "Cultural Items",
        "craft-supplies": "Craft Supplies",
        "fine-art": "Fine Art",
        "leather-goods": "Leather Goods"
    }'::jsonb)
    loop
        insert into categories (id, name, type)
        values (cat.key, cat.value, 'craft')
        on conflict (id) do nothing;
    end loop;
end;
$$ language plpgsql;

-- Execute the function
select insert_categories();

-- Add RLS policies
alter table categories enable row level security;
alter table sub_categories enable row level security;
alter table provider_categories enable row level security;

-- Policies for categories
create policy "Categories are viewable by everyone"
    on categories for select
    to public
    using (true);

-- Policies for sub_categories
create policy "Sub-categories are viewable by everyone"
    on sub_categories for select
    to public
    using (true);

-- Policies for provider_categories
create policy "Provider categories are viewable by everyone"
    on provider_categories for select
    to public
    using (true);

create policy "Providers can manage their own categories"
    on provider_categories for insert
    to authenticated
    with check (auth.uid() = (
        select user_id from providers where id = provider_id
    ));

create policy "Providers can update their own categories"
    on provider_categories for update
    to authenticated
    using (auth.uid() = (
        select user_id from providers where id = provider_id
    ));

create policy "Providers can delete their own categories"
    on provider_categories for delete
    to authenticated
    using (auth.uid() = (
        select user_id from providers where id = provider_id
    ));
