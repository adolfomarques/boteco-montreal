'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { uploadImage, uploadVideo } from '@/lib/upload';

interface ImageUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  accept?: 'image' | 'video';
  label?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  folder,
  accept = 'image',
  label = 'Imagem',
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVideo = accept === 'video';
  const acceptAttr = isVideo ? 'video/*' : 'image/*';

  const hasImage = value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'));

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      let url: string;
      if (isVideo) {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('Video muito grande. Maximo 50MB. Comprima antes de enviar.');
        }
        url = await uploadVideo(file, folder);
      } else {
        url = await uploadImage(file, folder);
      }
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemove() {
    onChange(null);
    setError(null);
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-label-caps text-on-surface-variant tracking-wider">
        {label}
      </label>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Preview */}
        <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 relative">
          {hasImage ? (
            <>
              <Image
                className="object-cover"
                src={value!}
                alt="Preview"
                fill
                sizes="192px"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 w-7 h-7 bg-error/80 text-on-error rounded-full flex items-center justify-center hover:bg-error transition-colors z-10"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl">
                {isVideo ? 'videocam' : 'add_photo_alternate'}
              </span>
              <span className="text-xs font-medium">
                {isVideo ? 'Enviar video' : 'Enviar imagem'}
              </span>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-surface-container-high text-on-surface px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">
              {uploading ? 'hourglass_empty' : 'upload'}
            </span>
            {uploading ? 'Enviando...' : isVideo ? 'Selecionar video' : 'Selecionar imagem'}
          </button>

          {/* Manual URL fallback */}
          <div>
            <p className="text-[10px] text-on-surface-variant mb-1">ou cole uma URL:</p>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value || null)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary/50"
            />
          </div>

          {error && (
            <p className="text-error text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
