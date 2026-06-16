import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PAGE_ID = '3804912659c180f5815cf9b54eb19c96';

async function saveToNotion(prompt: string, festival: string) {
  if (!NOTION_TOKEN) return;
  try {
    await fetch(`https://api.notion.com/v1/blocks/${NOTION_PAGE_ID}/children`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        children: [{
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [{ type: 'text', text: { content: `🐱 [${festival}] "${prompt}" — ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` } }],
            icon: { emoji: '🐱' },
            color: 'pink_background',
          },
        }],
      }),
    });
  } catch (e) {
    console.error('Notion save failed:', e);
  }
}

export async function POST(req: NextRequest) {
  const { prompt, festival = 'Lunar New Year', festivalDesc = 'red lanterns, gold coins, fireworks' } = await req.json();

  if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

  const fullPrompt = `Create a cute kawaii sticker illustration.

Character: "Ding Ding Cat" - a famous Hong Kong mascot cat with:
- Large yellow-gold bell-shaped helmet with green propeller on top and green ear cutouts
- Calico cat face: beige base with brown patches, big sparkly round eyes, pink blush cheeks
- Chubby chibi body with tiny paws, bold dark brown outlines
- Kawaii sticker art style

Festival theme: ${festival} — decorated with ${festivalDesc}

The cat is: ${prompt}

Style: vibrant colors, clean bold outlines, white or transparent background, single centered sticker composition, no text.`;

  try {
    const result = await generateText({
      model: 'google/gemini-3.1-flash-image-preview' as any,
      prompt: fullPrompt,
      experimental_providerMetadata: {
        gateway: { apiKey: process.env.AI_GATEWAY_API_KEY }
      }
    } as any);

    const imageFiles = (result as any).files?.filter((f: any) => f.mediaType?.startsWith('image/'));
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    const base64 = Buffer.from(imageFiles[0].uint8Array).toString('base64');
    const dataUrl = `data:${imageFiles[0].mediaType};base64,${base64}`;

    saveToNotion(prompt, festival);
    return NextResponse.json({ image: dataUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
