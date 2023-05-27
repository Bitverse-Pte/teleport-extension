declare class ServerTime {
    private _systime;
    private _difftime;
    constructor();
    init(): Promise<void>;
    getServerTime(): number;
    getClientTime(): number;
    getTimestamp(): number;
}
export default ServerTime;
