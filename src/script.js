function uuidv4() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const userId = uuidv4();
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
  var userTypeSelector = document.getElementById('user-type');

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
    textElement.innerHTML = marked.parse(message);
  
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

  function displayImages(images) {
    var messageContainerElement = document.createElement('div');
    messageContainerElement.classList.add('message-container');
    messageContainerElement.classList.add('chatbot');

    var messageElement = document.createElement('div');
    messageElement.classList.add('message');
  
    // Create avatar element
    var avatarElement = document.createElement('div');
    avatarElement.classList.add('avatar');
    avatarElement.style.backgroundImage = 'url(chatbot-avatar.svg)';
  
    // Create text element
    var imagesElement = document.createElement('div');
    imagesElement.classList.add('message-image');
  
    debugger;
    imagesElement.innerHTML = images.reduce((a, b) => {
      return a + `<img class="img-item" src="${b.url}" />`;
    }, '');
  
    // Append text element to message element
    messageElement.appendChild(imagesElement);
    messageContainerElement.appendChild(avatarElement);
    messageContainerElement.appendChild(messageElement);

  
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

    const textGenerate = () => {
      const url = apiEndpoint + `openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`;
      const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey
      };
  
      const prompt = {messages: [{role:'user', content: userMessage}], user: userId};
  
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

    const imageGenerate = () => {
      const url = apiEndpoint + `openai/images/generations:submit?api-version=2023-06-01-preview`;
      const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey
      };
  
      const prompt = {
        prompt: userMessage,
        size: "256x256",
        n: 2
      };
  
      fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(prompt)
      })
      .then(response => response.json())
      .then(responseData => {
        const id = responseData.id;
        let status = responseData.status;
        let images = [];
      
        const checkImageLoop = () => {
          setTimeout(() => {
            const url = apiEndpoint + `/openai/operations/images/${id}?api-version=2023-06-01-preview`;
            fetch(url, {
              method: 'GET',
              headers: headers,
            })
            .then(response => response.json())
            .then(responseData => {
              status = responseData.status;
              images = responseData.result && responseData.result.data ? responseData.result.data : [];
            })
            .catch(() => {
              status = 'failed';
            }).finally(() => {
              if (status === 'succeeded') {
                displayImages(images);
              } else if (status === 'failed') {
                displayMessage('An error occurred', false);
              } else {
                checkImageLoop();
              }
              if (status !== 'succeeded' && status !== 'failed') {
                checkImageLoop();
              } 
            });
          }, 5000);
        }

        if (status === 'succeeded') { 
          displayImages(images);
        }
        else {
          checkImageLoop();
        }
      })
      .catch(error => {
        displayMessage('An error occurred: ' + error);
      });

      
    }

    const userType = userTypeSelector.value;
    if (userType === 'text') {
      textGenerate();
    }
    else if (userType === 'image') {
      imageGenerate();
    }
  }
});
