CREATE TABLE domain_configs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  domain_name text NOT NULL UNIQUE,
  is_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  expires_at timestamp with time zone,
  CONSTRAINT domain_configs_pkey PRIMARY KEY (id)
);
