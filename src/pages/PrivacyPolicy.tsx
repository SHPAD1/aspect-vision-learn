import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="w-4 h-4 inline mr-1" />
              Legal
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: February 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            <div className="bg-card rounded-xl border border-border p-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Aspect Vision ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or enroll in our courses.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  2. Information We Collect
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, date of birth, and address when you register or enroll in our courses.</li>
                  <li><strong className="text-foreground">Educational Information:</strong> Academic background, qualifications, and exam preferences.</li>
                  <li><strong className="text-foreground">Payment Information:</strong> Billing details and transaction history for course enrollments.</li>
                  <li><strong className="text-foreground">Usage Data:</strong> Information about how you use our website, app, and services including course progress and test scores.</li>
                  <li><strong className="text-foreground">Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide, maintain, and improve our educational services</li>
                  <li>Process enrollments and manage your account</li>
                  <li>Send you important updates about your courses and batches</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Analyze usage patterns to improve our platform</li>
                  <li>Protect against fraudulent or illegal activity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  4. Information Sharing
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">With Service Providers:</strong> Third-party vendors who assist in operating our platform, processing payments, or delivering services.</li>
                  <li><strong className="text-foreground">For Legal Purposes:</strong> When required by law or to protect our rights and safety.</li>
                  <li><strong className="text-foreground">With Your Consent:</strong> When you give us permission to share your information.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  5. Data Security
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  6. Your Rights
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  7. Cookies
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings. Disabling certain cookies may limit your access to some features.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  8. Changes to This Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  9. Contact Us
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground font-medium">Aspect Vision</p>
                  <p className="text-muted-foreground">Email: aspectvisionofficial@gmail.com</p>
                  <p className="text-muted-foreground">Phone: +91 9472070758</p>
                  <p className="text-muted-foreground">Address: G75, Sector 63, Noida - 201309, UP</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
