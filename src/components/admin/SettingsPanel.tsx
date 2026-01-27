import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Key, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPanel() {
  const [mapboxToken, setMapboxToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMapbox = async () => {
    if (!mapboxToken.trim()) {
      toast.error("Please enter a valid Mapbox token");
      return;
    }
    
    setIsSaving(true);
    // TODO: Save to backend configuration
    setTimeout(() => {
      toast.success("Mapbox token saved successfully");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Mapbox Configuration</CardTitle>
                <CardDescription>Configure the interactive map for restaurant discovery</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">
              Required for Map
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Mapbox Public Access Token
            </Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.eyJ1Ijoi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Get your free token from{" "}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Mapbox Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleSaveMapbox} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Token"}
            </Button>
            {mapboxToken && (
              <span className="text-sm text-muted-foreground">
                Token length: {mapboxToken.length} characters
              </span>
            )}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-dashed">
            <h4 className="font-medium mb-2">Map Features (Lahore, Pakistan)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Interactive restaurant markers with clustering</li>
              <li>• "Trending Near You" functionality</li>
              <li>• Filter by cuisine, price, and dietary options</li>
              <li>• Real-time geolocation support</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Manage third-party service connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Mapbox GL</p>
                  <p className="text-xs text-muted-foreground">Interactive maps & geocoding</p>
                </div>
              </div>
              <Badge variant={mapboxToken ? "default" : "secondary"}>
                {mapboxToken ? "Configured" : "Not configured"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
