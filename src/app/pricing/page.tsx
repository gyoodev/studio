
"use client";

import { motion } from "framer-motion"; // Import motion
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Sparkles, Users, Video, ListChecks, Repeat, LifeBuoy, DollarSign, Zap, Gem, ShieldCheck, Star, ClipboardList, Salad, Apple } from "lucide-react"; // Added ClipboardList, Salad, Apple
import Link from "next/link";

interface Feature {
  text: string;
  icon: React.ElementType;
}

interface Plan {
  name: string;
  price: string;
  priceNumeric?: number;
  priceSuffix?: string;
  description: string;
  features: Feature[];
  cta: string;
  link: string;
  highlight: boolean;
  variant?: "default" | "outline";
}

const plans: Plan[] = [
  {
    name: "Premium",
    price: "$14.99",
    priceSuffix: "/ month",
    priceNumeric: 14.99,
    description: "Advanced tools for dedicated fitness enthusiasts.",
    features: [
      { text: "Unlimited AI Workout Plans", icon: ListChecks },
      { text: "Advanced Form Check (10 videos/month)", icon: Video },
      { text: "Adaptive Workout Adjustments", icon: Repeat },
      { text: "Full Access to Community Challenges", icon: Users },
      { text: "Basic Diet Plan Guidance", icon: ClipboardList }, // Added
      { text: "Detailed Progress Tracking & Analytics", icon: Zap },
    ],
    cta: "Choose Premium",
    link: "/subscribe?plan=premium",
    highlight: false,
    variant: "outline",
  },
  {
    name: "Platinum",
    price: "$24.99",
    priceSuffix: "/ month",
    priceNumeric: 24.99,
    description: "The most popular choice for peak performance and support.",
    features: [
      { text: "All Premium Features Included", icon: CheckCircle },
      { text: "Unlimited Advanced Form Checks", icon: Video },
      { text: "Personalized Diet Plan Suggestions", icon: Salad }, // Added
      { text: "Personalized AI Coaching Insights", icon: Sparkles },
      { text: "Priority Email Support", icon: LifeBuoy },
      { text: "Monthly Progress Review Call (15 min)", icon: Star },
    ],
    cta: "Choose Platinum",
    link: "/subscribe?plan=platinum",
    highlight: true,
    variant: "default",
  },
  {
    name: "Diamond",
    price: "$39.99",
    priceSuffix: "/ month",
    priceNumeric: 39.99,
    description: "The ultimate, all-inclusive fitness experience.",
    features: [
      { text: "All Platinum Features Included", icon: CheckCircle },
      { text: "Custom Nutrition Plan Guidance", icon: Apple }, // Changed icon to Apple for variety
      { text: "Dedicated AI Coach Access", icon: Gem },
      { text: "24/7 Priority Support (Chat & Email)", icon: ShieldCheck },
      { text: "Early Access to New Features & Beta Programs", icon: Zap },
    ],
    cta: "Choose Diamond",
    link: "/subscribe?plan=diamond",
    highlight: false,
    variant: "outline",
  },
];

export default function PricingPage() {
  return (
    <motion.div
      className="container py-12 md:py-20"
      initial={{ opacity: 0 }} // Initial state: invisible
      animate={{ opacity: 1 }} // Animate to visible
      transition={{ duration: 0.8 }} // Animation duration
    >
      <header className="text-center mb-12 md:mb-16">
        <DollarSign className="mx-auto h-14 w-14 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">

          Find Your Perfect Fit
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          Unlock your potential with FlexFit AI. Choose a plan tailored to your fitness journey.
        </p>
      </header>

      <section className="grid lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, index) => ( // Add index for staggered animation
          <Card
            key={plan.name}
            asChild // Use asChild to render motion.div as Card
          >
            <motion.div // Wrap each card with motion
              initial={{ opacity: 0, y: 20 }} // Initial state: invisible and slightly down
              animate={{ opacity: 1, y: 0 }} // Animate to visible and normal position
              transition={{ duration: 0.5, delay: index * 0.1 }} // Staggered animation delay
              className={`flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden p-4 md:p-6 ${
              plan.highlight ? "border-primary border-2 ring-4 ring-primary/20" : "border-border"
              }`}
          >
            <CardHeader className={`pb-4 ${plan.highlight ? 'bg-primary/10' : ''}`}>
              <CardTitle className={`text-2xl font-semibold ${plan.highlight ? "text-primary" : ""}`}>
                {plan.name}
              </CardTitle>
              <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 pt-6 pb-8">
              <div className="mb-6 text-center">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                {plan.priceSuffix && <span className="text-muted-foreground text-base">{plan.priceSuffix}</span>}
              </div>
              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <feature.icon className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6 pb-6 border-t bg-muted/30">
              <Button
                asChild
                className="w-full shadow-md hover:shadow-lg transition-shadow"
                variant={plan.variant}
                size="lg"
              >
                <Link href={plan.link || "#"}>{plan.cta}</Link>
              </Button>
            </CardFooter>
            </motion.div>
          </Card>
        ))}
      </section>
      <motion.footer // Wrap footer with motion
        className="mt-16 text-center text-muted-foreground text-sm p-4 md:p-6 bg-muted/30 rounded-md" // Added padding and background
        initial={{ opacity: 0, y: 20 }} // Initial state: invisible and slightly down
        animate={{ opacity: 1, y: 0 }} // Animate to visible and normal position
        transition={{ duration: 0.8, delay: plans.length * 0.1 + 0.2 }} // Delay after cards
      >
        <p>All prices are in USD. Subscriptions can be managed or cancelled at any time from your profile.</p>
        <p>Have questions? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>.</p>
      </footer>
    </motion.div> // Close the main motion.div
  );
}
