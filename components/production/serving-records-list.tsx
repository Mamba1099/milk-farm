"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity, Clock, TrendingUp, TrendingDown, Heart, Calendar, Edit } from "lucide-react";
import { RingLoader } from "react-spinners";
import { useServings } from "@/hooks/use-serving-hooks";
import { formatDate } from "@/lib/date-utils";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import type { ServingRecord, ServingStats, ServingRecordsListProps } from "@/lib/types/serving";
import { ServingEditDialog } from "@/components/production/serving-edit-dialog";

export function ServingRecordsList({ 
  filters, 
  showAddButton = true, 
  showStats = true, 
  title = "Serving Records",
  className = ""
}: ServingRecordsListProps): React.ReactElement {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedServing, setSelectedServing] = React.useState<ServingRecord | null>(null);

  const handleEditClick = (serving: ServingRecord) => {
    setSelectedServing(serving);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedServing(null);
  };
  console.log('ServingRecordsList component rendered!');
  
  const { data: servingResponse, isLoading, error } = useServings(filters);
  const servings = servingResponse?.servings || [];

  const stats: ServingStats = servings.reduce(
    (acc: ServingStats, serving: ServingRecord) => {
      acc.total++;
      if (!serving.outcome || serving.outcome === "PENDING") {
        acc.pending++;
      } else if (serving.outcome === "SUCCESSFUL") {
        acc.successful++;
      } else if (serving.outcome === "FAILED") {
        acc.failed++;
      }
      
      if (serving.ovaType === "PREDETERMINED") {
        acc.predetermined++;
      } else {
        acc.normalOva++;
      }
      
      return acc;
    },
    { total: 0, pending: 0, successful: 0, failed: 0, predetermined: 0, normalOva: 0 }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-col items-center justify-center py-12">
            <RingLoader size={60} color="#22C55E" className="mb-4" />
            <p className="text-gray-600">Loading serving records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600">Error loading serving records. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
  <div className={`space-y-6 w-full ${className}`}> 
      {/* Statistics Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-blue-200">
                <Activity className="h-4 w-4 mr-2 text-blue-200" />
                Total Servings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight drop-shadow text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-yellow-100">
                <Clock className="h-4 w-4 mr-2 text-yellow-100" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight drop-shadow text-white">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-100">
                <TrendingUp className="h-4 w-4 mr-2 text-green-100" />
                Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight drop-shadow text-white">{stats.successful}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-red-100">
                <TrendingDown className="h-4 w-4 mr-2 text-red-100" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight drop-shadow text-white">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-purple-100">
                <Heart className="h-4 w-4 mr-2 text-purple-100" />
                Predetermined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight drop-shadow text-white">{stats.predetermined}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-indigo-100">
                <Calendar className="h-4 w-4 mr-2 text-indigo-100" />
                Normal Ova
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight drop-shadow text-white">{stats.normalOva}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Serving Records Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {showAddButton && (
              <Link href="/production/serving/add">
                <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                  <Plus size={16} />
                  Add New Serving
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="w-full">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Date Served</TableHead>
                <TableHead>Serving Type</TableHead>
                <TableHead>Ova Type</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Time Left</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead>Served By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No serving records found. Add your first serving record!
                  </TableCell>
                </TableRow>
              ) : (
                servings.map((serving: ServingRecord) => {
                  const timerEndDate = new Date(serving.dateServed);
                  timerEndDate.setMinutes(timerEndDate.getMinutes() + 5);
                  const now = new Date();
                  const isExpired = now >= timerEndDate;
                  return (
                    <TableRow key={serving.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{serving.female?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-500">#{serving.female?.tagNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(serving.dateServed)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            serving.servingType === "BULL"
                              ? "bg-blue-600 text-white"
                              : serving.servingType === "AI"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-400 text-white"
                          }
                        >
                          {serving.servingType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            serving.ovaType === "PREDETERMINED"
                              ? "bg-pink-600 text-white"
                              : serving.ovaType === "NORMAL"
                              ? "bg-green-600 text-white"
                              : "bg-gray-400 text-white"
                          }
                        >
                          {serving.ovaType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            serving.outcome === "SUCCESSFUL"
                              ? "bg-green-700 text-white"
                              : serving.outcome === "FAILED"
                              ? "bg-red-600 text-white"
                              : "bg-yellow-500 text-white"
                          }
                        >
                          {serving.outcome || "PENDING"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {serving.outcome === "PENDING" ? <CountdownTimer targetDate={timerEndDate} showIcon={true} /> : <div className="text-xs text-gray-400">-</div>}
                      </TableCell>
                      <TableCell>
                        {serving.outcome === "SUCCESSFUL" && serving.actualBirthDate ? (
                          <div className="text-lg text-green-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDate(serving.actualBirthDate)}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{serving.servedBy}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          disabled={!isExpired}
                          style={!isExpired ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          onClick={() => handleEditClick(serving)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Edit Dialog */}
      <ServingEditDialog serving={selectedServing} open={editDialogOpen} onClose={handleEditDialogClose} />
    </div>
  );
}
