import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParsedSpecifications, WireCut } from "@/lib/gemini";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Ruler, Activity, Palette, Tag, AlertTriangle, AlertCircle, Plus, Info } from "lucide-react";

interface NetlistDisplayProps {
  specs: ParsedSpecifications;
  onUpdateWire?: (index: number, field: keyof WireCut, value: string) => void;
  onAddWire?: () => void;
}

const WIRE_COLORS = [
  "Red", "Black", "White", "Green", "Blue", 
  "Yellow", "Orange", "Brown", "Purple", "Grey", "Pink"
];

export default function NetlistDisplay({ specs, onUpdateWire, onAddWire }: NetlistDisplayProps) {
  const { wires, missingInfo, isSchematic } = specs;
  const hasWires = wires && wires.length > 0;

  if (!hasWires && !missingInfo?.length && isSchematic) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground p-8">
                    No wire cuts extracted. Please verify the schematic.
                    {onAddWire && (
                      <div className="mt-4">
                        <Button onClick={onAddWire} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Wire Manually
                        </Button>
                      </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages / Warnings */}
      
      {!isSchematic && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Confidence Extraction</AlertTitle>
          <AlertDescription>
            The uploaded document does not appear to be a standard wire harness schematic. 
            The extracted data may be incomplete or incorrect. Please utilize the table below to manually verify and input missing information.
          </AlertDescription>
        </Alert>
      )}

      {missingInfo && missingInfo.length > 0 && (
        <Alert variant="default" className="border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertTitle>Missing Information Detected</AlertTitle>
          <AlertDescription>
            The following required fields could not be found in the document: 
            <span className="font-semibold"> {missingInfo.join(", ")}</span>.
            Please review the table below and fill in the missing details.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Extracted Wire Netlist</CardTitle>
            <CardDescription>
                Found {wires.length} wire cuts ready for processing
            </CardDescription>
          </div>
          {onAddWire && (
            <Button onClick={onAddWire} size="sm" variant="outline" className="ml-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Wire
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <div className="flex items-center gap-1">
                      ID
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">ID name can be arbitrary but relevant labelling is best (e.g., GND, HOT, PWR)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>Length (cm)</TableHead>
                  <TableHead>Gauge (AWG)</TableHead>
                  <TableHead>Color</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wires.map((wire, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium p-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <Input 
                          value={wire.id || ""} 
                          onChange={(e) => onUpdateWire?.(index, 'id', e.target.value)}
                          className="h-8 w-24"
                          placeholder="ID"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-500" />
                        <Input 
                          value={wire.length === "null" ? "" : (wire.length || "")} 
                          onChange={(e) => onUpdateWire?.(index, 'length', e.target.value)}
                          className={`h-8 w-32 ${wire.length === "null" ? "border-red-300 bg-red-50" : ""}`}
                          placeholder="Length"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <Input 
                          value={wire.gauge === "null" ? "" : (wire.gauge || "")} 
                          onChange={(e) => onUpdateWire?.(index, 'gauge', e.target.value)}
                          className={`h-8 w-24 ${wire.gauge === "null" ? "border-red-300 bg-red-50" : ""}`}
                          placeholder="Gauge"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                        <Select 
                          value={
                             WIRE_COLORS.find(c => c.toLowerCase() === (wire.color || "").toLowerCase()) ||
                             (wire.color && wire.color !== "null" ? wire.color : "")
                          }
                          onValueChange={(value) => onUpdateWire?.(index, 'color', value)}
                        >
                          <SelectTrigger className={`h-8 w-32 ${wire.color === "null" ? "border-red-300 bg-red-50" : ""}`}>
                            <SelectValue placeholder="Select Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {WIRE_COLORS.map((color) => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full border border-muted" style={{ backgroundColor: color.toLowerCase() }}></div>
                                  {color}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
