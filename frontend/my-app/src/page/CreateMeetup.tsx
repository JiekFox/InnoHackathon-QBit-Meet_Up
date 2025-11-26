import { useMeetupForm } from '../utils/hooks/useMeetupForm';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import { useEffect, useState, ChangeEvent, JSX, useRef } from 'react';
import { GPT_URL } from '../constant/apiURL';
import { useAxiosWithAuth } from '../utils/hooks/useAxiosWithAuth';
import { ImagePreview } from '../components/ImagePreview';

export function CreateMeetup(): JSX.Element {
    const { token } = useAuth();
    const navigate = useNavigate();
    const axios = useAxiosWithAuth();

    const [aiResponse, setAiResponse] = useState<string>('');
    const [isAiResponseVisible, setIsAiResponseVisible] = useState<boolean>(false);
    const [isPendingAI, setIsPendingAI] = useState<boolean>(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!token) {
            navigate(SIGN_IN);
        }
    }, [token, navigate]);

    const {
        formData,
        error,
        handleChange,
        handleImageUpload,
        handleSubmit,
        isPending
    } = useMeetupForm();

    const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            handleImageUpload(e);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        const syntheticEvent = {
            target: {
                name: 'image',
                files: null,
                value: ''
            }
        } as unknown as ChangeEvent<HTMLInputElement>;

        handleImageUpload(syntheticEvent);
    };

    const handleImproveWithAI = async (): Promise<void> => {
        if (!formData.description) {
            alert('Please provide a description first.');
            return;
        }

        setIsPendingAI(true);

        const gptPrompt = `
            Тебе дано краткое описание мероприятия: "${formData.description}". 
            Твоя задача: расписать это описание больше объемом, сделать его структурированным и по пунктам. 
            Затем дай мне ответ СТРОГО В СЛЕДУЮЩЕМ ФОРМАТЕ: 
            "текст расширенного описания митапа, который ты придумаешь"
            Ничего больше добавлять не нужно. НЕ ПИШИ вводных слов, комментариев, заключений, либо других текстов вне указанного формата. ТОЛЬКО содержимое улучшенного описания. 
            ВАЖНО: ответ должен быть в пределах 480 символов. Если текст превышает это количество, сократи его.`;

        try {
            const gptResponse = await axios.post(
                `${GPT_URL}/chatgpt`,
                { message: gptPrompt },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const gptMessage: string | undefined =
                gptResponse.data.choices[0]?.message?.content;

            if (!gptMessage) {
                throw new Error('No content received from GPT.');
            }

            setAiResponse(gptMessage);
            setIsAiResponseVisible(true);
        } catch (error) {
            console.error('Error occurred while communicating with AI:', error);
            alert('Failed to communicate with AI.');
        } finally {
            setIsPendingAI(false);
        }
    };

    const handleAcceptAiSuggestion = (): void => {
        if (aiResponse) {
            handleChange({
                target: { name: 'description', value: aiResponse }
            } as ChangeEvent<HTMLInputElement>);
            setAiResponse('');
            setIsAiResponseVisible(false);
        }
    };

    return (
        <main className="create-meetup">
            <h1>Create New Meetup</h1>
            {error && <p className="error">{error.toString()}</p>}
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
                            className="ai-button"
                            onClick={handleAcceptAiSuggestion}
                        >
                            Accept AI Suggestion
                        </button>
                    </>
                )}

                <div className="image-upload-wrapper">
                    <label
                        htmlFor="customFileInput"
                        className="custom-file-label create-meetup-button"
                    >
                        Select image
                    </label>
                    <input
                        type="file"
                        id="customFileInput"
                        name="image"
                        accept="image/*"
                        onChange={onImageChange}
                        className="hidden-file-input"
                        ref={fileInputRef}
                    />

                    <div className="preview-box">
                        <ImagePreview
                            previewUrl={previewUrl}
                            onRemove={handleRemoveImage}
                        />
                    </div>
                </div>

                <button type="submit" className="create-meetup-button">
                    {isPending ? 'is pending...' : 'Create Meetup'}
                </button>
            </form>
        </main>
    );
}
