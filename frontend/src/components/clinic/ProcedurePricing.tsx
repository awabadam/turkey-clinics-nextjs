import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface Procedure {
  id: string;
  name: string;
  description: string | null;
  averagePrice: number | null;
}

interface ProcedurePricingProps {
  procedures: Procedure[];
  clinicId: string;
}

export function ProcedurePricing({ procedures }: ProcedurePricingProps) {
  if (procedures.length === 0) {
    return null;
  }

  const proceduresWithPrice = procedures.filter((p) => p.averagePrice !== null);
  const minPrice = proceduresWithPrice.length > 0
    ? Math.min(...proceduresWithPrice.map((p) => p.averagePrice!))
    : null;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Procedure Pricing</h2>
      {minPrice && (
        <div className="mb-4">
          <Badge variant="default" className="text-lg px-4 py-2">
            <DollarSign className="mr-2 h-4 w-4" />
            Starting from ${minPrice.toFixed(2)}
          </Badge>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {procedures.map((procedure) => (
          <Card key={procedure.id}>
            <CardHeader>
              <CardTitle className="text-lg">{procedure.name}</CardTitle>
              {procedure.description && (
                <CardDescription>{procedure.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {procedure.averagePrice ? (
                <div className="text-2xl font-bold text-primary">
                  ${procedure.averagePrice.toFixed(2)}
                </div>
              ) : (
                <span className="text-muted-foreground">Price on request</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
