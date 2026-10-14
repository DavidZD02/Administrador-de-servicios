const socket = io();

socket.on("service:created", (service) => {
  const list = document.getElementById("services-list");
  if (!list) return;

  const card = document.createElement("article");
  card.className = "service-card";
  card.dataset.id = service._id;

  const title = document.createElement("h2");
  title.textContent = service.name;
  card.appendChild(title);

  const description = document.createElement("p");
  description.textContent = service.description;
  card.appendChild(description);

  const duration = document.createElement("p");
  duration.textContent = `Duración: ${service.duration} minutos`;
  card.appendChild(duration);

  const price = document.createElement("p");
  price.textContent = `Precio: $${service.price}`;
  card.appendChild(price);

  const category = document.createElement("p");
  category.textContent = `Categoría: ${service.category}`;
  card.appendChild(category);

  const available = document.createElement("p");
  available.textContent = service.available ? "Disponible" : "No disponible";
  card.appendChild(available);

  list.appendChild(card);
});
