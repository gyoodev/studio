"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  link: string;
}

const simplePlans: Plan[] = [
  {
    name: "Basic",
    price: "$9.99",
    description: "Essential features for getting started.",
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    cta: "Get Basic",
    link: "/subscribe?plan=basic",
  },
  {
    name: "Pro",
    price: "$19.99",
    description: "Advanced features for growing users.",
    features: [
      "All Basic Features",
      "Feature 4",
      "Feature 5",
    ],
    cta: "Get Pro",
    link: "/subscribe?plan=pro",
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "Custom solutions for large organizations.",
    features: [
      "All Pro Features",
      "Custom Features",
      "Dedicated Support",
    ],
    cta: "Contact Sales",
    link: "/contact",
  },
];

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-20">
      <header className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Choose Your Plan
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
          Find the perfect plan that fits your needs.
        </p>
      </header>

      <section className="grid lg:grid-cols-3 gap-8 items-stretch">
        {simplePlans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                <span className="text-4xl font-extrabold">{plan.price}</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {/* You can add an icon here if needed */}
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={plan.link}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}