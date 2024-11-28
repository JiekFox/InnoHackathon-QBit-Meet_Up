import { MY_MEETUPS_OWNER, MY_MEETUPS_SUBSCRIBER } from '../constant/router';
import { NavLink } from 'react-router-dom';

export default function MyMeetups() {
    return (
        <>
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
        </>
    );
}
