import { ParsedSpecifications, WireCut } from "./gemini";

// Printer Configuration (Ender 3 V3 SE)
const BED_SIZE_X = 220;
const BED_SIZE_Y = 220;
const START_X = 10;
const START_Y = 10;
const WIRE_SPACING_X = 10; // 10mm between wires

// Tuning for the specific wire/extruder setup
const EXTRUSION_RATIO = 0.03; // Multiplier for E axis relative to Y movement
const FEED_RATE_MOVE = 3000;
const FEED_RATE_EXTRUDE = 1500;
const CUT_PIN = 32;

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

export const generateGCode = (specs: ParsedSpecifications): string[] => {
    if (!specs.wires || specs.wires.length === 0) return ["; No wires to process"];

    const commands: string[] = [
        "; SonicWire Harness Generation",
        `; Source: ${specs.isSchematic ? 'Schematic' : 'Wire List'}`,
        `; Wires: ${specs.wires.length}`,
        "G28 ; Home all axes",
        "G90 ; Absolute positioning",
        "G21 ; Millimeter units",
        "M83 ; Relative extrusion mode",
        `M42 P${CUT_PIN} S0 ; Cutter OFF (Safety)`,
        "G0 Z50 F3000 ; Raise Z to clear bed",
        "G4 P1000 ; Wait 1s",
    ];

    // 1. Analyze Scheme for Scaling
    const maxPrintableY = BED_SIZE_Y - START_Y - 10; // 10mm buffer
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
        const currentX = START_X + (index * WIRE_SPACING_X);
        
        // Check X bounds
        if (currentX > (BED_SIZE_X - 10)) {
            commands.push(`; SKIP Wire ${index + 1}: X-axis limit reached`);
            return;
        }

        const printLength = wire.lengthMm * scaleFactor;
        const extrusionAmount = printLength * EXTRUSION_RATIO;

        commands.push(`; --- Wire ${index + 1}: ${wire.id} (${wire.color}) ---`);
        commands.push(`; Original: ${wire.lengthMm.toFixed(1)}mm -> Printed: ${printLength.toFixed(1)}mm`);
        
        // Move to Start
        commands.push(`G0 X${currentX.toFixed(2)} Y${START_Y} F${FEED_RATE_MOVE}`);
        
        // Pause to stabilize
        commands.push("G4 P500");

        // Extrude (Move Y + Extrude E)
        // We move Y to (Start + Length)
        const targetY = START_Y + printLength;
        commands.push(`G1 Y${targetY.toFixed(2)} E${extrusionAmount.toFixed(4)} F${FEED_RATE_EXTRUDE}`);

        // Dwell before cut
        commands.push("G4 P500");

        // Cut Sequence
        commands.push(`M42 P${CUT_PIN} S255 ; CUT ON`);
        commands.push("G4 P1000       ; Wait for cut");
        commands.push(`M42 P${CUT_PIN} S0   ; CUT OFF`);
        
        // Retract slightly to prevent ooze/drag while moving to next
        commands.push("G1 E-1 F2000"); 
    });

    // Footer
    commands.push("; Job Complete");
    commands.push("G0 X0 Y200 F3000 ; Present print");
    commands.push("M84 ; Disable motors");

    return commands;
};
