package com.alsaeed.springChat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SpringChatApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringChatApplication.class, args);
	}

}
