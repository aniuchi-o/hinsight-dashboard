export interface IApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

export interface IApiError {
    status: number;
    message: string;
    code?: string;
}
