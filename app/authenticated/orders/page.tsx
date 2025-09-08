'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import UploadReceiptModal from '@/app/Components/UploadReceiptModal';

const statusTextColors: Record<string, string> = {
  Delivered: 'text-emerald-600',
};

const statusBgColors: Record<string, string> = {
  Delivered: 'bg-emerald-100',
};

const paymentStatusTextColors: Record<string, string> = {
  Paid: 'text-green-600',
  Unpaid: 'text-red-600',
};

const paymentStatusBgColors: Record<string, string> = {
  Paid: 'bg-green-100',
  Unpaid: 'bg-red-100',
};

interface Centre {
  name: string;
  centreId: string;
}

interface Product {
  quantity: number;
  product: {
    name: string;
  };
}

interface Order {
  _id: string;
  orderNo: string;
  centreId: Centre;
  products: Product[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/status/Delivered`);
        const data = await res.json();
        const result = Array.isArray(data) ? data : data.orders || [];
        setOrders(result);
        setFilteredOrders(result);
      } catch (err) {
        console.error('Failed to fetch delivered orders:', err);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveredOrders();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.centreId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.centreId?.centreId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products?.some(p => p.product?.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Payment status filter
    if (paymentStatusFilter) {
      filtered = filtered.filter((order) =>
        paymentStatusFilter === 'Paid' ? order.paymentStatus === 'Paid' : order.paymentStatus !== 'Paid'
      );
    }

    // Date filter
    if (dateFilter) {
      const today = new Date();
      let filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
        default:
          filterDate = new Date(0);
      }
      
      filtered = filtered.filter((order) => new Date(order.createdAt) >= filterDate);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, paymentStatusFilter, dateFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setPaymentStatusFilter('');
    setDateFilter('');
  };

  const hasActiveFilters = searchTerm || paymentStatusFilter || dateFilter;

  return (
    <div className="flex flex-col gap-4 justify-center py-10 px-2 sm:px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {/* Search and Filter Header - All in one line */}
          <div className="mb-6 text-black">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Search Bar - Reduced width */}
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Payment Status Filter */}
              <div className="flex-shrink-0">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Payment Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex-shrink-0">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Date Range</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors border border-gray-300 rounded-lg hover:border-red-300"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} delivered order{orders.length !== 1 && 's'}
              {hasActiveFilters && (
                <span className="text-teal-600 font-medium"> (filtered)</span>
              )}
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="min-w-[800px] w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 h-12 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap">Order</th>
                  <th className="px-4 py-2 whitespace-nowrap">Centre</th>
                  <th className="px-4 py-2 whitespace-nowrap">Items</th>
                  <th className="px-4 py-2 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-2 whitespace-nowrap">Status</th>
                  <th className="px-4 py-2 whitespace-nowrap">Date</th>
                  <th className="px-4 py-2 whitespace-nowrap">Payment Status</th>
                  <th className="px-4 py-2 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const dateObj = new Date(order.createdAt);
                    const date = dateObj.toLocaleDateString();
                    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={order._id} className="border-b border-b-gray-300 bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-teal-700 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold">
                              {order.orderNo?.slice(-3)}
                            </div>
                            <span className="truncate max-w-[100px]">{order.orderNo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium truncate max-w-[120px]">{order.centreId?.name}</div>
                          <div className="text-xs text-gray-400">ID: {order.centreId?.centreId}</div>
                        </td>
                        <td className="px-4 py-3">
                          {order.products?.length} items
                          <div className="text-xs text-gray-400 truncate max-w-[160px]">
                            {order.products?.map((p) => p.product?.name).join(', ')}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">₹{order.totalAmount?.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              statusBgColors[order.status] || 'bg-gray-100'
                            } ${statusTextColors[order.status] || 'text-gray-600'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {date} <br />
                          {time}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              paymentStatusBgColors[order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'] || 'bg-gray-100'
                            } ${paymentStatusTextColors[order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'] || 'text-gray-600'}`}
                          >
                            {order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-2 text-sm whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <button
                              className="text-blue-700 hover:underline text-left"
                              onClick={() => router.push(`/authenticated/view-orders/${order._id}`)}
                            >
                              Order Invoice
                            </button>
                            {order.paymentStatus !== 'Paid' && (
                              <button
                                className="text-green-700 hover:underline text-left"
                                onClick={() => {
                                  setSelectedOrderId(order._id);
                                  setModalOpen(true);
                                }}
                              >
                                Upload Receipt
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">
                      {hasActiveFilters ? 'No orders match your filters.' : 'No delivered orders found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && selectedOrderId && (
        <UploadReceiptModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
}