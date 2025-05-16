
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Users, Trophy, Star, Dumbbell } from 'lucide-react'; // Added Dumbbell here
import Image from 'next/image';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  imageHint: string;
  participants: number;
  reward: string;
}

const challengesData: Challenge[] = [
  {
    id: '1',
    title: 'Weekly Warrior: 5 Workouts',
    description: 'Complete any 5 workouts this week to earn the Weekly Warrior badge!',
    icon: Trophy,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'workout medal',
    participants: 1250,
    reward: 'Warrior Badge + 50 Points'
  },
  {
    id: '2',
    title: 'Cardio Crusher: 10k Steps Daily',
    description: 'Hit 10,000 steps every day for 7 days straight. Show your endurance!',
    icon: Star,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'running track',
    participants: 875,
    reward: 'Cardio King/Queen Badge + 75 Points'
  },
  {
    id: '3',
    title: 'Strength Starter: Lift Off',
    description: 'Log 3 strength training sessions this week focusing on compound lifts.',
    icon: Dumbbell, // Now uses the imported Dumbbell from lucide-react
    image: 'https://placehold.co/600x400.png',
    imageHint: 'weights gym',
    participants: 930,
    reward: 'Strength Badge + 60 Points'
  },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex P.', score: 1250, avatar: 'https://placehold.co/40x40.png' },
  { rank: 2, name: 'Sarah K.', score: 1180, avatar: 'https://placehold.co/40x40.png' },
  { rank: 3, name: 'Mike L.', score: 1100, avatar: 'https://placehold.co/40x40.png' },
  { rank: 4, name: 'Jessica B.', score: 1050, avatar: 'https://placehold.co/40x40.png' },
  { rank: 5, name: 'David R.', score: 990, avatar: 'https://placehold.co/40x40.png' },
];

export default function ChallengesPage() {
  const [optInLeaderboard, setOptInLeaderboard] = useState(false);

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <Users className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">Community Challenges</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Join challenges, earn rewards, and climb the leaderboard!
        </p>
      </div>

      <section id="active-challenges" className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Active Challenges</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challengesData.map((challenge) => (
            <Card key={challenge.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <div className="relative w-full h-48">
                 <Image 
                  src={challenge.image} 
                  alt={challenge.title} 
                  layout="fill" 
                  objectFit="cover" 
                  data-ai-hint={challenge.imageHint}
                />
              </div>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <challenge.icon className="h-7 w-7 text-accent" />
                  <CardTitle className="text-xl">{challenge.title}</CardTitle>
                </div>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Participants: {challenge.participants.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Reward: {challenge.reward}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full shadow-md">Join Challenge</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section id="leaderboard">
        <h2 className="text-3xl font-semibold mb-8 text-center">Leaderboard</h2>
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>See who's leading the pack. Scores are updated weekly.</CardDescription>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="opt-in" 
                checked={optInLeaderboard}
                onCheckedChange={(checked) => setOptInLeaderboard(Boolean(checked))}
              />
              <Label htmlFor="opt-in" className="text-sm font-medium">
                Show my profile on the leaderboard (Opt-in)
              </Label>
            </div>
          </CardHeader>
          <CardContent>
            {optInLeaderboard ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry) => (
                    <TableRow key={entry.rank}>
                      <TableCell className="font-medium">{entry.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Image src={entry.avatar} alt={entry.name} width={32} height={32} className="rounded-full" data-ai-hint="person avatar" />
                          <span>{entry.name}</span>
                        </div>
                        </TableCell>
                      <TableCell className="text-right">{entry.score.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Leaderboard is hidden. Opt-in above to display your ranking and see others.
              </p>
            )}
          </CardContent>
          {optInLeaderboard && (
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Leaderboard rankings are based on participation and challenge completion. Keep pushing!
            </p>
          </CardFooter>
          )}
        </Card>
      </section>
    </div>
  );
}

// Removed local Dumbbell SVG component
