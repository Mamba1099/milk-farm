"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export function MpesaIntegrationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full min-w-0"
    >
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 w-full min-w-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex items-center gap-2">
              <Icons.dollarSign className="h-5 w-5 text-green-600" />
              <span className="text-green-800">M-Pesa Integration</span>
            </div>
            <div className="ml-auto">
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              Seamless mobile money integration for automated milk sales payments. 
              Accept payments directly through M-Pesa and track transactions in real-time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start gap-3">
                <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Automated Payments</p>
                  <p className="text-xs text-gray-500">Direct STK push integration</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Transaction Tracking</p>
                  <p className="text-xs text-gray-500">Real-time payment verification</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Customer Records</p>
                  <p className="text-xs text-gray-500">Automatic customer database</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Receipt Generation</p>
                  <p className="text-xs text-gray-500">SMS receipts for customers</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-100/50 rounded-lg p-3 mt-4">
              <div className="flex items-center gap-2">
                <Icons.info className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-700 font-medium">
                  Integration in development - Stay tuned for updates!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}