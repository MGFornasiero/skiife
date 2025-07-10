import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import KataDisplay from "@/components/kata-display";
import KataSelection from "@/components/kata-selection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-background">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">KataFlow</h1>
          <p className="text-muted-foreground mt-2 text-lg">Visualize and learn your martial arts sequences.</p>
        </header>

        <Tabs defaultValue="ordinali" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ordinali">Ordinali</TabsTrigger>
            <TabsTrigger value="segnaposto">Segnaposto</TabsTrigger>
          </TabsList>
          <TabsContent value="ordinali">
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
          <TabsContent value="segnaposto">
            <KataSelection />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
