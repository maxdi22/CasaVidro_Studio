import { InspoImage, InspoCategory } from '../types';
import * as db from './dbService';
import { fileToImageFile, urlToImageFile } from '../utils/fileUtils';

const DEFAULT_INSPIRATION_IMAGES = [
    { url: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg', alt: 'Sala de estar moderna com sofá e estante de livros', category: 'Decor' as InspoCategory },
    { url: 'https://images.pexels.com/photos/37347/office-product-business-natural-light.jpg', alt: 'Mesa de escritório elegante com laptop e material de escritório', category: 'Luxuoso' as InspoCategory },
    { url: 'https://images.pexels.com/photos/1375736/pexels-photo-1375736.jpeg', alt: 'Interior de uma loja de roupas chique com araras de roupas', category: 'Fashion' as InspoCategory },
    { url: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg', alt: 'Ferramentas de mecânico organizadas em uma superfície de madeira', category: 'Publicitário' as InspoCategory },
    { url: 'https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg', alt: 'Cozinha moderna e bem iluminada com armários brancos', category: 'Decor' as InspoCategory },
    { url: 'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg', alt: 'Close-up de relógios de luxo em exibição', category: 'Luxuoso' as InspoCategory },
    { url: 'https://images.pexels.com/photos/102129/pexels-photo-102129.jpeg', alt: 'Bolsa de couro elegante em um fundo neutro', category: 'Fashion' as InspoCategory },
    { url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg', alt: 'Equipe de negócios colaborando em uma reunião de escritório', category: 'Publicitário' as InspoCategory },
];
const IMAGES_INITIALIZED_KEY = 'inspoImagesInitialized_v1';

const initializeDefaultImages = async () => {
    try {
        const isInitialized = localStorage.getItem(IMAGES_INITIALIZED_KEY);
        if (isInitialized) {
            return;
        }

        const existingImages = await db.getAllInspoImages();
        if (existingImages.length > 0) {
            localStorage.setItem(IMAGES_INITIALIZED_KEY, 'true');
            return;
        }

        console.log('Initializing default inspiration images...');
        for (const image of DEFAULT_INSPIRATION_IMAGES) {
            const imageFile = await urlToImageFile(image.url);
            const inspoImage: Omit<InspoImage, 'id'> = {
                src: imageFile.dataUrl,
                alt: image.alt,
                category: image.category,
            };
            await db.addInspoImage(inspoImage);
        }
        localStorage.setItem(IMAGES_INITIALIZED_KEY, 'true');
        console.log('Default inspiration images initialized successfully.');

    } catch (error) {
        console.error('Failed to initialize default inspiration images:', error);
        // Se a inicialização falhar, não tente novamente para evitar loops de erro
        localStorage.setItem(IMAGES_INITIALIZED_KEY, 'true');
    }
};


export const addInspoImage = async (file: File, category: InspoCategory): Promise<void> => {
  const imageFile = await fileToImageFile(file);
  const inspoImage: Omit<InspoImage, 'id'> = {
    src: imageFile.dataUrl,
    alt: file.name,
    category: category,
  };
  await db.addInspoImage(inspoImage);
};

export const getInspoImages = async (): Promise<InspoImage[]> => {
  await initializeDefaultImages();
  return db.getAllInspoImages();
};

export const deleteInspoImage = (id: number): Promise<void> => {
  return db.deleteInspoImage(id);
};