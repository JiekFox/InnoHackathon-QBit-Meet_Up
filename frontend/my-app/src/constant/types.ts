export interface AuthToken {
    refresh: string;
    access: string;
}

export interface AuthResponseData {
    refresh: string;
    access: string;
    username: string;
    user_id: number;
    message?: string;
    photo?: string;
}

export interface AuthContextType {
    token: AuthToken | null;
    userID: number | null;
    name: string | null;
    img: string | null | undefined;
    saveToken: (newToken: AuthToken | null) => void;
    removeToken: () => void;
    saveDate: (newDate: AuthResponseData) => void;
    loading: boolean;
}

export interface Config {
    headers: {
        Authorization: string;
    };
}

export interface Meetup {
    id: number;
    title: string;
    description: string;
    image: string | null;
    link: string;
    datetime_beg: string;
    dateTime?: string;
    attendees_count?: number;
    author_id: number;
    author?: string;
}

export interface ProfileFormData {
    id?: number;
    name: string;
    surname: string;
    email: string;
    about: string;
    username: string;
    tg_id: string;
    teams_id: string;
    photo: File | string | null;
}

export interface ParamsForFetch {
    page?: number;
    pageSize?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}
