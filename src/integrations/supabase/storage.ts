import { supabase } from './client';

export async function uploadImage(file: File, path: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${path}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('provider-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('provider-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function uploadMultipleImages(files: File[], path: string) {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}

export async function deleteImage(path: string) {
  try {
    const { error } = await supabase.storage
      .from('provider-images')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export function getPublicUrl(path: string) {
  const { data: { publicUrl } } = supabase.storage
    .from('provider-images')
    .getPublicUrl(path);
  
  return publicUrl;
}
