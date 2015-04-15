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
    svg = drawGraph(appData.graphs[i], i);
    zoomListener(svg);
    //drawLegend(color);
    drawOnDemand();
    
    // Ativa (deixa azul) o grafo selecionado na lista lateral
    $(".graph_menu.active").removeClass("active");
    $("a.graph_menu[graphId="+i+"]").addClass("active");
    
    // Mostra o grafo desenhado
    $("#loading").hide();
    $("#graphs-area").show();
    $("#legend-area").show();
};

function refreshGraphWithFocus(i, vector) {
	computeSimilarity(appData, stats, vector);
	refreshGraph(i);
}

// Função auxiliar que define as cores para as categorias
function configureColors() {
    var labels = [];
    $.each( getGraphSet(), function(id, value) {
        labels.push(id);
    });
    labels.sort();
    color.domain(labels);
}


var getGraphSet = function(){ 
    var setCategories =  new Object();
    $.each(appData.graphs, function(id, graph){
        $.each(graph, function(node, categories){ 
            $.each(categories, function(categories, values) {
                setCategories[categories] = 1;
            });

        }); 
    });
    return setCategories;
};

// create the zoom listener
var zoomListener = d3.behavior.zoom()
  .scaleExtent([0.2, 5])
  .on("zoom", zoomHandler);

// function for handling zoom event
function zoomHandler() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    /*$.each(pies, function(k, pie) {
        pie.attr("transform",  "scale(-" + d3.event.scale + ")");
    });*/
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
    
    var height = $(window).height() - 10;
    var width = height;
    $("#graphs-area-content")
    	.width(width)
    	.height(height);

    var svg = d3.select("#graphs-area-content")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    var container = svg.append("g");
    
    // Desenha o background:
    
    var margin = 16;
    var mainRadius = (height - 2*margin)/2;
    var cx = mainRadius + margin;
    var cy = mainRadius + margin;
    
    drawMarkers(i, container, margin, mainRadius, cx, cy);
    
    drawEdges(graph, i, container,  mainRadius, radius, cx, cy);
    
    
    // Desenha os nodos
    $.each(graph, function(j, person) {
        var localData = [];
        $.each(person, function(k, category) {
            localData.push({category : k, count : category.length});
        });
        
        var xy = computeNodePosition(i, j, mainRadius, radius, cx, cy);
        
        var pPie = container.append("g").append("g")
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

        var label = pPie.append("text")
            .attr("dy", ".35em")
            .attr("class", "nodelabel")
            .attr("x", radius)
            .attr("y", radius)
            .style("text-anchor", "middle")
            .text("G"+i+"E"+j);

        label.on('click', function() {                            
            refreshGraphWithFocus(i, personToVector(person));
        });
        label.append("title").text("centralizar neste elemento");
        
        /*Informações*/
        var path = svg.selectAll('path.arc');
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
    
    drawCentroidMarker(i, container, margin, mainRadius, cx, cy);
    
    return svg;
};

/*Exibe os dados on-demand*/
function drawOnDemand(){


};


var drawMarkers = function(graph, container, margin, mainRadius, cx, cy){
	var categories = color.domain();
	var angleIncrement = 2 * Math.PI/categories.length;
	for (var i = 0; i < categories.length; i++) {
		var arcLegend = d3.svg.arc()
			.innerRadius(mainRadius)
			.outerRadius(mainRadius + margin)
			.startAngle(i * angleIncrement)
			.endAngle((i + 1) * angleIncrement);
		container.append("path")
			.attr("d", arcLegend)
			.attr("fill", color(categories[i]))
			.attr("transform", "translate("+cx+","+cy+")");
		container.append("text")
	    	.attr("x", cx + (8 + mainRadius) * Math.cos(i * angleIncrement + angleIncrement/2 - Math.PI/2))
	    	.attr("y", cy + (8 + mainRadius) * Math.sin(i * angleIncrement + angleIncrement/2 - Math.PI/2))
	    	.attr("dy", ".35em")
	    	.style("text-anchor", "middle")
	    	.style("font-weight", "bold")
	    	.attr("fill", "#ffffff")
	    	.text(categories[i])
	    ;
	}
	container.append("line")
    	.attr("x1", margin)
    	.attr("y1", margin + mainRadius)
    	.attr("x2", margin + 2*mainRadius)
    	.attr("y2", margin + mainRadius)
    	.attr("stroke", "#808080")
    	.attr("stroke-width", "1 px")
    ;
	container.append("line")
		.attr("x1", margin + mainRadius)
    	.attr("y1", margin)
    	.attr("x2", margin + mainRadius)
    	.attr("y2", margin + 2*mainRadius)
		.attr("stroke", "#808080")
		.attr("stroke-width", "1 px")
	;
	
}

function drawCentroidMarker(graph, container, margin, mainRadius, cx, cy) {
	//if (stats.centroid !== stats.baseline) {
		var centroidRadius = 4;
		var xy = computeCentroidPosition(mainRadius, cx, cy);
		var centroidMark = container.append("circle")
			.attr("class", "centroid")
			.attr("cx", xy[0])
			.attr("cy", xy[1])
			.attr("r", centroidRadius)
			.attr("fill", "#ffffff")
			.attr("stroke", "#000000")
		;
		centroidMark.on('click', function() {
			refreshGraphWithFocus(graph, stats.centroid);
		});
		centroidMark.append("title").text("centralizar no centróide");
	//}
}


// Executado no carregamento da pagina, para preencher com o grafo 0
$.getJSON("data.json", function(data){
    appData = data;
    loadMenu();
    configureColors();
    
    stats = computeStatistics(data);
    computeSimilarity(data, stats, stats.centroid);
    
    refreshGraph(0);
});


// Desenha as arestas entre os nodes
var drawEdges = function(graph,i, container,  mainRadius, radius, cx, cy){
    var getXY = function(i, j) {
        return computeNodePosition(i,j, mainRadius, radius, cx, cy);
    };
    var lineFunction =  function(x1,y1,x2,y2,peso) {
        container.append("line")
    	.attr("x1", x1+radius)
    	.attr("y1", y1+radius)
    	.attr("x2", x2+radius)
    	.attr("y2", y2+radius)
    	.attr("stroke", "gray")
    	.attr("stroke-width", peso/2);
    };
    getAllConnections(graph).forEach(function(node){
        var xy1 = getXY(i, node.p1);
        var xy2 = getXY(i, node.p2);
        
        lineFunction(xy1[0], xy1[1], xy2[0], xy2[1], node.value);
    });
};

// Funcao auxiliar construcao das arestas entre nodes
var getCategoriesSet = function(graph){ 
    var mapNodeId = new Object();
    $.each(graph, function(node, categories){ 
        var setId =  new Object();
        $.each(categories, function(categories, values) {
            values.forEach(function(value){
                if (value in setId)
                    setId[value]++;
                else
                    setId[value] = 1;
            });
        });
        mapNodeId[node] = setId; 
    }); 
    return mapNodeId;
};

// Funcao auxiliar construcao das arestas entre nodes
var getNConnections = function(nodeSet1, nodeSet2){
    var count =  0;
    $.each(nodeSet1, function(id, n){
        if (id in nodeSet2)
            count++;
    });
    return count;
};

// Funcao auxiliar construcao das arestas entre nodes
var getAllConnections = function(graph){
    var mapNodeId = getCategoriesSet(graph);
    var connections = [];
    var nodeKeys = Object.keys(mapNodeId); 
    for (i = 0; i < nodeKeys.length-1; i++) {
        for (j = i+1; j < nodeKeys.length; j++) {
            var connection = {
                p1 : nodeKeys[i],
                p2 : nodeKeys[j],
                value : getNConnections(mapNodeId[nodeKeys[i]],mapNodeId[nodeKeys[j]])
            };
            connections.push(connection);
        } 
    }   
    return connections;
};
