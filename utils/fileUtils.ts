import { ImageFile } from '../types';

export const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
      const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
      resolve({ base64, mimeType, dataUrl });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const urlToImageFile = async (url: string): Promise<ImageFile> => {
  // Use a proxy to avoid CORS issues in a real-world scenario if the image server doesn't allow cross-origin requests.
  // For this implementation, we assume the image hosts (like Pexels) have CORS enabled.
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}. Status: ${response.status}`);
  }
  const blob = await response.blob();
  // Create a file name from URL or use a default
  const fileName = url.split('/').pop() || 'inspo-image.jpg';
  const file = new File([blob], fileName, { type: blob.type });
  return fileToImageFile(file);
};
