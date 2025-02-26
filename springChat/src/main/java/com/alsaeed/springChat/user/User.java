package com.alsaeed.springChat.user;

import com.alsaeed.springChat.chat.Chat;
import com.alsaeed.springChat.common.BaseAuditingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
@NamedQuery(name = UserConstants.FIND_USER_BY_EMAIL, query = "SELECT u FROM User u WHERE u.email = :email")
@NamedQuery(name = UserConstants.FIND_ALL_USERS_EXCEPT_SELF, query = "SELECT u FROM User u WHERE u.id != :publicId")
@NamedQuery(name = UserConstants.FIND_USER_BY_PUBLIC_ID, query = "SELECT u FROM User u WHERE u.id = :publicId")
public class User extends BaseAuditingEntity {

    private static final int LAST_ACTIVE_INTERVAL = 5;
    @Id
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime lastSeen;

    @OneToMany(mappedBy = "sender")
    private List<Chat> chatAsSender;
    @OneToMany(mappedBy = "receiver")
    private List<Chat> chatAsReceiver;

    @Transient
    public boolean isUserOnline(){
        return lastSeen != null && lastSeen.isAfter(LocalDateTime.now().minusMinutes(LAST_ACTIVE_INTERVAL));
    }


}
