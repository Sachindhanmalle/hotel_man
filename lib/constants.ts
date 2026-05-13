export const ORDER_STATUS = {
  RECEIVED: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-800' },
  READY: { label: 'Ready', color: 'bg-orange-100 text-orange-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
} as const

export const PAYMENT_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
} as const

export const CATEGORIES = {
  VEG: { label: 'Vegetarian', icon: '🟢' },
  NON_VEG: { label: 'Non-Vegetarian', icon: '🔴' },
  DRINKS: { label: 'Drinks', icon: '🥤' },
  DESSERTS: { label: 'Desserts', icon: '🍰' },
  STARTERS: { label: 'Starters', icon: '🥘' },
  MAIN_COURSE: { label: 'Main Course', icon: '🍛' },
  BREADS: { label: 'Breads', icon: '🍞' },
  RICE: { label: 'Rice', icon: '🍚' },
  SNACKS: { label: 'Snacks', icon: '🍔' },
  BEVERAGES: { label: 'Beverages', icon: '☕' },
} as const

export const USER_ROLES = {
  ADMIN: { label: 'Admin', permissions: ['all'] },
  MANAGER: { label: 'Manager', permissions: ['orders', 'menu', 'analytics', 'staff'] },
  STAFF: { label: 'Staff', permissions: ['orders', 'menu_view'] },
  KITCHEN: { label: 'Kitchen', permissions: ['orders', 'kitchen'] },
} as const
