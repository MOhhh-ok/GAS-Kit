interface LINESourceUser {
    type: 'user',
    userId: string,
}

interface LINESourceGroup {
    type: 'group',
    groupId: string,
    userId?: string,
}

interface LINESourceRoom {
    type: 'room',
    roomId: string,
    userId?: string,
}

interface LINEAction {
    type: 'message' | 'postback' | 'uri' | 'datetimepicker' | 'location';
    label: string;
    text?: string;
    uri?: string;
}

interface LINEQuickReplyItem {
    type: 'action',
    action: LINEAction,
}

interface LINEQuickReply {
    items: LINEQuickReplyItem[];
}

interface LINEMessage {
    type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'sticker' | 'imagemap' | 'template' | 'flex';
    quickReply?: LINEQuickReply;
}

interface LINEEvent {
    type: 'message' | 'follow' | 'unfollow' | 'join' | 'leave' | 'postback' | 'beacon';
    message?: LINEMessage;
    timestamp: number;
    source: LINESourceUser | LINESourceGroup | LINESourceRoom;
    replyToken?: string;
    mode: 'active' | 'standby';
    webhookEventId: string;
    deliveryContext: {
        isRedelivery: boolean;
    };
}

// テキストイベント
interface LINEEventTextMessage extends LINEMessage {
    type: 'text',
    id: string,
    text: string,
}

interface LINETextMessage extends LINEMessage {
    type: 'text',
    text: string,
}


interface LINEWebhookData {
    destination: string;
    events: LINEEvent[];
}