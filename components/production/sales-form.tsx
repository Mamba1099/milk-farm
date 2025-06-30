"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateSales,
  type CreateSalesData,
} from "@/hooks/use-production-hooks";

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  selectedDate?: string;
}

export function SalesForm({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
}: SalesFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    quantity: "",
    pricePerLiter: "",
    customerName: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createSalesMutation = useCreateSales();

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) <= 0) {
      newErrors.pricePerLiter = "Price per liter must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const salesData: CreateSalesData = {
      date: selectedDate || new Date().toISOString(),
      quantity: parseFloat(formData.quantity),
      pricePerLiter: parseFloat(formData.pricePerLiter),
      customerName: formData.customerName || undefined,
      notes: formData.notes || undefined,
    };

    try {
      await createSalesMutation.mutateAsync(salesData);
      toast({
        title: "Success",
        description: "Sales record created successfully",
      });
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create sales record";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      quantity: "",
      pricePerLiter: "",
      customerName: "",
      notes: "",
    });
    setErrors({});
  };

  const totalAmount =
    (parseFloat(formData.quantity) || 0) *
    (parseFloat(formData.pricePerLiter) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Record Sale</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
          {selectedDate && (
            <p className="text-sm text-gray-600">
              Date: {new Date(selectedDate).toLocaleDateString()}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Time: {new Date().toLocaleTimeString()}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Liters) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Enter quantity sold"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className={errors.quantity ? "border-red-500" : ""}
                required
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Price per Liter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Liter *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter price per liter"
                value={formData.pricePerLiter}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerLiter: e.target.value })
                }
                className={errors.pricePerLiter ? "border-red-500" : ""}
                required
              />
              {errors.pricePerLiter && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.pricePerLiter}
                </p>
              )}
            </div>

            {/* Total Amount Display */}
            {totalAmount > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-green-900">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name (Optional)
              </label>
              <Input
                type="text"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add any additional notes about this sale..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createSalesMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createSalesMutation.isPending ? (
                  <>
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Sale"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
