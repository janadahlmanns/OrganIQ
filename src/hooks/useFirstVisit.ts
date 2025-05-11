// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState, useEffect } from 'react';

export function useFirstVisit(key = 'firstVisit') {
    const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);

    useEffect(() => {
        const visited = sessionStorage.getItem(key);
        if (!visited) {
            setIsFirstVisit(true);
        }
    }, [key]);

    const markVisited = () => {
        sessionStorage.setItem(key, 'true');
        setIsFirstVisit(false);
    };

    return { isFirstVisit, markVisited };
}
