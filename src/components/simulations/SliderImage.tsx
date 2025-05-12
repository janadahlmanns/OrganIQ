// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../PrimaryButton';
import ProgressBar from '../ProgressBar';
import CancelButton from '../CancelButton';
import FeedbackButton from '../FeedbackButton';
import { waveformGenerators } from '../../utils/waveformGenerators';
import simulationData from '../../data/exercises_simulation.json';

// Types

type Props = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

type SliderConfig = {
    label: { en: string; de: string };
    key: string;
    min: number;
    max: number;
    initial: number;
};

type ExerciseData = {
    id: number;
    type: string;
    title: { en: string; de: string };
    description: { en: string; de: string };
    explanation?: { en: string; de: string };
    sliders: SliderConfig[];
    waveform: {
        mode: 'procedural' | 'image' | 'static';
        generator: string;
        width: number;
        height: number;
        timeWindowMs: number;
        pressureRangePa: number;
    };
    audio?: { enabled: boolean };
};


export default function SliderImage({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: Props) {
    const { i18n, t } = useTranslation();
    const [data, setData] = useState<ExerciseData | null>(null);
    const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [progressAfter, setProgressAfter] = useState(beforeProgress);

    useEffect(() => {
        const entry = simulationData.simulations.find((sim) => sim.id === exerciseId);
        if (
            entry &&
            entry.type === 'slider_image' &&
            entry.waveform?.mode === 'procedural'
        ) {
            setData(entry as ExerciseData);
            const initialSliderState: Record<string, number> = {};
            entry.sliders.forEach((s: SliderConfig) => {
                initialSliderState[s.key] = s.initial;
            });
            setSliderValues(initialSliderState);
        }
    }, [exerciseId]);

    if (!data) return null;

    const rawPath = waveformGenerators[data.waveform.generator](sliderValues, data.waveform);

    const handleSliderChange = (key: string, value: number) => {
        setSliderValues(prev => ({ ...prev, [key]: value }));
    };

    const handleDone = () => {
        setIsEvaluated(true);
        setProgressAfter(Math.min(beforeProgress + progressStep, 100));
    };

    const language = i18n.language as 'en' | 'de';
    const { width, height: baseHeight} = data.waveform;
    const height = baseHeight * 2;

    const yRange = height * 0.85;
    const yStart = (height - yRange) / 2;
    const yEnd = yStart + yRange;

    // Remap 0 Pa to new vertical coordinate
    const xAxisY = yStart + (1.1 / 2.2) * yRange; // maps pressure = 0 to vertical center

    const xRange = width * 0.80;
    const xStart = (width - xRange) / 2;

    const totalMs = 10.5; // for the full arrow
    const tickMs = 10;    // ticks only go up to 10
    const tickRatio = tickMs / totalMs; // ≈ 0.952


    const translatedPath = rawPath.replace(/([ML])\s*([\d.]+),([\d.]+)/g, (_, cmd, xRaw, yRaw) => {
        const x = xStart + parseFloat(xRaw) * xRange / width * tickRatio;

        const yOrig = parseFloat(yRaw);
        const pressure = (data.waveform.height / 2 - yOrig) * (data.waveform.pressureRangePa / data.waveform.height);

        const logicalSpan = 2.2; // total y-axis: −1.1 to +1.1
        const waveformSpan = 2.0; // waveform: −1 to +1
        const marginRatio = (logicalSpan - waveformSpan) / logicalSpan;

        const inset = (marginRatio / 2) * yRange;
        const yInsetStart = yStart + inset;
        const yInsetRange = yRange - 2 * inset;

        const y = yInsetStart + ((1 - pressure) / 2) * yInsetRange;

        return `${cmd} ${x.toFixed(2)},${y.toFixed(2)}`;
    });


    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1 font-sans text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            {/* Title */}
            <div className="text-center mb-2">
                <h2 className="text-heading-xl font-bold">{data.title[language]}</h2>
                <p className="text-base text-gray-300">{data.description[language]}</p>
            </div>

            {/* SVG Plot */}
            <div className="relative border-2 border-white rounded-xl bg-black shadow-inner mb-6">
                <svg width={width} height={Math.round(height)} className="block mx-auto">
                    {/* X-axis with arrow */}
                    <defs>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L6,3 z" fill="white" />
                        </marker>
                    </defs>
                    {/* Y-axis with arrow */}
                    <line
                        x1={xStart}
                        x2={xStart}
                        y1={yEnd}
                        y2={yStart}
                        stroke="white"
                        strokeWidth={1}
                        markerEnd="url(#arrow)"
                    />
                    {/* Y-axis ticks and labels */}
                    {[-1, -0.5, 0, 0.5, 1].map((v) => {
                        const y = yStart + ((1.1 - v) / 2.2) * yRange;
                        const x = xStart;

                        const showLabel = v === 0 || v === 1 || v === -1;
                        const label =
                            v === 1 ? '+1 Pa' :
                                v === -1 ? '−1 Pa' :
                                    '0';

                        return (
                            <g key={`ytick-${v}`}>
                                <line
                                    x1={x - 4}
                                    x2={x + 4}
                                    y1={y}
                                    y2={y}
                                    stroke="white"
                                    strokeWidth={1}
                                />
                                {showLabel && (
                                    <text
                                        x={x - 8}
                                        y={y + 4}
                                        fontSize="12"
                                        textAnchor="end"
                                        fill="white"
                                        fontFamily="Inter"
                                    >
                                        {label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    {/* X-axis with arrow */}
                    <line
                        x1={xStart}
                        x2={xStart + xRange}
                        y1={xAxisY}
                        y2={xAxisY}
                        stroke="white"
                        strokeWidth={1}
                        markerEnd="url(#arrow)"
                    />
                    {/* X-axis ticks and labels */}
                    {[...Array(11)].map((_, i) => {
                        if (i === 0) return null;
                        const tickVisualX = (i / 10) * tickRatio; // ratio compresses ticks into 10/10.5
                        const x = xStart + tickVisualX * xRange;
                        return (
                            <g key={`tick-${i}`}>
                                <line
                                    x1={x}
                                    x2={x}
                                    y1={xAxisY - 4}
                                    y2={xAxisY + 4}
                                    stroke="white"
                                    strokeWidth={1}
                                />
                                {(i === 5 || i === 10) && (
                                    <text
                                        x={x}
                                        y={xAxisY + 16}
                                        fontSize="12"
                                        textAnchor="middle"
                                        fill="white"
                                        fontFamily="Inter"
                                    >
                                        {i === 10 ? '10 ms' : '5'}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    <path
                        d={translatedPath}
                        stroke="#ff4fd8"
                        strokeWidth={2}
                        fill="none"
                        className="shadow-[0_0_8px_#ff4fd8]"
                    />
                </svg>
            </div>

            {/* Sliders */}
            <div className="space-y-4 mb-6">
                {data.sliders.map(slider => (
                    <div key={slider.key}>
                        <label className="block text-sm font-medium mb-1">
                            {slider.label[language]}:{' '}
                            {slider.key === 'frequency'
                                ? `${Math.round(sliderValues[slider.key])} Hz`
                                : `${sliderValues[slider.key].toFixed(2)} Pa`}
                        </label>
                        <input
                            type="range"
                            min={slider.min}
                            max={slider.max}
                            step={slider.key === 'frequency' ? 1 : 'any'}
                            value={sliderValues[slider.key]}
                            onChange={e => handleSliderChange(slider.key, parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>

            {/* Done or Feedback */}
            {!isEvaluated ? (
                <PrimaryButton onClick={handleDone} className="mx-auto w-2/3 !justify-center">
                    {t('shared.done')}
                </PrimaryButton>
            ) : (
                <FeedbackButton
                    correct
                    evaluation={t('shared.done')}
                        explanation={data.explanation?.[language]}
                    onContinue={() => onContinue({ incorrect: false, progressAfter })}
                />
            )}
        </div>
    );
}
