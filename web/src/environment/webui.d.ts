declare namespace webui {
    /// The following is generated from WebUI 2.5.

    /**
     * Calling a backend function.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function call(method: string, params: string | number | boolean | Uint8Array): Promise<any>;

    /**
     * Check if the connection with the backend is established.
     */
    export function isConnected(): boolean;

    /**
     * Set a callback to receive connection and disconnection events.
     */
    export function setEventCallback(callback: (event: Event) => void): void;

    /**
     * Encode text into base64 string.
     */
    export function encode(text: string): string;

    /**
     * Decode base64 string into text.
     */
    export function decode(base64: string): string;

    /**
     * Get OS high contrast preference.
     */
    export function isHighContrast(): boolean;

    /**
     * Enable WebUI debug logging in the console logs.
     */
    export function setLogging(enabled: boolean): void;

    /// The following is user-defined.

    export function handleRequest(data: string): Promise<number>;
    export function handleInterrupt(taskId: number): void;
}
