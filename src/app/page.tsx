import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dumbbell, Bot, Video, Users, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    title: 'Personalized Workout Plans',
    description: 'Get AI-tailored workout routines based on your fitness level, goals, and available equipment.',
    icon: Bot,
    link: '/generate-plan',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'fitness planning',
  },
  {
    title: 'Smart Form Checker',
    description: 'Analyze your exercise form with AI. Get real-time feedback to improve technique and prevent injuries.',
    icon: Video,
    link: '/form-check',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'exercise form',
  },
  {
    title: 'Adaptive Workouts',
    description: 'Your workout plan evolves with you. AI adjusts intensity and exercises based on your progress.',
    icon: Dumbbell, // Using Dumbbell as RefreshCw might be confusing with adapt plan
    link: '/adapt-plan',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'workout progress',
  },
  {
    title: 'Community Challenges',
    description: 'Join fun challenges, compete on leaderboards (opt-in), and stay motivated with the FlexFit AI community.', // Updated community name
    icon: Users,
    link: '/challenges',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'fitness community',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container px-4 md:px-6 text-center">
          <Dumbbell className="mx-auto h-16 w-16 mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">FlexFit</span> <span className="text-accent">AI</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
            Your personal AI fitness coach. Achieve your health goals with intelligent workout plans, smart form analysis, and adaptive training.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/generate-plan">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Core Features</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to elevate your fitness journey.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-start gap-4 p-6">
                  <feature.icon className="h-10 w-10 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="mt-1">{feature.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-0 relative aspect-[16/9]">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={feature.imageHint}
                  />
                </CardContent>
                <div className="p-6 bg-muted/50">
                  <Button asChild variant="link" className="p-0 h-auto text-primary hover:text-accent">
                    <Link href={feature.link}>
                      Explore {feature.title} <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
