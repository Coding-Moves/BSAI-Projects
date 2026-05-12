// src/components/UI/Badge.jsx
const variants = {
  green:  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  red:    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  blue:   'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  gray:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  teal:   'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function Badge({ variant = 'gray', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function StockBadge({ status }) {
  const map = {
    'In Stock':     'green',
    'Low Stock':    'yellow',
    'Out of Stock': 'red',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export function OrderStatusBadge({ status }) {
  const map = { Completed: 'green', Pending: 'yellow', Cancelled: 'red', Refunded: 'purple' };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export function PaymentBadge({ method }) {
  const map = { Cash: 'teal', Card: 'blue', Online: 'purple', Insurance: 'gray' };
  return <Badge variant={map[method] || 'gray'}>{method}</Badge>;
}
