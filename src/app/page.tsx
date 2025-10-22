import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
            <CardTitle>
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">SKI Compendium</h1>
            </CardTitle>
            <CardDescription>Compendio di Karate SKI per Bushido</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Kata contiene l'elenco dei Kata</p>
          <p>Kihon contiene i kihon da portare all' esame</p>
          <p>Ricerca consente di cercare tra i termini utilizzati</p>
          <p>Glossario spiega i termini divisi per categoria</p>
        </CardContent>
      </Card>
    </div>
  );
}
