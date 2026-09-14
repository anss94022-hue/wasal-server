export type CallType = "audio" | "video";

export type CallStatus =
  | "ringing"
  | "accepted"
  | "rejected"
  | "ended"
  | "missed";

export interface RTCSessionDescriptionData {
  type: "offer" | "answer" | "pranswer" | "rollback";
  sdp?: string;
}

export interface RTCIceCandidateData {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

export interface CallSession {
  callId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  createdAt: Date;
  answeredAt?: Date;
  endedAt?: Date;
}

export interface CallOffer {
  callId: string;
  callerId: string;
  receiverId: string;
  type: CallType;
  offer: RTCSessionDescriptionData;
}

export interface CallAnswer {
  callId: string;
  answer: RTCSessionDescriptionData;
}

export interface IceCandidate {
  callId: string;
  candidate: RTCIceCandidateData;
}
