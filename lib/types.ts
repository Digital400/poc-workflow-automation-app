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
    variant?: string
    size?: string
    validated?: boolean
  }>
  blobPath?: string
  
  // Additional fields from the JSON structure
  emailAddress?: string
  accountNumber?: string
  deliverySequence?: string
  customerId?: string
  orderId?: number
  isPickup?: string
  isDelivery?: string
  orderPickupDetails?: {
    pickupBranch: string
    pickupBranchCode: string
    pickupAddress: string
    pickupCity: string
    pickupSuburb: string
    pickupPostCode: string
    preferredDate: string
    firstName: string
    lastName: string
    contactNumber: string
    emailAddress: string
  }
  orderNote?: string
  deliveryInstructions?: string
  date?: string
  paymentType?: string
  shippingAddress?: {
    firstName: string
    lastName: string
    contactNumber: string
    businessName: string
    addressDetails: string
    streetAddress: string
    city: string
    suburb: string
    country: string
    postCode: string
    latitude: number
    longitude: number
    attentionTo: string
  }
  invoiceAddress?: {
    firstName: string
    lastName: string
    contactNumber: string
    businessName: string
    addressDetails: string
    streetAddress: string
    city: string
    suburb: string
    country: string
    postCode: string
    latitude: number
    longitude: number
    attentionTo: string
  }
  cardDetails?: {
    cardType: string
    nameOnCard: string
    amount: number
    currency: string
    cardNumber: string
    authcode: string
    transactionType: string
    transactionId: string
    tarnsactionReference: string
    responseText: string
  }
  freightCharge?: number
  freightChargeWithGst?: number
  gst?: number
  subTotal?: number
  totalPriceWithGst?: number
} 