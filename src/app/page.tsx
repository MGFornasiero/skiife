import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import KataDisplay from "@/components/kata-display";
import KataSelection from "@/components/kata-selection";
import SearchDisplay from "@/components/search-display";
import SegnapostoDisplay from "@/components/segnaposto-display";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-background">
      <div className="w-full max-w-4xl">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="kata">Kata</TabsTrigger>
            <TabsTrigger value="kihon">Kihon</TabsTrigger>
            <TabsTrigger value="ricerca">Ricerca</TabsTrigger>
            <TabsTrigger value="segnaposto">Segnaposto</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <Card>
              <CardHeader>
                  <CardTitle>
                    <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">SKI Compendium</h1>
                  </CardTitle>
                  <CardDescription>Welcome to the SKI Compendium. Your digital resource for Shotokan Karate.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Use the tabs to navigate through Kata, Kihon, and the Glossary.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="kata">
            <KataSelection />
          </TabsContent>
          <TabsContent value="kihon">
            <Card>
              <CardHeader>
                <CardTitle>Kihon</CardTitle>
                <CardDescription>Select a grade to see its detailed kihon sequenze.</CardDescription>
              </CardHeader>
              <CardContent>
                <KataDisplay />
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="ricerca">
              <SearchDisplay />
          </TabsContent>
          <TabsContent value="segnaposto">
            <SegnapostoDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
