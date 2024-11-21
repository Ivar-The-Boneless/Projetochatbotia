const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Páginas e arquivos estáticos
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Fluxo de conversa
const chatbotResponses = {
  welcome: "Olá! Bem-vindo(a) à nossa pousada em Maceió 🌴. Escolha uma opção:\n1️⃣ Fazer uma reserva de quarto.\n2️⃣ Saber mais sobre nossa pousada e serviços.\n3️⃣ Dicas sobre pontos turísticos de Maceió.",
  reservation: {
    askDates: "Qual é o período da sua estadia? (Ex.: 10/12 a 15/12)",
    askRoomType: "Qual tipo de quarto você prefere? 🛏️ Standard, 🛌 Luxo ou 👨‍👩‍👧 Familiar?",
    confirm: (dates, roomType, totalValue) =>
      `Você escolheu o quarto ${roomType} para o período ${dates}. O valor será R$${totalValue}. Deseja confirmar? (Sim/Não)`,
    success: "Sua reserva foi confirmada 🎉! Enviaremos um e-mail com os detalhes.",
  },
  faq: {
    cancelPolicy:
      "Nossa política de cancelamento permite cancelamentos gratuitos até 48 horas antes do check-in. Após isso, será cobrada uma taxa de 50%.",
    checkInOut: "O check-in começa às 14h e o check-out é até às 12h.",
  },
  tourism: {
    beaches:
      "🏖️ **Praia do Francês**: Relaxamento e esportes aquáticos.\n🌊 **Pajuçara**: Piscinas naturais.\n🐚 **Praia de Ipioca**: Refúgio tranquilo.",
    restaurants:
      "🍤 **Restaurante Wanchako**: Frutos do mar.\n🥘 **Imperador dos Camarões**: Chiclete de camarão.\n🍹 **Massagueirinha**: Drinks e petiscos.",
    culture:
      "🎭 **Teatro Deodoro**: Peças teatrais.\n🛍️ **Feirinha da Pajuçara**: Artesanatos.\n🖼️ **Museu Théo Brandão**: Cultura alagoana.",
  },
};

// Gerenciar o fluxo de conversa
io.on("connection", (socket) => {
  console.log("Novo usuário conectado!");

  socket.emit("message", chatbotResponses.welcome);

  let step = "welcome";
  let reservation = {};

  socket.on("userMessage", (msg) => {
    msg = msg.toLowerCase();

    switch (step) {
      case "welcome":
        if (msg.includes("1")) {
          step = "reservationDates";
          socket.emit("message", chatbotResponses.reservation.askDates);
        } else if (msg.includes("2")) {
          step = "faq";
          socket.emit(
            "message",
            "Perguntas frequentes:\n1️⃣ Políticas de cancelamento.\n2️⃣ Check-in e Check-out.\nEscolha uma opção."
          );
        } else if (msg.includes("3")) {
          step = "tourism";
          socket.emit(
            "message",
            "Dicas turísticas:\n1️⃣ Praias.\n2️⃣ Restaurantes.\n3️⃣ Cultura.\nEscolha uma opção."
          );
        } else {
          socket.emit("message", "Por favor, escolha uma opção válida!");
        }
        break;

      case "reservationDates":
        reservation.dates = msg;
        step = "reservationRoom";
        socket.emit("message", chatbotResponses.reservation.askRoomType);
        break;

      case "reservationRoom":
        reservation.roomType = msg;
        const totalValue = 500; // Simulando valor fixo
        step = "reservationConfirm";
        socket.emit(
          "message",
          chatbotResponses.reservation.confirm(
            reservation.dates,
            reservation.roomType,
            totalValue
          )
        );
        break;

      case "reservationConfirm":
        if (msg.includes("sim")) {
          step = "welcome";
          socket.emit("message", chatbotResponses.reservation.success);
          socket.emit("message", chatbotResponses.welcome);
        } else {
          step = "welcome";
          socket.emit("message", "Reserva cancelada. Volte quando quiser!");
          socket.emit("message", chatbotResponses.welcome);
        }
        break;

      case "faq":
        if (msg.includes("1")) {
          socket.emit("message", chatbotResponses.faq.cancelPolicy);
        } else if (msg.includes("2")) {
          socket.emit("message", chatbotResponses.faq.checkInOut);
        }
        step = "welcome";
        socket.emit("message", chatbotResponses.welcome);
        break;

      case "tourism":
        if (msg.includes("1")) {
          socket.emit("message", chatbotResponses.tourism.beaches);
        } else if (msg.includes("2")) {
          socket.emit("message", chatbotResponses.tourism.restaurants);
        } else if (msg.includes("3")) {
          socket.emit("message", chatbotResponses.tourism.culture);
        }
        step = "welcome";
        socket.emit("message", chatbotResponses.welcome);
        break;

      default:
        socket.emit("message", "Desculpe, não entendi. Tente novamente!");
    }
  });   
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
