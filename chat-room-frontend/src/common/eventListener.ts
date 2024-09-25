// type CallbackFunction = (...args: any[]) => void;
type CallbackFunction = <T extends any[]>(...args: T) => void;
interface NativeEventListener {
    target: EventTarget;
    eventName: string;
    callback: EventListenerOrEventListenerObject;
    options?: boolean | EventListenerOptions;
}

class EventListener {
    constructor() {
        this.customListeners = new Map();
        this.nativeListeners = [];
    }

    private customListeners: Map<string, CallbackFunction[]>;

    private nativeListeners: NativeEventListener[];

    add(eventName: string, callback: CallbackFunction) {
        if (!this.customListeners.get(eventName)) {
            this.customListeners.set(eventName, []);
        }
        this.customListeners.get(eventName)?.push(callback);
    }

    remove(eventName: string, callback: CallbackFunction) {
        const eventListeners = this.customListeners.get(eventName);

        if (eventListeners && eventListeners.length) {
            const idx = eventListeners.indexOf(callback);
            idx > -1 && eventListeners.splice(idx, 1);
        }
    }

    dispatch(eventName: string, ...args: any[]) {
        const eventListeners = this.customListeners.get(eventName);
        if (!eventListeners) {
            return;
        }
        for (const listener of eventListeners) {
            listener(...args);
        }
    }

    bindNativeEventListener(
        target: EventTarget,
        eventName: string,
        callback: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ) {
        target.addEventListener(eventName, callback, options);
        const nativeEventListener: NativeEventListener = {
            target,
            eventName,
            callback,
            options,
        };
        this.nativeListeners.push(nativeEventListener);
    }

    unbindNativeEventListeners(): void {
        while (this.nativeListeners.length) {
            const nativeListener: NativeEventListener = this.nativeListeners.pop()!;
            nativeListener.target.removeEventListener(
                nativeListener.eventName,
                nativeListener.callback,
                nativeListener.options,
            );
        }
    }

    unbindSingleNativeEventListeners(eventName: string, callback: EventListenerOrEventListenerObject) {
        for (const nativeListener of this.nativeListeners) {
            if (eventName === nativeListener.eventName && callback === nativeListener.callback) {
                nativeListener.target.removeEventListener(
                    nativeListener.eventName,
                    nativeListener.callback,
                    nativeListener.options,
                );
            }
        }
    }
}

export default EventListener;
