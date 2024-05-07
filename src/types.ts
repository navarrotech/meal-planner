// Copyright © 2023 Navarrotech

export type User = {
    id: string;

    first_name: string;
    last_name: string;
    email: string;
    password: string;

    access_token?: string;
    preferences: Record<string, any>;

    reset_key?: string;
    reset_key_expiration?: Date;
    verified: boolean;
    verify_key?: string;

    created: Date;
    updated: Date;
}
  
export type Team = {
    id: string;

    name: string;
    image: string;
    description: string;
    banner: string;
    members: string[];

    metadata: Record<string, any>;

    expires: Date;
    created: Date;
    updated: Date;
    used: Date;
}

export type DestinationType = 
      "facebook"
    | "youtube"
    | "twitch"
    | "tiktok"
    | "rtmp"

export type Destination = {
    id: string;
    ownerid: string;

    name: string;
    type: DestinationType;
    credentials: Record<string, any>;

    metadata: Record<string, any>;

    expires: Date;
    created: Date;
    updated: Date;
    used: Date;
}

export type Video = {
    id: string;
    ownerid: string;

    filename: string;
    url: string;
    thumbnail: string;
    duration: number;
    fps: number;
    width: number;
    height: number;

    uses: number;
    metadata: Record<string, any>;

    expires: Date;
    created: Date;
    updated: Date;
    used: Date;
}

export type RtmpKeys = {
    id: string;
    ownerid: string;

    key: string;
    destinations: string[];

    metadata: Record<string, any>;

    created: Date;
    updated: Date;
    used: Date;
}
  
export type PrerecordedStreams = {
    id: string;
    ownerid: string;

    status: string; // Consider using a TypeScript enum for predefined statuses

    now: boolean;
    time: Date;
    metadata: Record<string, any>;

    videos: string[];
    destinations: Record<string, any>;

    created: Date;
    updated: Date;
    used: Date;
}

export type PrerecordedDestinationType = {
    destination_id: string;

    type: DestinationType;

    title: string;
    description: string;
    thumbnail: string;

    metadata: Record<string, any>;

    created: Date;
    updated: Date;
    used: Date;
}

export type StreamAnalytics = {
    id: string;
    ownerid: string;
    
    type: DestinationType;

    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
}

// Assuming Core and Analytics models don't have Record<string, any> other fields
export type Core = {
    id: string;
}
  
export type Analytics = {
    id: string;
}
  