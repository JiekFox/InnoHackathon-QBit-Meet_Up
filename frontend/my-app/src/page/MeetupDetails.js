import { useParams } from 'react-router-dom';
import useFetchMeetings from '../api/useFetchMeetings';
import icon from '../assets/img/icon.png';
import { MEETINGS_API_URL } from '../constant/apiURL';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router';
import { SIGN_IN } from '../constant/router';

export default function MeetupDetails() {
    const navigate = useNavigate();
    const { id } = useParams(); // Получаем ID из URL
    const { token } = useAuth(); // Достаем токен из контекста
    const {
        data: meetup,
        loading,
        error
    } = useFetchMeetings(`${MEETINGS_API_URL}${id}/`);
    console.log(token);
    // Обработчик для кнопки "Sign for meeting"
    const handleSignForMeeting = async () => {
        if (!token) {
            navigate(SIGN_IN);
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${token.access}` } // Используем токен для авторизации
        };

        try {
            const response = await axios.post(
                `${MEETINGS_API_URL}${id}/subscribe/`,
                {}, // Пустое тело
                config
            );
            console.log('Successfully signed for meeting:', response.data);
        } catch (error) {
            console.error(
                'Error signing for meeting:',
                error.response?.data || error.message
            );
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <main className="meetup-details">
            <div className="meetup-details-card">
                <div className="meetup-details-image">
                    <img src={meetup.image || icon} alt="Meetup" />
                </div>
                <div className="meetup-details-content">
                    <h1 className="meetup-details-title">
                        {meetup.title || 'Untitled Meetup'}
                    </h1>
                    <h2 className="meetup-details-author">
                        {`Author: ${meetup.author || 'Unknown'}`}
                    </h2>
                    <p className="meetup-details-date">
                        {`Date begin: ${meetup.date || 'Not specified'}`}
                    </p>
                    <p className="meetup-details-signed">
                        {`Already signed: ${meetup.signed || 0}`}
                    </p>
                    <h3>Description:</h3>
                    <p className="meetup-details-description">
                        {meetup.description || 'No description available.'}
                    </p>
                </div>
                <button
                    className="meetup-details-button"
                    onClick={handleSignForMeeting} // Добавляем обработчик нажатия
                >
                    {token ? 'Subscribe' : 'Sign for meeting'}
                </button>
            </div>
        </main>
    );
}
