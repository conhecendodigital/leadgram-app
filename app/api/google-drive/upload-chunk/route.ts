import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const chunk = formData.get('chunk') as Blob;
    const uploadUrl = formData.get('uploadUrl') as string;
    const start = parseInt(formData.get('start') as string);
    const end = parseInt(formData.get('end') as string);
    const total = parseInt(formData.get('total') as string);

    if (!chunk || !uploadUrl || isNaN(start) || isNaN(end) || isNaN(total)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // BUG #3 FIX: Validar range de chunks
    if (start < 0 || end < 0 || total <= 0) {
      return NextResponse.json(
        { error: 'Invalid chunk parameters: values must be non-negative' },
        { status: 400 }
      );
    }

    if (start >= end || end > total) {
      return NextResponse.json(
        { error: 'Invalid chunk range: start must be < end <= total' },
        { status: 400 }
      );
    }

    // Converter Blob para ArrayBuffer
    const arrayBuffer = await chunk.arrayBuffer();

    // BUG #10 FIX: Validar tamanho máximo do chunk (10MB)
    const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
    if (arrayBuffer.byteLength > MAX_CHUNK_SIZE) {
      return NextResponse.json(
        { error: `Chunk too large. Maximum size is ${MAX_CHUNK_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Enviar chunk para o Google Drive
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Content-Range': `bytes ${start}-${end}/${total}`,
      },
      body: arrayBuffer,
    });

    // 308 = Resume Incomplete (mais chunks necessários)
    // 200/201 = Upload completo
    if (response.status === 308) {
      // Upload incompleto, retornar range recebido
      const range = response.headers.get('Range');
      return NextResponse.json({
        status: 'incomplete',
        range,
      });
    }

    if (response.ok) {
      // Upload completo
      const data = await response.json();
      return NextResponse.json({
        status: 'complete',
        fileId: data.id,
        fileName: data.name,
      });
    }

    // Erro
    const errorText = await response.text();
    console.error('Chunk upload error:', response.status, errorText);
    return NextResponse.json(
      { error: `Upload failed: ${response.status}` },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('❌ Chunk Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload chunk' },
      { status: 500 }
    );
  }
}
