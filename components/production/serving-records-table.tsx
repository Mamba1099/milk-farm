import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Clock } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import type { ServingRecord, ServingRecordsTableProps } from "@/lib/types/serving";


export const ServingRecordsTable: React.FC<ServingRecordsTableProps> = ({ servings, showAddButton = true, title = "Serving Records", onEdit }) => (
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
                const servedDate = new Date(serving.dateServed);
                const timerEndDate = new Date(Date.UTC(
                  servedDate.getUTCFullYear(),
                  servedDate.getUTCMonth(),
                  servedDate.getUTCDate() + 21,
                  servedDate.getUTCHours(),
                  servedDate.getUTCMinutes(),
                  servedDate.getUTCSeconds()
                ));
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
                      <Badge className={
                        serving.servingType === "BULL"
                          ? "bg-blue-600 text-white"
                          : serving.servingType === "AI"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-400 text-white"
                      }>
                        {serving.servingType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        serving.ovaType === "PREDETERMINED"
                          ? "bg-pink-600 text-white"
                          : serving.ovaType === "NORMAL"
                          ? "bg-green-600 text-white"
                          : "bg-gray-400 text-white"
                      }>
                        {serving.ovaType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        serving.outcome === "SUCCESSFUL"
                          ? "bg-green-700 text-white"
                          : serving.outcome === "FAILED"
                          ? "bg-red-600 text-white"
                          : "bg-yellow-500 text-white"
                      }>
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
                        onClick={() => onEdit && onEdit(serving)}
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
);
