const socket = io();

const addLine = (card, tag, text, className) => {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  card.appendChild(element);
};

const countServices = (services) =>
  services.reduce((total, item) => total + item.quantity, 0);

const buildBookingCard = (booking) => {
  const card = document.createElement("article");
  card.className = "booking-card";
  card.dataset.id = booking._id;

  addLine(card, "h2", `Reserva #${booking._id}`);
  addLine(card, "p", `👤 Cliente: ${booking.clientName}`);
  addLine(card, "p", `📅 Fecha: ${booking.date}`);
  addLine(card, "p", `🕒 Hora: ${booking.time}`);
  addLine(card, "p", `Servicios: ${countServices(booking.services)}`, "booking-services");
  addLine(card, "p", `Estado: ${booking.status}`);

  return card;
};

socket.on("service:created", (service) => {
  const list = document.getElementById("services-list");
  if (!list) return;

  const card = document.createElement("article");
  card.className = "service-card";
  card.dataset.id = service._id;

  addLine(card, "h2", service.name);
  addLine(card, "p", service.description);
  addLine(card, "p", `Duración: ${service.duration} minutos`);
  addLine(card, "p", `Precio: $${service.price}`);
  addLine(card, "p", `Categoría: ${service.category}`);
  addLine(card, "p", service.available ? "Disponible" : "No disponible");

  list.appendChild(card);
});

socket.on("booking:created", (booking) => {
  const list = document.getElementById("bookings-list");
  if (!list) return;

  list.appendChild(buildBookingCard(booking));
});

socket.on("booking:updated", (booking) => {
  const card = document.querySelector(`.booking-card[data-id="${booking._id}"]`);
  if (!card) return;

  card.querySelector(".booking-services").textContent =
    `Servicios: ${countServices(booking.services)}`;
});

const form = document.getElementById("service-form");

if (form) {
  const message = document.getElementById("form-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      duration: Number(formData.get("duration")),
      price: Number(formData.get("price")),
      category: formData.get("category"),
      available: form.elements.available.checked,
    };

    socket.emit("service:create", data, (response) => {
      if (response.status === "success") {
        form.reset();
        form.elements.available.checked = true;
        message.textContent = "Servicio creado correctamente";
        message.className = "form-message success";
      } else {
        message.textContent = response.message;
        message.className = "form-message error";
      }
    });
  });
}