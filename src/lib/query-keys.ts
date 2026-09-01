/**
 * Standardized TanStack Query Key Factory for Miegraine POS & Mini-ERP
 * Follows TanStack Query v5 Key Hierarchy Best Practices
 */

export const queryKeys = {
  // Products & Inventory
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (outletId?: string, search?: string) => [...queryKeys.products.lists(), { outletId, search }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (productId: string) => [...queryKeys.products.details(), productId] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },

  // Customers & Debts
  customers: {
    all: ['customers'] as const,
    list: (search?: string) => [...queryKeys.customers.all, 'list', { search }] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },

  // POS Cashier Shift
  shifts: {
    all: ['shifts'] as const,
    active: (outletId?: string) => [...queryKeys.shifts.all, 'active', outletId] as const,
    history: (outletId?: string) => [...queryKeys.shifts.all, 'history', outletId] as const,
  },

  // Transactions & Sales
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: { outletId?: string; startDate?: string; endDate?: string; page?: number }) =>
      [...queryKeys.transactions.all, 'list', filters] as const,
    detail: (invoiceNo: string) => [...queryKeys.transactions.all, 'detail', invoiceNo] as const,
  },

  // Stock Mutations & Transfers
  inventory: {
    all: ['inventory'] as const,
    mutations: (productId?: string) => [...queryKeys.inventory.all, 'mutations', productId] as const,
    transfers: (status?: string) => [...queryKeys.inventory.all, 'transfers', status] as const,
    purchases: (status?: string) => [...queryKeys.inventory.all, 'purchases', status] as const,
  },

  // Executive Reports
  reports: {
    all: ['reports'] as const,
    summary: (startDate?: string, endDate?: string) => [...queryKeys.reports.all, 'summary', { startDate, endDate }] as const,
    pnl: (period?: string) => [...queryKeys.reports.all, 'pnl', period] as const,
  },
};
