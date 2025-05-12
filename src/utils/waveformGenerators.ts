// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

type SliderValues = { [key: string]: number };

type WaveformConfig = {
    width: number;
    height: number;
    timeWindowMs: number; // horizontal range of x-axis in milliseconds
    pressureRangePa: number; // full height = this peak-to-peak pressure (e.g. 2 → -1 to +1 Pa)
};

export function generateSinePath(
    sliders: SliderValues,
    config: WaveformConfig
): string {
    const { frequency, amplitude } = sliders;
    const { width, height, timeWindowMs, pressureRangePa } = config;

    const numPoints = 200;
    const points: string[] = [];

    for (let i = 0; i <= numPoints; i++) {
        // X: time mapped to screen width
        const t = (i / numPoints) * (timeWindowMs / 1000); // seconds
        const x = (i / numPoints) * width;

        // Y: pressure (centered at 0), scaled to screen height
        const pressure = amplitude * Math.sin(2 * Math.PI * frequency * t); // Pa
        const y = height / 2 - (pressure / (pressureRangePa / 2)) * (height / 2);

        points.push(`${x},${y}`);
    }

    return `M ${points.join(" L ")}`;
}

export const waveformGenerators: Record<
    string,
    (sliders: SliderValues, config: WaveformConfig) => string
> = {
    sine: generateSinePath
};
