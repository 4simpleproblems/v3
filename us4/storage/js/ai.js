(function() {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);

    var button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.bottom = '100px';
    button.style.right = '20px';
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.background = 'gray';
    button.style.borderRadius = '50%';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9999';
    button.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.3)';
    button.style.transition = 'width 0.3s, height 0.3s, background-color 0.3s';

    var robotIcon = document.createElement('span');
    robotIcon.classList.add('fa-solid', 'fa-robot');
    robotIcon.style.fontSize = '30px';
    robotIcon.style.color = 'white';
    robotIcon.style.transition = 'transform 0.3s';

    button.appendChild(robotIcon);
    document.body.appendChild(button);

    var iframe = document.createElement('iframe');
    iframe.srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>US4 - AI</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #1a1a1a;
            color: gold;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            height: 100vh;
        }

        h1 {
            text-align: center;
            color: gold;
            margin-top: 20px;
        }

        #chat-container {
            border: 2px solid #444;
            height: 400px;
            width: 80%;
            max-width: 600px;
            padding: 20px;
            margin-top: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            background-color: #222;
            color: gold;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
            overflow-y: auto;
        }

        #input-container {
            display: flex;
            align-items: center;
            width: 80%;
            max-width: 600px;
            margin-bottom: 20px;
        }

        #user-input {
            flex-grow: 1;
            padding: 15px;
            font-size: 16px;
            border-radius: 10px;
            background-color: #333;
            color: gold;
            border: 1px solid gold;
            margin-right: 10px;
            resize: none;
            min-height: 50px;
            transition: background-color 0.3s ease;
        }

        #user-input:focus {
            background-color: #444;
            outline: none;
        }

        #send-button {
            width: 50px;
            height: 50px;
            background-color: #333;
            color: gold;
            border-radius: 50%;
            border: 1px solid gold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }

        #send-button::before {
            content: '↑';
            font-size: 20px;
            font-weight: bold;
        }

        #send-button:hover {
            background-color: #444;
            transform: scale(1.1);
        }

        #send-button:active {
            background-color: #555;
        }

        img {
            width: 30px;
            height: 30px;
            margin-right: 10px;
        }

        .message {
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
        }

        .message.user {
            text-align: right;
        }

        .message.bot {
            text-align: left;
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <div class="message bot"><img src="https://voucan-us4.github.io/ai/logo.png" alt="AI Logo">Hello. How are you doing today?</div>
    </div>
    
    <div id="input-container">
        <textarea id="user-input" placeholder="Type your message here..."></textarea>
        <button id="send-button"></button>
    </div>

    <script>
        document.getElementById('send-button').addEventListener('click', function() {
            const userInput = document.getElementById('user-input').value.trim();
            if (userInput) {
                const newMessage = document.createElement('div');
                newMessage.classList.add('message', 'user');
                newMessage.textContent = userInput;

                document.getElementById('chat-container').appendChild(newMessage);
                document.getElementById('user-input').value = '';
                document.getElementById('chat-container').scrollTop = document.getElementById('chat-container').scrollHeight;
            }
        });
    </script>
    <script src="https://voucan-us4.github.io/ai/ai.js"></script>
</body>
</html>`;

    iframe.style.position = 'fixed';
    iframe.style.bottom = '100px';
    iframe.style.right = '20px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '2px solid #000';
    iframe.style.background = '#fff';
    iframe.style.borderRadius = '8px';
    iframe.style.visibility = 'hidden';
    iframe.style.opacity = '0';
    iframe.style.zIndex = '9999';
    iframe.style.overflowY = 'auto';
    iframe.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.4)';
    iframe.style.transition = 'all 0.4s ease';

    document.body.appendChild(iframe);

    button.addEventListener('click', function() {
        var isOpen = iframe.style.width === '450px';

        if (!isOpen) {
            iframe.style.visibility = 'visible';
            iframe.style.opacity = '1';
            iframe.style.width = '450px';
            iframe.style.height = '450px';
            iframe.style.bottom = '60px';
            iframe.style.right = '100px';
            iframe.style.transform = 'scale(1)';
            robotIcon.classList.remove('fa-robot');
            robotIcon.classList.add('fa-times');
            robotIcon.style.color = 'white';
            button.style.backgroundColor = '#ffc700';
            button.style.width = '70px';
            button.style.height = '70px';
            robotIcon.style.transform = 'rotate(180deg)';
        } else {
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.bottom = '100px';
            iframe.style.right = '20px';
            iframe.style.transform = 'scale(0)';
            robotIcon.classList.remove('fa-times');
            robotIcon.classList.add('fa-robot');
            robotIcon.style.color = 'white';
            button.style.backgroundColor = 'gray';
            button.style.width = '60px';
            button.style.height = '60px';
            robotIcon.style.transform = 'rotate(0deg)';
            
            setTimeout(() => {
                iframe.style.visibility = 'hidden';
                iframe.style.opacity = '0';
            }, 400);
        }
    });
})();
