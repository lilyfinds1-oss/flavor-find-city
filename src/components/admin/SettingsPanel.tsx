import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Key, Save, ExternalLink, CheckCircle, XCircle, Brain, Database, Loader2, Sparkles, Settings, CreditCard, ShieldCheck } from "lucide-react";
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
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  configKey: "mapbox_public_token" | "stripe_publishable_key";
  placeholder: string;
  helpText?: string;
  helpUrl?: string;
  helpLabel?: string;
  features?: string[];
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
            <Key className="w-4 h-4" /> Public Token
          </Label>
          <Input
            id={configKey}
            type="text"
            placeholder={placeholder}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono"
            disabled={isLoading}
          />
          {helpUrl && (
            <p className="text-xs text-muted-foreground">
              {helpText}{" "}
              <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                {helpLabel}
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          )}
        </div>

        <Button onClick={handleSave} disabled={updateConfig.isPending || isLoading} className="gap-2">
          <Save className="w-4 h-4" />
          {updateConfig.isPending ? "Saving..." : "Save Token"}
        </Button>

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

function ServerSecretCard({
  title,
  description,
  icon: Icon,
  secretName,
  helpText,
  helpUrl,
  helpLabel,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  secretName: string;
  helpText?: string;
  helpUrl?: string;
  helpLabel?: string;
}) {
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
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="w-3 h-3" /> Server-side
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-4 rounded-lg bg-muted/50 border border-dashed text-sm space-y-2">
          <p className="font-medium">
            This secret is stored server-side and is never sent to the browser.
          </p>
          <p className="text-muted-foreground">
            Set or rotate it as the <code className="px-1 py-0.5 rounded bg-background border font-mono text-xs">{secretName}</code>{" "}
            edge function secret in your backend settings.
          </p>
        </div>
        {helpUrl && (
          <p className="text-xs text-muted-foreground">
            {helpText}{" "}
            <a href={helpUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              {helpLabel}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AIModelSettings() {
  const [settings, setSettings] = useState({
    default_model: "gemini-1.5-flash",
    vision_model: "gemini-1.5-pro",
    recommendation_model: "gemini-1.5-pro",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from("ai_settings").select("*").limit(1).maybeSingle();
      if (data) {
        setSettings({
          default_model: data.default_model,
          vision_model: data.vision_model,
          recommendation_model: data.recommendation_model,
        });
      }
    } catch (e) {
      console.error("Failed to fetch AI settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from("ai_settings").select("id").limit(1).maybeSingle();
      if (existing) {
        await supabase.from("ai_settings").update({ ...settings, updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("ai_settings").insert(settings);
      }
      toast.success("AI model settings saved");
    } catch (e) {
      toast.error("Failed to save AI settings");
    } finally {
      setSaving(false);
    }
  };

  const models = [
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Fast, Low Cost)" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Advanced)" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>AI Model Configuration</CardTitle>
            <CardDescription>Choose which Gemini models power each AI feature</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {(["default_model", "vision_model", "recommendation_model"] as const).map((k) => (
            <div className="space-y-2" key={k}>
              <Label className="capitalize">{k.replace("_", " ")}</Label>
              <Select value={settings[k]} onValueChange={(v) => setSettings((s) => ({ ...s, [k]: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {models.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Model Routing Strategy
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Flash</strong> → Search, moderation, discovery feed, descriptions</li>
            <li>• <strong>Pro</strong> → Vision/dish recognition, personalized recommendations</li>
          </ul>
        </div>

        <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Model Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPanel() {
  const { data: mapboxToken } = useAppConfig("mapbox_public_token");
  const { data: stripePublishableKey } = useAppConfig("stripe_publishable_key");
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);
  const [embeddingResult, setEmbeddingResult] = useState<string | null>(null);

  const handleGenerateEmbeddings = async () => {
    setGeneratingEmbeddings(true);
    setEmbeddingResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-embeddings", {
        body: { batchAll: true },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEmbeddingResult(`✓ Processed ${data.processed} restaurants (${data.errors} errors)`);
      toast.success(`Generated embeddings for ${data.processed} restaurants`);
    } catch (e: any) {
      setEmbeddingResult(`✗ ${e.message}`);
      toast.error(e.message || "Failed to generate embeddings");
    } finally {
      setGeneratingEmbeddings(false);
    }
  };

  const integrations = [
    { label: "Mapbox GL", description: "Interactive maps & geocoding", icon: MapPin, configured: !!mapboxToken && mapboxToken.length > 0 },
    { label: "Google Gemini", description: "Server-side secret (GEMINI_API_KEY)", icon: Brain, configured: null },
    { label: "Stripe (secret)", description: "Server-side secret (STRIPE_SECRET_KEY)", icon: CreditCard, configured: null },
    { label: "Stripe (publishable)", description: "Client-side checkout", icon: CreditCard, configured: !!stripePublishableKey && stripePublishableKey.length > 0 },
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
        features={[
          "Interactive restaurant markers with clustering",
          "Trending Near You functionality",
          "Filter by cuisine, price, and dietary options",
          "Real-time geolocation support",
        ]}
      />

      <ServerSecretCard
        title="Google Gemini API Key"
        description="Powers AI search, vision, moderation, embeddings & recommendations"
        icon={Brain}
        secretName="GEMINI_API_KEY"
        helpText="Get your API key from"
        helpUrl="https://aistudio.google.com/app/apikey"
        helpLabel="Google AI Studio"
      />

      <ServerSecretCard
        title="Stripe Secret Key"
        description="Server-side key used by billing edge functions"
        icon={CreditCard}
        secretName="STRIPE_SECRET_KEY"
        helpText="Get your API keys from"
        helpUrl="https://dashboard.stripe.com/apikeys"
        helpLabel="Stripe Dashboard"
      />

      <ConfigTokenCard
        title="Stripe Publishable Key"
        description="Client-side key for Stripe Elements and checkout"
        icon={CreditCard}
        configKey="stripe_publishable_key"
        placeholder="pk_live_..."
        helpText="Get your publishable key from"
        helpUrl="https://dashboard.stripe.com/apikeys"
        helpLabel="Stripe Dashboard"
      />

      <AIModelSettings />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Vector Embeddings</CardTitle>
              <CardDescription>Generate embeddings for semantic search (requires the server-side Gemini key)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generates vector embeddings for all restaurants that don't have one yet. New restaurants get embeddings automatically via database triggers.
          </p>
          <div className="flex items-center gap-4">
            <Button onClick={handleGenerateEmbeddings} disabled={generatingEmbeddings} className="gap-2">
              {generatingEmbeddings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {generatingEmbeddings ? "Generating..." : "Generate Embeddings"}
            </Button>
            {embeddingResult && <span className="text-sm text-muted-foreground">{embeddingResult}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Third-party service connections</CardDescription>
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
                  {item.configured === null ? (
                    <Badge variant="outline" className="gap-1">
                      <ShieldCheck className="w-3 h-3" /> Server secret
                    </Badge>
                  ) : item.configured ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <Badge variant="default">Connected</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="secondary">Not configured</Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
