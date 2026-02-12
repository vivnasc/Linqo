-- Linqo Database Schema
-- Execute isto no SQL Editor do Supabase

-- Perfis de utilizador (extends Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Contactos
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  contact_user_id uuid references auth.users on delete cascade,
  name text not null,
  status text default 'active' check (status in ('active', 'pending', 'blocked')),
  created_at timestamptz default now()
);

alter table contacts enable row level security;

create policy "Users can manage their own contacts"
  on contacts for all using (auth.uid() = user_id);

-- Canais de intenção
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text default 'message-circle',
  color text default '#22c55e',
  user_id uuid references auth.users on delete cascade not null,
  contact_id uuid references contacts on delete cascade,
  created_at timestamptz default now()
);

alter table channels enable row level security;

create policy "Users can manage their own channels"
  on channels for all using (auth.uid() = user_id);

-- Conversas
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references channels on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Participantes da conversa
create table if not exists conversation_participants (
  conversation_id uuid references conversations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  primary key (conversation_id, user_id)
);

alter table conversations enable row level security;
alter table conversation_participants enable row level security;

create policy "Users can view their conversations"
  on conversations for select using (
    id in (select conversation_id from conversation_participants where user_id = auth.uid())
  );

create policy "Users can create conversations"
  on conversations for insert with check (true);

create policy "Users can update their conversations"
  on conversations for update using (
    id in (select conversation_id from conversation_participants where user_id = auth.uid())
  );

create policy "Users can view their participations"
  on conversation_participants for select using (auth.uid() = user_id);

create policy "Users can add participants"
  on conversation_participants for insert with check (auth.uid() = user_id);

-- Mensagens
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  sender_id uuid references auth.users on delete cascade not null,
  content text not null,
  channel_id uuid references channels on delete set null,
  -- Emotional analysis (stored with consent)
  emotional_tone text,
  emotional_tension smallint check (emotional_tension between 0 and 10),
  emotional_sentiment text check (emotional_sentiment in ('positivo', 'neutro', 'negativo', 'misto')),
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Users can view messages in their conversations"
  on messages for select using (
    conversation_id in (
      select conversation_id from conversation_participants where user_id = auth.uid()
    )
  );

create policy "Users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

-- Lista de espera (waitlist)
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_messages_conversation on messages(conversation_id, created_at);
create index if not exists idx_contacts_user on contacts(user_id);
create index if not exists idx_channels_user on channels(user_id);
create index if not exists idx_conv_participants_user on conversation_participants(user_id);

-- Enable Realtime for messages
alter publication supabase_realtime add table messages;
