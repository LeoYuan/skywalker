import hilog from "@ohos:hilog";
const DOMAIN: number = 0x0001;
const TAG: string = 'SkyWalker';
export class Logger {
    static debug(message: string, ...args: string[]): void {
        hilog.debug(DOMAIN, TAG, message, args);
    }
    static info(message: string, ...args: string[]): void {
        hilog.info(DOMAIN, TAG, message, args);
    }
    static warn(message: string, ...args: string[]): void {
        hilog.warn(DOMAIN, TAG, message, args);
    }
    static error(message: string, ...args: string[]): void {
        hilog.error(DOMAIN, TAG, message, args);
    }
}
