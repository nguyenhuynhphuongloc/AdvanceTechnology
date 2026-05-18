import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { mockSellerProfiles } from "../../data/adminMockData";
import { Search } from "lucide-react";

export default function SellerProfiles() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfiles = mockSellerProfiles.filter(profile =>
    profile.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    if (status === "approved") return "default";
    if (status === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Profiles</h1>
        <p className="text-muted-foreground">Manage seller profiles and applications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Profiles ({mockSellerProfiles.length})</CardTitle>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.shopName}</TableCell>
                  <TableCell>{profile.ownerName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(profile.status)}>
                      {profile.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{profile.submittedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No profiles found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
