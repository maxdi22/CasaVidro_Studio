

export type Mode = 'image' | 'video';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type ProductSize = 'Much Smaller' | 'Smaller' | 'Same Size' | 'Larger' | 'Much Larger';

// Fix: Add UserProfile interface to be used by AuthContext.
export interface UserProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export interface ImageFile {
  base64: string; // Raw base64 data
  mimeType: string;
  dataUrl: string; // data:mime/type;base64,... for display
  maskDisplayUrl?: string; // for UI overlay
  maskApiBase64?: string; // for API call (white on black)
}

export interface AppState {
  mode: Mode;
  prompt: string;
  negativePrompt: string;
  productImages: ImageFile[];
  sceneImage: ImageFile | null;
  aspectRatio: AspectRatio;
  productSize: ProductSize;
  contextImages: ImageFile[];
}

export interface Output {
  type: 'image' | 'video';
  src: string; // data URL for image, blob URL for video
  text?: string;
}

export interface Creation extends AppState {
  id?: number;
  output: Output;
  createdAt: string; // ISO string
}

export interface PromptHelperContent {
  title: string;
  promptGuide: {
    title:string;
    content: string;
    example: {
      title: string;
      prompt: string;
    };
  };
  editingGuide: {
    title: string;
    content: string;
    examples: {
      title: string;
      prompt: string;
    }[];
  };
  promptBuilder: {
    title: string;
    type: string;
    subject: string;
    style: string;
    details: string;
    generateButton: string;
    yourPrompt: string;
  };
  stylesKeywords: {
    title: string;
    categories: {
      name: string;
      keywords: { name: string; value: string; }[];
    }[];
  };
  negativePrompts: {
    title: string;
    content: string;
    keywords: string[];
  };
}

export type InspoCategory = 'Luxuoso' | 'Decor' | 'Fashion' | 'Publicitário';

export const INSPO_CATEGORIES: InspoCategory[] = ['Luxuoso', 'Decor', 'Fashion', 'Publicitário'];

export interface InspoImage {
  id: number;
  src: string; // data URL
  alt: string; // filename
  category: InspoCategory;
}