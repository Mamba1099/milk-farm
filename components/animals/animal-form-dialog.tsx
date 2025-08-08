import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCreateAnimal, useUpdateAnimal, useAvailableParents } from "@/hooks";
import { useToast } from "@/hooks";
import { AnimalFormDialogProps, Animal } from "@/lib/types/animal";
import type { CreateAnimalInput, UpdateAnimalInput } from "@/lib/validators/animal";

export function AnimalFormDialog({
  open,
  onOpenChange,
  animal,
  onSuccess,
}: AnimalFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CreateAnimalInput & { motherId?: string; fatherId?: string }>>({
  });

  const createMutation = useCreateAnimal();
  const updateMutation = useUpdateAnimal();
  const { data: mothers } = useAvailableParents("FEMALE");
  const { data: fathers } = useAvailableParents("MALE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (animal) {
        await updateMutation.mutateAsync({
          ...formData,
          id: animal.id,
        } as UpdateAnimalInput);
        toast({ 
          title: "Success", 
          description: "Animal updated successfully",
          type: "success" 
        });
      } else {
        await createMutation.mutateAsync(formData as CreateAnimalInput);
        toast({ 
          title: "Success", 
          description: "Animal created successfully",
          type: "success" 
        });
      }
      onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save animal",
        type: "error",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {animal ? "Edit Animal" : "Add New Animal"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tag Number *
                </label>
                <Input
                  value={formData.tagNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tagNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "COW" | "BULL" | "CALF",
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="CALF">Calf</option>
                  <option value="COW">Cow</option>
                  <option value="BULL">Bull</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as "MALE" | "FEMALE",
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Health Status
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      healthStatus: e.target.value as "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINED",
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="HEALTHY">Healthy</option>
                  <option value="SICK">Sick</option>
                  <option value="RECOVERING">Recovering</option>
                  <option value="QUARANTINED">Quarantined</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Birth Date *
                </label>
                <Input
                  type="date"
                  value={
                    formData.birthDate instanceof Date
                      ? formData.birthDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      birthDate: new Date(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expected Maturity Date
                </label>
                <Input
                  type="date"
                  value={
                    formData.expectedMaturityDate instanceof Date
                      ? formData.expectedMaturityDate
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedMaturityDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  When this animal is expected to mature and be ready for
                  production
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mother</label>
                <select
                  value={formData.motherId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      motherId: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Mother</option>
                  {mothers?.map((mother: Animal) => (
                    <option key={mother.id} value={mother.id}>
                      {mother.name || mother.tagNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Father</label>
                <select
                  value={formData.fatherId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fatherId: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Father</option>
                  {fathers?.map((father: Animal) => (
                    <option key={father.id} value={father.id}>
                      {father.name || father.tagNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {animal ? "Update" : "Create"} Animal
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
