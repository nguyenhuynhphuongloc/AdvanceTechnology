import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Commissions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commissions</h1>
        <p className="text-muted-foreground">Track seller commissions and payouts</p>
      </div>

      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          Commission tracking is coming soon. This feature is currently under development.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Commission tracking, calculation, and payout management features will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
