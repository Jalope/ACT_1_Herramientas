// Espera a que se cargue todo el DOM
document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("grafico-serie-temporal");
  let margin, width, height, svg, x, y, line;

  function updateDimensions() {
    margin = { top: 20, right: 30, bottom: 30, left: 50 };
    width = container.offsetWidth - margin.left - margin.right;
    height = container.offsetHeight - margin.top - margin.bottom;
  }

  /**
   * Función que carga un CSV, parsea los datos y dibuja la serie temporal.
   * @param {string} csvFile - Ruta del archivo CSV a cargar.
   * @param {string} dateFormat - Formato de la fecha para parsear (e.g., "%Y-%m-%d").
   */
  function loadChart(csvFile, dateFormat) {
    updateDimensions();
    // Elimina el SVG anterior (si existe) para limpiar el contenedor
    d3.select("#grafico-serie-temporal").select("svg").remove();

    // Carga el CSV
    d3.csv(csvFile).then(function(data) {
      // Define el parseador de fechas de acuerdo al formato proporcionado
      const parseDate = d3.timeParse(dateFormat);

      // Parsea los datos: convierte 'date' a objeto Date y 'Revenue' a número.
      data.forEach(d => {
        d.date = parseDate(d.date);
        d.revenue = +d.Revenue;  // Asegúrate de usar la letra mayúscula si así está en el CSV
      });

      // Ordena los datos por fecha ascendente (buena práctica para líneas de tiempo)
      data.sort((a, b) => d3.ascending(a.date, b.date));

      // Define las escalas para los ejes
      x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

      y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.revenue)])
            .range([height, 0]);

      // Crea el SVG dentro del contenedor #grafico-serie-temporal
      svg = d3.select("#grafico-serie-temporal")
        .append("svg")
          .attr("width",  width  + margin.left + margin.right)
          .attr("height", height + margin.top  + margin.bottom)
        .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // Añade el eje X (abajo) con fuente más grande
      svg.append("g")
         .attr("class", "x-axis")
         .attr("transform", `translate(0, ${height})`)
         .call(d3.axisBottom(x).ticks(6))
         .selectAll("text")
         .style("font-size", "12px");

      // Añade el eje Y (izquierda) con fuente más grande
      svg.append("g")
         .attr("class", "y-axis")
         .call(d3.axisLeft(y))
         .selectAll("text")
         .style("font-size", "12px");

      // Define la función generadora de la línea
      line = d3.line()
               .x(d => x(d.date))
               .y(d => y(d.revenue));

      // Dibuja la línea
      svg.append("path")
         .datum(data)
         .attr("class", "line")
         .attr("fill", "none")
         .attr("stroke", "steelblue")
         .attr("stroke-width", 2)
         .attr("d", line);

      // Añade círculos en cada punto de la línea para facilitar la interacción o visualización
      svg.selectAll("circle.point")
         .data(data)
         .enter()
         .append("circle")
           .attr("class", "point")
           .attr("cx", d => x(d.date))
           .attr("cy", d => y(d.revenue))
           .attr("r", 3)
           .attr("fill", "steelblue");
    })
    .catch(function(error) {
      console.error("Error al cargar o procesar el CSV:", error);
    });
  }

  function handleResize() {
    const currentWidth = container.offsetWidth;
    const currentHeight = container.offsetHeight;
    
    if (svg && x && y) {
      updateDimensions();
      
      svg.select("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
      
      x.range([0, width]);
      y.range([height, 0]);
      
      svg.select(".x-axis")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x).ticks(6))
         .selectAll("text")
         .style("font-size", "12px");
      
      svg.select(".y-axis")
         .call(d3.axisLeft(y))
         .selectAll("text")
         .style("font-size", "12px");
      
      svg.select(".line")
         .attr("d", line);
      
      svg.selectAll(".point")
         .attr("cx", d => x(d.date))
         .attr("cy", d => y(d.revenue));
    }
  }

  window.addEventListener("resize", handleResize);

  // Manejadores de eventos para los botones

  // Al hacer click en "Diaria", carga la serie temporal diaria.
  document.getElementById("btn-diaria").addEventListener("click", function() {
    loadChart("data/ventas_diarias.csv", "%Y-%m-%d");
  });

  // Mensual
  document.getElementById("btn-mensual").addEventListener("click", function() {
    loadChart("data/ventas_mensuales.csv", "%Y-%m");
  });

  // Carga por defecto la vista diaria al iniciar.
  loadChart("data/ventas_diarias.csv", "%Y-%m-%d");

});
