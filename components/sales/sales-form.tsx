"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icons } from "@/components/icons";
import { useCreateSale } from "@/hooks/use-sales-hooks";
import { useToast } from "@/hooks/use-toast";

interface SalesFormData {
  customerName: string;
  quantity: string;
  totalAmount: string;
  paymentMethod: "CASH" | "MPESA";
}

export function SalesForm() {
  const [formData, setFormData] = useState<SalesFormData>({
    customerName: "",
    quantity: "",
    totalAmount: "",
    paymentMethod: "CASH"
  });

  const createSaleMutation = useCreateSale();
  const { toast } = useToast();

  const handleInputChange = (field: keyof SalesFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.quantity || !formData.totalAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        type: "error"
      });
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        customerName: formData.customerName,
        quantity: parseFloat(formData.quantity),
        totalAmount: parseFloat(formData.totalAmount),
        payment_method: formData.paymentMethod
      });

      // Reset form
      setFormData({
        customerName: "",
        quantity: "",
        totalAmount: "",
        paymentMethod: "CASH"
      });

      toast({
        title: "Success",
        description: "Sale recorded successfully",
        type: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record sale",
        type: "error"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-w-0"
    >
      <Card className="bg-white border-gray-200 shadow-sm w-full min-w-0 h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icons.plus className="h-4 w-4 text-blue-600" />
            <span className="text-gray-800">Record New Sale</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col min-w-0 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col min-w-0">
            <div className="space-y-1">
              <Label htmlFor="customerName" className="text-xs font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-8 text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="quantity" className="text-xs font-medium text-gray-700">
                Quantity (Liters) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                placeholder="0.0"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-8 text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="totalAmount" className="text-xs font-medium text-gray-700">
                Total Amount (KSh) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-8 text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentMethod" className="text-xs font-medium text-gray-700">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: "CASH" | "MPESA") => handleInputChange("paymentMethod", value)}
              >
                <SelectTrigger className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-8 text-sm">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spacer to push button to bottom */}
            <div className="flex-1"></div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={createSaleMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md transition-colors duration-200 text-sm h-8"
              >
                {createSaleMutation.isPending ? (
                  <>
                    <Icons.loader className="h-3 w-3 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Icons.check className="h-3 w-3 mr-2" />
                    Record Sale
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Icons.info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Sales Information</p>
                <p>Enter quantity and calculate total amount manually</p>
                <p>Total amount is the final price you want to charge</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}