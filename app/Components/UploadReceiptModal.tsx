"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  orderId,
}: UploadReceiptModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !orderId) return;

    const formData = new FormData();
    formData.append("uploadReceipt", file);
    formData.append("paymentStatus", "Paid"); 

    try {
      setUploading(true);
      setMessage("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage("Authentication token not found.");
        setUploading(false);
        return;
      }

      const response = await fetch(
        `https://backend.st9.in/api/orders/${orderId}/payment-fields`,
        {
          method: "PUT", // ✅ matches your backend route
          headers: {
            Authorization: `Bearer ${token}`, // ✅ attach auth token
          },
          body: formData, // ✅ formData handles file upload
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Upload failed");
      }

      setMessage("Receipt uploaded successfully!");
      setTimeout(() => {
        onClose();
        setFile(null);
        setMessage("");
      }, 1500);
    } catch (error: any) {
      setMessage(error.message || "Error uploading receipt. Please try again.");
    } finally {
      setUploading(false);
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

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Receipt</h2>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />

        {message && (
          <p
            className={`text-sm mt-3 ${
              message.includes("Error") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex justify-end mt-5 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
