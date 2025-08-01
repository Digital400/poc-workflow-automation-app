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
import { Eye, Edit, Code, FileText, X, Loader2, Settings, Send, CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TransactionDetailDrawerProps {
  transaction: Transaction | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  mode: "view" | "edit"
  onSave?: (updatedTransaction: Transaction) => void
  onDelete?: (id: string) => void
}

interface ERPMapping {
  field: string
  sourceField: string
  sanitize: boolean
  sanitizeOptions: string[]
  userDefinedValue: string
  required: boolean
  type: "string" | "number" | "date" | "array"
  validation?: {
    type: "email" | "required"
    error?: string
  }
}

interface ERPLineItemMapping {
  field: string
  sourceField: string
  sanitize: boolean
  sanitizeOptions: string[]
  userDefinedValue: string
  required: boolean
  type: "string" | "number"
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
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [erpMappings, setErpMappings] = useState<ERPMapping[]>([
    { field: "Reference ID", sourceField: "id", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "string" },
    { field: "purchaseOrderNumber", sourceField: "purchaseOrderReference", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "string" },
    { field: "customerEmail", sourceField: "customerName", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "string", validation: { type: "email" } },
    { field: "Order Total", sourceField: "orderTotal", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "number" },
    { field: "CreateDate", sourceField: "createdOn", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "date" }
  ])
  const [lineItemMappings, setLineItemMappings] = useState<ERPLineItemMapping[]>([
    { field: "style", sourceField: "style", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "string" },
    { field: "sku", sourceField: "sku", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "string" },
    { field: "varient", sourceField: "__empty__", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: false, type: "string" },
    { field: "size", sourceField: "__empty__", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: false, type: "string" },
    { field: "quantity", sourceField: "quantity", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "number" },
    { field: "unitPrice", sourceField: "unitPrice", sanitize: false, sanitizeOptions: [], userDefinedValue: "", required: true, type: "number" }
  ])
  const [isSendingToERP, setIsSendingToERP] = useState<boolean>(false)
  const [erpWizardStep, setErpWizardStep] = useState<"main" | "lineItems">("main")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Helper function to validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Helper function to sanitize data based on options
  const sanitizeData = (value: unknown, sanitizeOptions: string[], userDefinedValue: string): unknown => {
    // If user defined value is provided, use it (regardless of sanitization)
    if (userDefinedValue && userDefinedValue.trim() !== "") {
      return userDefinedValue
    }
    
    // If no value and no user defined value, return the original value
    if (!value) return value
    
    let result = value
    
    // Apply sanitization options in order
    sanitizeOptions.forEach(option => {
      switch (option) {
        case "trim":
          if (typeof result === "string") {
            result = result.trim()
          }
          break
        case "stringToNumber":
          if (typeof result === "string") {
            result = parseFloat(result) || 0
          }
          break
        case "numberToString":
          if (typeof result === "number") {
            result = result.toString()
          }
          break
        case "toUpperCase":
          if (typeof result === "string") {
            result = result.toUpperCase()
          }
          break
        case "toLowerCase":
          if (typeof result === "string") {
            result = result.toLowerCase()
          }
          break
      }
    })
    
    return result
  }

  // Helper function to validate mappings
  const validateMappings = () => {
    const errors: string[] = []
    
    erpMappings.forEach(mapping => {
      if (mapping.validation?.type === "email") {
        // Check user defined value first
        if (mapping.userDefinedValue && mapping.userDefinedValue.trim() !== "") {
          if (!validateEmail(mapping.userDefinedValue)) {
            errors.push(`${mapping.field}: Invalid email format in user defined value`)
          }
        } else if (mapping.sourceField && mapping.sourceField !== "__empty__") {
          // Check source field value
          const sourceValue = transaction?.[mapping.sourceField as keyof Transaction]
          if (sourceValue) {
            // Convert to string for validation
            const stringValue = String(sourceValue).trim()
            if (stringValue !== "") {
              if (!validateEmail(stringValue)) {
                errors.push(`${mapping.field}: Source field "${mapping.sourceField}" does not contain a valid email`)
              }
            } else {
              // Empty value error
              errors.push(`${mapping.field}: Source field "${mapping.sourceField}" is empty`)
            }
          } else {
            // No value error
            errors.push(`${mapping.field}: Source field "${mapping.sourceField}" has no value`)
          }
        } else if (mapping.sourceField === "__empty__") {
          // No field selected error
          errors.push(`${mapping.field}: No source field selected`)
        }
      }
    })
    
    return errors
  }

  // Update validation errors when mappings change
  useEffect(() => {
    const errors = validateMappings()
    setValidationErrors(errors)
  }, [erpMappings, transaction])

  // Helper function to get available source fields from transaction
  const getAvailableSourceFields = () => {
    if (!transaction) return []
    
    const fields: string[] = []
    Object.keys(transaction).forEach(key => {
      if (key !== "orderLines") {
        fields.push(key)
      }
    })
    
    // Add nested fields from orderLines
    if (transaction.orderLines && transaction.orderLines.length > 0) {
      Object.keys(transaction.orderLines[0]).forEach(key => {
        fields.push(`orderLines.${key}`)
      })
    }
    
    return fields
  }

  // Function to send data to ERP
  const sendToERP = async () => {
    if (!transaction) return
    
    // Validate mappings first
    const validationErrors = validateMappings()
    if (validationErrors.length > 0) {
      alert(`Validation errors:\n${validationErrors.join('\n')}`)
      return
    }
    
    setIsSendingToERP(true)
    
    try {
      // Transform data according to mappings
      const transformedData: Record<string, unknown> = {}
      
      // Map main fields
      erpMappings.forEach(mapping => {
        if (mapping.sourceField && mapping.sourceField !== "__empty__") {
          let value = transaction[mapping.sourceField as keyof Transaction]
          
          if (mapping.sanitize) {
            value = sanitizeData(value, mapping.sanitizeOptions, mapping.userDefinedValue) as typeof value
          }
          
          transformedData[mapping.field] = value
        }
      })
      
      // Map line items
      if (transaction.orderLines && transaction.orderLines.length > 0) {
        transformedData.LineItems = transaction.orderLines.map(item => {
          const lineItem: Record<string, unknown> = {}
          
          lineItemMappings.forEach(mapping => {
            if (mapping.sourceField && mapping.sourceField !== "__empty__") {
              let value = item[mapping.sourceField as keyof typeof item]
              
              if (mapping.sanitize) {
                value = sanitizeData(value, mapping.sanitizeOptions, mapping.userDefinedValue) as typeof value
              }
              
              lineItem[mapping.field] = value
            }
          })
          
          return lineItem
        })
      }
      
      // TODO: Send to ERP API
      console.log("Sending to ERP:", transformedData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message
      alert("Data sent to ERP successfully!")
      
    } catch (error) {
      console.error("Error sending to ERP:", error)
      alert("Error sending to ERP")
    } finally {
      setIsSendingToERP(false)
    }
  }

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

  const handleJsonSave = async () => {
    try {
      setIsSaving(true)
      setJsonError("")
      
      const parsedData = JSON.parse(jsonData)
      
      // Prevent changing the transaction ID
      if (parsedData.id !== transaction?.id) {
        setJsonError("Transaction ID cannot be changed")
        setIsSaving(false)
        return
      }
      
      if (transaction && onSave) {
        // Validate required fields
        if (!parsedData.integrationService || !parsedData.status) {
          setJsonError("Integration service and status are required")
          setIsSaving(false)
          return
        }
        
        // Validate status values
        const validStatuses = ["pending", "processing", "completed", "failed"]
        if (!validStatuses.includes(parsedData.status)) {
          setJsonError("Invalid status value")
          setIsSaving(false)
          return
        }
        
        await onSave(parsedData as Transaction)
        setJsonModified(false)
        setIsSaving(false)
      }
    } catch (error) {
      setJsonError("Invalid JSON format")
      setIsSaving(false)
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
          className="mx-auto w-full max-w-full px-12 overflow-y-auto min-h-[78vh]"
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
          
          <DocumentPreview pdfUrl={pdfUrl} className="w-1/4" />

          <div className="mid-container p-4 space-y-4 w-1/4">
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
                    <p className="text-sm">{transaction.integrationService}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div>{getStatusBadge(transaction.status)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Created On</label>
                    <p className="text-sm">{formatDate(transaction.createdOn)}</p>
                  </div>
                </div>
                
                {transaction.orderLines && transaction.orderLines.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Order Items</label>
                    <div className="space-y-2 max-h-46 overflow-y-auto">
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.id}</p>
                </div>
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
                      disabled={mode === "view" || isSaving}
                      className={`w-full h-120 p-3 font-mono text-sm border rounded-md resize-none ${
                        mode === "view" ? "bg-muted/50 cursor-not-allowed" : 
                        isSaving ? "bg-muted/50 cursor-not-allowed" : "bg-muted"
                      }`}
                      placeholder={
                        mode === "view" ? "Read-only JSON view" : 
                        isSaving ? "Saving..." : "Enter JSON data..."
                      }
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
                    disabled={!!jsonError || isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save JSON Changes"
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="right-container p-4 space-y-4 w-1/2 overflow-y-auto">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Digital-Hub Integration
                </CardTitle>
                <CardDescription>
                  Map transaction data to Digital-Hub system format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wizard Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      erpWizardStep === "main" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      1
                    </div>
                    <span className={`text-sm font-medium ${
                      erpWizardStep === "main" ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      Main Fields
                    </span>
                    <div className="w-8 h-px bg-muted"></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      erpWizardStep === "lineItems" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      2
                    </div>
                    <span className={`text-sm font-medium ${
                      erpWizardStep === "lineItems" ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      Line Items
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {erpWizardStep === "lineItems" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setErpWizardStep("main")}
                      >
                        ← Back
                      </Button>
                    )}
                    {erpWizardStep === "main" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setErpWizardStep("lineItems")}
                      >
                        Next →
                      </Button>
                    )}
                  </div>
                </div>

                {/* Main Fields Mapping */}
                {erpWizardStep === "main" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Main Fields</h4>
                      <Badge variant="secondary" className="text-xs">
                        {erpMappings.filter(m => m.sourceField && m.sourceField !== "__empty__").length}/{erpMappings.length} Mapped
                      </Badge>
                    </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {erpMappings.map((mapping, index) => {
                      const hasEmailError = mapping.validation?.type === "email" && 
                        validationErrors.some(error => error.includes(mapping.field))
                      
                      return (
                        <div key={mapping.field} className={`p-3 border rounded-lg bg-muted/30 ${
                          hasEmailError ? 'border-red-500 bg-red-50' : ''
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            {mapping.field}
                            {mapping.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={mapping.sanitize}
                              onCheckedChange={(checked) => {
                                const newMappings = [...erpMappings]
                                newMappings[index].sanitize = checked
                                setErpMappings(newMappings)
                              }}
                            />
                            <span className="text-xs text-muted-foreground">Sanitize</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Source Field</Label>
                            <Select
                              value={mapping.sourceField}
                              onValueChange={(value) => {
                                const newMappings = [...erpMappings]
                                newMappings[index].sourceField = value
                                setErpMappings(newMappings)
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__empty__">Leave Empty</SelectItem>
                                {getAvailableSourceFields().map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {mapping.sanitize && (
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Sanitize Options</Label>
                              <div className="grid grid-cols-2 gap-1">
                                {["trim", "stringToNumber", "numberToString", "toUpperCase", "toLowerCase"].map(option => (
                                  <div key={option} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`${mapping.field}-${option}`}
                                      checked={mapping.sanitizeOptions.includes(option)}
                                      onChange={(e) => {
                                        const newMappings = [...erpMappings]
                                        if (e.target.checked) {
                                          // Prevent conflicting options
                                          if (option === "stringToNumber" && mapping.sanitizeOptions.includes("numberToString")) {
                                            newMappings[index].sanitizeOptions = newMappings[index].sanitizeOptions.filter(opt => opt !== "numberToString")
                                          }
                                          if (option === "numberToString" && mapping.sanitizeOptions.includes("stringToNumber")) {
                                            newMappings[index].sanitizeOptions = newMappings[index].sanitizeOptions.filter(opt => opt !== "stringToNumber")
                                          }
                                          newMappings[index].sanitizeOptions.push(option)
                                        } else {
                                          newMappings[index].sanitizeOptions = newMappings[index].sanitizeOptions.filter(opt => opt !== option)
                                        }
                                        setErpMappings(newMappings)
                                      }}
                                      className="rounded"
                                    />
                                    <Label htmlFor={`${mapping.field}-${option}`} className="text-xs">
                                      {option === "trim" && "Trim"}
                                      {option === "stringToNumber" && "To Number"}
                                      {option === "numberToString" && "To String"}
                                      {option === "toUpperCase" && "Uppercase"}
                                      {option === "toLowerCase" && "Lowercase"}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {mapping.sanitize && (
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                User Defined Value
                                <span className="text-blue-600 ml-1">(Overrides sanitization)</span>
                              </Label>
                              <Input
                                value={mapping.userDefinedValue}
                                onChange={(e) => {
                                  const newMappings = [...erpMappings]
                                  newMappings[index].userDefinedValue = e.target.value
                                  
                                  // If user enters a value, uncheck all sanitization options
                                  if (e.target.value.trim() !== "") {
                                    newMappings[index].sanitizeOptions = []
                                  }
                                  
                                  setErpMappings(newMappings)
                                }}
                                placeholder="Enter value to override sanitization"
                                className={`h-8 ${mapping.userDefinedValue ? 'border-blue-500 bg-blue-50' : ''}`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
                )}
                
                {/* Line Items Mapping */}
                {erpWizardStep === "lineItems" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Line Items</h4>
                      <Badge variant="secondary" className="text-xs">
                        {lineItemMappings.filter(m => m.sourceField && m.sourceField !== "__empty__").length}/{lineItemMappings.length} Mapped
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {lineItemMappings.map((mapping, index) => (
                        <div key={mapping.field} className="p-3 border rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">
                              {mapping.field}
                              {mapping.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={mapping.sanitize}
                                onCheckedChange={(checked) => {
                                  const newMappings = [...lineItemMappings]
                                  newMappings[index].sanitize = checked
                                  setLineItemMappings(newMappings)
                                }}
                              />
                              <span className="text-xs text-muted-foreground">Sanitize</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Source Field</Label>
                              <Select
                                value={mapping.sourceField}
                                onValueChange={(value) => {
                                  const newMappings = [...lineItemMappings]
                                  newMappings[index].sourceField = value
                                  setLineItemMappings(newMappings)
                                }}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__empty__">Leave Empty</SelectItem>
                                  {transaction?.orderLines && transaction.orderLines.length > 0 ? 
                                    Object.keys(transaction.orderLines[0]).map(field => (
                                      <SelectItem key={field} value={field}>
                                        {field}
                                      </SelectItem>
                                    )) : []
                                  }
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {mapping.sanitize && (
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Sanitize Options</Label>
                                <div className="grid grid-cols-2 gap-1">
                                  {["trim", "stringToNumber", "numberToString", "toUpperCase", "toLowerCase"].map(option => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`line-${mapping.field}-${option}`}
                                        checked={mapping.sanitizeOptions.includes(option)}
                                        onChange={(e) => {
                                          const newMappings = [...lineItemMappings]
                                          if (e.target.checked) {
                                            // Prevent conflicting options
                                            if (option === "stringToNumber" && mapping.sanitizeOptions.includes("numberToString")) {
                                              newMappings[index].sanitizeOptions = newMappings[index].sanitizeOptions.filter(opt => opt !== "numberToString")
                                            }
                                            if (option === "numberToString" && mapping.sanitizeOptions.includes("stringToNumber")) {
                                              newMappings[index].sanitizeOptions = newMappings[index].sanitizeOptions.filter(opt => opt !== "stringToNumber")
                                            }
                                            newMappings[index].sanitizeOptions.push(option)
                                          } else {
                                            newMappings[index].sanitizeOptions = newMappings[index].sanitizeOptions.filter(opt => opt !== option)
                                          }
                                          setLineItemMappings(newMappings)
                                        }}
                                        className="rounded"
                                      />
                                      <Label htmlFor={`line-${mapping.field}-${option}`} className="text-xs">
                                        {option === "trim" && "Trim"}
                                        {option === "stringToNumber" && "To Number"}
                                        {option === "numberToString" && "To String"}
                                        {option === "toUpperCase" && "Uppercase"}
                                        {option === "toLowerCase" && "Lowercase"}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {mapping.sanitize && (
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  User Defined Value
                                  <span className="text-blue-600 ml-1">(Overrides sanitization)</span>
                                </Label>
                                <Input
                                  value={mapping.userDefinedValue}
                                  onChange={(e) => {
                                    const newMappings = [...lineItemMappings]
                                    newMappings[index].userDefinedValue = e.target.value
                                    
                                    // If user enters a value, uncheck all sanitization options
                                    if (e.target.value.trim() !== "") {
                                      newMappings[index].sanitizeOptions = []
                                    }
                                    
                                    setLineItemMappings(newMappings)
                                  }}
                                  placeholder="Enter value to override sanitization"
                                  className={`h-8 ${mapping.userDefinedValue ? 'border-blue-500 bg-blue-50' : ''}`}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Send to ERP Button */}
                <div className="pt-4">
                  <Button 
                    onClick={sendToERP}
                    disabled={isSendingToERP}
                    className="w-full"
                  >
                    {isSendingToERP ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending to ERP...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send to ERP
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Validation Status */}
                {validationErrors.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Mapping configuration is valid. All required fields are mapped.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Validation Errors:</div>
                        {validationErrors.map((error, index) => (
                          <div key={index} className="text-sm">• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
          
          <DrawerFooter>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 