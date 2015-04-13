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
    drawOnDemand();
    
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
var radius = 60,
    padding = 10; 

// Intervalo de cores disponiveis
var color = d3.scale.ordinal()
    .range(["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6","#1f77b4	","#aec7e8	","#ff7f0e	","#ffbb78	","#2ca02c	","#98df8a	","#d62728	","#ff9896	","#9467bd	","#c5b0d5	","#8c564b	","#c49c94	","#e377c2	","#f7b6d2	","#7f7f7f	","#c7c7c7	","#bcbd22	","#dbdb8d	","#17becf	","#9edae5"]);

// ....
var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(radius - 20);

// ....
var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

// Função que desenha um dado grafo na area reservada do html
var drawGraph = function(graph, i){
    $("#graphs-area-content").empty();
    
    var width = 900;
    var height = 900;
    $("#graphs-area-content").width(width);

    var svg = d3.select("#graphs-area-content")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    svg.append("circle")
    	.attr("cx", width/2)
    	.attr("cy", width/2)
    	.attr("r", width/2)
    	.attr("stroke", "#404040")
    	.attr("stroke-width", "1 px")
    	.attr("fill", "none")
    ;
    svg.append("line")
    	.attr("x1", 0)
    	.attr("y1", height/2)
    	.attr("x2", width)
    	.attr("y2", height/2)
    	.attr("stroke", "#404040")
    	.attr("stroke-width", "1 px")
    ;
    svg.append("line")
	    .attr("x1", width/2)
	    .attr("y1", 0)
	    .attr("x2", width/2)
	    .attr("y2", height)
	    .attr("stroke", "#404040")
	    .attr("stroke-width", "1 px")
    ;
    
    //<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
    
    $.each(graph, function(j, person) {
        var localData = [];
        $.each(person, function(k, category) {
            localData.push({category : k, count : category.length});
        });
        
        var xy = computePosition(i, j, person, width, height, radius);
        
        var pPie = svg.append("g")
            //.attr("transform", "translate(" + (j-1)*radius*2 + "," + yPosition + ")")
            .attr("transform", "translate(" + xy[0] + "," + xy[1] + ")")
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
            //.append("title").text(function(d){return d.value;});

        pPie.append("text")
            .attr("dy", ".35em")
            //.attr("transform", "translate(" + radius + "," + radius + ")")
            .attr("x", radius)
            .attr("y", radius)
            .style("text-anchor", "middle")
            .text("G"+i+"E"+j);


        /*Informações*/
        var path = svg.selectAll('path');
        var tooltip = d3.select('#graphs-area-content')                               
            .append('div')                                                
            .attr('class', 'tooltip2');                                    
          
        tooltip.append('div')                                           
            .attr('class', 'label');                                      

        tooltip.append('div')                                           
            .attr('class', 'count');                                      

        tooltip.append('div')                                           
          .attr('class', 'percent');                                    

        path.on('mouseover', function(d) {                            
            var total = d3.sum(localData.map(function(d) {                
              return d.count;                                           
            }));                                                        
            var percent = Math.round(1000 * d.data.count / total) / 10; 
            tooltip.select('.label').html(d.data.category);                
            tooltip.select('.count').html(d.data.count);                
            tooltip.select('.percent').html(percent + '%');             
            tooltip.style('display', 'block');                          
            tooltip.style('top', (d3.event.pageY + 10) + 'px')          
                .style('left', (d3.event.pageX - 450) + 'px');             
        });                                                           

        path.on('mouseout', function() {                              
            tooltip.style('display', 'none');                           
        });                                                           
    });
};

/*Exibe os dados on-demand*/
function drawOnDemand(){


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
    
    stats = computeStatistics(data);
    
    refreshGraph(0);
});

