import { NextResponse } from 'next/server';
import { Client, Source, Image, Text } from 'creatomate';

export const dynamic = 'force-dynamic';

// Minimal 1x1 white JPEG as base64 — smallest valid image
const TINY_WHITE_JPEG = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARC' +
  'AABAAEDASIA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB//Z';

export async function GET() {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'CREATOMATE_API_KEY not set' }, { status: 503 });

  const client = new Client(apiKey);

  try {
    // Simplest possible render: 1 image + 1 text, 3 seconds, 540x960
    const source = new Source({
      outputFormat: 'mp4',
      width: 540,
      height: 960,
      elements: [
        new Image({
          track: 1,
          source: `data:image/jpeg;base64,${TINY_WHITE_JPEG}`,
          duration: 3,
          width: '100%',
          height: '100%',
        }),
        new Text({
          track: 2,
          text: 'Test Render',
          fontFamily: 'Montserrat',
          fontWeight: '700',
          fontSize: '48px',
          fillColor: '#000000',
          x: '50%',
          y: '50%',
          xAnchor: '50%',
          yAnchor: '50%',
        }),
      ],
    });

    const renders = await client.startRender({ source });
    const r = renders[0];

    return NextResponse.json({
      id: r.id,
      status: r.status,
      errorMessage: r.errorMessage ?? null,
      url: r.url ?? null,
    });
  } catch (err) {
    return NextResponse.json({
      error: String(err).slice(0, 500),
    }, { status: 500 });
  }
}
