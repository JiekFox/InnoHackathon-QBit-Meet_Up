import { useMeetupForm } from '../utils/hooks/useMeetupForm';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { GPT_URL } from '../constant/apiURL';

export function CreateMeetup() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [aiResponse, setAiResponse] = useState(''); // Состояние для текста от GPT
    const [isAiResponseVisible, setIsAiResponseVisible] = useState(false); // Управление видимостью текста от GPT
    const [isPendingAI, setIsPendingAI] = useState(false); // Состояние загрузки для кнопки AI

    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, []);

    const {
        formData,
        error,
        handleChange,
        handleImageUpload,
        handleSubmit,
        isPending
    } = useMeetupForm();

    // Функция для обработки нажатия кнопки AI
    const handleImproveWithAI = async () => {
        if (!formData.description) {
            alert('Please provide a description first.');
            return;
        }

        setIsPendingAI(true);

        const gptPrompt = `Тебе дано краткое описание мероприятия: ${formData.description}. 
        Твоя задача: расписать это описание больше объемом (если меньше 4 предложений дано, расписать хотя бы до 4 предложений, 
        иначе просто сделать текст красивее), сделать его структурированным, по желанию - по пунктам. 
        Затем дать мне ответ СТРОГО В ТАКОМ ФОРМАТЕ: "Success, 'текст расширенного описания митапа, который ты придумаешь'". 
        Если ты не смог придумать из-за какой-то ошибки, возвращаешь мне строго такой ответ: "Fail, 'описание, почему ты не смог улучшить текст'. 
        Строго запрещается давать ответ Fail без причины. Единственная доступная тебе для этого причина: в предложенном тексте меньше 10 слов. В таком случае ты можешь просто написать: "Fail, текст слишком короткий". 
        Иначе ты ОБЯЗАН хоть как-то преобразовать, расширить и улучшить текст.`;

        try {
            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const gptMessage = gptResponse.data.choices[0]?.message?.content;

            // Проверяем, есть ли корректный ответ от GPT
            if (!gptMessage) {
                throw new Error('No content received from GPT.');
            } else {
                console.log('GPT response:');
                console.log(gptMessage);
            }

            if (gptMessage.startsWith('Success')) {
                // Регулярное выражение для извлечения текста независимо от типа кавычек
                const match = gptMessage.match(/new_meetup_description:\s*["'](.+?)["']/);
                if (match && match[1]) {
                    const newDescription = match[1]; // Текст описания
                    console.log('Extracted AI description:', newDescription);
                    setAiResponse(newDescription);
                    setIsAiResponseVisible(true); // Показать текстовое поле и кнопку
                } else {
                    throw new Error('Response format is invalid.');
                }
            } else {
                alert('AI could not improve the description.');
            }
        } catch (error) {
            console.error('Error occurred while communicating with AI:', error);
            alert('Failed to communicate with AI.');
        } finally {
            setIsPendingAI(false);
        }
    };

    // Функция для принятия текста AI
    const handleAcceptAiSuggestion = () => {
        if (aiResponse) {
            handleChange({ target: { name: 'description', value: aiResponse } });
            setAiResponse('');
            setIsAiResponseVisible(false); // Скрыть поле и кнопку
        }
    };

    return (
        <main className="create-meetup">
            <h1>Create New Meetup</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="create-meetup-form">
                <div className="input-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="datetime_beg">Start Date and Time:</label>
                    <input
                        type="datetime-local"
                        id="datetime_beg"
                        name="datetime_beg"
                        value={formData.datetime_beg}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="link">Link:</label>
                    <input
                        type="url"
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="e.g., https://google.com"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button
                    type="button"
                    className="ai-button"
                    onClick={handleImproveWithAI}
                    disabled={isPendingAI}
                >
                    {isPendingAI ? 'Processing AI...' : 'Improve with AI ✨'}
                </button>
                {isAiResponseVisible && (
                    <>
                        <div className="input-group">
                            <label>AI Suggestion:</label>
                            <textarea
                                id="ai-response"
                                value={aiResponse}
                                readOnly
                                className="ai-response-field"
                            />
                        </div>
                        <button
                            type="button"
                            className="accept-ai-button"
                            onClick={handleAcceptAiSuggestion}
                        >
                            Accept AI Suggestion
                        </button>
                    </>
                )}
                <div className="input-group">
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                <button type="submit" className="create-meetup-button">
                    {isPending ? 'is pending...' : 'Create Meetup'}
                </button>
            </form>
        </main>
    );
}
