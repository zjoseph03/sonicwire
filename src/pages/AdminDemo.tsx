import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Printer, Upload, Play, Terminal, Zap, RefreshCw, ChevronDown, ChevronUp, Edit, Eye, FileCode, Check, FileText, X, AlertTriangle, List, CheckCircle } from "lucide-react";
import { generateGCode, PrinterConfig, DEFAULT_CONFIG } from "@/lib/gcode";
import { ParsedSpecifications, WireCut } from "@/lib/gemini";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

// Helper for color bubbles
const getColorStyle = (code: string) => {
    const map: Record<string, string> = {
        "RD": "red",
        "BK": "black",
        "WH": "white",
        "GN": "green",
        "BU": "blue",
        "YL": "yellow",
        "YE": "yellow", // Added YE support
        "OR": "orange",
        "BN": "saddlebrown", // brown
        "VT": "purple",
        "GY": "grey",
        "PK": "pink",
        "SHIELD": "grey", // Shield wires
        "DRAIN": "grey",
        "BARE": "grey"
    };

    const upperCode = code?.toUpperCase()?.trim() || "";
    // If exact match in map use it, else if it's a standard color name try using it, otherwise fallback to grey if it looks like garbage
    // But keeping original logic of trying lowercase is fine for "blue", "red" inputs. 
    // However, "ye" or "shield" falling through was the issue.
    const color = map[upperCode] || code?.toLowerCase() || "grey";
    
    // For white and yellow, use black text. Others use white text for better contrast.
    // Explicitly check for WH/Yellow/White/Orange/Pink to ensure readability
    const isLight = ["white", "yellow", "orange", "pink", "cyan", "lime", "gold", "silver"].includes(color.toLowerCase()) || 
                   upperCode === "WH" || 
                   upperCode === "YL" ||
                   upperCode === "YE";
    
    return {
        backgroundColor: color,
        color: isLight ? "black" : "white",
        border: "1px solid black" // User invoked black border
    };
};

// Web Serial API types (browser specific)
interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    writable: WritableStream;
    readable: ReadableStream;
}

interface Order {
    id: string;
    created_at: string;
    file_name: string;
    storage_path: string;
    total_price: number;
    currency: string;
    quantity: number;
    total_length_cm: number;
    wire_count: number;
    wire_data: WireCut[]; // Assuming JSONB maps to this
    status: string;
}

const AdminDemo = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Existing State
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

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/admin/login");
            }
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
             if (!session) navigate("/admin/login");
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                if (data) setOrders(data as unknown as Order[]);
            } catch (error: any) {
                console.error("Error fetching orders:", error);
                toast.error("Failed to load orders");
            }
        };
        fetchOrders(); // Initial fetch
        
        // Subscribe to changes
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Change received!', payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Load Order Data
    useEffect(() => {
        if (selectedOrder) {
            // Load specs
            if (selectedOrder.wire_data) {
                setSpecs({
                    wires: selectedOrder.wire_data,
                    missingInfo: [],
                    isSchematic: true
                });
            } else {
                setSpecs(null);
            }

            // Load file preview
            if (selectedOrder.storage_path) {
                setFileName(selectedOrder.file_name);
                // Fetch public URL or signed URL
                const getFileUrl = async () => {
                    // Try public URL first if bucket is public, or signed URL
                    // Assuming secure bucket, let's get a signed URL
                    const { data, error } = await supabase
                        .storage
                        .from('schematics')
                        .createSignedUrl(selectedOrder.storage_path, 3600); // 1 hour

                    if (error) {
                         console.error("Error getting file URL:", error);
                         setFileData(null);
                    } else if (data) {
                        setFileData(data.signedUrl);
                        // Determine type from extension or contentType if available
                        const ext = selectedOrder.file_name.split('.').pop()?.toLowerCase();
                        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) {
                            setFileType('image/' + ext);
                        } else if (ext === 'pdf') {
                            setFileType('application/pdf');
                        } else {
                            setFileType('application/octet-stream');
                        }
                    }
                };
                getFileUrl();
            } else {
                setFileData(null);
                setFileName(null);
            }
            
            addLog(`Loaded order #${selectedOrder.id.slice(0, 8)}`);
        }
    }, [selectedOrder]);


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

    const saveWire = async () => {
        if (specs && editingWireIndex !== null && tempWire && selectedOrder) {
            const newWires = [...specs.wires];
            newWires[editingWireIndex] = tempWire;
            
            // Save to DB
            try {
                const { error } = await supabase
                    .from('orders')
                    .update({ wire_data: newWires }) // JSONB updates
                    .eq('id', selectedOrder.id);

                if (error) throw error;

                // Update local state if successful
                const newSpecs = { ...specs, wires: newWires };
                setSpecs(newSpecs);
                
                // Also update the order in the list (optimistically or via re-fetch)
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, wire_data: newWires } : o));
                // Update selected order ref
                setSelectedOrder(prev => prev ? { ...prev, wire_data: newWires } : null);

                setEditingWireIndex(null);
                setTempWire(null);
                addLog(`Updated wire #${editingWireIndex + 1} and saved to database.`);
                toast.success("Changes saved successfully");
            } catch (error: any) {
                console.error("Error saving wire:", error);
                toast.error("Failed to save changes: " + error.message);
            }
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

    const handleMarkComplete = async () => {
        if (!selectedOrder) return;
        try {
            const { error, count } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', selectedOrder.id)
                .select('*', { count: 'exact' });
            
            if (error) throw error;
            
            // If count is 0, it means no rows were updated (likely RLS policy blocking update)
            if (count === 0) {
                toast.error("Permission denied: Unable to update order status");
                return;
            }

            toast.success("Order marked as completed");
            // Update local state
             setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o));
             setSelectedOrder(prev => prev ? { ...prev, status: 'completed' } : null);
        } catch (error: any) {
            console.error('Error updating order:', error);
            toast.error("Failed to update status");
        }
    };

    const handleMarkAllComplete = async () => {
        const pendingOrders = orders.filter(o => o.status !== 'completed');
        if (pendingOrders.length === 0) return;

        try {
            const { error, count } = await supabase
                .from('orders')
                .update({ status: 'completed' })
                .in('id', pendingOrders.map(o => o.id)) // Mark all pending as completed
                .select('*', { count: 'exact' });

            if (error) throw error;
             
             if (count === 0) {
                 toast.error("Permission denied: Unable to update orders");
                 return;
             }

            toast.success("All pending orders marked as completed");
             setOrders(prev => prev.map(o => ({ ...o, status: 'completed' })));
             if (selectedOrder) setSelectedOrder(prev => prev ? { ...prev, status: 'completed' } : null);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to update all orders");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar: Job Queue */}
                    <div className="col-span-12 md:col-span-3 space-y-4">
                        <Card className="h-[calc(100vh-150px)] flex flex-col overflow-hidden">
                             <Tabs defaultValue="pending" className="flex flex-col h-full">
                                <CardHeader className="pb-2 flex-shrink-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <List className="w-5 h-5"/> Job Queue
                                        </CardTitle>
                                    </div>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="pending">Pending</TabsTrigger>
                                        <TabsTrigger value="completed">Completed</TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent className="flex-grow p-0 overflow-hidden">
                                     <TabsContent value="pending" className="h-full mt-0">
                                        <ScrollArea className="h-full">
                                            <div className="p-2 sticky top-0 bg-background z-10 border-b flex justify-end">
                                               <Button variant="ghost" size="sm" onClick={handleMarkAllComplete} className="text-xs text-muted-foreground hover:text-foreground">
                                                  <CheckCircle className="w-3 h-3 mr-1" />
                                                  Mark All Complete
                                               </Button>
                                            </div>
                                            <div className="divide-y relative">
                                                {orders.filter(o => o.status !== 'completed').length === 0 && (
                                                     <div className="p-8 text-center text-sm text-muted-foreground italic">
                                                         No pending orders.
                                                     </div>
                                                )}
                                                {orders.filter(o => o.status !== 'completed').map((order) => (
                                                    <div 
                                                        key={order.id}
                                                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedOrder?.id === order.id ? 'bg-muted border-l-4 border-primary' : ''}`}
                                                        onClick={() => setSelectedOrder(order)}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-semibold text-sm truncate max-w-[120px]">{order.file_name || 'Untitled'}</span>
                                                            <Badge variant="default" className="text-[10px] bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200">
                                                                Pending
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex justify-between">
                                                            <span className="font-mono text-[10px]">{order.wire_count} Wires</span>
                                                            <span className="text-[10px]">{formatDate(order.created_at)}</span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1 font-mono opacity-70">
                                                             ID: ...{order.id.slice(-6)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                     </TabsContent>

                                     <TabsContent value="completed" className="h-full mt-0">
                                        <ScrollArea className="h-full">
                                            <div className="divide-y">
                                                {orders.filter(o => o.status === 'completed').length === 0 && (
                                                     <div className="p-8 text-center text-sm text-muted-foreground italic">
                                                         No details found.
                                                     </div>
                                                )}
                                                {orders.filter(o => o.status === 'completed').map((order) => (
                                                    <div 
                                                        key={order.id}
                                                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors opacity-70 hover:opacity-100 ${selectedOrder?.id === order.id ? 'bg-muted border-l-4 border-muted-foreground' : ''}`}
                                                        onClick={() => setSelectedOrder(order)}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-semibold text-sm truncate max-w-[120px] decoration-slate-400">{order.file_name || 'Untitled'}</span>
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                Completed
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex justify-between">
                                                            <span className="font-mono text-[10px]">{order.wire_count} Wires</span>
                                                            <span className="text-[10px]">{formatDate(order.created_at)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                     </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-12 md:col-span-9 space-y-6">
                        {selectedOrder ? (
                            <>
                                {/* Header Controls */}
                                <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                                    <div>
                                        <h1 className="text-2xl font-bold flex items-center gap-2">
                                            <Terminal className="text-primary w-6 h-6"/>
                                            Control Panel
                                        </h1>
                                        <p className="text-muted-foreground text-sm">
                                            Order: {selectedOrder.id} • {selectedOrder.file_name}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleMarkComplete}
                                            disabled={selectedOrder.status === 'completed'}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4"/>
                                            Mark Complete
                                        </Button>
                                        <Button 
                                            className={isConnected ? "bg-green-600 hover:bg-green-700" : "bg-primary"}
                                            onClick={connectSerial} 
                                            disabled={isConnected}
                                            size="sm"
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            {isConnected ? "Connected" : "Connect Printer"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Left Column: Harness Data & Preview */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex justify-between items-center text-base">
                                                    Wire Specifications
                                                    {specs && <Badge variant="outline">{specs.wires.length} Wires</Badge>}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {specs ? (
                                                    <ScrollArea className="h-[350px] w-full rounded-md border p-2">
                                                        <div className="space-y-2">
                                                            {specs.wires.map((wire, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded gap-2 hover:bg-muted/50 transition-colors">
                                                                    {editingWireIndex === idx ? (
                                                                        <div className="flex-grow flex items-center gap-2 flex-wrap">
                                                                            <span className="font-mono text-xs text-muted-foreground w-6">#{idx + 1}</span>
                                                                            <div className="grid grid-cols-3 gap-2 flex-grow min-w-[200px]">
                                                                                <Input 
                                                                                    value={tempWire?.id} 
                                                                                    onChange={(e) => setTempWire(prev => ({...prev!, id: e.target.value}))}
                                                                                    className="h-7 text-xs"
                                                                                    placeholder="ID"
                                                                                />
                                                                                <Input 
                                                                                    value={tempWire?.color} 
                                                                                    onChange={(e) => setTempWire(prev => ({...prev!, color: e.target.value}))}
                                                                                    className="h-7 text-xs"
                                                                                    placeholder="Color"
                                                                                />
                                                                                <Input 
                                                                                    value={tempWire?.length} 
                                                                                    onChange={(e) => setTempWire(prev => ({...prev!, length: e.target.value}))}
                                                                                    className="h-7 text-xs"
                                                                                    placeholder="Length"
                                                                                />
                                                                            </div>
                                                                            <div className="flex gap-1 ml-auto">
                                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 bg-green-50" onClick={saveWire}>
                                                                                    <Check className="h-3 w-3" />
                                                                                </Button>
                                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 bg-red-50" onClick={cancelEditingWire}>
                                                                                    <X className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                             <div className="flex items-center gap-3">
                                                                                <span className="font-mono text-xs text-muted-foreground w-6">#{idx + 1}</span>
                                                                                <span className="font-medium">{wire.id}</span>
                                                                                <Badge 
                                                                                    variant="outline" 
                                                                                    style={getColorStyle(wire.color)}
                                                                                    className="text-[10px] min-w-[30px] justify-center"
                                                                                >
                                                                                    {wire.color}
                                                                                </Badge>
                                                                             </div>
                                                                             <div className="flex items-center gap-4">
                                                                                 <span className="font-mono text-xs">{wire.length}</span>
                                                                                 <Button 
                                                                                    size="icon" 
                                                                                    variant="ghost" 
                                                                                    className="h-6 w-6 opacity-30 hover:opacity-100"
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
                                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md">
                                                        No specifications loaded.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Schematic Preview */}
                                        <Collapsible className="border rounded-md bg-muted/20" defaultOpen={false}>
                                            <div className="flex items-center justify-between p-3 bg-muted/30">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-medium">Source Document</span>
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
                                                    <div className="p-8 text-center text-muted-foreground">
                                                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                        <p className="text-sm">Preview not available</p>
                                                    </div>
                                                )}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>

                                    {/* Right Column: Machine Control */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="pb-3 px-4 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                        <Printer className="w-4 h-4"/> Machine Configuration (Ender 3 V3)
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4">
                                                 <div className="grid grid-cols-2 gap-3">
                                                    {/* Configuration Inputs - Simplified for brevity */}
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase">Bed Y (mm)</Label>
                                                        <Input type="number" value={config.bedSizeY} onChange={(e) => handleConfigChange('bedSizeY', e.target.value)} className="h-7 text-xs font-mono" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase">Cut Pin</Label>
                                                        <Input type="number" value={config.cutPin} onChange={(e) => handleConfigChange('cutPin', e.target.value)} className="h-7 text-xs font-mono" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase">Flow Ratio</Label>
                                                        <Input type="number" step="0.001" value={config.extrusionRatio} onChange={(e) => handleConfigChange('extrusionRatio', e.target.value)} className="h-7 text-xs font-mono" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase">Cut Delay (ms)</Label>
                                                        <Input type="number" value={config.cutDuration} onChange={(e) => handleConfigChange('cutDuration', e.target.value)} className="h-7 text-xs font-mono" />
                                                    </div>
                                                 </div>
                                            </CardContent>
                                        </Card>

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

                                        <Card className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle className="text-sm">Serial Terminal</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-4">
                                                <div className="bg-black text-green-500 font-mono text-xs p-3 rounded h-[200px] overflow-y-auto flex flex-col-reverse shadow-inner">
                                                    {logs.length === 0 && <span className="opacity-50 italic">System ready...</span>}
                                                    {logs.map((log, i) => (
                                                        <div key={i} className="whitespace-pre-wrap">{log}</div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    <Button onClick={sendGCode} disabled={!isConnected || isPrinting || !specs} className="w-full">
                                                        {isPrinting ? <RefreshCw className="w-4 h-4 animate-spin mr-2"/> : <Play className="w-4 h-4 mr-2"/>}
                                                        {isPrinting ? "Printing..." : "Run Job"}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                                <List className="w-12 h-12 mb-4 opacity-20" />
                                <h2 className="text-xl font-semibold mb-2">Select an Order</h2>
                                <p className="text-sm max-w-sm text-center">
                                    Choose a pending order from the queue on the left to review specifications and initiate production.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDemo;
