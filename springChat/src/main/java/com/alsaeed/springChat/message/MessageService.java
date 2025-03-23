package com.alsaeed.springChat.message;

import com.alsaeed.springChat.chat.Chat;
import com.alsaeed.springChat.chat.ChatRepository;
import com.alsaeed.springChat.file.FileService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final MessageMapper mapper;
    private final FileService fileService;

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
        return messageRepository.findMessagesByChatId(chatId)
                .stream()
                .map(mapper::toMessageResponse)
                .toList();
    }

    @Transactional
    public void setMessagesToSeen(String chatId, Authentication authentication){
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat Not Found"));

//        final String receiverId = getReceiverId(chat, authentication);

        messageRepository.setMessagesToSeenByChatId(chatId, MessageState.SEEN);

        //todo notification
    }

    public void uploadMediaMessage(String chatId, MultipartFile file, Authentication authentication){
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat Not Found"));

        final String senderId = getSenderId(chat, authentication);
        final String receiverId = getReceiverId(chat, authentication);

        final String filePath = fileService.saveFile(file, senderId);
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setType(MessageType.IMAGE);
        message.setState(MessageState.SENT);
        message.setMediaFilePath(filePath);
        messageRepository.save(message);

        //todo notification
    }

    private String getSenderId(Chat chat, Authentication authentication) {
        if(chat.getSender().getId().equals(authentication.getName())){
            chat.getSender().getId();
        }
        return chat.getReceiver().getId();
    }

    private String getReceiverId(Chat chat, Authentication authentication) {
        if(chat.getSender().getId().equals(authentication.getName())){
            chat.getReceiver().getId();
        }
        return chat.getSender().getId();
    }
}
