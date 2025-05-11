// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

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
