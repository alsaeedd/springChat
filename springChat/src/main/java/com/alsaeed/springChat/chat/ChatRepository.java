package com.alsaeed.springChat.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, String> {

    @Query(name = ChatConstants.FIND_CHAT_BY_SENDER_ID)
    List<Chat> findChatsBySenderId(@Param("senderId") String userId);

    @Query(name = ChatConstants.FIND_CHAT_BY_SENDER_AND_RECEIVER_ID)
    Optional<Chat> findChatsBySenderAndReceiverId(@Param("senderId") String senderId, @Param("receiverId") String receiverId);
}
