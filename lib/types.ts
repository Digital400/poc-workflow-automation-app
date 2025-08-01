export type Transaction = {
  id: string
  integrationService: string
  referenceKey: string
  referenceValue: string
  purchaseOrderReference?: string
  status: "pending" | "processing" | "completed" | "failed"
  createdOn: string
  customerName?: string
  orderTotal?: number
  orderLines?: Array<{
    style: string
    sku: string
    quantity: number
    unitPrice: number
  }>
  blobPath?: string
} 