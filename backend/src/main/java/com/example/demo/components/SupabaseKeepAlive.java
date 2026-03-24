package com.example.demo.components;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Value;

@Component
public class SupabaseKeepAlive {
    
    @Autowired
    private JdbcTemplate jbdcTemplate;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${TELEGRAM_BOT_TOKEN:}")
    private String telegramBotToken;

    @Value("${TELEGRAM_CHAT_ID:}")
    private String telegramChatId;

    @Scheduled(cron = "0 0 10,18 * * ?")
    public void pingSupabase() {
        String message;

        try {
            jbdcTemplate.execute("SELECT 1");
            message = "Supabase ping success at " + LocalDateTime.now() + 
                ", supabase and DigitalOcean are still alive!";
            System.out.println(message);

        } catch(Exception e) {
            message = "Supabase ping failed at " + LocalDateTime.now() + 
                ", check manually supabase status";
            System.err.println("Fail to ping Supabase: " + e.getMessage());

        }

        sendTelegramAlert(message);
    }

    private void sendTelegramAlert(String message) {

        if (telegramBotToken == null || telegramBotToken.isBlank() || 
            telegramChatId == null || telegramChatId.isBlank()) {

                System.out.println("Telegram credentials missing, sending no message");
                return;
        }

        try {
            String url = "https://api.telegram.org/bot" + telegramBotToken + 
                "/sendMessage?chat_id=" + telegramChatId + 
                "&text=" + message;

            restTemplate.getForObject(url, String.class);

        } catch (Exception e) {

            System.err.println("Telegram message send failed " + e.getMessage());
        }
    }
}
