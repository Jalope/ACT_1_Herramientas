// Variables globales para el redimensionamiento
const container = document.getElementById("grafico-ventas");
let margin, width, height, svg, x, y;

function updateDimensions() {
    margin = { top: 20, right: 30, bottom: 30, left: 150 };
    width = container.offsetWidth - margin.left - margin.right;
    height = container.offsetHeight - margin.top - margin.bottom;
}

function handleResize() {
    if (svg && x && y) {
        updateDimensions();
        
        svg.select("svg")
           .attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);
        
        x.range([0, width]);
        y.range([0, height]);
        
        const tickValues = d3.range(0, x.domain()[1], 5000);
        
        svg.selectAll(".bar")
           .attr("y", d => y(d.Product))
           .attr("height", y.bandwidth())
           .attr("width", d => x(d['Quantity Ordered']));
        
        svg.select(".x-axis")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x).tickValues(tickValues))
           .selectAll("text")
           .style("font-size", "12px");
        
        svg.select(".y-axis")
           .call(d3.axisLeft(y))
           .selectAll("text")
           .style("font-size", "12px")
           .style("text-anchor", "start")
           .attr("x", -145);
    }
}

// Tooltip
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

// Inicializar dimensiones
updateDimensions();

// Crear SVG
svg = d3.select("#grafico-ventas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Carga de datos
d3.csv("data/productos_vendidos.csv").then(data => {
    data.forEach(d => {
        d['Quantity Ordered'] = +d['Quantity Ordered'];
    });

    data.sort((a, b) => b['Quantity Ordered'] - a['Quantity Ordered']);

    y = d3.scaleBand()
        .domain(data.map(d => d.Product))
        .range([0, height])
        .padding(0.2);

    x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d['Quantity Ordered'])])
        .range([0, width]);

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
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(tickValues))
        .selectAll("text")
        .style("font-size", "12px");

    // Eje Y
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .attr("x", -145);
});

// Evento de redimensionamiento
window.addEventListener("resize", handleResize);
