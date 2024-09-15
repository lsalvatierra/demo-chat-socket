$(document).ready(function () {
    var usernamePage = $('#username-page');
    var chatPage = $('#chat-page');
    var usernameForm = $('#usernameForm');
    var messageForm = $('#messageForm');
    var messageArea = $('#messageArea');
    var connectingElement = $('.connecting');
    var stompClient = null;
    var username = null;

    function conectarUsuario(event) {
        username = $('#name').val().trim();

        if (username) {
            usernamePage.addClass('d-none');
            chatPage.removeClass('d-none');

            var socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, onConnected, onError);
        }
        event.preventDefault();
    }

    function onConnected() {
        stompClient.subscribe('/topic/public', onMessageReceived);
        stompClient.send("/app/chat.addUser",
            {},
            JSON.stringify({sender: username, type: 'JOIN'})
        );
        connectingElement.addClass('d-none');
    }

    function onError() {
        connectingElement.text('Could not connect to WebSocket server. Please refresh this page to try again!');
        connectingElement.css('color', 'red');
    }

    function enviarMensaje(event) {
        var messageContent = $('#message').val().trim();
        if (messageContent && stompClient) {
            var chatMessage = {
                sender: username,
                content: messageContent,
                type: 'CHAT'
            };
            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            $('#message').val('');
        }
        event.preventDefault();
    }

    function onMessageReceived(payload) {
        var message = JSON.parse(payload.body);
        var messageElement = $('<li>').addClass('list-group-item');

        if (message.type === 'JOIN') {
            messageElement.addClass('event-message').text(message.sender + ' joined!');
        } else if (message.type === 'LEAVE') {
            messageElement.addClass('event-message').text(message.sender + ' left!');
        } else {
            var usernameElement = $('<strong>').text(message.sender);
            var textElement = $('<span>').text(message.content);
            messageElement.append(usernameElement).append(': ').append(textElement);
        }

        messageArea.append(messageElement);
        messageArea.scrollTop(messageArea[0].scrollHeight);
    }

    usernameForm.on('submit', conectarUsuario);
    messageForm.on('submit', enviarMensaje);
});
