package dev.kore.genie.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class OllamaConfig {

    @Value("${kore.genie.ollama.base-url}")
    private String baseUrl;

    @Value("${kore.genie.ollama.model}")
    private String model;

    @Value("${kore.genie.ollama.timeout}")
    private Duration timeout;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(model)
                .timeout(timeout)
                .build();
    }
}
