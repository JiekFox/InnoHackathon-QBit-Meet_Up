import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorPage } from '../page/ErrorPage/ErrorPage';
import Root from './Root/Root';
import Home from '../page/Home';
import { MY_MEETUPS, PROFILE } from '../constant/router';
import Profile from '../page/Profile';
import MyMeetups from '../page/MyMeetups';

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
                }
            ]
        }
    ]);

    return <RouterProvider router={router} />;
}

export default Router;
