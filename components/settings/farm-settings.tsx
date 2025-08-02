"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export function FarmSettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-[#2d5523] to-[#1e3a1a] rounded-full w-20 h-20 flex items-center justify-center">
            <Icons.settings className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-gray-800 text-xl">Farm Settings</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Icons.alertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Under Construction</span>
            <Icons.alertCircle className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We're working hard to bring you comprehensive farm management settings. 
              This feature will allow you to configure farm details, location settings, 
              timezone preferences, and more to customize your farming experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.settings className="h-6 w-6 text-[#2d5523] mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Basic Configuration</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.home className="h-6 w-6 text-[#2d5523] mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Location Settings</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.settings className="h-6 w-6 text-[#2d5523] mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Timezone & Currency</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
