import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Sellers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sellers</h1>
        <p className="text-muted-foreground">Manage marketplace sellers</p>
      </div>

      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>
          This feature is currently under development. Please use Seller Profiles for now.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comprehensive seller management features will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
