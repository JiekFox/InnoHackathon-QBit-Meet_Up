import DebounceInput from '../DebounceInput';

export default function FilterBar({ onSearchChange }) {
    return (
        <div className="filter-bar">
            <select id="filter" name="filter" className="select">
                <option value="value">Value</option>
            </select>
            <DebounceInput
                type="text"
                id="search"
                name="search"
                placeholder="Search meetups..."
                className="search-input"
                onChange={onSearchChange}
                delay={500}
            />
        </div>
    );
}
