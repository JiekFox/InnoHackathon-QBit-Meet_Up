import React, {
    useState,
    useEffect,
    useCallback,
    ChangeEvent,
    InputHTMLAttributes
} from 'react';

interface DebounceInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange: (value: string) => void;
    delay?: number;
}

const DebounceInput: React.FC<DebounceInputProps> = React.memo(
    ({ value, onChange, delay = 300, ...props }) => {
        const [inputValue, setInputValue] = useState<string>(value || '');

        useEffect(() => {
            const handler = setTimeout(() => {
                onChange(inputValue);
            }, delay);

            return () => clearTimeout(handler);
        }, [inputValue, onChange, delay]);

        const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
        }, []);

        return <input {...props} value={inputValue} onChange={handleInputChange} />;
    }
);

export default DebounceInput;
