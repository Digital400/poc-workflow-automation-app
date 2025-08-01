"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Eye, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface TransactionsTableProps {
  data: Transaction[]
  onViewTransaction: (transaction: Transaction) => void
  onEditTransaction: (transaction: Transaction) => void
  currentPage: number
  totalPages: number
  pageSize: number
  totalRecords: number
  searchTerm: string
  loading?: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearchChange: (search: string) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function TransactionsTable({ 
  data, 
  onViewTransaction, 
  onEditTransaction,
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  searchTerm,
  loading = false,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange
}: TransactionsTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: () => {
        const isSorted = sortBy === 'id'
        const isAsc = sortOrder === 'asc'
        return (
          <Button
            variant="ghost"
            onClick={() => onSortChange('id', isSorted && isAsc ? 'desc' : 'asc')}
          >
            TransactionId
            <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? 'opacity-100' : 'opacity-50'}`} />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "purchaseOrderReference",
      header: () => {
        const isSorted = sortBy === 'purchaseOrderReference'
        const isAsc = sortOrder === 'asc'
        return (
          <Button
            variant="ghost"
            onClick={() => onSortChange('purchaseOrderReference', isSorted && isAsc ? 'desc' : 'asc')}
          >
            Purchase Order
            <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? 'opacity-100' : 'opacity-50'}`} />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("purchaseOrderReference") || "N/A"}</div>,
    },
    {
      accessorKey: "referenceValue",
      header: "Customer Email",
      cell: ({ row }) => <div className="text-sm">{row.getValue("referenceValue") || "N/A"}</div>,
    },
    {
      accessorKey: "orderTotal",
      header: () => {
        const isSorted = sortBy === 'orderTotal'
        const isAsc = sortOrder === 'asc'
        return (
          <Button
            variant="ghost"
            onClick={() => onSortChange('orderTotal', isSorted && isAsc ? 'desc' : 'asc')}
          >
            Total
            <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? 'opacity-100' : 'opacity-50'}`} />
          </Button>
        )
      },
      cell: ({ row }) => {
        const total = row.getValue("orderTotal") as number
        return <div className="text-sm font-medium">{formatCurrency(total)}</div>
      },
    },
    {
      accessorKey: "status",
      header: () => {
        const isSorted = sortBy === 'status'
        const isAsc = sortOrder === 'asc'
        return (
          <Button
            variant="ghost"
            onClick={() => onSortChange('status', isSorted && isAsc ? 'desc' : 'asc')}
          >
            Status
            <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? 'opacity-100' : 'opacity-50'}`} />
          </Button>
        )
      },
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "createdOn",
      header: () => {
        const isSorted = sortBy === 'createdOn'
        const isAsc = sortOrder === 'asc'
        return (
          <Button
            variant="ghost"
            onClick={() => onSortChange('createdOn', isSorted && isAsc ? 'desc' : 'asc')}
          >
            Created On
            <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? 'opacity-100' : 'opacity-50'}`} />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("createdOn"))}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onViewTransaction(transaction)
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEditTransaction(transaction)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
    // Remove pagination and sorting from TanStack Table since we're using server-side pagination and sorting
  })

  const generatePaginationItems = () => {
    const items = []

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => {
            e.preventDefault()
            if (currentPage > 1) {
              onPageChange(currentPage - 1)
            }
          }}
          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    )

    // Page numbers
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              onPageChange(1)
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault()
              onPageChange(i)
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              onPageChange(totalPages)
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => {
            e.preventDefault()
            if (currentPage < totalPages) {
              onPageChange(currentPage + 1)
            }
          }}
          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    )

    return items
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by purchase order, customer, or integration..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                    Loading transactions...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
            }}
            className="h-8 w-16 rounded border border-input bg-background px-2 py-1 text-sm"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Pagination>
              <PaginationContent>
                {generatePaginationItems()}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.length} of {totalRecords} row(s) total.
        </div>
      </div>
    </div>
  )
} 