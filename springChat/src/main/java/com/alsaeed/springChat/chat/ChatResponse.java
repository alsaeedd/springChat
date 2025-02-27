package com.alsaeed.springChat.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponse {

    private String id;
    private String name;
    private long unreadCount;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private boolean isReceiverOnline;
    private String senderId;
    private String receiverId;
}
