import { NextResponse } from 'next/server';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PAGE_ID = '3804912659c180f5815cf9b54eb19c96';

export async function GET() {
  if (!NOTION_TOKEN) return NextResponse.json({ stickers: [] });
  try {
    const res = await fetch(`https://api.notion.com/v1/blocks/${NOTION_PAGE_ID}/children?page_size=50`, {
      headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' },
    });
    const data = await res.json();
    const stickers = (data.results || [])
      .filter((b: any) => b.type === 'callout')
      .map((b: any) => ({ id: b.id, prompt: b.callout?.rich_text?.[0]?.plain_text || '', created: b.created_time }));
    return NextResponse.json({ stickers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
