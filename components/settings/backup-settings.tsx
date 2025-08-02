"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export function BackupSettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full w-20 h-20 flex items-center justify-center">
            <Icons.upload className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-gray-800 text-xl">Backup & Data Management</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Icons.alertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Under Construction</span>
            <Icons.alertCircle className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Protect your valuable farm data with automated backup solutions. We're building 
              comprehensive backup and data management tools including scheduled backups, 
              data export options, and restore capabilities for peace of mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.database className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Auto Backup</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.upload className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Data Export</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <Icons.settings className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Data Restore</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
