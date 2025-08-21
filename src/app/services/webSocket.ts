// WebSocketService.ts
export class WebSocketService {
    private conn: WebSocket | null = null;
    private defaultCallback: ((json: any) => void) | null = null;

    setDefaultCallback(callback: (json: any) => void) {
        this.defaultCallback = callback;
    }

    open(url: string, netCallback: (state: number, message: string) => void) {
        try {
            this.conn = new WebSocket(url);
            this.conn.onerror = () => {
                netCallback(this.conn?.readyState ?? -1, "Fail to the server!");
            };
            this.conn.onopen = () => {
                netCallback(this.conn?.readyState ?? -1, "OK");
            };
            this.conn.onmessage = (event) => {
                this.processResponse(event);
            };
            this.conn.onclose = (event) => {
                console.warn(`Socket closed: ${event.reason}`);
                // Implement reconnect if needed
            };
        } catch (e) {
            netCallback(-1, (e as Error).message);
        }
    }

    close() {
        if (this.conn) this.conn.close();
    }

    private send(json: any) {
        if (this.conn && this.conn.readyState === WebSocket.OPEN) {
            this.conn.send(JSON.stringify(json));
        }
    }

    enterRoomToken(roomId: string, domain: string, authToken: string) {
        this.send({
            action: "enterRoomToken",
            data: { rid: roomId, authToken, domain },
        });
    }

    joinRoomWithToken(authToken: string, roomToken: string) {
        this.send({
            action: "joinRoomWithToken",
            data: { authToken, roomToken },
        });
    }

    exitRoom(authToken: string) {
        this.send({ action: "exitRoom", data: { authToken } });
    }

    sendChat(data: any) {
        this.send({ action: "chat", data: { ltime: Date.now(), ...data } });
    }

    react(data: any) {
        this.send({ action: "reaction", data });
    }

    deleteChat(data: any) {
        this.send({ action: "delChat", data });
    }

    block(data: any) {
        this.send({ action: "expelUser", data });
    }

    unBlock(data: any) {
        this.send({ action: "unExpelUser", data });
    }

    fetchHistory(data: any) {
        this.send({ action: "history", data });
    }

    private processResponse(event: MessageEvent) {
        try {
            const json = JSON.parse(event.data);
            if (this.defaultCallback) this.defaultCallback(json);
        } catch (e) {
            console.error("Invalid JSON: ", event.data);
        }
    }

    // Add other methods like enterRoom, leaveRoom, etc., if needed
}
