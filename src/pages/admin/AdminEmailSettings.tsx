import { useState, useEffect } from "react";
import {
  Mail,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Send,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminEmailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [companyName, setCompanyName] = useState("Aspect Vision");
  const [companySignature, setCompanySignature] = useState(
    "Best Regards,\nAspect Vision Team\nwww.aspectvision.com"
  );
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [testEmail, setTestEmail] = useState("");
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
      const email = settings.find((s) => s.setting_key === "smtp_email");
      const password = settings.find((s) => s.setting_key === "smtp_app_password");
      const name = settings.find((s) => s.setting_key === "company_name");
      const signature = settings.find((s) => s.setting_key === "company_signature");
      const enabled = settings.find((s) => s.setting_key === "email_enabled");

      if (email) setSmtpEmail(email.setting_value);
      if (password) setSmtpPassword(password.setting_value);
      if (name) setCompanyName(name.setting_value);
      if (signature) setCompanySignature(signature.setting_value);
      if (enabled) setIsEmailEnabled(enabled.setting_value === "true");

      setIsConfigured(!!(email?.setting_value && password?.setting_value));
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
    if (!smtpEmail.trim() || !smtpPassword.trim()) {
      toast({ title: "Error", description: "Email और App Password दोनों भरें", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await upsertSetting("smtp_email", smtpEmail.trim());
      await upsertSetting("smtp_app_password", smtpPassword.trim());
      await upsertSetting("company_name", companyName.trim());
      await upsertSetting("company_signature", companySignature.trim());
      await upsertSetting("email_enabled", String(isEmailEnabled));

      setIsConfigured(true);
      toast({ title: "सफल!", description: "Email settings saved successfully" });
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({ title: "Error", description: "Test email address enter करें", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          action: "test",
          to: testEmail.trim(),
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: "✅ Email Sent!", description: `Test email sent to ${testEmail}` });
      } else {
        toast({ title: "❌ Failed", description: data?.error || "Email send failed", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "❌ Error", description: error.message || "Could not send test email", variant: "destructive" });
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
          <Mail className="w-6 h-6 text-primary" />
          Email Settings
        </h2>
        <p className="text-muted-foreground">
          Configure SMTP email for notifications, notices, and automated emails
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConfigured && isEmailEnabled ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {isConfigured && isEmailEnabled ? "Email Service Active" : "Email Not Configured"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConfigured && isEmailEnabled
                    ? "Automated emails are enabled"
                    : "Configure email to enable notifications"}
                </p>
              </div>
            </div>
            <Badge variant={isConfigured && isEmailEnabled ? "default" : "secondary"}>
              {isConfigured && isEmailEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            SMTP Email Configuration
          </CardTitle>
          <CardDescription>
            Gmail App Password use करें। Settings → Security → 2-Step Verification → App Passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium text-foreground">Enable Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                ID creation, enrollment, payment, और notices पर email भेजें
              </p>
            </div>
            <Switch checked={isEmailEnabled} onCheckedChange={setIsEmailEnabled} />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="smtpEmail">Sender Email Address</Label>
            <Input
              id="smtpEmail"
              type="email"
              placeholder="your-company@gmail.com"
              value={smtpEmail}
              onChange={(e) => setSmtpEmail(e.target.value)}
            />
          </div>

          {/* App Password */}
          <div className="space-y-2">
            <Label htmlFor="smtpPassword">App Password</Label>
            <div className="relative">
              <Input
                id="smtpPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Gmail App Password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Google Account → Security → App Passwords se generate करें
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      {/* Company Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Company Branding
          </CardTitle>
          <CardDescription>
            Email template me company name और signature set करें
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Aspect Vision"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySignature">Email Signature</Label>
            <Textarea
              id="companySignature"
              value={companySignature}
              onChange={(e) => setCompanySignature(e.target.value)}
              placeholder="Best Regards,&#10;Company Team"
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} variant="outline" className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Update Branding
          </Button>
        </CardContent>
      </Card>

      {/* Test Email */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Test Email
            </CardTitle>
            <CardDescription>
              Configuration verify करने के लिए test email भेजें
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Recipient Email</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleTestEmail} disabled={testing} variant="outline" className="w-full">
              {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Test Email
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-3">Gmail App Password कैसे बनाएं?</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Google Account → <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-primary underline">Security</a> पर जाएं</li>
            <li><strong>2-Step Verification</strong> ON करें (अगर नहीं है)</li>
            <li><strong>App Passwords</strong> section में जाएं</li>
            <li>App name enter करें (जैसे "Aspect Vision") और <strong>Create</strong> करें</li>
            <li>Generated 16-digit password यहां paste करें</li>
          </ol>
          <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important:</strong> Regular Gmail password काम नहीं करेगा। App Password generate करना ज़रूरी है।
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmailSettings;
