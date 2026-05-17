import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Refunds() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">Manage refund requests</p>
      </div>

      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          Refund management is coming soon. This feature is currently under development.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Full refund management capabilities including automated processing and manual review will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
