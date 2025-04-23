import React from 'react';

type ExerciseStageProps = {
    children: React.ReactNode;
};

export default function ExerciseStage({ children }: ExerciseStageProps) {
    return (
        <div className="w-full flex-1 flex flex-col items-stretch justify-start py-8">
            {children}
        </div>
    );
}
