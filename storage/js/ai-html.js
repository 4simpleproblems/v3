document.addEventListener("DOMContentLoaded", function() {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    const apiKeys = [
        atob('Z3NrX21Fb2gzbURvVzFYSW1qUnlHdkV4V0dkeWIzRlloa2l4ckFEcWwyU2g1YjhjSlQyNDIyTGU='),
        atob('Z3NrX1pBbnN0eHZoTkJ1SFNrWnVnMVhnV0dkeWIzRllqVDB1cnlwcTZBcVJHcUE1WkFVenJOdWw='),
        atob('Z3NrX0h1N0ZPbGZYMmpleERkNE5IZFAzV0dkeWIzRlkwSWZWekdZNlkwMmFrbUxLSUFxRk51Z1Y='),
        atob('Z3NrX0xsVXR1dmV6NklNVURBR1ZBaEl6V0dkeWIzRllpa0ltbkFaVTR6TTFhUkY3ZjJ5NjVJM3E='),
        atob('Z3NrXzNwa1JOUE82Z1N3V1M4cFlIZjg3V0dkeWIzRllzZzZGOURGZWZCVHd0SzNXMjlDUzFmNzM='),
        atob('Z3NrX0w4SFF4WTBQZlByVGcyMDFGcHFHV0dkeWIzRlltaThPenhaV1JtSGhyUTdESk1NMTJISFc='),
        atob('Z3NrX3hWTGVUSWRETDZ0VUZjbVZyV1FqV0dkeWIzRllKUnJkT283SUQyRHNKSEc0WklIV21GQzY=')
    ];

    let currentKeyIndex = 0;
    let messageHistory = [];

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessageToChat(userMessage, "guest.png", "user");
        userInput.value = "";

        messageHistory.push({ role: 'user', content: userMessage });
        if (messageHistory.length > 10) messageHistory.shift();

        for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[currentKeyIndex];

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: "You are a helpful AI assistant." },
                            ...messageHistory.slice(-10)
                        ],
                        temperature: 1,
                        max_tokens: 1024,
                        stream: false
                    })
                });

                if (response.status === 429) {
                    console.warn(`API key ${apiKey} failed with 429. Switching key...`);
                    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                    continue;
                }

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error("Invalid API response");
                }

                const aiResponse = data.choices[0].message.content;
                messageHistory.push({ role: 'assistant', content: aiResponse });
                if (messageHistory.length > 10) messageHistory.shift();

                addMessageToChat(aiResponse, "logo.png", "bot");
                return;

            } catch (error) {
                console.error("Fetch error:", error);
            }
        }

        addMessageToChat("Error: All API Keys failed, or messages/message history is too long.", null, "error");
    }

    function addMessageToChat(message, imgSrc, messageType) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', messageType);

        if (imgSrc) {
            const img = document.createElement('img');
            img.src = `https://voucan-us4.github.io/ai/${imgSrc}`;
            img.classList.add('message-icon');
            messageElement.appendChild(img);
        }

        const textContainer = document.createElement('div');
        textContainer.innerHTML = formatMessage(message);
        messageElement.appendChild(textContainer);

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function formatMessage(text) {
        return text.replace(/```([\s\S]+?)```/g, (match, code) => {
            return `<div class="code-block"><pre><code>${escapeHtml(code)}</code></pre><button class="copy-btn" onclick="copyCode(this)">Copy</button></div>`;
        }).replace(/\n/g, '<br>');
    }

    function escapeHtml(text) {
        return text.replace(/[&<>"']/g, function(match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    window.copyCode = function(button) {
        const code = button.previousElementSibling.innerText;
        navigator.clipboard.writeText(code).then(() => {
            button.innerText = "Copied!";
            setTimeout(() => { button.innerText = "Copy"; }, 2000);
        });
    };

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
