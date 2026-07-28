'use client';

import { supabase } from '@/lib/supabase';

const BUCKET = 'boteco-media';
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.8;

function generateFileName(ext: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${ts}-${rand}.${ext}`;
}

function getExtension(file: File): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return mimeMap[file.type] || file.name.split('.').pop() || 'jpg';
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress image'));
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = getExtension(file);
  const fileName = `${folder}/${generateFileName(ext)}`;

  const compressed = await compressImage(file);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, compressed, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadVideo(file: File, folder: string): Promise<string> {
  const ext = getExtension(file);
  const fileName = `${folder}/${generateFileName(ext)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteMedia(url: string): Promise<void> {
  const prefix = `/storage/v1/object/public/${BUCKET}/`;
  const path = url.includes(prefix) ? url.split(prefix)[1] : null;
  if (!path) return;

  await supabase.storage.from(BUCKET).remove([path]);
}

export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(`/storage/v1/object/public/${BUCKET}/`);
}
