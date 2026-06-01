// chatbot.js - widget de chat flotante con IA
// se puede incluir en cualquier pagina publica

const CHATBOT_API = 'http://localhost:5000/api/chatbot/preguntar';

// inyectamos los estilos del chat
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .chat-fab {
        position: fixed; bottom: 24px; right: 24px;
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        border: none; cursor: pointer; z-index: 1000;
        box-shadow: 0 6px 24px rgba(16,185,129,0.4);
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; transition: all 0.3s ease;
    }
    .chat-fab:hover { transform: scale(1.08); }
    .chat-window {
        position: fixed; bottom: 96px; right: 24px;
        width: 380px; max-width: calc(100vw - 48px); height: 520px;
        background: #151d2e; border: 1px solid #2a3649;
        border-radius: 18px; z-index: 1000; display: none;
        flex-direction: column; overflow: hidden;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: chatIn 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes chatIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
    .chat-window.open { display: flex; }
    .chat-header {
        padding: 18px 20px; background: linear-gradient(135deg, #10b981, #059669);
        display: flex; align-items: center; gap: 12px;
    }
    .chat-header-icon {
        width: 38px; height: 38px; background: rgba(255,255,255,0.2);
        border-radius: 10px; display: flex; align-items: center;
        justify-content: center; font-size: 20px;
    }
    .chat-header-title { font-size: 15px; font-weight: 700; color: #fff; }
    .chat-header-sub { font-size: 11px; color: rgba(255,255,255,0.8); }
    .chat-close {
        margin-left: auto; background: none; border: none; color: #fff;
        font-size: 22px; cursor: pointer; opacity: 0.8;
    }
    .chat-close:hover { opacity: 1; }
    .chat-body {
        flex: 1; padding: 18px; overflow-y: auto;
        display: flex; flex-direction: column; gap: 12px;
    }
    .chat-msg {
        max-width: 80%; padding: 11px 15px; border-radius: 14px;
        font-size: 14px; line-height: 1.5;
    }
    .chat-msg.bot {
        background: #1e293b; color: #e2e8f0; align-self: flex-start;
        border-bottom-left-radius: 4px;
    }
    .chat-msg.user {
        background: linear-gradient(135deg, #10b981, #059669); color: #fff;
        align-self: flex-end; border-bottom-right-radius: 4px;
    }
    .chat-typing { color: #64748b; font-size: 13px; font-style: italic; align-self: flex-start; }
    .chat-input-area {
        padding: 14px; border-top: 1px solid #2a3649; display: flex; gap: 8px;
    }
    .chat-input-area input {
        flex: 1; padding: 11px 15px; background: #0a0f1d;
        border: 1px solid #2a3649; border-radius: 10px; color: #f1f5f9;
        font-size: 14px; font-family: inherit;
    }
    .chat-input-area input:focus { outline: none; border-color: #10b981; }
    .chat-send {
        background: linear-gradient(135deg, #10b981, #059669); border: none;
        color: #fff; width: 44px; border-radius: 10px; cursor: pointer; font-size: 18px;
    }
`;
document.head.appendChild(chatStyles);

// inyectamos el HTML del chat
const chatHTML = document.createElement('div');
chatHTML.innerHTML = `
    <button class="chat-fab" onclick="toggleChat()">💬</button>
    <div class="chat-window" id="chat-window">
        <div class="chat-header">
            <div class="chat-header-icon">☪</div>
            <div>
                <div class="chat-header-title">Asistente Halal</div>
                <div class="chat-header-sub">Pregúntame sobre productos y tiendas</div>
            </div>
            <button class="chat-close" onclick="toggleChat()">×</button>
        </div>
        <div class="chat-body" id="chat-body">
            <div class="chat-msg bot">¡Hola! Soy tu asistente Halal. Puedo ayudarte a encontrar productos y tiendas verificadas. ¿Qué buscas?</div>
        </div>
        <div class="chat-input-area">
            <input type="text" id="chat-input" placeholder="Escribe tu pregunta..."
                   onkeydown="if(event.key==='Enter') enviarMensaje()">
            <button class="chat-send" onclick="enviarMensaje()">➤</button>
        </div>
    </div>
`;
document.body.appendChild(chatHTML);

// abre o cierra la ventana del chat
function toggleChat() {
    document.getElementById('chat-window').classList.toggle('open');
}

// añade un mensaje a la conversacion
function añadirMensaje(texto, tipo) {
    const body = document.getElementById('chat-body');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${tipo}`;
    msg.textContent = texto;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
}

// envia la pregunta al backend y muestra la respuesta
async function enviarMensaje() {
    const input = document.getElementById('chat-input');
    const pregunta = input.value.trim();
    if (!pregunta) return;

    añadirMensaje(pregunta, 'user');
    input.value = '';

    // mostramos "escribiendo..."
    const body = document.getElementById('chat-body');
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.textContent = 'El asistente está escribiendo...';
    typing.id = 'typing';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    try {
        const respuesta = await fetch(CHATBOT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta })
        });
        const datos = await respuesta.json();

        document.getElementById('typing')?.remove();

        if (respuesta.ok) {
            añadirMensaje(datos.respuesta, 'bot');
        } else {
            añadirMensaje('Lo siento, no estoy disponible ahora mismo.', 'bot');
        }
    } catch (error) {
        document.getElementById('typing')?.remove();
        añadirMensaje('Error de conexión. Inténtalo de nuevo.', 'bot');
    }
}