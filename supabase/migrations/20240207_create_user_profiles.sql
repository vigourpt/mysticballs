-- Create user_profiles table
create table if not exists public.user_profiles (
    id uuid references auth.users(id) primary key,
    email text not null,
    display_name text,
    readings_count integer default 0,
    is_premium boolean default false,
    last_reading_date timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
    on public.user_profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.user_profiles for update
    using (auth.uid() = id);

create policy "Allow insert for authenticated users"
    on public.user_profiles for insert
    with check (auth.uid() = id);

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on public.user_profiles to authenticated;

-- Create function to handle profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.user_profiles (id, email, display_name, readings_count, is_premium, created_at, updated_at)
    values (new.id, new.email, split_part(new.email, '@', 1), 0, false, now(), now());
    return new;
end;
$$;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
