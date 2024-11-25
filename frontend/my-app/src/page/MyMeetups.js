import Pagination from '../components/home/Pagination';
import { useState } from 'react';

export default function MyMeetups() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('');
    const meetings = [
        {
            title: 'Team Meeting',
            date: '02/02/2020',
            description: 'Discuss project updates and next steps.'
        },
        {
            title: 'Client Presentation',
            date: '03/03/2020',
            description: 'Showcase our progress to the client.'
        }
    ];

    const handleSearch = query => {
        setSearchQuery(query);
        console.log('Search query:', query);
    };

    const handleFilterChange = filterValue => {
        setFilter(filterValue);
        console.log('Filter selected:', filterValue);
    };

    return (
        <main className="main-content">
            <h2>Your Meetings</h2>
            <section className="meetups">
                <div className="filter-bar">
                    <select
                        id="filter"
                        name="filter"
                        className="filter-bar > select"
                        onChange={e => handleFilterChange(e.target.value)}
                    >
                        <option value="value">Value</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                    </select>

                    <input
                        type="text"
                        id="search"
                        name="search"
                        placeholder="Search meetups..."
                        className="filter-bar > search-input"
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>

                <div className="meetup-grid">
                    {meetings.map((meeting, index) => (
                        <div className="meetup-card" key={index}>
                            <h3>{meeting.title}</h3>
                            <p>{meeting.date}</p>
                            <p>{meeting.description}</p>
                        </div>
                    ))}
                </div>

                <Pagination />
            </section>
        </main>
    );
}
