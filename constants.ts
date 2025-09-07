import { PromptHelperContent } from './types';

export const VIDEO_LOADING_MESSAGES = [
    "Iniciando a geração do vídeo...",
    "Enviando solicitação para a matriz de vídeo...",
    "Aquecendo os motores de renderização...",
    "Consultando o resultado inicial...",
    "A IA está sonhando com o seu vídeo...",
    "Verificando o status da operação...",
    "Juntando os frames...",
    "Isso pode levar alguns minutos, por favor aguarde...",
    "Ainda consultando o resultado...",
    "Finalizando o fluxo de vídeo...",
    "Quase lá...",
];

export const PROMPT_HELPER_CONTENT: { [key: string]: PromptHelperContent } = {
    en: {
        title: "Prompt Helper",
        promptGuide: {
            title: "Prompt Guide",
            content: "A good prompt is specific and descriptive. Think about the subject, the setting, the style, and any specific details you want to include.",
            example: {
                title: "Example Prompt:",
                prompt: "A cinematic, wide-angle shot of a majestic bioluminescent jellyfish gracefully floating in the dark, deep abyss of the ocean, surrounded by sparkling plankton, hyper-detailed, 8K, Unreal Engine."
            }
        },
        editingGuide: {
            title: "Editing Guide",
            content: "When editing, describe the change you want to make. Be clear and concise.",
            examples: [
                { title: "Add Something:", prompt: "Add a small, red boat floating on the water." },
                { title: "Change Style:", prompt: "Make this image in the style of Vincent van Gogh." },
                { title: "Change Color:", prompt: "Change the color of the car to a vibrant blue." }
            ]
        },
        promptBuilder: {
            title: "Prompt Builder",
            type: "Type (e.g., photo, painting, 3D render)",
            subject: "Subject (e.g., a dragon, a futuristic city)",
            style: "Style (e.g., cyberpunk, watercolor, realistic)",
            details: "Details (e.g., with neon lights, at sunset)",
            generateButton: "Generate Prompt",
            yourPrompt: "Your Generated Prompt:"
        },
        stylesKeywords: {
            title: "Styles & Keywords",
            categories: [
                { name: "Photography Styles", keywords: [{ name: "Cinematic", value: "cinematic shot" }, { name: "Portrait", value: "portrait photography" }, { name: "Landscape", value: "landscape photography" }, { name: "Macro", value: "macro photography" }] },
                { name: "Art Styles", keywords: [{ name: "Impressionism", value: "impressionist painting" }, { name: "Surrealism", value: "surrealist art" }, { name: "Pop Art", value: "pop art style" }, { name: "Minimalist", value: "minimalist" }] },
                { name: "Artists", keywords: [{ name: "Van Gogh", value: "in the style of Vincent van Gogh" }, { name: "Salvador Dalí", value: "in the style of Salvador Dalí" }, { name: "Hokusai", value: "in the style of Hokusai" }] },
                { name: "Lighting", keywords: [{ name: "Golden Hour", value: "golden hour lighting" }, { name: "Neon", value: "neon lighting" }, { name: "Dramatic", value: "dramatic lighting" }] },
                { name: "Effects", keywords: [{ name: "Bioluminescent", value: "bioluminescent" }, { name: "Holographic", value: "holographic" }, { name: "Glimmering", value: "glimmering" }] },
            ]
        },
        negativePrompts: {
            title: "Negative Prompts",
            content: "Use negative prompts to exclude things you don't want in your image. This helps refine the result.",
            keywords: ["ugly", "blurry", "bad anatomy", "watermark", "text", "low quality", "extra limbs"]
        }
    },
    'pt-br': {
        title: "Ajudante de Prompt",
        promptGuide: {
            title: "Guia de Prompt",
            content: "Um bom prompt é específico e descritivo. Pense no assunto, no cenário, no estilo e em quaisquer detalhes específicos que você queira incluir.",
            example: {
                title: "Exemplo de Prompt:",
                prompt: "Uma foto cinematográfica, grande angular, de uma majestosa água-viva bioluminescente flutuando graciosamente no abismo escuro e profundo do oceano, cercada por plâncton cintilante, hiperdetalhada, 8K, Unreal Engine."
            }
        },
        editingGuide: {
            title: "Guia de Edição",
            content: "Ao editar, descreva a mudança que você deseja fazer. Seja claro e conciso.",
            examples: [
                { title: "Adicionar Algo:", prompt: "Adicione um pequeno barco vermelho flutuando na água." },
                { title: "Mudar Estilo:", prompt: "Faça esta imagem no estilo de Vincent van Gogh." },
                { title: "Mudar Cor:", prompt: "Mude a cor do carro para um azul vibrante." }
            ]
        },
        promptBuilder: {
            title: "Construtor de Prompt",
            type: "Tipo (ex: foto, pintura, render 3D)",
            subject: "Assunto (ex: um dragão, uma cidade futurista)",
            style: "Estilo (ex: cyberpunk, aquarela, realista)",
            details: "Detalhes (ex: com luzes de neon, ao pôr do sol)",
            generateButton: "Gerar Prompt",
            yourPrompt: "Seu Prompt Gerado:"
        },
        stylesKeywords: {
            title: "Estilos & Palavras-chave",
            categories: [
                { name: "Estilos de Fotografia", keywords: [{ name: "Cinemático", value: "cinematic shot" }, { name: "Retrato", value: "portrait photography" }, { name: "Paisagem", value: "landscape photography" }, { name: "Macro", value: "macro photography" }] },
                { name: "Estilos de Arte", keywords: [{ name: "Impressionismo", value: "impressionist painting" }, { name: "Surrealismo", value: "surrealist art" }, { name: "Pop Art", value: "pop art style" }, { name: "Minimalista", value: "minimalist" }] },
                { name: "Artistas", keywords: [{ name: "Van Gogh", value: "in the style of Vincent van Gogh" }, { name: "Salvador Dalí", value: "in the style of Salvador Dalí" }, { name: "Hokusai", value: "in the style of Hokusai" }] },
                { name: "Iluminação", keywords: [{ name: "Golden Hour", value: "golden hour lighting" }, { name: "Neon", value: "neon lighting" }, { name: "Dramática", value: "dramatic lighting" }] },
                { name: "Efeitos", keywords: [{ name: "Bioluminescente", value: "bioluminescent" }, { name: "Holográfico", value: "holographic" }, { name: "Cintilante", value: "glimmering" }] },
            ]
        },
        negativePrompts: {
            title: "Prompts Negativos",
            content: "Use prompts negativos para excluir coisas que você не quer na sua imagem. Isso ajuda a refinar o resultado.",
            keywords: ["feio", "borrado", "anatomia ruim", "marca d'água", "texto", "baixa qualidade", "membros extras"]
        }
    }
};