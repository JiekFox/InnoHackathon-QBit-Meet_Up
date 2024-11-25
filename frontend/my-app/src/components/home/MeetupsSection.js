import FilterBar from './FilterBar';
import MeetupCard from './MeetupCard';
import Pagination from './Pagination';
import icon from '../../assets/img/icon.png';

export default function MeetupsSection() {
    const meetups = Array.from({ length: 7 }, (_, i) => ({
        id: i,
        title: `Title ${i + 1}`,
        description: 'This is a simple description for the event.',
        image: icon
    }));

    return (
        <section className="meetups">
            <FilterBar />
            <div className="meetup-grid">
                {meetups.map(meetup => (
                    <MeetupCard key={meetup.id} {...meetup} />
                ))}
            </div>
            <Pagination />
        </section>
    );
}
