import React, { useState, useEffect, useCallback } from 'react';

const DebounceInput = React.memo(({ value, onChange, delay = 300, ...props }) => {
    const [inputValue, setInputValue] = useState(value || '');

    useEffect(() => {
        const handler = setTimeout(() => {
            onChange(inputValue);
        }, delay);

        return () => clearTimeout(handler);
    }, [inputValue, onChange, delay]);

    const handleInputChange = useCallback(e => {
        setInputValue(e.target.value);
    }, []);

    return <input {...props} value={inputValue} onChange={handleInputChange} />;
});

export default DebounceInput;
