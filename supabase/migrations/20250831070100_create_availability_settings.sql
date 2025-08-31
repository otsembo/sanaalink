CREATE TABLE availability_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  weekday text NOT NULL CHECK (weekday IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  CONSTRAINT availability_settings_weekday_provider_unique UNIQUE (provider_id, weekday)
);
