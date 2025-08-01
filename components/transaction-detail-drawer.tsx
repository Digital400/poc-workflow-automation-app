"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { DocumentPreview } from "@/components/ui/document-preview"
import { Transaction } from "@/lib/types"
import { Eye, Edit, Code, FileText, X } from "lucide-react"

interface TransactionDetailDrawerProps {
  transaction: Transaction | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: "view" | "edit"
  onSave?: (updatedTransaction: Transaction) => void
  onDelete?: (id: string) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function TransactionDetailDrawer({ 
  transaction, 
  isOpen, 
  onOpenChange, 
  mode,
  onSave,
  onDelete
}: TransactionDetailDrawerProps) {
  const [editData, setEditData] = useState<Partial<Transaction>>({})
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [viewMode, setViewMode] = useState<"default" | "json">("default")
  const [jsonData, setJsonData] = useState<string>("")
  const [jsonError, setJsonError] = useState<string>("")
  const [jsonModified, setJsonModified] = useState<boolean>(false)

  useEffect(() => {
    if (transaction) {
      setEditData({
        integrationService: transaction.integrationService,
        status: transaction.status
      })
      console.log(transaction)
      // Mock PDF URL - replace with actual PDF URL from transaction data
      setPdfUrl(transaction.blobPath || "")
      
      // Initialize JSON data
      setJsonData(JSON.stringify(transaction, null, 2))
      setJsonError("")
      setJsonModified(false)
    }
  }, [transaction])

  const handleSave = () => {
    if (transaction && onSave) {
      const updatedTransaction: Transaction = {
        ...transaction,
        ...editData
      }
      onSave(updatedTransaction)
      onOpenChange(false)
    }
  }

  const handleJsonSave = () => {
    try {
      const parsedData = JSON.parse(jsonData)
      
      // Prevent changing the transaction ID
      if (parsedData.id !== transaction?.id) {
        setJsonError("Transaction ID cannot be changed")
        return
      }
      
      if (transaction && onSave) {
        // Validate required fields
        if (!parsedData.integrationService || !parsedData.status) {
          setJsonError("Integration service and status are required")
          return
        }
        
        // Validate status values
        const validStatuses = ["pending", "processing", "completed", "failed"]
        if (!validStatuses.includes(parsedData.status)) {
          setJsonError("Invalid status value")
          return
        }
        
        onSave(parsedData as Transaction)
        setJsonModified(false)
        onOpenChange(false)
      }
      setJsonError("")
    } catch (error) {
      setJsonError("Invalid JSON format")
    }
  }

  // Update JSON data when editData changes in default view
  useEffect(() => {
    if (transaction && (editData.integrationService !== transaction.integrationService || editData.status !== transaction.status)) {
      const updatedTransaction = {
        ...transaction,
        ...editData
      }
      // Ensure the transaction ID is preserved
      updatedTransaction.id = transaction.id
      const newJsonData = JSON.stringify(updatedTransaction, null, 2)
      setJsonData(newJsonData)
      // Reset modified state since this is a programmatic update
      setJsonModified(false)
    }
  }, [editData, transaction])

  const handleJsonChange = (value: string) => {
    setJsonData(value)
    setJsonError("")
    
    // Check if JSON has been modified from original
    if (transaction) {
      const originalJson = JSON.stringify(transaction, null, 2)
      setJsonModified(value !== originalJson)
    }
    
    try {
      const parsedData = JSON.parse(value)
      
      // Ensure transaction ID is preserved
      if (transaction && parsedData.id !== transaction.id) {
        // Replace the ID with the original one
        parsedData.id = transaction.id
        setJsonData(JSON.stringify(parsedData, null, 2))
      }
      
      // Update the editData state to reflect JSON changes in default view
      setEditData({
        integrationService: parsedData.integrationService || transaction?.integrationService,
        status: parsedData.status || transaction?.status
      })
    } catch {
      // Don't set error for partial JSON while typing
      if (value.trim() !== "") {
        setJsonError("Invalid JSON format")
      }
    }
  }

  if (!transaction) return null

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div 
          className="mx-auto w-full max-w-full px-12 overflow-y-auto min-h-[75vh]"
          style={{
            imageRendering: 'crisp-edges',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  {mode === "view" ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  {mode === "view" ? "View Transaction" : "Edit Transaction"}
                </DrawerTitle>
                <DrawerDescription>
                  Transaction details for {transaction.purchaseOrderReference || transaction.referenceValue}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex flex-row gap-4">
          
          <DocumentPreview pdfUrl={pdfUrl} className="w-1/3" />

          <div className="mid-container p-4 space-y-4 w-1/3">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-muted-foreground">View Mode</label>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "default" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("default")}
                  className="rounded-none border-0"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Default
                </Button>
                <Button
                  variant={viewMode === "json" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("json")}
                  className="rounded-none border-0"
                >
                  <Code className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>

            {viewMode === "default" ? (
              // Default View
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Purchase Order</label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.purchaseOrderReference || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Reference Key</label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.referenceKey || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Reference Value</label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.referenceValue || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                    <p className="text-sm">{transaction.customerName || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Order Total</label>
                    <p className="text-sm font-medium">${transaction.orderTotal?.toFixed(2) || "0.00"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Integration Service</label>
                    {mode === "view" ? (
                      <p className="text-sm">{transaction.integrationService}</p>
                    ) : (
                      <input 
                        type="text" 
                        value={editData.integrationService || ""}
                        onChange={(e) => setEditData(prev => ({ ...prev, integrationService: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    {mode === "view" ? (
                      <div>{getStatusBadge(transaction.status)}</div>
                    ) : (
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={editData.status || transaction.status}
                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as Transaction["status"] }))}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Created On</label>
                    <p className="text-sm">{formatDate(transaction.createdOn)}</p>
                  </div>
                </div>
                
                {mode === "view" && transaction.orderLines && transaction.orderLines.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Order Items</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {transaction.orderLines.map((item, index) => (
                        <div key={index} className="text-sm bg-muted p-2 rounded">
                          <div className="flex justify-between">
                            <span>{item.style} - {item.sku}</span>
                            <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {item.quantity} | Total: ${(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {mode === "view" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.id}</p>
                  </div>
                )}
              </div>
            ) : (
              // JSON View
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Transaction JSON</label>
                    {jsonModified && (
                      <Badge variant="secondary" className="text-xs">
                        Modified
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {mode === "view" ? "Read-only view" : "Note: Transaction ID cannot be modified"}
                  </div>
                  <div className="relative h-full">
                    <textarea
                      value={jsonData}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      disabled={mode === "view"}
                      className={`w-full h-120 p-3 font-mono text-sm border rounded-md resize-none ${
                        mode === "view" ? "bg-muted/50 cursor-not-allowed" : "bg-muted"
                      }`}
                      placeholder={mode === "view" ? "Read-only JSON view" : "Enter JSON data..."}
                    />
                    {jsonError && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="destructive" className="text-xs">
                          {jsonError}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {mode === "edit" && jsonModified && (
                  <Button 
                    onClick={handleJsonSave}
                    disabled={!!jsonError}
                    className="w-full"
                  >
                    Save JSON Changes
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="right-container p-4 space-y-4 bg-blue-200 w-1/3">Right Container</div>
          </div>
          
          <DrawerFooter>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 