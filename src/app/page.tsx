import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import KataDisplay from "@/components/kata-display";
import KataSelection from "@/components/kata-selection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-background">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">SKI Compendium</h1>
        </header>

        <Tabs defaultValue="kata" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kata">Kata</TabsTrigger>
            <TabsTrigger value="kihon">Kihon</TabsTrigger>
            <TabsTrigger value="glossario">Glossario</TabsTrigger>
            <TabsTrigger value="ricerca">Ricerca</TabsTrigger>
          </TabsList>
          <TabsContent value="kata">
            <KataSelection />
          </TabsContent>
          <TabsContent value="kihon">
            <Card>
              <CardHeader>
                <CardTitle>Sequenza Display</CardTitle>
                <CardDescription>Select a sequenza number to see its detailed passaggi.</CardDescription>
              </CardHeader>
              <CardContent>
                <KataDisplay />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="glossario">
            <Card>
              <CardHeader>
                <CardTitle>Glossario</CardTitle>
                <CardDescription>Definitions for martial arts terms.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="ricerca">
            <Card>
              <CardHeader>
                <CardTitle>Ricerca</CardTitle>
                <CardDescription>Search for specific techniques or movements.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
