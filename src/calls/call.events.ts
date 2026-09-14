export const CALL_EVENTS = {
  INCOMING: "call:incoming",
  ACCEPT: "call:accept",
  REJECT: "call:reject",
  END: "call:end",
  OFFER: "call:offer",
  ANSWER: "call:answer",
  ICE_CANDIDATE: "call:ice-candidate",
} as const;
