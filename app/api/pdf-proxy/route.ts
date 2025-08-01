import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  console.log('PDF Proxy requested for URL:', url)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch PDF:', response.status, response.statusText)
      return new NextResponse(`Failed to fetch PDF: ${response.status}`, { status: response.status })
    }

    const pdfBuffer = await response.arrayBuffer()
    const headers = new Headers()
    
    // Force the PDF to be displayed inline
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', 'inline')
    headers.set('Cache-Control', 'public, max-age=3600')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    console.log('PDF Proxy successful, returning PDF with inline disposition')
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Error fetching PDF:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 