package dev.kore.genie.llm;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.data.message.AiMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LlmService {

    private final ChatLanguageModel chatLanguageModel;

    private static final String SYSTEM_PROMPT =
            "Tu es un assistant IA privé d'entreprise. " +
            "Tu réponds uniquement à partir des informations fournies dans le contexte. " +
            "Si tu ne sais pas, dis-le clairement.";

    public String ask(String question) {
        Response<AiMessage> response = chatLanguageModel.generate(
                List.of(
                        SystemMessage.from(SYSTEM_PROMPT),
                        UserMessage.from(question)
                )
        );
        return response.content().text();
    }
}
