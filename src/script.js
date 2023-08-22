document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById('settings-modal');
  var settingsButton = document.getElementById('settings-button');
  var closeButton = document.getElementsByClassName('close')[0];
  var settingsForm = document.getElementById('settings-form');
  var apiKeyInput = document.getElementById('api-key');
  var apiEndpointInput = document.getElementById('api-endpoint');
  var deploymentNameInput = document.getElementById('deployment-name');
  var apiKey = localStorage.getItem('apiKey') || '';
  var apiEndpoint = localStorage.getItem('apiEndpoint') || '';
  var deploymentName = localStorage.getItem('deploymentName') || '';

  // Open the modal when settings button is clicked
  settingsButton.onclick = function() {
    modal.style.display = 'block';
    apiKeyInput.value = apiKey;
    apiEndpointInput.value = apiEndpoint;
    deploymentNameInput.value = deploymentName;
  };

  // Close the modal when close button is clicked
  closeButton.onclick = function() {
    modal.style.display = 'none';
  };

  // Save the settings when form is submitted
  settingsForm.onsubmit = function(event) {
    event.preventDefault();
    apiKey = apiKeyInput.value;
    apiEndpoint = apiEndpointInput.value;
    deploymentName = deploymentNameInput.value;
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('apiEndpoint', apiEndpoint);
    localStorage.setItem('deploymentName', deploymentName);
    modal.style.display = 'none';
  };

  // Chat functionality
  var chatLog = document.getElementById('chat-log');
  var userInput = document.getElementById('user-input');
  var sendButton = document.getElementById('send-button');

  sendButton.onclick = function() {
    var userMessage = userInput.value;
    displayMessage(userMessage, true);
    userInput.value = '';
    getAIResponse(userMessage);
  };

  userInput.onkeydown = function(event) {
    event.key === 'Enter' && sendButton.click();
  }

  function displayMessage(message, isUser = false) {
    var messageContainerElement = document.createElement('div');
    messageContainerElement.classList.add('message-container');
    messageContainerElement.classList.add(isUser ? 'user' : 'chatbot');

    var messageElement = document.createElement('div');
    messageElement.classList.add('message');
  
    // Create avatar element
    var avatarElement = document.createElement('div');
    avatarElement.classList.add('avatar');
    avatarElement.style.backgroundImage = isUser ? 'url(user-avatar.png)' : 'url(chatbot-avatar.svg)';
  
    // Create text element
    var textElement = document.createElement('p');
    textElement.classList.add('message-text');
  
    // Check if the message contains a code section
    debugger;
    if (message.includes('```')) {
      while (message.includes('```')) {
        var codeSection = message.match(/```(.+?)```/s);
        if (codeSection) {
          var codeElement = document.createElement('code');
          codeElement.textContent = codeSection[1];
          textElement.innerHTML = message.replace(codeSection[0], codeElement.outerHTML);
          message = message.replace(codeSection[0], codeElement.outerHTML);
        }
      }
    } else {
      textElement.textContent = message;
    }
  
    // Append text element to message element
    messageElement.appendChild(textElement);

    if (isUser) {
      messageContainerElement.appendChild(messageElement);
      messageContainerElement.appendChild(avatarElement);
    } else {
      messageContainerElement.appendChild(avatarElement);
      messageContainerElement.appendChild(messageElement);
    }

  
    // Append message element to chat log
    chatLog.appendChild(messageContainerElement);

    // scroll to bottom when appending new message
    chatLog.scrollTo(0, chatLog .scrollHeight);
  }
  
  

  function getAIResponse(userMessage) {
    if (!apiKey || !apiEndpoint) {
      displayMessage('Please set up the API settings first.');
      return;
    }

    const url = apiEndpoint + `openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`;
    const headers = {
      'Content-Type': 'application/json',
      'api-key': apiKey
    };

    const prompt = {messages: [{role:'user', content: userMessage}]};

    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(prompt)
    })
    .then(response => response.json())
    .then(responseData => {
      var aiResponse = responseData.choices[0].message.content;
      displayMessage(aiResponse);
    })
    .catch(error => {
      displayMessage('An error occurred: ' + error);
    });
  }
});
