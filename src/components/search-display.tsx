"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function SearchDisplay() {
  const [searchText, setSearchText] = useState("");
  const [searched, setSearched] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchText) return;

    setLoading(true);
    setError(null);
    setSearched(null);

    try {
      const response = await fetch('/api/finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: searchText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }

      const data = await response.json();
      setSearched(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ricerca</CardTitle>
        <CardDescription>Search for specific techniques or movements.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="submit" onClick={handleSearch} disabled={!searchText || loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="mt-6">
          {error && (
            <div className="text-destructive p-4 border border-destructive/50 rounded-md">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          {searched && (
            <div className="p-4 border rounded-md bg-muted/50">
              <h3 className="font-semibold mb-2">Search Results:</h3>
              <pre className="text-sm whitespace-pre-wrap break-all bg-background p-2 rounded">
                {JSON.stringify(searched, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
