var appData;

function loadMenu() {
    $.each(appData.graphs, function(i, object){
        jQuery('<a/>', {
            id: 'graph'+i,
            href: '#',
            class: 'list-group-item text-center ' + (i == 0? 'active' : ''),
            text: 'Grafo '+i
        }).appendTo('.list-group');
    });
};

function configureColors() {
    var labels = [];
    for(var c = 'A'.charCodeAt(0); c <= 'Z'.charCodeAt(0); c++ ) {
        labels.push(String.fromCharCode(c));
    }
    
    color.domain(labels);
}

var radius = 74,
    padding = 10;

var color = d3.scale.ordinal()
    .range(["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6","#1f77b4	","#aec7e8	","#ff7f0e	","#ffbb78	","#2ca02c	","#98df8a	","#d62728	","#ff9896	","#9467bd	","#c5b0d5	","#8c564b	","#c49c94	","#e377c2	","#f7b6d2	","#7f7f7f	","#c7c7c7	","#bcbd22	","#dbdb8d	","#17becf	","#9edae5"]);

var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - 30);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

var drawGraph = function(graph, i){
    // Prepara regiao para os graficos de cada grafo
    var svg = d3.select("#graphs-area")
        .append("svg")
        .attr("width", 1500)
        .attr("height", 1500);
    
    $.each(graph, function(j, person) {
        var localData = [];
        $.each(person, function(k, category) {
            localData.push({category : k, count : category.length});
        });
        
        var pPie = svg.append("g")
            .attr("transform", "translate(" + (j-1)*radius*2 + "," + radius + ")")
            .selectAll(".arc")
            .data(function(d) { return pie(localData); })
            .enter();
        
        pPie.append("path")
            .attr("class", "arc")
            .attr("d", arc)
            .attr("transform", "translate(" + radius + "," + radius + ")")
            .style("fill", function(d) {
                return color(d.data.category);
            })
            .append("title").text(function(d){return d.value;});

        pPie.append("text")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text("G"+i+"E"+j);
        
        
        
    });
};

var drawLegend = function(color){
    var legend = d3.select("#legend-area")
        .append("svg")
        .attr("class", "legend")
        .attr("width", radius * 2)
        .attr("height", radius * 8)
        .selectAll("g")
        .data(color.domain().slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });
};

$.getJSON("data.json", function(data){
    appData = data;
    loadMenu();
    configureColors();
    drawGraph(appData.graphs[0], 0);
    drawLegend(color);
    $("#loading").hide();
    $("#graphs-area").show();
    $("#legend-area").show();
});