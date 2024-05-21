package com.syajel.messenger.config;


import com.syajel.messenger.chat.Message;
import com.syajel.messenger.chat.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations msgTemplate;

    @EventListener
    public void HandleWebSocketDisconnectListener(
            SessionDisconnectEvent event
    ){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            log.info("{} has disconnected.", username);
            var message = Message.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .build();
            msgTemplate.convertAndSend("/topic/public", message);
        }
    }
}
