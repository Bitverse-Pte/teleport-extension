declare const http: {
    get: (url: string) => Promise<any>;
    post: (url: string, data: any, headers: any) => Promise<any>;
};
export default http;
