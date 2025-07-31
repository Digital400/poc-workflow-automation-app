export type Transaction = {
  id: string
  integrationService: string
  referenceId: string
  status: "pending" | "processing" | "completed" | "failed"
  createdOn: string
}

export const transactionData: Transaction[] = [
  {
    id: "1",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-001",
    status: "completed",
    createdOn: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-002",
    status: "processing",
    createdOn: "2024-01-15T11:45:00Z",
  },
  {
    id: "3",
    integrationService: "Square POS",
    referenceId: "SQ-2024-003",
    status: "pending",
    createdOn: "2024-01-15T12:15:00Z",
  },
  {
    id: "4",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-004",
    status: "failed",
    createdOn: "2024-01-15T13:20:00Z",
  },
  {
    id: "5",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-005",
    status: "completed",
    createdOn: "2024-01-15T14:05:00Z",
  },
  {
    id: "6",
    integrationService: "Square POS",
    referenceId: "SQ-2024-006",
    status: "processing",
    createdOn: "2024-01-15T15:30:00Z",
  },
  {
    id: "7",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-007",
    status: "completed",
    createdOn: "2024-01-15T16:45:00Z",
  },
  {
    id: "8",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-008",
    status: "pending",
    createdOn: "2024-01-15T17:10:00Z",
  },
  {
    id: "9",
    integrationService: "Square POS",
    referenceId: "SQ-2024-009",
    status: "completed",
    createdOn: "2024-01-15T18:25:00Z",
  },
  {
    id: "10",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-010",
    status: "processing",
    createdOn: "2024-01-15T19:40:00Z",
  },
  {
    id: "11",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-011",
    status: "completed",
    createdOn: "2024-01-16T09:15:00Z",
  },
  {
    id: "12",
    integrationService: "Square POS",
    referenceId: "SQ-2024-012",
    status: "failed",
    createdOn: "2024-01-16T10:30:00Z",
  },
  {
    id: "13",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-013",
    status: "pending",
    createdOn: "2024-01-16T11:45:00Z",
  },
  {
    id: "14",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-014",
    status: "completed",
    createdOn: "2024-01-16T12:20:00Z",
  },
  {
    id: "15",
    integrationService: "Square POS",
    referenceId: "SQ-2024-015",
    status: "processing",
    createdOn: "2024-01-16T13:35:00Z",
  },
  {
    id: "16",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-016",
    status: "completed",
    createdOn: "2024-01-16T14:50:00Z",
  },
  {
    id: "17",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-017",
    status: "failed",
    createdOn: "2024-01-16T15:05:00Z",
  },
  {
    id: "18",
    integrationService: "Square POS",
    referenceId: "SQ-2024-018",
    status: "pending",
    createdOn: "2024-01-16T16:20:00Z",
  },
  {
    id: "19",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-019",
    status: "completed",
    createdOn: "2024-01-16T17:35:00Z",
  },
  {
    id: "20",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-020",
    status: "processing",
    createdOn: "2024-01-16T18:50:00Z",
  },
  {
    id: "21",
    integrationService: "Square POS",
    referenceId: "SQ-2024-021",
    status: "completed",
    createdOn: "2024-01-17T09:25:00Z",
  },
  {
    id: "22",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-022",
    status: "failed",
    createdOn: "2024-01-17T10:40:00Z",
  },
  {
    id: "23",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-023",
    status: "pending",
    createdOn: "2024-01-17T11:55:00Z",
  },
  {
    id: "24",
    integrationService: "Square POS",
    referenceId: "SQ-2024-024",
    status: "completed",
    createdOn: "2024-01-17T12:10:00Z",
  },
  {
    id: "25",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-025",
    status: "processing",
    createdOn: "2024-01-17T13:25:00Z",
  },
  {
    id: "26",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-026",
    status: "completed",
    createdOn: "2024-01-17T14:40:00Z",
  },
  {
    id: "27",
    integrationService: "Square POS",
    referenceId: "SQ-2024-027",
    status: "failed",
    createdOn: "2024-01-17T15:55:00Z",
  },
  {
    id: "28",
    integrationService: "Stripe Payment",
    referenceId: "STR-2024-028",
    status: "pending",
    createdOn: "2024-01-17T16:10:00Z",
  },
  {
    id: "29",
    integrationService: "PayPal Gateway",
    referenceId: "PP-2024-029",
    status: "completed",
    createdOn: "2024-01-17T17:25:00Z",
  },
  {
    id: "30",
    integrationService: "Square POS",
    referenceId: "SQ-2024-030",
    status: "processing",
    createdOn: "2024-01-17T18:40:00Z",
  },
]

// Create a mutable copy of the transaction data that can be updated
export let mutableTransactionData: Transaction[] = [...transactionData]

// Function to update the mutable transaction data
export const updateTransactionData = (updatedTransaction: Transaction) => {
  mutableTransactionData = mutableTransactionData.map(transaction => 
    transaction.id === updatedTransaction.id ? updatedTransaction : transaction
  )
}

// Function to reset the mutable data to original state
export const resetTransactionData = () => {
  mutableTransactionData = [...transactionData]
} 