export default function FilterBar() {
    return (
        <div className="filter-bar">
            <select id="filter" name="filter" className="select">
                <option value="value">Value</option>
            </select>
            <input
                type="text"
                id="search"
                name="search"
                placeholder="Search meetups..."
                className="search-input"
            />
        </div>
    );
}
