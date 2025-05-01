// /src/hooks/useFirstVisit.ts

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
