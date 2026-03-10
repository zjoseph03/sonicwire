import { ParsedSpecifications, WireCut } from "./gemini";

export interface PrinterConfig {
    bedSizeX: number;
    bedSizeY: number;
    startX: number;
    startY: number;
    wireSpacingX: number;
    extrusionRatio: number;
    feedRateMove: number;
    feedRateExtrude: number;
    cutPin: number;
    safeZ: number;
    cutDuration: number;
}

export const DEFAULT_CONFIG: PrinterConfig = {
    bedSizeX: 220,
    bedSizeY: 220,
    startX: 10,
    startY: 10,
    wireSpacingX: 10,
    extrusionRatio: 1.0, // 1:1 Movement to Extrusion (Feed 1mm wire for 1mm travel)
    feedRateMove: 3000,
    feedRateExtrude: 1500,
    cutPin: 32,
    safeZ: 50,
    cutDuration: 1000
};

// Parse length string to mm number
// Supports: "150mm", "15cm", "1.5m", "6in"
const parseLengthMm = (str: string): number => {
    if (!str || str === "null") return 0;
    const clean = str.toLowerCase().replace(/[\s,]/g, '');
    const match = clean.match(/(\d+(?:\.\d+)?)([a-z]+|")?/);
    if (!match) return 0;
    
    const val = parseFloat(match[1]);
    const unit = match[2];
    
    switch(unit) {
        case 'm': return val * 1000;
        case 'cm': return val * 10;
        case 'in': case '"': return val * 25.4;
        case 'ft': case "'": return val * 304.8;
        default: return val; // assume mm if no unit
    }
};

export const generateGCode = (specs: ParsedSpecifications, config: PrinterConfig = DEFAULT_CONFIG): string[] => {
    if (!specs.wires || specs.wires.length === 0) return ["; No wires to process"];

    const commands: string[] = [
        "; SonicWire Harness Generation",
        `; Source: ${specs.isSchematic ? 'Schematic' : 'Wire List'}`,
        `; Wires: ${specs.wires.length}`,
        "G28 ; Home all axes (Initialize Printer)",
        "G90 ; Set to Absolute Positioning Mode",
        "G21 ; Set Units to Millimeters",
        "M83 ; Set Extruder to Relative Mode",
        `M42 P${config.cutPin} S0 ; Turn Cutter OFF (Safety Check)`,
        `G0 Z${config.safeZ} F${config.feedRateMove} ; Raise Z-Axis to ${config.safeZ}mm to clear bed`,
        "G4 P1000 ; Wait 1000ms (1s) for startup",
        `G0 Z2.0 F${config.feedRateMove} ; Lower Z to working height`,
    ];

    // 1. Analyze Scheme for Scaling
    const maxPrintableY = config.bedSizeY - config.startY - 10; // 10mm buffer
    let maxWireLength = 0;
    
    // Parse all lengths first
    const processedWires = specs.wires.map(w => ({
        ...w,
        lengthMm: parseLengthMm(w.length)
    }));

    // Find max
    processedWires.forEach(w => {
        if (w.lengthMm > maxWireLength) maxWireLength = w.lengthMm;
    });

    // Determine scale factor
    // If the longest wire is longer than bed, we scale EVERYTHING down proportionally
    let scaleFactor = 1.0;
    if (maxWireLength > maxPrintableY) {
        scaleFactor = maxPrintableY / maxWireLength;
        commands.push(`; NOTE: Scaling applied! Factor: ${scaleFactor.toFixed(3)} (Max wire ${maxWireLength}mm -> ${maxPrintableY}mm)`);
    } else {
        commands.push(`; No scaling needed. Max wire: ${maxWireLength}mm`);
    }

    // 2. Generate Paths
    processedWires.forEach((wire, index) => {
        const currentX = config.startX + (index * config.wireSpacingX);
        
        // Check X bounds
        if (currentX > (config.bedSizeX - 10)) {
            commands.push(`; SKIP Wire ${index + 1}: X-axis limit reached`);
            return;
        }

        const printLength = wire.lengthMm * scaleFactor;
        const extrusionAmount = printLength * config.extrusionRatio;

        commands.push(`; --- Wire ${index + 1}: ${wire.id} (${wire.color}) ---`);
        commands.push(`; Original: ${wire.lengthMm.toFixed(1)}mm -> Printed: ${printLength.toFixed(1)}mm`);

        commands.push("G92 E0 ; Reset Extruder");
        
        // Move to Start
        commands.push(`G0 X${currentX.toFixed(2)} Y${config.startY} F${config.feedRateMove} ; Move to start position for Wire ${index + 1}`);
        
        // Pause to stabilize
        commands.push("G4 P500 ; Pause 0.5s to stabilize before extrusion");

        // Extrude (Move Y + Extrude E)
        // We move Y to (Start + Length)
        const targetY = config.startY + printLength;
        commands.push(`G1 Y${targetY.toFixed(2)} E${extrusionAmount.toFixed(4)} F${config.feedRateExtrude} ; Extrude wire length (${printLength.toFixed(1)}mm)`);

        // Dwell before cut
        commands.push("G4 P500 ; Pause 0.5s before cutting");

        // Cut Sequence
        commands.push(`M42 P${config.cutPin} S255 ; ACTIVATE CUTTER (Pin ${config.cutPin} set to High/255)`);
        commands.push(`G4 P${config.cutDuration} ; Wait ${config.cutDuration}ms for cut to complete`);
        commands.push(`M42 P${config.cutPin} S0 ; DEACTIVATE CUTTER (Pin ${config.cutPin} set to Low/0)`);

        // Reverse Operation (Return logic)
        commands.push(`G1 Y${config.startY} E-${extrusionAmount.toFixed(4)} F${config.feedRateExtrude} ; FULL REVERSE back to start`);
        
        // Retract slightly to prevent ooze/drag while moving to next
        commands.push("G1 E-1 F2000 ; Retract filament 1mm to prevent ooze"); 
    });

    // Footer
    commands.push("; Job Complete");
    commands.push("G0 X0 Y200 F3000 ; Move bed forward to present harness");
    commands.push("M84 ; Disable motors to release manual control");

    return commands;
};
