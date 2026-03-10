import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Printer, Upload, Play, Terminal, Zap, RefreshCw } from "lucide-react";
import { generateGCode } from "@/lib/gcode";
import { ParsedSpecifications } from "@/lib/gemini";
import Navbar from "@/components/Navbar";

// Web Serial API types (browser specific)
interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    writable: WritableStream;
}

const AdminDemo = () => {
    const [port, setPort] = useState<SerialPort | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [specs, setSpecs] = useState<ParsedSpecifications | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    // Load spec from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('lastHarnessSpecs');
        if (stored) {
            try {
                setSpecs(JSON.parse(stored));
                addLog('Loaded parsed harness from session storage.');
            } catch (e) {
                console.error("Failed to parse stored specs", e);
            }
        }
    }, []);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
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
        if (!port || !specs) return;
        setIsPrinting(true);
        addLog("Starting print job...");

        const commands = generateGCode(specs);
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();

        try {
            for (const cmd of commands) {
                // Skip comments for serial speed optimization, unless meaningful
                if (cmd.startsWith(';') && !cmd.includes('Scaling')) continue;
                
                addLog(`> ${cmd}`);
                await writer.write(encoder.encode(cmd + '\n'));
                
                // Slight delay for buffer management (simple flow control)
                await new Promise(r => setTimeout(r, 100));
            }
            addLog("Job sent successfully.");
        } catch (err) {
            addLog(`Transmission Error: ${String(err)}`);
        } finally {
            writer.releaseLock();
            setIsPrinting(false);
        }
    };

    const handleClearSession = () => {
        localStorage.removeItem('lastHarnessSpecs');
        setSpecs(null);
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
                                                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                                     <div className="flex items-center gap-3">
                                                        <span className="font-mono text-xs text-muted-foreground">#{idx + 1}</span>
                                                        <span className="font-medium">{wire.id}</span>
                                                        <Badge variant="secondary" className="text-xs">{wire.color}</Badge>
                                                     </div>
                                                     <span className="font-mono">{wire.length}</span>
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

                        <Alert className="bg-primary/5 border-primary/20">
                            <Printer className="h-4 w-4"/>
                            <AlertTitle>Printing Configuration</AlertTitle>
                            <AlertDescription className="text-xs mt-2 space-y-1">
                                <p>• <strong>Max Bed Y:</strong> 220mm</p>
                                <p>• <strong>Auto-Scale:</strong> Active (Shrinks if &gt;210mm)</p>
                                <p>• <strong>Wire Spacing:</strong> 10mm</p>
                                <p>• <strong>Cut Pin:</strong> 32 (High/Low)</p>
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* Right Column: Comparison / Control */}
                    <div className="space-y-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Serial Terminal</CardTitle>
                                <CardDescription>Live communication with Ender 3 V3 SE</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col gap-4">
                                <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-[400px] overflow-y-auto shadow-inner">
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
