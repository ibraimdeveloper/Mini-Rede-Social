type ApiMessage = {
  id: number;
  message: string;
  user_send_id: number;
  user_receive_id: number;
  time: string;
  readMessage: boolean;
};

const apiMessagesUser2: ApiMessage[] = [
    { id: 1, message: "Hey!", user_send_id: 2, user_receive_id: 1, time: "18:10", readMessage: true },
    { id: 2, message: "Olá 👋", user_send_id: 1, user_receive_id: 2, time: "18:11", readMessage: true },
    { id: 3, message: "Como estás?", user_send_id: 2, user_receive_id: 1, time: "18:12", readMessage: true },
    { id: 4, message: "Estou bem, e tu?", user_send_id: 1, user_receive_id: 2, time: "18:13", readMessage: true },
    { id: 5, message: "Tudo tranquilo 😄", user_send_id: 2, user_receive_id: 1, time: "18:14", readMessage: false },
];

const apiMessages: ApiMessage[] = [
    { id: 1, message: "ola?", user_send_id: 3, user_receive_id: 1, time: "19:45", readMessage: true },
    { id: 2, message: "Tudo bem?", user_send_id: 1, user_receive_id: 3, time: "19:46", readMessage: true },
    { id: 3, message: "Sim, e contigo?", user_send_id: 3, user_receive_id: 1, time: "19:47", readMessage: true },
    { id: 4, message: "Também 👍", user_send_id: 1, user_receive_id: 3, time: "19:48", readMessage: false },
    { id: 5, message: "O que estás a fazer?", user_send_id: 3, user_receive_id: 1, time: "19:49", readMessage: false },
];

export function getMessagesByChatId(id: number) {
  if (id === 2) {
    return apiMessages;
  }

  if (id === 3) {
    return apiMessagesUser2;
  }

  return [];
}