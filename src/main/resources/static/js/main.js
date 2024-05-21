'use strict';

let usernamePage = document.querySelector('#username-page');
let chatPage = document.querySelector('#chat-page');
let usernameForm = document.querySelector('#username-form');
let messageForm = document.querySelector('#message-form');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#message-area');
let connectingElement = document.querySelector('.connecting');

let stompClient = null;
let username = null;

let colors = [
    '#000000','#FFFFFF','#FFA500','#A020F0',
    '#FF0000','#FFC0CB','#0A00FF','#00FFA5'
]



function connect(event){
    username = document.querySelector('#name').value.trim();
    if (username){
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        let socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnectSuccess, onError);

    }
    event.preventDefault();
}

function onConnectSuccess(){
    stompClient.subscribe('/topic/public', onMessageReceive);

    stompClient.send('/app/messenger.addUser',
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
    connectingElement.classList.add('hidden');
}

function onError(error){
    connectingElement.textContent = 'Could not connect. Please refresh the page and try again.';
    connectingElement.style.color = 'red';
}

function sendMessage(event){
    let messageText = messageInput.value.trim();
    if (messageText && stompClient) {
        let message = {
            sender: username,
            content: messageText,
            type: 'CHAT'
        };

        stompClient.send(
            '/app/messenger.sendMessage',
            {},
            JSON.stringify(message)
        );
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceive(payload){
    let message = JSON.parse(payload.body);
    let messageElement = document.createElement('li');

    if (message.type === 'JOIN'){
        messageElement.classList.add('event-message');
        message.content = message.sender + ' has joined!';
    } else if (message.type === 'LEAVE'){
        messageElement.classList.add('event-message');
        message.content = message.sender + ' has left!';
    } else {
        messageElement.classList.add('chat-message');

        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    let textElement = document.createElement('p');
    let messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}



function getAvatarColor(msgSender){
    let hash = 0;
    for (let i = 0; i < msgSender.length; i++) {
        hash = 31 * hash + msgSender.charCodeAt(i);
    }
    let index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
