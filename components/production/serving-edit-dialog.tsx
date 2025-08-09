import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { RingLoader } from "react-spinners";
import type { ServingEditDialogProps } from "@/lib/types/serving";
import { useUpdateServing } from "@/hooks/use-serving-hooks";

export function ServingEditDialog({ serving, open, onClose }: ServingEditDialogProps) {
  const [outcome, setOutcome] = React.useState(serving?.outcome || "PENDING");
  const [actualBirthDate, setActualBirthDate] = React.useState(serving?.actualBirthDate || "");
  const { mutate, isPending } = useUpdateServing();


  React.useEffect(() => {
    setOutcome(serving?.outcome || "PENDING");
    setActualBirthDate(serving?.actualBirthDate || "");
  }, [serving]);

  if (!serving) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      id: serving.id,
      outcome,
      actualBirthDate: outcome === "SUCCESSFUL" ? actualBirthDate : undefined,
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-6 rounded-lg bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700 mb-2">Edit Serving Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded p-3 mb-2">
            <div className="font-semibold text-gray-700">Female: <span className="text-green-700">{serving.female?.name || "Unknown"}</span> <span className="text-xs text-gray-500">#{serving.female?.tagNumber}</span></div>
            <div className="text-sm text-gray-600 mt-1">Date Served: <span className="font-medium">{formatDate(serving.dateServed)}</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Outcome</label>
            <select
              value={outcome}
              onChange={e => setOutcome(e.target.value as "SUCCESSFUL" | "FAILED" | "PENDING")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="SUCCESSFUL">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          {outcome === "SUCCESSFUL" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Actual Birth Date</label>
              <input
                type="date"
                value={actualBirthDate ? actualBirthDate.split("T")[0] : ""}
                onChange={e => setActualBirthDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors" onClick={onClose} disabled={isPending}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-colors flex items-center justify-center min-w-[100px]" disabled={isPending}>
              {isPending ? <RingLoader size={20} color="#fff" speedMultiplier={0.8} /> : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
