"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full w-20 h-20 flex items-center justify-center">
            <Icons.shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-gray-800 text-xl">Security Settings</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Icons.alertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Under Construction</span>
            <Icons.alertCircle className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your farm's security is our top priority. We're developing advanced security 
              features including two-factor authentication, password policies, session 
              management, and access controls to keep your data safe and secure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.shield className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Two-Factor Auth</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.lock className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Password Policy</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.settings className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Session Control</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
