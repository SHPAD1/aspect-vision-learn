import { Calendar, Clock, MapPin, Users, IndianRupee, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BatchCardProps {
  batch: {
    id: string;
    name: string;
    course_name: string;
    branch_name: string;
    start_date: string;
    duration_weeks: number;
    mode: "online" | "offline" | "hybrid";
    fees: number;
    description: string;
    schedule: string;
    thumbnail_url?: string;
    discount_percent?: number | null;
  };
  onViewDetails: (id: string) => void;
  onEnroll: (id: string) => void;
}

const modeConfig = {
  online: { label: "Online", className: "badge-online" },
  offline: { label: "Offline", className: "badge-offline" },
  hybrid: { label: "Hybrid", className: "badge-hybrid" },
};

export function BatchCard({ batch, onViewDetails, onEnroll }: BatchCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountedPrice = (price: number, discount: number | null | undefined) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  const hasDiscount = batch.discount_percent && batch.discount_percent > 0;
  const discountedPrice = getDiscountedPrice(batch.fees, batch.discount_percent);

  return (
    <div className="card-elevated group overflow-hidden">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={batch.thumbnail_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"}
          alt={batch.course_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge className={cn(modeConfig[batch.mode].className)}>
            {modeConfig[batch.mode].label}
          </Badge>
          {hasDiscount && (
            <Badge className="bg-destructive text-destructive-foreground">
              <Percent className="w-3 h-3 mr-1" />
              {batch.discount_percent}% OFF
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <p className="text-sm font-medium text-primary mb-1">{batch.course_name}</p>
          <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1">
            {batch.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {batch.description}
        </p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{batch.branch_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatDate(batch.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{batch.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{batch.schedule}</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-5 h-5 text-foreground" />
            <span className="font-heading text-xl font-bold text-foreground">
              {formatCurrency(batch.fees).replace("₹", "")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(batch.id)}
            >
              Details
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => onEnroll(batch.id)}
            >
              Enroll
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}