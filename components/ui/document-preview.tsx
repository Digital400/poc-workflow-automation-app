"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, ZoomIn, ZoomOut } from "lucide-react"

interface DocumentPreviewProps {
  pdfUrl?: string
  className?: string
}

export function DocumentPreview({ pdfUrl, className = "" }: DocumentPreviewProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useProxy, setUseProxy] = useState(true)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleDownload = () => {
    if (pdfUrl && pdfUrl.trim() !== "") {
      window.open(pdfUrl, '_blank')
    }
  }

  // Create proxy URL for PDF display
  const getProxyUrl = (url: string) => {
    if (!url || url.trim() === "") return ""
    return `/api/pdf-proxy?url=${encodeURIComponent(url)}`
  }

  // Try original URL first, then fallback to proxy if needed
  const getPdfUrl = (url: string) => {
    if (!url || url.trim() === "") return ""
    // Use proxy to handle content-disposition issues
    return useProxy ? getProxyUrl(url) : url
  }

  // Reset error state when PDF URL changes
  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
    setUseProxy(true) // Reset to use proxy by default
    console.log('PDF URL changed:', pdfUrl)
    if (pdfUrl) {
      console.log('Proxy URL:', getPdfUrl(pdfUrl))
    }
  }, [pdfUrl])

  return (
    <div className={`p-4 space-y-4 bg-card border rounded-lg ${className}`}>
              <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Document Preview</span>
            {pdfUrl && (
              <span className="text-xs text-muted-foreground">
                ({useProxy ? 'via proxy' : 'direct'})
              </span>
            )}
          </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          {pdfUrl && pdfUrl.trim() !== "" && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDownload()
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-muted">
        {pdfUrl && pdfUrl.trim() !== "" ? (
          <div className="relative overflow-auto" style={{ height: '500px' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              </div>
            )}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-destructive">Failed to load PDF</p>
                  <p className="text-xs text-muted-foreground">The document may be unavailable or restricted</p>
                </div>
              </div>
            )}
            <iframe
              src={`${getPdfUrl(pdfUrl)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=${Math.round(zoomLevel * 100)}`}
              className="w-full h-full border-0"
              style={{
                minHeight: `${500 * zoomLevel}px`,
                minWidth: `${100 * zoomLevel}%`
              }}
              title="PDF Document"
              onLoad={(e) => {
                setIsLoading(false)
                setHasError(false)
              }}
              onError={() => {
                setIsLoading(false)
                if (useProxy) {
                  // Try original URL as fallback
                  console.log('Proxy failed, trying original URL')
                  setUseProxy(false)
                  setIsLoading(true)
                } else {
                  setHasError(true)
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No PDF document available</p>
              <p className="text-xs text-muted-foreground">PDF will appear here when available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 