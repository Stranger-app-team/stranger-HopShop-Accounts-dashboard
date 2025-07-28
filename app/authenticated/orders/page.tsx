'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const statusTextColors: Record<string, string> = {
  Delivered: 'text-emerald-600',
};

const statusBgColors: Record<string, string> = {
  Delivered: 'bg-emerald-100',
};

const paymentStatusTextColors: Record<string, string> = {
  Paid: 'text-green-600',
  Pending: 'text-yellow-600',
  Failed: 'text-red-600',
  Refunded: 'text-blue-600',
};

const paymentStatusBgColors: Record<string, string> = {
  Paid: 'bg-green-100',
  Pending: 'bg-yellow-100',
  Failed: 'bg-red-100',
  Refunded: 'bg-blue-100',
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/status/Delivered`);
        const data = await res.json();
        const result = Array.isArray(data) ? data : data.orders || [];
        setOrders(result);
      } catch (err) {
        console.error('Failed to fetch delivered orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveredOrders();
  }, []);

  return (
    <div className="flex flex-col gap-4 justify-center py-10 px-2 sm:px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {orders.length} delivered order{orders.length !== 1 && 's'}
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
                ) : orders.length > 0 ? (
                  orders.map((order) => {
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
                              paymentStatusBgColors[order.paymentStatus] || 'bg-gray-100'
                            } ${paymentStatusTextColors[order.paymentStatus] || 'text-gray-600'}`}
                          >
                            {order.paymentStatus || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-2 text-sm whitespace-nowrap">
                          <button
                            className="text-blue-700 hover:underline"
                            onClick={() => router.push(`/authenticated/view-orders/${order._id}`)}
                          >
                            Order Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400">
                      No delivered orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
