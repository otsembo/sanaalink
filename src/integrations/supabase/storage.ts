import { supabase } from './client';

export type StorageBucket = 'provider-images' | 'service-images' | 'product-images';

export async function uploadImage(file: File, path: string, bucket: StorageBucket = 'provider-images') {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function uploadMultipleImages(files: File[], path: string, bucket: StorageBucket = 'provider-images') {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path, bucket));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

export async function deleteImage(path: string, bucket: StorageBucket = 'provider-images') {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export function getPublicUrl(path: string, bucket: StorageBucket = 'provider-images') {
  const { data: { publicUrl } } = supabase.storage
    .from('provider-images')
    .getPublicUrl(path);
  
  return publicUrl;
}
