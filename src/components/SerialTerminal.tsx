import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, Plug, PlugZap } from "lucide-react";
import { toast } from "sonner";

// @ts-ignore
const SerialTerminal = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  
  // Refs to hold the stream locks/promises so we can close properly without re-renders affecting closure
  const portRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<string> | null>(null);
  const readableStreamClosedRef = useRef<Promise<void> | null>(null);
  const writableStreamClosedRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    if(!message || message.trim() === "") return;
    setLogs(prev => {
        const newLogs = [...prev, message];
        return newLogs.slice(-50); // Keep last 50 logs
    });
  };

  const connect = async () => {
    // @ts-ignore
    if (!("serial" in navigator)) {
      toast.error("Web Serial API not supported in this browser.");
      return;
    }

    try {
      // @ts-ignore
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 115200 }); // Common for Ender 3

      portRef.current = selectedPort;
      setIsConnected(true);
      toast.success("Connected to serial device");

      // Create an AbortController to signal the read loop to stop
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Setup writer
      const textEncoder = new TextEncoderStream();
      // @ts-ignore
      const writableStreamClosed = textEncoder.readable.pipeTo(selectedPort.writable);
      writableStreamClosedRef.current = writableStreamClosed;
      
      const newWriter = textEncoder.writable.getWriter();
      writerRef.current = newWriter;

      // Setup reader
      const textDecoder = new TextDecoderStream();
      // @ts-ignore
      const readableStreamClosed = selectedPort.readable.pipeTo(textDecoder.writable);
      readableStreamClosedRef.current = readableStreamClosed;

      const newReader = textDecoder.readable.getReader();
      readerRef.current = newReader;

      // Start reading
      readLoop(newReader, abortController.signal);

    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect: " + (error as Error).message);
    }
  };

  const readLoop = async (currentReader: ReadableStreamDefaultReader<string>, signal: AbortSignal) => {
    try {
      while (true) {
        const { value, done } = await currentReader.read();
        if (done) {
          currentReader.releaseLock();
          break;
        }
        if (value) {
            addLog(`RX: ${value}`);
        }
        if (signal.aborted) {
           await currentReader.cancel();
           break;
        }
      }
    } catch (error) {
      console.log("Read error or close", error);
    }
  };

  const disconnect = async () => {
    const toastId = toast.loading("Disconnecting...");
    try {
        const reader = readerRef.current;
        const writer = writerRef.current;
        
        // Signal read loop to stop
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        
        if (reader) {
            await reader.cancel();
            if (readableStreamClosedRef.current) {
               await readableStreamClosedRef.current.catch(() => {/* ignore */});
            }
            readerRef.current = null;
        }
        
        if (writer) {
            await writer.close();
            if (writableStreamClosedRef.current) {
                await writableStreamClosedRef.current;
            }
            writerRef.current = null;
        }

        const port = portRef.current;
        if (port) {
            await port.close();
            portRef.current = null;
        }
        
        setIsConnected(false);
        toast.dismiss(toastId);
        toast.info("Disconnected");
    } catch (e) {
        console.error("Error closing port", e);
        toast.dismiss(toastId);
        toast.error("Failed to disconnect properly");
    }
  };

  const sendCommand = async () => {
    const writer = writerRef.current;
    if (!writer || !inputValue.trim()) return;

    try {
      const command = inputValue.trim() + "\n";
      await writer.write(command);
      addLog(`TX: ${inputValue.trim()}`);
      setInputValue("");
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send command");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendCommand();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mb-8 relative z-20">
      <section className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/40 shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    Serial Control Center
                </h3>
                <p className="text-sm text-muted-foreground">Direct G-Code Interface (Baud: 115200)</p>
            </div>
            <Button 
                variant={isConnected ? "destructive" : "default"} 
                onClick={isConnected ? disconnect : connect}
                className="flex items-center gap-2"
            >
                {isConnected ? <PlugZap className="w-4 h-4" /> : <Plug className="w-4 h-4" />}
                {isConnected ? "Disconnect" : "Connect"}
            </Button>
            </div>
            
            <div className="space-y-4">
                {/* Terminal Output */}
                <div className="relative rounded-md border bg-muted/50 p-4">
                    <ScrollArea className="h-[200px] w-full" ref={scrollRef}>
                        <div className="font-mono text-sm space-y-1">
                            {logs.length === 0 ? (
                                <div className="text-muted-foreground italic text-center py-10 opacity-50">
                                    Connect device to view serial output...
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`break-words ${log.startsWith("TX:") ? "text-blue-500 font-semibold" : "text-green-600"}`}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter G-Code (e.g., G28, M105)..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!isConnected}
                        className="font-mono flex-1 bg-background"
                    />
                    <Button onClick={sendCommand} disabled={!isConnected || !inputValue} size="icon">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default SerialTerminal;
