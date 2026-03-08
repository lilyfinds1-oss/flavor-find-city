import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Key, Save, ExternalLink, CheckCircle, XCircle, Brain } from "lucide-react";
import { toast } from "sonner";
import { useAppConfig, useUpdateAppConfig } from "@/hooks/useAppConfig";

function ConfigTokenCard({
  title,
  description,
  icon: Icon,
  configKey,
  placeholder,
  helpText,
  helpUrl,
  helpLabel,
  features,
  integrationLabel,
  integrationDescription,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  configKey: "mapbox_public_token" | "openai_api_key";
  placeholder: string;
  helpText?: string;
  helpUrl?: string;
  helpLabel?: string;
  features?: string[];
  integrationLabel: string;
  integrationDescription: string;
}) {
  const { data: savedToken, isLoading } = useAppConfig(configKey);
  const updateConfig = useUpdateAppConfig();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (savedToken) setToken(savedToken);
  }, [savedToken]);

  const handleSave = async () => {
    if (!token.trim()) {
      toast.error("Please enter a valid token");
      return;
    }
    try {
      await updateConfig.mutateAsync({ key: configKey, value: token.trim() });
      toast.success(`${title} saved successfully`);
    } catch (error) {
      console.error("Failed to save token:", error);
      toast.error("Failed to save token. Make sure you have admin permissions.");
    }
  };

  const isConfigured = !!savedToken && savedToken.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Badge variant={isConfigured ? "default" : "secondary"}>
            {isConfigured ? "Configured" : "Not configured"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={configKey} className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Key
          </Label>
          <Input
            id={configKey}
            type="password"
            placeholder={placeholder}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono"
            disabled={isLoading}
          />
          {helpUrl && (
            <p className="text-xs text-muted-foreground">
              {helpText}{" "}
              <a
                href={helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {helpLabel}
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={updateConfig.isPending || isLoading} className="gap-2">
            <Save className="w-4 h-4" />
            {updateConfig.isPending ? "Saving..." : "Save Token"}
          </Button>
          {token && (
            <span className="text-sm text-muted-foreground">
              Token length: {token.length} characters
            </span>
          )}
        </div>

        {features && features.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-dashed">
            <h4 className="font-medium mb-2">Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPanel() {
  const { data: mapboxToken } = useAppConfig("mapbox_public_token");
  const { data: openaiToken } = useAppConfig("openai_api_key");

  const integrations = [
    {
      label: "Mapbox GL",
      description: "Interactive maps & geocoding",
      icon: MapPin,
      configured: !!mapboxToken && mapboxToken.length > 0,
    },
    {
      label: "OpenAI",
      description: "AI search, moderation & recommendations",
      icon: Brain,
      configured: !!openaiToken && openaiToken.length > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <ConfigTokenCard
        title="Mapbox Configuration"
        description="Configure the interactive map for restaurant discovery"
        icon={MapPin}
        configKey="mapbox_public_token"
        placeholder="pk.eyJ1Ijoi..."
        helpText="Get your free token from"
        helpUrl="https://account.mapbox.com/access-tokens/"
        helpLabel="Mapbox Dashboard"
        integrationLabel="Mapbox GL"
        integrationDescription="Interactive maps & geocoding"
        features={[
          "Interactive restaurant markers with clustering",
          '"Trending Near You" functionality',
          "Filter by cuisine, price, and dietary options",
          "Real-time geolocation support",
        ]}
      />

      <ConfigTokenCard
        title="OpenAI Configuration"
        description="Power AI search, moderation, embeddings & blog generation"
        icon={Brain}
        configKey="openai_api_key"
        placeholder="sk-..."
        helpText="Get your API key from"
        helpUrl="https://platform.openai.com/api-keys"
        helpLabel="OpenAI Dashboard"
        integrationLabel="OpenAI"
        integrationDescription="AI search, moderation & recommendations"
        features={[
          "Semantic search with text-embedding-3-small",
          "GPT-4o mini for ranking explanations & moderation",
          "AI-powered blog generation",
          "Review auto-moderation with quality scoring",
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Manage third-party service connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {integrations.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.configured ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Badge variant={item.configured ? "default" : "secondary"}>
                    {item.configured ? "Connected" : "Not configured"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}