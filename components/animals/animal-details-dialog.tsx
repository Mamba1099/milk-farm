import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AnimalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: unknown;
}

export function AnimalDetailsDialog({
  open,
  onOpenChange,
  animal,
}: AnimalDetailsDialogProps) {
  if (!open || !animal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {animal.name || `Animal ${animal.tagNumber}`}
              </h2>
              <p className="text-gray-600">Tag: {animal.tagNumber}</p>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{animal.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{animal.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Birth Date:</span>
                  <span className="font-medium">
                    {new Date(animal.birthDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(animal.birthDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365)
                    )}{" "}
                    years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Status:</span>
                  <span className="font-medium">{animal.healthStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matured:</span>
                  <span className="font-medium">
                    {animal.isMatured ? "Yes" : "No"}
                  </span>
                </div>
                {animal.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{animal.weight} kg</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Family</h3>
              <div className="space-y-2">
                {animal.mother && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mother:</span>
                    <span className="font-medium">
                      {animal.mother.name || animal.mother.tagNumber}
                    </span>
                  </div>
                )}
                {animal.father && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Father:</span>
                    <span className="font-medium">
                      {animal.father.name || animal.father.tagNumber}
                    </span>
                  </div>
                )}
                {animal.motherOf?.length > 0 && (
                  <div>
                    <span className="text-gray-600">Children:</span>
                    <div className="mt-1 space-y-1">
                      {animal.motherOf.map((child: unknown) => (
                        <div key={child.id} className="text-sm font-medium">
                          {child.name || child.tagNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {animal.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-700">{animal.notes}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Treatments</h3>
              {animal.treatments?.length > 0 ? (
                <div className="space-y-2">
                  {animal.treatments.slice(0, 3).map((treatment: unknown) => (
                    <div
                      key={treatment.id}
                      className="text-sm p-2 bg-gray-50 rounded"
                    >
                      <div className="font-medium">{treatment.disease}</div>
                      <div className="text-gray-600">
                        {new Date(treatment.treatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No treatments recorded</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Production</h3>
              {animal.productionRecords?.length > 0 ? (
                <div className="space-y-2">
                  {animal.productionRecords
                    .slice(0, 3)
                    .map((record: unknown) => (
                      <div
                        key={record.id}
                        className="text-sm p-2 bg-gray-50 rounded"
                      >
                        <div className="font-medium">{record.total}L</div>
                        <div className="text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No production records</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Serving History</h3>
              {animal.servings?.length > 0 ? (
                <div className="space-y-2">
                  {animal.servings.slice(0, 3).map((serving: unknown) => (
                    <div
                      key={serving.id}
                      className="text-sm p-2 bg-gray-50 rounded"
                    >
                      <div className="font-medium">{serving.outcome}</div>
                      <div className="text-gray-600">
                        {new Date(serving.servedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No serving records</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
