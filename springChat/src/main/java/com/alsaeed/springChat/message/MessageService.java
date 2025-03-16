package com.alsaeed.springChat.message;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;

    public void saveMessage(MessageRequest messageRequest){
        messageRepository.save(messageRequest);
    }
}
