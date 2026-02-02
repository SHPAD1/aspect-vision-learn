import { GraduationCap, Laptop, Users, Award, Clock, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Instructors",
    description: "Learn from industry professionals with 10+ years of experience in their fields.",
  },
  {
    icon: Laptop,
    title: "Hands-on Projects",
    description: "Build real-world projects that you can add to your portfolio and showcase to employers.",
  },
  {
    icon: Users,
    title: "Small Batch Sizes",
    description: "Maximum 30 students per batch ensures personalized attention and better learning outcomes.",
  },
  {
    icon: Award,
    title: "Industry Certification",
    description: "Get certified upon completion and stand out in your job applications.",
  },
  {
    icon: Clock,
    title: "Flexible Timings",
    description: "Choose from weekday or weekend batches that fit your schedule.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Get help anytime with our AI tutor and dedicated support team.",
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
            Learn Different. Succeed Different.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've designed our programs to give you the best learning experience and career outcomes.
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