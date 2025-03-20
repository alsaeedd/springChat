package com.alsaeed.springChat.message;

import com.alsaeed.springChat.chat.Chat;
import com.alsaeed.springChat.chat.ChatRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    public void saveMessage(MessageRequest messageRequest){
        Chat chat = chatRepository.findById(messageRequest.getChatId())
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setChat(chat);
        message.setSenderId(messageRequest.getSenderId());
        message.setReceiverId(message.getReceiverId());
        message.setType(messageRequest.getType());
        message.setState(MessageState.SENT);

        messageRepository.save(message);

        //todo notification
    }

    public List<MessageResponse> findChatMessages(String chatId){

    }
}
