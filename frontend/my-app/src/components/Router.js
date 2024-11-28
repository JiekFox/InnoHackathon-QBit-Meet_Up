import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { ErrorPage } from '../page/ErrorPage/ErrorPage';
import Root from './Root/Root';
import Home from '../page/Home';
import {
    CREATE_MEETUPS,
    MEETUP_DETAILS,
    MY_MEETUPS,
    MY_MEETUPS_OWNER,
    MY_MEETUPS_SUBSCRIBER,
    PROFILE,
    SIGN_IN,
    SIGN_UP,
    USERS_DETAIL
} from '../constant/router';
import Profile from '../page/Profile';
import MyMeetups from '../page/MyMeetups';
import MyMeetupsSubscriber from '../page/MyMeetupsSubscriber';
import MyMeetupsOwner from '../page/MyMeetupsOwner';
import MeetupDetails from '../page/MeetupDetails';
import SignIn from '../page/SignIn';
import SignUp from '../page/SignUp';
import { CreateMeetup } from '../page/CreateMeetup';
import ProfileViewer from '../page/ProfileViewer';

function Router() {
    const router = createBrowserRouter([
        {
            path: '',
            errorElement: <ErrorPage />,
            element: <Root />,
            children: [
                {
                    index: true,
                    element: <Home />
                },
                {
                    path: PROFILE,
                    element: <Profile />
                },

                {
                    path: MY_MEETUPS,
                    element: <Outlet />,
                    children: [
                        {
                            path: MY_MEETUPS_SUBSCRIBER,
                            element: <MyMeetupsSubscriber />
                        },
                        {
                            path: MY_MEETUPS_OWNER,
                            element: <MyMeetupsOwner />
                        },
                        {
                            index: true,
                            element: <MyMeetups />
                        }
                    ]
                },
                {
                    path: MEETUP_DETAILS + '/:id',
                    element: <MeetupDetails />
                },
                {
                    path: SIGN_IN,
                    element: <SignIn />
                },
                {
                    path: SIGN_UP,
                    element: <SignUp />
                },
                {
                    path: CREATE_MEETUPS,
                    element: <CreateMeetup />
                },
                {
                    path: `${USERS_DETAIL}/:id`,
                    element: <ProfileViewer />
                }
            ]
        }
    ]);

    return <RouterProvider router={router} />;
}

export default Router;
