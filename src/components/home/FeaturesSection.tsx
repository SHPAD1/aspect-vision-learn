 import { GraduationCap, FileText, Users, Award, Clock, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Instructors",
     description: "Learn from faculty with 10+ years of experience in competitive exam coaching.",
  },
  {
     icon: FileText,
     title: "Comprehensive Study Material",
     description: "Get access to updated study materials, previous year papers, and regular mock tests.",
  },
  {
    icon: Users,
    title: "Small Batch Sizes",
     description: "Maximum 30 students per batch ensures individual attention and doubt clearing.",
  },
  {
    icon: Award,
     title: "Proven Results",
     description: "98% selection rate with hundreds of successful candidates in SSC, Banking, Railway exams.",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
     description: "Choose from morning, evening, or weekend batches that fit your schedule.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
     description: "Get help anytime with our dedicated support team and doubt clearing sessions.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
             Your Success is Our Priority
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             We've designed our programs to ensure maximum success in competitive examinations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-interactive p-6"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}