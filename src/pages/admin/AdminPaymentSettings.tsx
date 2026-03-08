import { useState, useEffect } from "react";
import {
  CreditCard,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPaymentSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showKeyId, setShowKeyId] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*");

      if (error) throw error;

      const settings = data || [];
      const keyId = settings.find((s) => s.setting_key === "razorpay_key_id");
      const keySecret = settings.find((s) => s.setting_key === "razorpay_key_secret");
      const enabled = settings.find((s) => s.setting_key === "razorpay_enabled");

      if (keyId) setRazorpayKeyId(keyId.setting_value);
      if (keySecret) setRazorpayKeySecret(keySecret.setting_value);
      if (enabled) setIsRazorpayEnabled(enabled.setting_value === "true");

      setIsConfigured(!!(keyId?.setting_value && keySecret?.setting_value));
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const upsertSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("payment_settings")
      .select("id")
      .eq("setting_key", key)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("payment_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("payment_settings")
        .insert({ setting_key: key, setting_value: value });
      if (error) throw error;
    }
  };

  const handleSave = async () => {
    if (!razorpayKeyId.trim() || !razorpayKeySecret.trim()) {
      toast({ title: "Error", description: "Please fill both Key ID and Key Secret", variant: "destructive" });
      return;
    }

    if (!razorpayKeyId.startsWith("rzp_")) {
      toast({ title: "Error", description: "Invalid Key ID format. It should start with 'rzp_'", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await upsertSetting("razorpay_key_id", razorpayKeyId.trim());
      await upsertSetting("razorpay_key_secret", razorpayKeySecret.trim());
      await upsertSetting("razorpay_enabled", String(isRazorpayEnabled));

      setIsConfigured(true);
      toast({ title: "सफल!", description: "Razorpay settings saved successfully" });
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("razorpay-payment", {
        body: { action: "test" },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: "✅ Connection Successful", description: "Razorpay API keys are valid and working" });
      } else {
        toast({ title: "❌ Connection Failed", description: data?.error || "Invalid API keys", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "❌ Test Failed", description: error.message || "Could not connect to Razorpay", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payment Settings
        </h2>
        <p className="text-muted-foreground">
          Configure Razorpay payment gateway for online payments
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConfigured && isRazorpayEnabled ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {isConfigured && isRazorpayEnabled ? "Razorpay Active" : "Razorpay Not Configured"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured && isRazorpayEnabled
                    ? "Online payments are enabled"
                    : "Configure API keys to enable online payments"}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured && isRazorpayEnabled ? "default" : "secondary"}>
              {isConfigured && isRazorpayEnabled ? "Live" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Razorpay API Configuration
          </CardTitle>
          <CardDescription>
            Enter your Razorpay API Key ID and Key Secret from the{" "}
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Razorpay Dashboard
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Enable Razorpay Payments</p>
              <p className="text-sm text-muted-foreground">
                Students will be able to pay online via Razorpay
              </p>
            </div>
            <Switch
              checked={isRazorpayEnabled}
              onCheckedChange={setIsRazorpayEnabled}
            />
          </div>

          {/* Key ID */}
          <div className="space-y-2">
            <Label htmlFor="keyId">API Key ID</Label>
            <div className="relative">
              <Input
                id="keyId"
                type={showKeyId ? "text" : "password"}
                placeholder="rzp_live_xxxxxxxxxxxxxxx"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowKeyId(!showKeyId)}
              >
                {showKeyId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Starts with <code>rzp_test_</code> (test) or <code>rzp_live_</code> (production)
            </p>
          </div>

          {/* Key Secret */}
          <div className="space-y-2">
            <Label htmlFor="keySecret">API Key Secret</Label>
            <div className="relative">
              <Input
                id="keySecret"
                type={showKeySecret ? "text" : "password"}
                placeholder="Enter your Razorpay Key Secret"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowKeySecret(!showKeySecret)}
              >
                {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
            {isConfigured && (
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Test Connection"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-3">How to get Razorpay API Keys?</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Razorpay Dashboard</a></li>
            <li>Navigate to <strong>Settings → API Keys</strong></li>
            <li>Click <strong>"Generate Key"</strong> to create new API keys</li>
            <li>Copy the <strong>Key ID</strong> and <strong>Key Secret</strong></li>
            <li>Paste them here and save</li>
          </ol>
          <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important:</strong> Use <code>rzp_test_</code> keys for testing and <code>rzp_live_</code> keys for production payments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentSettings;
