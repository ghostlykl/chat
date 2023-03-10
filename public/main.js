(function() {
    const app = document.querySelector("body");
    const socket = io();

    let uname;
    
    document.getElementById("username").addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            AuthUser();
          }
    });

    document.getElementById("message-input").addEventListener('keydown', function(event) {
        if (event.shiftKey && event.key === 'Enter') {
            this.value += '\n';
            event.preventDefault();
          } else if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
          }
    });

    const smileyButton = document.querySelector("#smiley-btn");
    const smileyDropdown = document.querySelector(".smiley-dropdown-content");
    smileyButton.addEventListener('click', () => {
        smileyDropdown.classList.toggle('show');
    });
    const smileys = document.querySelectorAll('.smiley');
    smileys.forEach((smiley) => {
        smiley.addEventListener('click', () => {
            const selectedSmiley = smiley.getAttribute('data-smiley');
            document.querySelector("#message-input").value += selectedSmiley;
        });
    });

    function sendMessage() {
        let message = app.querySelector("#message-input").value;
        if (message.trim().length === 0) {
            return;
        }
        renderMessage("me", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector("#message-input").value = "";
    }

    function AuthUser() {
        let username = app.querySelector("#username").value;
        if (username.length === 0) {
            return;
        }
        socket.emit("login", username);
        uname = username;

        app.querySelector(".container").classList.remove("blur-element");
        app.querySelector(".join-screen").style.display = "none";
    }

    app.querySelector("#join-chat-btn").addEventListener("click", function() {
        AuthUser();
    });
    
    app.querySelector("#send-message-btn").addEventListener("click", function(){
        sendMessage();
    });

    app.querySelector(".header #logout").addEventListener("click", function() {
        socket.emit("logout", uname);
        window.location.reload();
    });

    document.getElementById('message-input').addEventListener('keypress', () => {
        socket.emit('typing', { uname, message: '????????????????...' });
    });

    socket.on("update", function(update) {
        renderMessage("update", update);
    });
    socket.on("chat", function(message) {
        renderMessage("other", message);
    });
    socket.on('user-count', (count) => {
        document.getElementById('online-box').innerHTML = `Online: ${count}`;
      });
    socket.on('typing', ({ uname, message }) => {
        const typingMessageElement = document.getElementById('typing-message');
        typingMessageElement.innerHTML = `${uname} ${message}`;
        typingMessageElement.classList.add('visible');
        setTimeout(() => {
            typingMessageElement.classList.remove('visible');
        }, 3000);
    });

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".container .chat-box");
        if (type === "me") {
            let el = document.createElement("div");
            el.setAttribute("class", "message me-message");
            el.innerHTML = `
                <div style="background: #e0e0e0;">
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        } 
        // ?????????????????? ???? ???????????? ??????
        else if (type === "other") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div style="background: #ffc0cb">
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        }
        else if (type === "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

})();
