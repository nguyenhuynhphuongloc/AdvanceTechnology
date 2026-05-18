import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";

export default function MediaLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage product images and media</p>
        </div>
        <Button>
          <Upload className="size-4 mr-2" />
          Upload Media
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20">
            <ImageIcon className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No media files uploaded yet</p>
            <Button variant="outline" className="mt-4">
              <Upload className="size-4 mr-2" />
              Upload your first image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
