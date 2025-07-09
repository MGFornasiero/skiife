import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import KataDisplay from "@/components/kata-display";

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
            <Card>
              <CardHeader>
                <CardTitle>Placeholder</CardTitle>
                <CardDescription>This is a placeholder tab.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">Content for this tab is coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
