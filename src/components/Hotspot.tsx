import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import hotspotData from '../data/exercises_hotspot.json';

const LANGUAGE = 'en'; // 🔒 Temporary hardcoded language

type HotspotRegion = {
    name: string;
    shape: 'polygon';
    points: { x: number; y: number }[];
};

type HotspotProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

export default function Hotspot({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: HotspotProps) {
    const exercise = hotspotData.hotspots.find((ex) => ex.id === exerciseId);
    const navigate = useNavigate();

    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [regions, setRegions] = useState<HotspotRegion[]>([]);
    const [viewBox, setViewBox] = useState<string>('0 0 100 100'); // fallback

    useEffect(() => {
        setWasCorrect(null);
        setProgressAfter(beforeProgress);

        if (!exercise) return;

        const loadRegions = async () => {
            try {
                const res = await fetch(`/images/exercises/${exercise.regionSourceId}.regions.json`);
                const data = await res.json();
                setRegions(data);
            } catch (err) {
                console.error('Failed to load regions:', err);
            }

            try {
                const svgRes = await fetch(`/images/exercises/${exercise.regionSourceId}.svg`);
                const svgText = await svgRes.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.querySelector('svg');
                if (svgElement && svgElement.hasAttribute('viewBox')) {
                    setViewBox(svgElement.getAttribute('viewBox')!);
                } else {
                    console.warn('No viewBox found in SVG');
                }
            } catch (err) {
                console.error('Failed to load SVG or extract viewBox:', err);
            }
        };

        loadRegions();
    }, [exerciseId, beforeProgress, exercise]);

    if (!exercise) {
        return (
            <div className="text-white text-center space-y-4">
                <div className="text-xl font-bold">Hotspot data not found.</div>
                <PrimaryButton
                    variant="white"
                    active
                    className="w-2/3 mx-auto"
                    onClick={() => navigate('/')}
                >
                    Back to Menu
                </PrimaryButton>
            </div>
        );
    }

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (wasCorrect !== null) return;

        const svg = e.currentTarget;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;

        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const svgPoint = point.matrixTransform(ctm.inverse());

        const clickedRegion = regions.find((region) => {
            if (region.shape !== 'polygon') return false;
            const { points } = region;
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const xi = points[i].x, yi = points[i].y;
                const xj = points[j].x, yj = points[j].y;
                const intersect =
                    yi > svgPoint.y !== yj > svgPoint.y &&
                    svgPoint.x < ((xj - xi) * (svgPoint.y - yi)) / (yj - yi + 0.0001) + xi;
                if (intersect) inside = !inside;
            }
            return inside;
        });

        const isCorrect = clickedRegion?.name === exercise.targetRegionId;
        setWasCorrect(isCorrect);
        setProgressAfter(Math.min(beforeProgress + progressStep, 100));
    };

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center">{exercise.prompt[LANGUAGE]}</h2>

                <div className="relative w-full aspect-square overflow-hidden">
                    <img
                        src={`/images/exercises/${exercise.regionSourceId}.svg`}
                        alt="Hotspot"
                        className="absolute w-full h-full object-contain"
                    />
                    <svg
                        className="absolute w-full h-full"
                        viewBox={viewBox}
                        onClick={handleClick}
                    >
                        {regions.map((region, idx) => (
                            <polygon
                                key={idx}
                                points={region.points.map(p => `${p.x},${p.y}`).join(' ')}
                                fill="transparent"
                                stroke="none"
                                className="hover:fill-white hover:opacity-20 cursor-pointer"
                            />
                        ))}
                    </svg>
                </div>

                {wasCorrect !== null && (
                    <FeedbackButton
                        evaluation={wasCorrect ? 'Correct!' : 'Incorrect!'}
                        explanation={!wasCorrect ? 'Explanation goes here.' : undefined}
                        correct={wasCorrect}
                        onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                    />
                )}
            </div>
        </div>
    );
}
