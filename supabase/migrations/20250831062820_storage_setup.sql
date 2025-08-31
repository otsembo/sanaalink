-- Create the provider-images bucket
insert into storage.buckets (id, name, public)
values ('provider-images', 'provider-images', true);

-- Enable Row Level Security
alter table storage.objects enable row level security;

-- Create policies for the provider-images bucket
-- Allow public read access to all files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'provider-images' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'provider-images' AND
  (auth.uid() = (
    select user_id 
    from public.providers 
    where id::text = array_to_string(string_to_array(storage.foldername(name), '/'), '')
  ))
);

-- Allow providers to update their own files
create policy "Providers can update their own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'provider-images' AND
  (auth.uid() = (
    select user_id 
    from public.providers 
    where id::text = array_to_string(string_to_array(storage.foldername(name), '/'), '')
  ))
);

-- Allow providers to delete their own files
create policy "Providers can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'provider-images' AND
  (auth.uid() = (
    select user_id 
    from public.providers 
    where id::text = array_to_string(string_to_array(storage.foldername(name), '/'), '')
  ))
);
