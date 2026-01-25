import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook to manage idempotency keys for sensitive banking operations.
 * Persists the current key in state to allow retries on the same operation
 * WITHOUT generating a new key, thus preventing double-spending on the backend.
 */
export const useIdempotency = () => {
    const [currentKey, setCurrentKey] = useState<string>(uuidv4());

    const rotateKey = useCallback(() => {
        setCurrentKey(uuidv4());
    }, []);

    return { idempotencyKey: currentKey, rotateKey };
};
