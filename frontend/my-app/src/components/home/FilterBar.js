import DebounceInput from '../DebounceInput';

export default function FilterBar({ onSearchChange }) {
    return (
        <div className="filter-bar">
            <DebounceInput
                type="text"
                id="search"
                name="search"
                placeholder="Search meetups..."
                className="search-input"
                onChange={onSearchChange}
                delay={500}
            />
            <button
                className="AI-buttons"
                onClick={() => {
                    console.log(1);
                }}
            >
                {' '}
                Recommended by AI✨{' '}
            </button>
        </div>
    );
}
