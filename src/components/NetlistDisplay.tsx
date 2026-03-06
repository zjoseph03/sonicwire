import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParsedSpecifications } from "@/lib/gemini";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ruler, Activity, Palette, Tag } from "lucide-react";

interface NetlistDisplayProps {
  specs: ParsedSpecifications;
}

export default function NetlistDisplay({ specs }: NetlistDisplayProps) {
  if (!specs || specs.length === 0) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground p-8">
                    No wire cuts extracted. Please verify the schematic.
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Extracted Wire Netlist</CardTitle>
        <CardDescription>
            Found {specs.length} wire cuts ready for processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Gauge</TableHead>
                <TableHead>Color</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specs.map((wire, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {wire.id || `W-${index + 1}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-500" />
                        {wire.length !== "null" ? wire.length : <span className="text-muted-foreground italic">--</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        {wire.gauge !== "null" ? wire.gauge : <span className="text-muted-foreground italic">--</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                         {wire.color !== "null" ? (
                             <Badge variant="outline" className="capitalize">
                                {wire.color}
                             </Badge>
                         ) : (
                             <span className="text-muted-foreground italic">--</span>
                         )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
