// -------------------------------------------------------
// Módulo: serieTemporal.js
// Descripción: Visualiza las ventas agrupadas por mes y por producto
// Caso de uso: Analizar estacionalidad y comparar volúmenes de ventas por producto.
// -------------------------------------------------------


// Definir márgenes y dimensiones del gráfico.
const margin = { top: 20, right: 30, bottom: 70, left: 60 },
      width = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Crear el contenedor SVG dentro del div asignado en index.html.
// Se asume que en index.html tienes un div con id="serie-temporal".
const svg = d3.select("#serie-temporal")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


 // Cargar y procesar el CSV con las agregaciones de ventas.
 d3.csv("./data/agrupado_por_mes_numero_de_ventas.csv").then(data => {
  
  // Convertir QuantityOrdered a número
  data.forEach(d => {
    d.QuantityOrdered = +d.QuantityOrdered;
    // Si es necesario, limpia o ajusta el valor de MesAño (por ejemplo, quitar espacios).
    d.MesAño = d.MesAño.trim();
  });

  // Extraer la lista única de meses y productos.
  const meses = Array.from(new Set(data.map(d => d.MesAño)));
  const productos = Array.from(new Set(data.map(d => d.Product)));

  // Escala principal en eje X: cada grupo corresponde a un mes.
  const xScale = d3.scaleBand()
    .domain(meses)
    .range([0, width])
    .padding(0.2);

  // Subescala para distribuir las barras de productos dentro de cada mes.
  const xSubgroup = d3.scaleBand()
    .domain(productos)
    .range([0, xScale.bandwidth()])
    .padding(0.05);

  // Escala para el eje Y (cantidad vendida).
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.QuantityOrdered)])
    .nice()
    .range([height, 0]);

  // Agregar eje X y girar las etiquetas para mayor legibilidad.
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Agregar eje Y.
  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Agrupar los datos por MesAño
  const dataPorMes = d3.group(data, d => d.MesAño); 

  // Dibujar las barras agrupadas: cada grupo (mes) contendrá las barras por producto.
  svg.selectAll("g.grupo-mes")
    .data(dataPorMes)
    .join("g")
      .attr("class", "grupo-mes")
      .attr("transform", d => `translate(${xScale(d[0])},0)`)
    .selectAll("rect")
    .data(d => d[1])  // d[1] contiene los registros del mes.
    .join("rect")
      .attr("x", d => xSubgroup(d.Product))
      .attr("y", d => yScale(d.QuantityOrdered))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - yScale(d.QuantityOrdered))
      .attr("fill", "steelblue");

}).catch(error => {
  console.error("Error al cargar el dataset:", error);
});