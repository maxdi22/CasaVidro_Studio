// Fix: Import GenerateImagesResponse to correctly type the output of the image generation service.
import { GoogleGenAI, GenerateContentResponse, Modality, Type, GenerateImagesResponse } from "@google/genai";
import { ImageFile, AspectRatio, ProductSize } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for development. In a real environment, the key would be set.
  // In this context we can assume it's always present.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Fix: Changed return type from GenerateContentResponse to GenerateImagesResponse to match the return value of `ai.models.generateImages`.
export const generateImage = async (prompt: string, negativePrompt: string, aspectRatio: AspectRatio): Promise<GenerateImagesResponse> => {
    const fullPrompt = negativePrompt ? `${prompt}, negative prompt: ${negativePrompt}` : prompt;
    return ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio,
        },
    });
};

export const editImage = async (prompt: string, productImage: ImageFile, sceneImage: ImageFile | null): Promise<GenerateContentResponse> => {
    const parts: any[] = [
        { inlineData: { data: productImage.base64, mimeType: productImage.mimeType } },
    ];

    if (sceneImage) {
        parts.push({ inlineData: { data: sceneImage.base64, mimeType: sceneImage.mimeType } });
    }
    
    parts.push({ text: prompt });

    return ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
};

export const generateVideo = async (prompt: string, baseImage: ImageFile | null) => {
    const options: any = {
        model: 'veo-2.0-generate-001',
        prompt,
        config: { numberOfVideos: 1 }
    };

    if (baseImage) {
        options.image = {
            imageBytes: baseImage.base64,
            mimeType: baseImage.mimeType,
        };
    }

    return ai.models.generateVideos(options);
};

export const pollVideoStatus = async (operation: any) => {
    return ai.operations.getVideosOperation({ operation });
};

export const translateText = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text from Portuguese to English: "${text}"`,
    });
    return response.text.trim();
};

export const buildPrompt = async (type: string, subject: string, style: string, details: string): Promise<string> => {
    const userPrompt = `
      Create a creative and well-structured image generation prompt based on these keywords.
      Make it descriptive and evocative.

      Type: ${type}
      Subject: ${subject}
      Style: ${style}
      Details: ${details}
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
    });
    return response.text.trim();
};

export const generateProductPlacementPrompt = async (productImage: ImageFile, sceneImage: ImageFile, productSize: ProductSize): Promise<string> => {
    
    const getSizeInstruction = (): string => {
        switch (productSize) {
            case 'Much Smaller':
                return "Make the product approximately 50% smaller than the original object it's replacing.";
            case 'Smaller':
                return "Make the product approximately 25% smaller than the original object it's replacing.";
            case 'Larger':
                return "Make the product approximately 25% larger than the original object it's replacing.";
            case 'Much Larger':
                return "Make the product approximately 50% larger than the original object it's replacing.";
            case 'Same Size':
            default:
                return "";
        }
    };
    
    const systemPrompt = `You are a world-class expert in photorealistic digital art and product placement. Your task is to act as a bridge between a user's images and a powerful image editing AI. You will receive a 'Product Image' and a 'Scene Image'. Your job is to generate a highly detailed, expert-level prompt that instructs the editing AI to seamlessly and realistically integrate the product into the scene.

**Your process must be as follows:**

**Step 1: Deep Analysis of the Product Image.**
Before writing the prompt, you must internally analyze and understand the product's core characteristics. Identify:
-   **Primary Material(s):** Is it glass, metal, plastic, ceramic, wood? Be specific (e.g., 'clear ribbed glass', 'brushed aluminum', 'matte white ceramic').
-   **Surface Properties:** Note its texture and finish (e.g., glossy, matte, translucent, reflective, textured, smooth).
-   **Contents:** If the product is a container, what is inside? Describe its properties (e.g., 'viscous, opaque white liquid', 'clear amber fluid', 'empty').
-   **Color and Form:** Note the precise colors and the overall shape and structure of the product.
-   **Inferred Scale:** Based on the object (e.g., lotion dispenser, perfume bottle), what is its likely real-world size?

**Step 2: Generate the Editing Prompt.**
Using your analysis from Step 1, construct a single, cohesive prompt for the editing AI. This prompt must include the following explicit instructions:

1.  **Complete Object Removal:** Start by clearly instructing the AI to **"Completely and entirely remove the [main subject of the scene] from the scene."** Be specific about what to remove.

2.  **Product Reconstruction and Placement:** Instruct the AI to **recreate and place** the product from the 'Product Image' where the original object was. It's crucial to use the word "recreate" to imply a photorealistic rendering, not a simple copy-paste.

3.  **Material-Specific Realism (CRITICAL):** This is the most important part. Based on your analysis, give detailed instructions on how to render the product's materials within the context of the scene.
    -   **Example for Glass/Liquid:** "Recreate the product as a high-fidelity model of a ribbed glass bottle containing a milky, opaque lotion. Render the scene's light realistically refracting through the ribbed glass, showing subtle highlights on the ridges. The internal liquid should appear translucent, catching ambient light softly. Ensure reflections on the glass surface accurately mirror the surrounding environment."
    -   **Example for Metal:** "Recreate the product with a brushed steel texture. Capture the anisotropic reflections characteristic of brushed metal, ensuring they align with the scene's primary light source. Cast soft, realistic contact shadows beneath the product."

4.  **Fidelity and Proportions:** Emphasize that the recreated product must be **extremely faithful** to the original's shape, color, branding, and details. Crucially, render the product at a realistic scale and proportion, similar in size to the object it is replacing.

5.  **Lighting and Shadow Integration:** Explicitly command the AI to integrate the product by matching the scene's lighting (direction, color, temperature, softness) and casting physically accurate shadows and contact occlusion.

The final output must be ONLY the generated prompt string itself, without any additional explanation, preamble, or markdown formatting.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: systemPrompt },
                { inlineData: { mimeType: productImage.mimeType, data: productImage.base64 } },
                { inlineData: { mimeType: sceneImage.mimeType, data: sceneImage.base64 } }
            ]
        }
    });

    const basePrompt = response.text.trim();
    const sizeInstruction = getSizeInstruction();

    // Append the size instruction to the base prompt if it exists.
    const finalPrompt = [basePrompt, sizeInstruction].filter(Boolean).join(' ');

    return finalPrompt;
};
