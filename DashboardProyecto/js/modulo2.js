const map = L.map('map');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

//Contenedor SVG sobre el mapa
const pane = map.getPanes().overlayPane;
const svg = d3.select(pane).append("svg")
  .attr("class", "leaflet-zoom-hide")
  .style("z-index", 500)
  .style("position", "absolute");

const g = svg.append("g").attr("class", "leaflet-zoom-hide");
const tooltip = d3.select("#tooltip");
const selector = document.getElementById("mes-selector");

let dataGlobal = [];

d3.dsv(";", "data/Ventas_mapa.csv").then(data => {
  data.forEach(d => {
    d.lat = +d.latitud;
    d.lng = +d.longitud;
    d.valor_ventas = +d.val_ventas;
    d.cantidad_ventas = +d.cant_ventas;
    d.mes = d.mes.padStart(2, "0");
  });

  dataGlobal = data;

  const radio = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.cantidad_ventas)])
    .range([4, 30]);

  const color = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, d3.max(data, d => d.valor_ventas)]);

  const puntos = g.selectAll("circle");



  function render(month) {
    const mesData = dataGlobal.filter(d => d.mes === month);
    const join = puntos.data(mesData, d => d.localidad);

    join.enter()
      .append("circle")
      .attr("r", d => radio(d.cantidad_ventas))
      .attr("fill", d => color(d.valor_ventas))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("opacity", 0.85)
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`<strong>${d.localidad}</strong><br/>Ventas: $${d.valor_ventas.toLocaleString()}<br/>Transacciones: ${d.cantidad_ventas.toLocaleString()}`);
      })

      .on("mousemove", event => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"))
      .merge(join)
      .transition()
      .duration(500)
      .attr("r", d => radio(d.cantidad_ventas))
      .attr("fill", d => color(d.valor_ventas));

    join.exit().remove();

    update();
  }


  function update() {
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    svg
      .attr("width", bottomRight.x - topLeft.x)
      .attr("height", bottomRight.y - topLeft.y)
      .style("left", topLeft.x + "px")
      .style("top", topLeft.y + "px");

    g.attr("transform", `translate(${-topLeft.x},${-topLeft.y})`);

    g.selectAll("circle")
      .attr("cx", d => map.latLngToLayerPoint([d.lat, d.lng]).x)
      .attr("cy", d => map.latLngToLayerPoint([d.lat, d.lng]).y);

  }

  map.on("zoomend", update);
  map.on("moveend", update);


  selector.addEventListener("change", (e) => {
    render(e.target.value);
  });


  map.fitBounds(data.map(d => [d.lat, d.lng]));
  render(selector.value);

  crearLeyenda(); // llamada a la función que genera la leyenda

});



// Reproducción automática
const playButton = document.getElementById("play-button");
let isPlaying = false;
let interval;

playButton.addEventListener("click", () => {
  if (!isPlaying) {
    isPlaying = true;
    playButton.textContent = "⏸ Pausar";
    let currentMonth = parseInt(selector.value, 10);
    interval = setInterval(() => {
      currentMonth = currentMonth < 12 ? currentMonth + 1 : 1;
      const value = String(currentMonth).padStart(2, "0");
      selector.value = value;
      selector.dispatchEvent(new Event("change"));
    }, 1500);
  } else {
    isPlaying = false;
    playButton.textContent = "▶ Reproducir";
    clearInterval(interval);
  }



});

function crearLeyenda() {
  const legend = d3.select("#legend");
  legend.html(""); // Limpia si ya existía contenido

  // Escala de color (valor de ventas)
  const valoresColor = [50000, 100000, 200000, 300000];
  const color = d3.scaleSequential(d3.interpolateYlOrBr)
    .domain([0, 300000]);

  legend.append("div")
    .attr("class", "legend-title")
    .text("Valor de ventas");

    const colorItems = legend.selectAll(".color-legend-item")
    .data(valoresColor)
    .enter()
    .append("div")
    .attr("class", "legend-item legend-section");

    colorItems.append("div")
    .attr("class", "legend-item-circle")
    .style("background-color", d => color(d));

  colorItems.append("span").text(d => `$${d.toLocaleString()}`);

  // Separador
  legend.append("hr").style("margin", "8px 0");

  // Escala de tamaño (cantidad de ventas)
  const valoresTam = [500, 1000, 1500];
  const radioEscala = d3.scaleSqrt().domain([0, 1500]).range([1, 14]);

  legend.append("div")
  .attr("class", "legend-title")
  .text("Cantidad de ventas");

  const sizeItems = legend.selectAll(".size-legend-item")
  .data(valoresTam)
  .enter()
  .append("div")
  .attr("class", "legend-item");

  sizeItems.append("svg")
    .attr("width", 30)
    .attr("height", 30)
    .append("circle")
    .attr("cx", 15)
    .attr("cy", 15)
    .attr("r", d => radioEscala(d))
    .attr("fill", "#ccc")
    .attr("stroke", "#999");

  sizeItems.append("span")
    .style("margin-left", "6px")
    .text(d => d);
}
