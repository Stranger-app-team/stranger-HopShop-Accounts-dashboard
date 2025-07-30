"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

interface OrderDetails {
  _id: string;
  orderNo: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  orderId,
}: UploadReceiptModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  // Fetch order details when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoadingOrder(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      // Extract the order data from the nested structure
      const orderData = data.order || data;
      setOrderDetails(orderData);
    } catch (error: any) {
      setMessage(error.message || "Error fetching order details");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!orderId) return;

    try {
      setProcessing(true);
      setMessage("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("Authentication token not found.");
        setProcessing(false);
        return;
      }

      let response;

      if (file) {
        // If file is selected, upload receipt and mark as paid
        const formData = new FormData();
        formData.append("uploadReceipt", file);
        formData.append("paymentStatus", "Paid");

        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/payment-fields`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        // If no file, just mark as paid
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/payment-fields`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentStatus: "Paid",
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to mark as paid");
      }

      const successMessage = file 
        ? "Receipt uploaded and order marked as paid successfully!" 
        : "Order marked as paid successfully!";
      
      setMessage(successMessage);
      setTimeout(() => {
        onClose();
        setFile(null);
        setMessage("");
        // Refresh the page to show updated data
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setMessage(error.message || "Error processing request. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-5 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mark Order as Paid</h2>

        {/* Order Details Section */}
        {loadingOrder ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Loading order details...</p>
          </div>
        ) : orderDetails ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Order ID:</span> {orderDetails.orderNo}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span> ₹{orderDetails.totalAmount?.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Payment Status:</span> 
              <span className={`ml-1 ${orderDetails.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {orderDetails.paymentStatus}
              </span>
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Failed to load order details</p>
          </div>
        )}

        {/* Optional Receipt Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Receipt 
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
        </div>

        {message && (
          <p
            className={`text-sm mt-3 ${
              message.includes("Error") || message.includes("Failed") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-black rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleMarkAsPaid}
            disabled={processing || orderDetails?.paymentStatus === 'Paid'}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Mark as Paid"}
          </button>
        </div>
      </div>
    </div>
  );
}
