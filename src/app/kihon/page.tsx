import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import KataDisplay from "@/components/kata-display";

export default function KihonPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kihon</CardTitle>
        <CardDescription>Select a grade to see its detailed kihon sequenze.</CardDescription>
      </CardHeader>
      <CardContent>
        <KataDisplay />
      </CardContent>
    </Card>
  );
}
