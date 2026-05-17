package dev.kore.genie.llm;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/llm")
@RequiredArgsConstructor
public class LlmController {

    private final LlmService llmService;

    @PostMapping("/ask")
    public ResponseEntity<AnswerResponse> ask(@RequestBody QuestionRequest request) {
        String answer = llmService.ask(request.question());
        return ResponseEntity.ok(new AnswerResponse(answer));
    }

    public record QuestionRequest(String question) {}
    public record AnswerResponse(String answer) {}
}
