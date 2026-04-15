export interface AuthToken {
    refresh: string;
    access: string;
}

export interface AuthState {
    token: AuthToken | null;
    name: string | null;
    userID: number | null;
    role: 'admin' | 'user';
    img: string | null | undefined;
    loading: boolean;
}

export interface AuthResponseData {
    refresh: string;
    access: string;
    username: string;
    user_id: number;
    message?: string;
    photo?: string;
    role?: 'admin' | 'user';
}

export interface AuthContextType extends AuthState {
    saveToken: (newToken: AuthToken | null) => void;
    removeToken: () => void;
    saveDate: (newDate: AuthResponseData) => void;
}

export interface Config {
    headers: {
        Authorization: string;
    };
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string;
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
    location?: string;
    author_id: number;
    author?: string;
    tags?: Tag[];
    duration: number;
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
    tagIds?: number[];
    status?: string;
}
