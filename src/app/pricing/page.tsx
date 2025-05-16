
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, Sparkles, Users, Video, ListChecks, Repeat, LifeBuoy, DollarSign, Zap } from "lucide-react";
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
    name: "Basic",
    price: "Free",
    priceNumeric: 0,
    description: "Get started with essential fitness tools.",
    features: [
      { text: "Limited AI Workout Plans", icon: ListChecks },
      { text: "Basic Form Check (1 video/week)", icon: Video },
      { text: "Community Access", icon: Users },
    ],
    cta: "Get Started",
    link: "/signup",
    highlight: false,
    variant: "outline",
  },
  {
    name: "FlexFit Pro", // Updated Plan Name
    price: "$9.99",
    priceSuffix: "/ month",
    priceNumeric: 9.99,
    description: "Unlock advanced AI features and personalized training.",
    features: [
      { text: "Unlimited AI Workout Plans", icon: ListChecks },
      { text: "Advanced Form Check & Feedback", icon: Video },
      { text: "Adaptive Workout Adjustments", icon: Repeat },
      { text: "Full Access to Challenges", icon: Users },
      { text: "Detailed Progress Tracking", icon: Zap },
    ],
    cta: "Choose Pro",
    link: "/subscribe?plan=pro", // Placeholder link
    highlight: true,
    variant: "default",
  },
  {
    name: "FlexFit Elite", // Updated Plan Name
    price: "$19.99",
    priceSuffix: "/ month",
    priceNumeric: 19.99,
    description: "The ultimate AI fitness experience with premium support.",
    features: [
      { text: "All Pro Features Included", icon: CheckCircle },
      { text: "Personalized AI Coaching Insights", icon: Sparkles },
      { text: "Priority Email Support", icon: LifeBuoy },
      { text: "Early Access to New Features", icon: Zap },
    ],
    cta: "Choose Elite",
    link: "/subscribe?plan=elite", // Placeholder link
    highlight: false,
    variant: "outline",
  },
];

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-20">
      <header className="text-center mb-12 md:mb-16">
        <DollarSign className="mx-auto h-14 w-14 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Find the Perfect Plan
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          Simple, transparent pricing. Elevate your fitness journey with FlexFit AI today.
        </p>
      </header>

      <section className="grid lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden ${
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
                {plan.priceNumeric === 0 && <span className="block text-base text-muted-foreground mt-1">Always free</span>}
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
          </Card>
        ))}
      </section>
      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>All prices are in USD. Subscriptions can be managed or cancelled at any time from your profile.</p>
        <p>Have questions? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>.</p>
      </footer>
    </div>
  );
}
