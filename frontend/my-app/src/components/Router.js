import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorPage } from '../page/ErrorPage/ErrorPage';
import Root from './Root/Root';
import Home from '../page/Home';
import {
    MEETUP_DETAILS,
    MY_MEETUPS,
    PROFILE,
    SIGN_IN,
    SIGN_UP
} from '../constant/router';
import Profile from '../page/Profile';
import MyMeetups from '../page/MyMeetups';
import DetailMeet from '../page/DetailMeet';
import SignIn from '../page/SignIn';
import SignUp from '../page/SignUp';

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
                    element: <MyMeetups />
                },
                {
                    path: MEETUP_DETAILS + '/:id',
                    element: <DetailMeet />
                },
                {
                    path: SIGN_IN,
                    element: <SignIn />
                },
                {
                    path: SIGN_UP,
                    element: <SignUp />
                }
            ]
        }
    ]);

    return <RouterProvider router={router} />;
}

export default Router;
