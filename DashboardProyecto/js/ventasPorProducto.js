// Dimensiones
const margin = { top: 20, right: 30, bottom: 30, left: 150 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Crear SVG
const svg = d3.select("#grafico-ventas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip para mostrar las unidades de cada producto 
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.15)")
    .style("position", "absolute")
    .style("pointer-events", "none");

// Carga de datos preprocesados
d3.csv("data/productos_vendidos.csv").then(data => {
    data.forEach(d => {
        d['Quantity Ordered'] = +d['Quantity Ordered'];
    });

    data.sort((a, b) => b['Quantity Ordered'] - a['Quantity Ordered']);

    const y = d3.scaleBand()
        .domain(data.map(d => d.Product))
        .range([0, height])
        .padding(0.2);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['Quantity Ordered'])])
        .range([0, width]);

    // reducción de la escala horizontal
    const tickValues = d3.range(0, d3.max(data, d => d['Quantity Ordered']), 5000);

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.Product))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d['Quantity Ordered']))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.Product}</strong><br/>${d['Quantity Ordered']} unidades`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Eje X
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(tickValues));

    // Eje Y (etiquetas alineadas a la izquierda)
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("text-anchor", "start") // alineación a la izquierda
        .attr("x", -150);

});
