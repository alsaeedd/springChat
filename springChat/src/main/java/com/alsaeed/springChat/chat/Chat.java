package com.alsaeed.springChat.chat;

import com.alsaeed.springChat.common.BaseAuditingEntity;
import com.alsaeed.springChat.message.Message;
import com.alsaeed.springChat.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

import static jakarta.persistence.GenerationType.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat")
public class Chat extends BaseAuditingEntity {

    @Id
    @GeneratedValue(strategy = UUID)
    private String id;

    private User sender;
    private User receiver;
    private List<Message> messages; //because lists preserver order
}
