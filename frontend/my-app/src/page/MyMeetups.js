import { useState } from 'react';
import { MY_MEETUPS_OWNER, MY_MEETUPS_SUBSCRIBER } from '../constant/router';
import { NavLink } from 'react-router-dom';

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
            <div>
                Would you like to view Meetups you have subscribed to or you own?
            </div>

            <NavLink to={MY_MEETUPS_SUBSCRIBER}>
                <h1 className="title">Subscriber</h1>
            </NavLink>

            <NavLink to={MY_MEETUPS_OWNER}>
                <h1 className="title">Owner</h1>
            </NavLink>
        </main>
    );
}
