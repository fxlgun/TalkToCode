// extension.js

const vscode = require('vscode');
const { window, ViewColumn, commands } = vscode;

let disposable;

function activate(context) {
	// Register command to open the chatbot sidebar
	disposable = vscode.commands.registerCommand('TalkToCode.openChatbot', () => {
		// Create and show a new sidebar panel
		const panel = window.createWebviewPanel(
			'chatbotPanel',
			'Talk To Code',
			ViewColumn.Two, // Specify the column for the sidebar
			{
				enableScripts: true
			}
		);

		// Load HTML content into the sidebar panel
		panel.webview.html = getWebviewContent(panel.webview, panel);

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(message => {
			// Send user message to API and receive response
			sendToAPI(message.text)
				.then(response => {
					// Add response to chatbox
					panel.webview.postMessage({ text: response });
				})
				.catch(error => {
					console.error('Error sending message to API:', error);
					// Handle error and display message in chatbox
					panel.webview.postMessage({ text: 'API hai hi no' });
				});
		});
	});

	context.subscriptions.push(disposable);
}

function deactivate() {
	if (disposable) {
		disposable.dispose();
	}
}

function getWebviewContent(webview, panel) {
	return `
        <html>
        <head>
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: Inter, sans-serif; }
                #chatbox { height: calc(100% - 40px); overflow-y: auto; padding: 6px 10px 6px 0px; overflow-x:hidden }
                #messageInput { width: calc(100% - 20px); margin: 10px; padding: 10px; background-color:transparent; border:0.5px grey solid; color:white; border-radius: 10px; }
                #sendMessageBtn { margin: 5px 10px; padding: 10px 14px; background-color:#008170; color: white; border-radius: 10px; border: none }
            </style>
        </head>
        <body>
            <div id="chatbox"></div>
            <form id="chatForm">
                <input type="text" id="messageInput" placeholder="Type your message...">
                <button type="submit" id="sendMessageBtn"> Send </button>
            </form>
            <script>
                const vscode = acquireVsCodeApi();
                const chatbox = document.getElementById('chatbox');
                const chatForm = document.getElementById('chatForm');
                const messageInput = document.getElementById('messageInput');

                function addMessage(message, fromUser = false) {
					const messageBox = document.createElement('div');
                    const messageElement = document.createElement('div');
					messageBox.appendChild(messageElement);
					messageBox.style.width = "100%";
					messageBox.style.display = 'flex';
					messageBox.style.margin = '6px'
					messageBox.style.justifyContent = 'flex-start'
                    messageElement.textContent = message;
					messageElement.style.padding = '10px';
					messageElement.style.backgroundColor = '#005B41'
					messageElement.style.borderRadius = '10px';
					messageElement.style.width = 'fit-content';
                    if (fromUser) {
						messageBox.style.justifyContent = 'flex-end'
                        messageElement.style.textAlign = 'right';
						messageElement.style.backgroundColor = '#232D3F'
                    }
                    chatbox.appendChild(messageBox);
                    chatbox.scrollTop = chatbox.scrollHeight;
                }

                function sendMessageToExtension(message) {
                    vscode.postMessage({ text: message });
                }

                chatForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const message = messageInput.value.trim();
                    if (message !== '') {
                        sendMessageToExtension(message);
                        addMessage(message, true);
                        messageInput.value = '';
                    }
                });

                window.addEventListener('message', event => {
                    const message = event.data.text;
                    addMessage(message);
                });
            </script>
        </body>
        </html>
    `;
}

async function sendToAPI(message) {
	try {

		// Make HTTP request to API endpoint
		const response = await fetch('https://jsonpla.com/posts?userId=3')
		// Check if request was successful
		if (!response.ok) {
			throw new Error('Failed to get response from API');
		}

		// Parse and return response JSON
		const responseData = await response.json();

		return responseData[0].title;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	activate,
	deactivate
};
