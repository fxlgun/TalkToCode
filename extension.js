// extension.js

const vscode = require('vscode');
const { window, ViewColumn, commands, Disposable } = vscode;

let disposable;

function activate(context) {
    // Register command to open the chatbot sidebar
    disposable = vscode.commands.registerCommand('TalkToCode.openChatbot', () => {
        // Create and show a new sidebar panel
        const panel = window.createWebviewPanel(
            'chatbotPanel',
            'Talk with Code!',
            ViewColumn.Two, // Specify the column for the sidebar
            {
                enableScripts: true
            }
        );

        // Load HTML content into the sidebar panel
        panel.webview.html = getWebviewContent(panel.webview);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(message => {
			vscode.window.showInformationMessage(message)
            // Handle user input and send it to the chatbot backend
            // Example: sendUserMessageToBackend(message.text);
            // Receive response from backend and send it back to the webview
            // Example: panel.webview.postMessage({ text: chatbotResponse });
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {
    if (disposable) {
        disposable.dispose();
    }
}

function getWebviewContent(webview) {
    return `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                #chatbox { height: calc(100% - 40px); overflow-y: scroll; border: 1px solid #ccc; padding: 10px; }
                #messageInput { width: calc(100% - 20px); margin: 0 10px; }
                #sendMessageBtn { margin-top: 10px; }
            </style>
        </head>
        <body>
            <div id="chatbox"></div>
            <input type="text" id="messageInput" placeholder="Type your message...">
            <button id="sendMessageBtn">Send</button>
            <script>
                const vscode = acquireVsCodeApi();
                const chatbox = document.getElementById('chatbox');
                const messageInput = document.getElementById('messageInput');
                const sendMessageBtn = document.getElementById('sendMessageBtn');

                // Function to add a message to the chatbox
                function addMessage(message, fromUser = false) {
                    const messageElement = document.createElement('div');
                    messageElement.textContent = message;
                    if (fromUser) {
                        messageElement.style.textAlign = 'right';
                    }
                    chatbox.appendChild(messageElement);
                    chatbox.scrollTop = chatbox.scrollHeight;
                }

                // Send message to extension when user clicks Send button
                sendMessageBtn.addEventListener('click', () => {
                    const message = messageInput.value;
                    if (message.trim() !== '') {
                        vscode.postMessage({ text: message });
                        addMessage(message, true);
                        messageInput.value = '';
                    }
                });

                // Receive message from extension and add it to the chatbox
                window.addEventListener('message', event => {
                    const message = event.data.text;
                    addMessage(message);
                });
            </script>
        </body>
        </html>
    `;
}

module.exports = {
    activate,
    deactivate
};
