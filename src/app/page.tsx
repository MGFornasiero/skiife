import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <Card>
      <CardHeader>
          <CardTitle>
            <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">SKI Compendium</h1>
          </CardTitle>
          <CardDescription>Welcome to the SKI Compendium. Your digital resource for Shotokan Karate.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Use the navigation menu to explore Kata, Kihon, and other resources.</p>
      </CardContent>
    </Card>
  );
}
