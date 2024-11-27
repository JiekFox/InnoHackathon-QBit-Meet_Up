import React, { useState, useEffect } from 'react';

export default function DebounceInput({ value, onChange, delay = 300, ...props }) {
    const [inputValue, setInputValue] = useState(value || '');

    useEffect(() => {
        const handler = setTimeout(() => {
            onChange(inputValue);
        }, delay);

        return () => clearTimeout(handler);
    }, [inputValue, onChange, delay]);

    const handleInputChange = e => {
        setInputValue(e.target.value);
    };

    return <input {...props} value={inputValue} onChange={handleInputChange} />;
}
