// ------------------------------
//     serieTemporal.js
// ------------------------------

/**
 * Este script dibujará un gráfico de líneas (serie temporal)
 * leyendo datos de un CSV ubicado en /data/ventas_diarias.csv
 */

// 1. Definir dimensiones y márgenes del gráfico
const margin = { top: 20, right: 30, bottom: 30, left: 50 },
      width  = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// 2. Crear el contenedor SVG y un "g" principal
const svg = d3.select("#serie-temporal")
  .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// 3. Cargar los datos del CSV
//    Asegúrate de que tu archivo se llame como tú decidas (ej. ventas_diarias.csv)
//    y que tenga columnas "date" y "revenue"
d3.csv("data/ventas_diarias.csv").then(function(data) {

  // 3.1 Parsear el formato de fecha según tu CSV
  //     Si tu fecha es "2019-01-15", con año-mes-día:
  const parseDate = d3.timeParse("%Y-%m-%d");
  
  // 3.2 Convertir cada fila a los tipos adecuados
  data.forEach(d => {
    d.date    = parseDate(d.date);     // convierte texto a fecha
    d.Revenue = +d.Revenue;           // convierte texto a número
  });

  // 3.3 Ordenar datos por fecha (opcional pero recomendable)
  data.sort((a, b) => d3.ascending(a.date, b.date));

  // 4. Definir las escalas en base a los datos
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))  // mínimo y máximo de la fecha
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Revenue)]) // de 0 al máx de ingresos
    .range([height, 0]);

  // 5. Dibujar los ejes (abajo para X, izquierda para Y)
  const xAxis = d3.axisBottom(x).ticks(6); // .ticks(6) sugiere ~6 divisiones
  const yAxis = d3.axisLeft(y);

  svg.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(xAxis);

  svg.append("g")
     .call(yAxis);

  // 6. Generador de línea
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.Revenue));

  // 7. Dibujar la línea
  svg.append("path")
     .datum(data)                // bind array completo
     .attr("fill", "none")       // sin relleno
     .attr("stroke", "steelblue")// color de la línea
     .attr("stroke-width", 2)
     .attr("d", line);

  // (Opcional) 8. Añadir círculos en cada punto
  svg.selectAll("circle.point")
     .data(data)
     .enter()
     .append("circle")
       .attr("class", "point")
       .attr("cx", d => x(d.date))
       .attr("cy", d => y(d.Revenue))
       .attr("r", 3)
       .attr("fill", "steelblue");

  // (Opcional) 9. Podrías implementar tooltips, transiciones, etc.

}).catch(function(error) {
  console.error("Error al cargar o procesar el CSV:", error);
});