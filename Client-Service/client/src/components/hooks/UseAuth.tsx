import React, { useEffect, useState } from 'react'

const UseAuth = (): boolean => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);    
    }, []);
    return isAuthenticated;
}

export default UseAuth