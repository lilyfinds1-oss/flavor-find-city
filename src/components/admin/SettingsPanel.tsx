import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Key, Save, ExternalLink, CheckCircle, XCircle, Brain, Database, Loader2, Sparkles, Settings, CreditCard } from "lucide-react";
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
  configKey: string;
  placeholder: string;
  helpText?: string;
  helpUrl?: string;
  helpLabel?: string;
  features?: string[];
  integrationLabel: string;
  integrationDescription: string;
}) {
  const { data: savedToken, isLoading } = useAppConfig(configKey as any);
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
      await updateConfig.mutateAsync({ key: configKey as any, value: token.trim() });
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
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
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
      const { data: existing } = await supabase
        .from("ai_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("ai_settings")
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
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
          <div className="space-y-2">
            <Label>Default Model</Label>
            <p className="text-xs text-muted-foreground mb-1">Used for search, moderation, feed, descriptions</p>
            <Select value={settings.default_model} onValueChange={(v) => setSettings(s => ({ ...s, default_model: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vision Model</Label>
            <p className="text-xs text-muted-foreground mb-1">Used for dish recognition from photos</p>
            <Select value={settings.vision_model} onValueChange={(v) => setSettings(s => ({ ...s, vision_model: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recommendation Model</Label>
            <p className="text-xs text-muted-foreground mb-1">Used for personalized recommendations</p>
            <Select value={settings.recommendation_model} onValueChange={(v) => setSettings(s => ({ ...s, recommendation_model: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Model Routing Strategy
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Flash</strong> → Search, moderation, discovery feed, descriptions (fast & cheap)</li>
            <li>• <strong>Pro</strong> → Vision/dish recognition, personalized recommendations (advanced)</li>
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
  const { data: geminiToken } = useAppConfig("gemini_api_key" as any);
  const { data: stripeSecretKey } = useAppConfig("stripe_secret_key" as any);
  const { data: stripePublishableKey } = useAppConfig("stripe_publishable_key" as any);
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

  const isStripeConfigured = !!stripeSecretKey && stripeSecretKey.length > 0;

  const integrations = [
    {
      label: "Mapbox GL",
      description: "Interactive maps & geocoding",
      icon: MapPin,
      configured: !!mapboxToken && mapboxToken.length > 0,
    },
    {
      label: "Google Gemini",
      description: "AI search, vision, moderation & recommendations",
      icon: Brain,
      configured: !!geminiToken && geminiToken.length > 0,
    },
    {
      label: "Stripe",
      description: "Payments & subscriptions for restaurant plans",
      icon: CreditCard,
      configured: isStripeConfigured,
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
        title="Google Gemini Configuration"
        description="Power AI search, vision, moderation, embeddings & recommendations"
        icon={Brain}
        configKey="gemini_api_key"
        placeholder="AIza..."
        helpText="Get your API key from"
        helpUrl="https://aistudio.google.com/app/apikey"
        helpLabel="Google AI Studio"
        integrationLabel="Google Gemini"
        integrationDescription="AI search, vision & recommendations"
        features={[
          "Semantic search with text-embedding-004",
          "Gemini 1.5 Flash for ranking, moderation & descriptions",
          "Gemini 1.5 Pro for vision (dish recognition) & recommendations",
          "AI-powered blog generation",
          "Review auto-moderation with quality scoring",
        ]}
      />

      <ConfigTokenCard
        title="Stripe Secret Key"
        description="Enable payment processing for restaurant subscriptions"
        icon={CreditCard}
        configKey="stripe_secret_key"
        placeholder="sk_live_..."
        helpText="Get your API keys from"
        helpUrl="https://dashboard.stripe.com/apikeys"
        helpLabel="Stripe Dashboard"
        integrationLabel="Stripe"
        integrationDescription="Payments & subscriptions"
        features={[
          "Restaurant subscription billing (Starter & Growth plans)",
          "Secure checkout via Stripe",
          "Recurring monthly payments",
          "Billing history & plan management",
        ]}
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
        integrationLabel="Stripe (Client)"
        integrationDescription="Client-side payment forms"
      />

      <AIModelSettings />

      {/* Embedding Generation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Vector Embeddings</CardTitle>
              <CardDescription>Generate embeddings for semantic search (requires Gemini key)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generates vector embeddings for all restaurants that don't have one yet. This powers the hybrid semantic search system.
            New restaurants automatically get embeddings via database triggers.
          </p>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGenerateEmbeddings}
              disabled={generatingEmbeddings || !geminiToken}
              className="gap-2"
            >
              {generatingEmbeddings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {generatingEmbeddings ? "Generating..." : "Generate Embeddings"}
            </Button>
            {embeddingResult && (
              <span className="text-sm text-muted-foreground">{embeddingResult}</span>
            )}
          </div>
          {!geminiToken && (
            <p className="text-xs text-destructive">Configure your Gemini API key above to enable embedding generation.</p>
          )}
        </CardContent>
      </Card>

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
