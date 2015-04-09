// Variavel que armazena os dados do problema
// É um mapa que contém os grafos e as distancias entre todos vertices de todos os grafos
var appData;

// Função que carrega o menu à esquerda (lista de grafos)
function loadMenu() {
    $.each(appData.graphs, function(i, object){
        jQuery('<a/>', {
            class: 'list-group-item text-center graph_menu',
            text: 'Grafo '+i,
            graphId: i,
            style: "cursor:pointer"
        }).click(function(event){
            refreshGraph($(event.target).attr("graphId"));
        }).appendTo('.list-group');
    });
}; 

// Função que trata a mudança de grafos (clique em um grafo da lista lateral)
function refreshGraph(i) {
    // Escode o grafo e apresenta um gif loading
    $("#graphs-area").hide();
    $("#legend-area").hide();
    $("#loading").show();
    
    // Chama a função que realmente desenha o grafo e a legenda
    drawGraph(appData.graphs[i], i);
    drawLegend(color);
    
    // Ativa (deixa azul) o grafo selecionado na lista lateral
    $(".graph_menu.active").removeClass("active");
    $("a.graph_menu[graphId="+i+"]").addClass("active");
    
    // Mostra o grafo desenhado
    $("#loading").hide();
    $("#graphs-area").show();
    $("#legend-area").show();
};

// Função auxiliar que define as cores para as categorias
function configureColors() {
    var labels = [];
    for(var c = 'A'.charCodeAt(0); c <= 'Z'.charCodeAt(0); c++ ) {
        labels.push(String.fromCharCode(c));
    }
    
    color.domain(labels);
}


// Raio de uma "rosquinha"
var radius = 74,
    padding = 10; 

// Intervalo de cores disponiveis
var color = d3.scale.ordinal()
    .range(["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6","#1f77b4	","#aec7e8	","#ff7f0e	","#ffbb78	","#2ca02c	","#98df8a	","#d62728	","#ff9896	","#9467bd	","#c5b0d5	","#8c564b	","#c49c94	","#e377c2	","#f7b6d2	","#7f7f7f	","#c7c7c7	","#bcbd22	","#dbdb8d	","#17becf	","#9edae5"]);

// ....
var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - 30);

// ....
var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

// Função que desenha um dado grafo na area reservada do html
var drawGraph = function(graph, i){
    $("#graphs-area-content").empty();
    
    $("#graphs-area-content").width(1500);

    var svg = d3.select("#graphs-area-content")
        .append("svg")
        .attr("width", 1500)
        .attr("height", 500);
    
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

// Função que desenha a legenda na area reservada do html
var drawLegend = function(color){
    $("#legend-area-content").empty();
    
    var legend = d3.select("#legend-area-content")
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


// Executado no carregamento da pagina, para preencher com o grafo 0
$.getJSON("data.json", function(data){
    appData = data;
    loadMenu();
    configureColors();
    refreshGraph(0);
});