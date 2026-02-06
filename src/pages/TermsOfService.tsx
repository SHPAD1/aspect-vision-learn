import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <FileText className="w-4 h-4 inline mr-1" />
              Legal
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Terms of Service
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the services provided by Aspect Vision ("we," "our," or "us"), including our website, mobile application, and educational courses, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  2. Description of Services
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Aspect Vision provides educational coaching services for competitive examinations including SSC, Banking, Railway, and Defence exams. Our services include live and recorded classes, study materials, mock tests, and personalized mentorship delivered through online and offline modes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  3. User Registration & Account
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must be at least 16 years old to create an account</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  4. Course Enrollment & Fees
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Course fees must be paid as per the chosen payment plan before accessing course content</li>
                  <li>Prices are subject to change; enrolled students will not be affected by price increases</li>
                  <li>All payments are processed securely through authorized payment gateways</li>
                  <li>Promotional offers and discounts are subject to terms specified during the offer period</li>
                  <li>Course access is provided for the duration specified at the time of enrollment</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  5. Refund Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Our refund policy is as follows:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Within 7 days of enrollment:</strong> Eligible for a partial refund (70% of course fee) if no significant course content has been accessed</li>
                  <li><strong className="text-foreground">After 7 days:</strong> No refunds will be provided</li>
                  <li><strong className="text-foreground">Promotional offers:</strong> Courses purchased under special promotions may have different refund terms</li>
                  <li>Refund requests must be submitted through our support system with valid reasons</li>
                  <li>Processing time for approved refunds is 7-14 business days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  6. Intellectual Property Rights
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">All content provided through our services is protected by intellectual property laws:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Study materials, videos, and course content are owned by Aspect Vision</li>
                  <li>You are granted a limited, non-transferable license to access content for personal educational use</li>
                  <li>Copying, distributing, or sharing course materials is strictly prohibited</li>
                  <li>Screen recording, downloading, or reproducing video content is not allowed</li>
                  <li>Violation of intellectual property rights may result in account termination and legal action</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  7. User Conduct
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Share your account credentials with others</li>
                  <li>Use the services for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Disrupt or interfere with the services or servers</li>
                  <li>Harass, abuse, or harm other users or faculty members</li>
                  <li>Post or transmit harmful content through our platforms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  8. Disclaimer of Warranties
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are provided "as is" without warranties of any kind. While we strive to provide high-quality education, we do not guarantee specific exam results or outcomes. Success depends on individual effort, preparation, and various external factors beyond our control.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  9. Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, Aspect Vision shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services. Our total liability shall not exceed the amount paid by you for the specific course or service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  10. Modifications to Services
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any part of our services at any time. We may also update these Terms of Service periodically. Continued use of our services after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  11. Governing Law
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  12. Contact Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  For any questions or concerns regarding these Terms of Service, please contact us:
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
