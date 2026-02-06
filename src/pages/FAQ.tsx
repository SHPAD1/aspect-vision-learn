import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "General",
    questions: [
      {
        question: "What is Aspect Vision?",
        answer: "Aspect Vision is a premier coaching institute dedicated to preparing students for various competitive exams including SSC, Banking, Railway, and Defence examinations. We provide comprehensive coaching with experienced faculty, quality study materials, and personalized mentorship to help students achieve their career goals.",
      },
      {
        question: "Where are your branches located?",
        answer: "We have our Corporate Office in Sector 63, Noida (UP) and Regional Office in Rajeev Nagar, Patna (Bihar). We also offer online classes for students across India.",
      },
      {
        question: "What courses do you offer?",
        answer: "We offer preparation courses for SSC CGL, SSC CHSL, SSC MTS, Bank PO, Bank Clerk, IBPS, RRB, Railway exams (RRB NTPC, Group D), and Defence exams (CDS, NDA, AFCAT). Visit our Batches page to see all available courses.",
      },
    ],
  },
  {
    category: "Admission & Enrollment",
    questions: [
      {
        question: "How can I enroll in a course?",
        answer: "You can enroll in our courses through multiple ways:\n1. Visit our website and click on 'Enroll Now' on any batch\n2. Fill out the enquiry form and our team will contact you\n3. Visit our branch office directly\n4. Call us at +91 9472070758",
      },
      {
        question: "What documents are required for admission?",
        answer: "For admission, you need to provide:\n• Valid ID proof (Aadhaar Card/Voter ID/Passport)\n• Recent passport-size photographs\n• Educational qualification certificates\n• Contact details and address proof",
      },
      {
        question: "Is there any entrance test for admission?",
        answer: "No, there is no entrance test required for admission. Anyone who wishes to prepare for competitive exams can join our courses. We assess your current level during the initial classes to provide personalized guidance.",
      },
      {
        question: "Can I get a demo class before enrolling?",
        answer: "Yes, we offer demo classes for all our courses. Contact our team to schedule a free demo class and experience our teaching methodology before making a decision.",
      },
    ],
  },
  {
    category: "Fees & Payment",
    questions: [
      {
        question: "What are the fee structures?",
        answer: "Fee structures vary based on the course, duration, and mode (online/offline). Please visit our Batches page or contact our office for detailed fee information. We offer competitive pricing and various payment options.",
      },
      {
        question: "Do you offer installment payment options?",
        answer: "Yes, we understand that paying the entire fee at once may be difficult for some students. We offer flexible EMI options and installment payment plans. Contact our office to discuss the best payment plan for you.",
      },
      {
        question: "Are there any scholarships available?",
        answer: "Yes, we offer merit-based scholarships for deserving students. We also provide discounts through promotional coupons. Check our current offers or contact us to know about available scholarship opportunities.",
      },
      {
        question: "What is the refund policy?",
        answer: "Refunds are processed as per our refund policy. If you wish to discontinue within 7 days of enrollment, you may be eligible for a partial refund (subject to terms). Please read our terms of service or contact support for detailed information.",
      },
    ],
  },
  {
    category: "Classes & Study Material",
    questions: [
      {
        question: "What is the class schedule?",
        answer: "Class schedules vary by batch. We offer morning, afternoon, and evening batches to accommodate working professionals and students. Online batches have flexible timings. Check the specific batch details for exact schedules.",
      },
      {
        question: "Do you provide study materials?",
        answer: "Yes, we provide comprehensive study materials including:\n• Topic-wise notes and handouts\n• Previous year question papers\n• Practice test series\n• Current affairs updates\n• Video lectures for revision (online students)",
      },
      {
        question: "Are the classes recorded for later viewing?",
        answer: "Yes, for online batches, all live classes are recorded and available for replay. Students can access these recordings through our mobile app or student portal for revision purposes.",
      },
      {
        question: "How are doubts handled?",
        answer: "We have dedicated doubt-clearing sessions after each topic. Students can also reach out to faculty members through our support system. Our small batch sizes ensure every student gets individual attention.",
      },
    ],
  },
  {
    category: "Online Learning",
    questions: [
      {
        question: "How do online classes work?",
        answer: "Our online classes are conducted through our dedicated platform and mobile app. You can attend live classes, interact with teachers in real-time, access recorded sessions, take mock tests, and download study materials - all from your device.",
      },
      {
        question: "What are the technical requirements for online classes?",
        answer: "You need:\n• Stable internet connection (minimum 2 Mbps)\n• Smartphone or computer with camera and microphone\n• Our mobile app (available on Google Play Store)\n• Quiet study environment for better learning",
      },
      {
        question: "Can I switch from online to offline mode?",
        answer: "Yes, subject to seat availability, you can switch between online and offline modes. There may be fee adjustments based on the mode. Contact our support team to process the switch.",
      },
    ],
  },
  {
    category: "Support & Contact",
    questions: [
      {
        question: "How can I contact support?",
        answer: "You can reach us through:\n• Email: aspectvisionofficial@gmail.com\n• Phone: +91 9472070758\n• Contact form on our website\n• Visit our branch offices\n• Through the support section in our app",
      },
      {
        question: "What are your office hours?",
        answer: "Our offices are open Monday to Saturday, 9:00 AM to 7:00 PM. Online support is available during office hours. For urgent queries outside office hours, you can email us.",
      },
      {
        question: "How quickly are support queries resolved?",
        answer: "We aim to respond to all queries within 24 hours. Urgent academic-related queries are prioritized and usually resolved within a few hours during office hours.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4 inline mr-1" />
              Help Center
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our courses, enrollment process, fees, and more
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  {section.category}
                </h2>
                <div className="bg-card rounded-xl border border-border">
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${section.category}-${index}`} className="border-border">
                        <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 text-left">
                          <span className="font-medium text-foreground">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-primary/5 rounded-2xl p-8 text-center">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
