import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Printer, Upload, Play, Terminal, Zap, RefreshCw, ChevronDown, ChevronUp, Edit, Eye, FileCode, Check, FileText, X, AlertTriangle } from "lucide-react";
import { generateGCode, PrinterConfig, DEFAULT_CONFIG } from "@/lib/gcode";
import { ParsedSpecifications, WireCut } from "@/lib/gemini";
import Navbar from "@/components/Navbar";

// Web Serial API types (browser specific)
interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    writable: WritableStream;
    readable: ReadableStream;
}

const AdminDemo = () => {
    const [port, setPort] = useState<SerialPort | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [specs, setSpecs] = useState<ParsedSpecifications | null>(null);
    const [config, setConfig] = useState<PrinterConfig>(DEFAULT_CONFIG);
    const [logs, setLogs] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // File Preview
    const [fileData, setFileData] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    
    // Wire Editing
    const [editingWireIndex, setEditingWireIndex] = useState<number | null>(null);
    const [tempWire, setTempWire] = useState<WireCut | null>(null);

    // G-Code Preview & Editing
    const [gcodePreview, setGcodePreview] = useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditingGcode, setIsEditingGcode] = useState(false);

    // Load spec from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('lastHarnessSpecs');
        if (stored) {
            try {
                const parsedSpecs = JSON.parse(stored);
                setSpecs(parsedSpecs);
                addLog('Loaded parsed harness from session storage.');
            } catch (e) {
                console.error("Failed to parse stored specs", e);
            }
        }
        
        // Load stored file preview
        const storedFileData = localStorage.getItem('lastHarnessFileData');
        if (storedFileData) {
            setFileData(storedFileData);
            setFileName(localStorage.getItem('lastHarnessFileName'));
            setFileType(localStorage.getItem('lastHarnessFileType'));
        }
    }, []);

    // Regenerate G-Code when specs or config changes
    useEffect(() => {
        if (specs) {
            const initialGCode = generateGCode(specs, config).join('\n');
            setGcodePreview(initialGCode);
        }
    }, [specs, config]);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const handleConfigChange = (key: keyof PrinterConfig, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setConfig(prev => ({ ...prev, [key]: numValue }));
        }
    };

    // Wire Editing
    const startEditingWire = (index: number, wire: WireCut) => {
        setEditingWireIndex(index);
        setTempWire({ ...wire });
    };

    const cancelEditingWire = () => {
        setEditingWireIndex(null);
        setTempWire(null);
    };

    const saveWire = () => {
        if (specs && editingWireIndex !== null && tempWire) {
            const newWires = [...specs.wires];
            newWires[editingWireIndex] = tempWire;
            const newSpecs = { ...specs, wires: newWires };
            setSpecs(newSpecs);
            localStorage.setItem('lastHarnessSpecs', JSON.stringify(newSpecs));
            setEditingWireIndex(null);
            setTempWire(null);
            addLog(`Updated wire #${editingWireIndex + 1}`);
        }
    };

    const connectSerial = async () => {
        if (!navigator.serial) {
            addLog("Web Serial API not supported in this browser.");
            return;
        }

        try {
            const p = await (navigator as any).serial.requestPort();
            await p.open({ baudRate: 115200 });
            setPort(p);
            setIsConnected(true);
            addLog("Serial Port Connected (115200 baud)");
        } catch (err) {
            console.error(err);
            addLog(`Connection Failed: ${String(err)}`);
        }
    };

    const sendGCode = async () => {
        if (!port || !gcodePreview) return;
        setIsPrinting(true);
        addLog("Starting print job from preview...");

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        const writer = port.writable.getWriter();
        const reader = port.readable.getReader();

        try {
            const commands = gcodePreview.split(/\r?\n/);
            let buffer = '';

            for (const line of commands) {
                const cmd = line.trim();
                
                // Ignore empty lines and comments
                if (!cmd || cmd.startsWith(';')) {
                    continue;
                }
                
                addLog(`> ${cmd}`);
                await writer.write(encoder.encode(cmd + '\n'));
                
                // Wait for 'ok'
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;
                    
                    // Check for "ok" (case-insensitive usually, but standard is "ok")
                    if (buffer.toLowerCase().includes('ok')) {
                        buffer = '';
                        break;
                    }
                }
            }
            addLog("Job sent successfully.");
        } catch (err) {
            console.error(err);
            addLog(`Transmission Error: ${String(err)}`);
        } finally {
            writer.releaseLock();
            reader.releaseLock();
            setIsPrinting(false);
        }
    };

    const handleClearSession = () => {
        localStorage.removeItem('lastHarnessSpecs');
        setSpecs(null);
        setGcodePreview('');
        addLog("Session cleared.");
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Terminal className="text-primary w-8 h-8"/>
                            Admin Control: Demo Day
                        </h1>
                        <p className="text-muted-foreground">Direct Serial G-Code Interface</p>
                    </div>
                    <div className="flex gap-4">
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleClearSession}
                            disabled={!specs}
                        >
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Reset Data
                        </Button>
                        <Button 
                            className={isConnected ? "bg-green-600 hover:bg-green-700" : "bg-primary"}
                            onClick={connectSerial} 
                            disabled={isConnected}
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            {isConnected ? "Connected to Printer" : "Connect via USB"}
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column: Harness Data */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Current Harness
                                    {specs && <Badge variant="outline">{specs.wires.length} Wires</Badge>}
                                </CardTitle>
                                <CardDescription>
                                    Data extracted from the last user upload.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {specs ? (
                                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                        <div className="space-y-4">
                                            {specs.wires.map((wire, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded gap-2 min-h-[50px]">
                                                    {editingWireIndex === idx ? (
                                                        <div className="flex-grow flex items-center gap-2">
                                                            <span className="font-mono text-xs text-muted-foreground w-6">#{idx + 1}</span>
                                                            <div className="grid grid-cols-3 gap-2 flex-grow">
                                                                <Input 
                                                                    value={tempWire?.id} 
                                                                    onChange={(e) => setTempWire(prev => ({...prev!, id: e.target.value}))}
                                                                    className="h-8 text-xs bg-background"
                                                                    placeholder="ID"
                                                                />
                                                                <Input 
                                                                    value={tempWire?.color} 
                                                                    onChange={(e) => setTempWire(prev => ({...prev!, color: e.target.value}))}
                                                                    className="h-8 text-xs bg-background"
                                                                    placeholder="Color"
                                                                />
                                                                <Input 
                                                                    value={tempWire?.length} 
                                                                    onChange={(e) => setTempWire(prev => ({...prev!, length: e.target.value}))}
                                                                    className="h-8 text-xs bg-background"
                                                                    placeholder="Length"
                                                                />
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={saveWire}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={cancelEditingWire}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                             <div className="flex items-center gap-3">
                                                                <span className="font-mono text-xs text-muted-foreground w-6">#{idx + 1}</span>
                                                                <span className="font-medium min-w-[60px]">{wire.id}</span>
                                                                <Badge variant="secondary" className="text-xs min-w-[50px] justify-center">{wire.color}</Badge>
                                                             </div>
                                                             <div className="flex items-center gap-4">
                                                                 <span className="font-mono">{wire.length}</span>
                                                                 <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-6 w-6 opacity-30 hover:opacity-100 transition-opacity"
                                                                    onClick={() => startEditingWire(idx, wire)}
                                                                 >
                                                                    <Edit className="h-3 w-3" />
                                                                 </Button>
                                                             </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-md border-2 border-dashed">
                                        <Upload className="h-10 w-10 mb-4 opacity-50" />
                                        <p>No parser data found.</p>
                                        <p className="text-sm">Go to Quote Request first to upload a PDF.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Machine Configuration & Preview */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3 px-4 pt-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Printer className="w-4 h-4"/> Machine Settings
                                        </CardTitle>
                                        <Badge variant="outline" className="text-[10px] font-mono">Ender 3 V3 SE</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                     <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Bed Y (mm)</Label>
                                            <Input 
                                                type="number" 
                                                value={config.bedSizeY} 
                                                onChange={(e) => handleConfigChange('bedSizeY', e.target.value)}
                                                className="h-7 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Feed Rate (XY)</Label>
                                            <Input 
                                                type="number" 
                                                value={config.feedRateMove} 
                                                onChange={(e) => handleConfigChange('feedRateMove', e.target.value)}
                                                className="h-7 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Feed Rate (E)</Label>
                                            <Input 
                                                type="number" 
                                                value={config.feedRateExtrude} 
                                                onChange={(e) => handleConfigChange('feedRateExtrude', e.target.value)}
                                                className="h-7 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Cut Pin (Index)</Label>
                                            <Input 
                                                type="number" 
                                                value={config.cutPin} 
                                                onChange={(e) => handleConfigChange('cutPin', e.target.value)}
                                                className="h-7 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Flow Ratio</Label>
                                            <Input 
                                                type="number" 
                                                step="0.001"
                                                value={config.extrusionRatio} 
                                                onChange={(e) => handleConfigChange('extrusionRatio', e.target.value)}
                                                className="h-7 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Cut Delay (ms)</Label>
                                            <Input 
                                                type="number" 
                                                value={config.cutDuration} 
                                                onChange={(e) => handleConfigChange('cutDuration', e.target.value)}
                                                className="h-7 text-xs font-mono"
                                            />
                                        </div>
                                     </div>
                                </CardContent>
                            </Card>

                            {/* Schematic Preview */}
                            <Collapsible className="border rounded-md bg-muted/20" defaultOpen={!!fileData}>
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Source Document</span>
                                        {fileName ? (
                                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">({fileName})</span>
                                        ) : (
                                            <span className="text-xs text-red-500 italic flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" /> Not Found
                                            </span>
                                        )}
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <ChevronDown className="h-4 w-4 opacity-50"/>
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent className="border-t bg-background p-2">
                                    {fileData ? (
                                        fileType?.startsWith('image/') ? (
                                            <img src={fileData} alt="Schematic" className="w-full rounded border shadow-sm max-h-[500px] object-contain" />
                                        ) : (
                                            <iframe src={fileData} className="w-full h-[500px] border rounded shadow-sm" title="Schematic Document" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-md bg-muted/5">
                                            <AlertTriangle className="h-8 w-8 mb-2 opacity-30 text-yellow-500" />
                                            <p className="font-semibold text-sm">No Preview Available</p>
                                            <p className="text-xs max-w-[250px] mt-1">
                                                This could be an old session. Please go to "File &gt; Upload" or start a new quote to enable schematic preview.
                                            </p>
                                        </div>
                                    )}
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>

                    {/* Right Column: Comparison / Control */}
                    <div className="space-y-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Serial Terminal</CardTitle>
                                <CardDescription>Live communication with Ender 3 V3 SE</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col gap-4">
                                
                                {/* G-Code Preview & Edit Section */}
                                <Collapsible
                                    open={isPreviewOpen}
                                    onOpenChange={setIsPreviewOpen}
                                    className="border rounded-md p-2 bg-muted/30"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-4">
                                            <Label className="text-sm font-semibold flex items-center gap-2">
                                                <FileCode className="w-4 h-4" />
                                                G-Code Preview
                                            </Label>
                                            {isPreviewOpen && (
                                                <div className="flex items-center bg-background rounded-md border p-0.5 h-7 shadow-sm">
                                                    <Button 
                                                        variant={!isEditingGcode ? "secondary" : "ghost"} 
                                                        size="sm" 
                                                        onClick={() => setIsEditingGcode(false)}
                                                        className="h-6 text-xs px-2 rounded-sm"
                                                    >
                                                        <Eye className="w-3 h-3 mr-1.5 opacity-70"/> View
                                                    </Button>
                                                    <Button 
                                                        variant={isEditingGcode ? "secondary" : "ghost"} 
                                                        size="sm" 
                                                        onClick={() => setIsEditingGcode(true)}
                                                        className="h-6 text-xs px-2 rounded-sm"
                                                    >
                                                        <Edit className="w-3 h-3 mr-1.5 opacity-70"/> Edit
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                                {isPreviewOpen ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">Toggle Preview</span>
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="mt-2 text-sm">
                                        {isEditingGcode ? (
                                            <div className="space-y-2">
                                                <Textarea 
                                                    value={gcodePreview}
                                                    onChange={(e) => setGcodePreview(e.target.value)}
                                                    className="font-mono text-xs h-[300px] bg-background resize-none focus-visible:ring-1"
                                                    placeholder="Generated G-Code will appear here..."
                                                />
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                                                    <Check className="w-3 h-3 text-green-600" /> 
                                                    Edits apply instantly. Switch to View to see formatting.
                                                </p>
                                            </div>
                                        ) : (
                                             <ScrollArea className="h-[300px] w-full bg-background rounded-md border text-xs font-mono shadow-sm">
                                                <div className="p-2 space-y-0.5">
                                                    {gcodePreview.split('\n').map((line, i) => {
                                                        const trimmed = line.trim();
                                                        if (!trimmed) return null; // Skip empty display lines
                                                        
                                                        const isFullComment = trimmed.startsWith(';');
                                                        const parts = line.split(';');
                                                        const command = parts[0];
                                                        const comment = parts.slice(1).join(';');
                                                        
                                                        return (
                                                            <div key={i} className={`flex gap-3 hover:bg-muted/50 px-2 py-0.5 rounded-sm transition-colors ${isFullComment ? 'opacity-80' : ''}`}>
                                                                <span className="text-muted-foreground/30 select-none w-6 text-right flex-shrink-0 text-[10px] pt-0.5">{i+1}</span>
                                                                <div className="flex-grow whitespace-pre-wrap break-all">
                                                                    {isFullComment ? (
                                                                        <span className="italic text-green-600/90 font-medium">{trimmed}</span>
                                                                    ) : (
                                                                        <>
                                                                            <span className="font-bold text-foreground/90">{command}</span>
                                                                            {comment && <span className="italic text-muted-foreground ml-1">;{comment}</span>}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>



                                <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-[300px] overflow-y-auto shadow-inner">
                                    {logs.length === 0 && <span className="opacity-50">System Ready. Waiting for connection...</span>}
                                    {logs.map((log, i) => (
                                        <div key={i} className="mb-1 border-b border-green-900/30 pb-1">{log}</div>
                                    ))}
                                </div>
                                
                                <Button 
                                    size="lg" 
                                    className="w-full mt-auto" 
                                    disabled={!isConnected || !specs || isPrinting}
                                    onClick={sendGCode}
                                >
                                    {isPrinting ? (
                                        <>Printing...</>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-5 w-5" />
                                            Send G-Code Job
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDemo;
