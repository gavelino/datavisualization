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
    
    var width = 1200;
    var height = 600;
    $("#graphs-area-content").width(width);

    var svg = d3.select("#graphs-area-content")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    $.each(graph, function(j, person) {
        var localData = [];
        $.each(person, function(k, category) {
            localData.push({category : k, count : category.length});
        });
        
        var xPosition = computeXPosition(i, j, person, width, radius);
        var yPosition = computeYPosition(i, j, person, height, radius);
        
        var pPie = svg.append("g")
            //.attr("transform", "translate(" + (j-1)*radius*2 + "," + yPosition + ")")
            .attr("transform", "translate(" + xPosition + "," + yPosition + ")")
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
            .attr("transform", "translate(" + radius + "," + radius + ")")
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



// Daqui para baixo são funcões para calcular a similaridade e posição das pessoas.
function computeStatistics(appData) {
	var n = 0;
	var centroid = personToVector({});
	var maxNorm = 0;
	var minNorm = 1000;
	var idf = personToVector({});
	var sim = {};
	
	for (var graph in appData.graphs) {
		for (var p in appData.graphs[graph]) {
			var vector = personToVector(appData.graphs[graph][p]);
			for (var i = 0; i < vector.length; i++) {
				centroid[i] += vector[i];
				if (vector[i] > 0) {
					idf[i]++;
				}
			}
			var norm = vectorNorm(vector);
			maxNorm = Math.max(maxNorm, norm);
			minNorm = Math.min(minNorm, norm);
			n++;
		}
	}
	for (var i = 0; i < centroid.length; i++) {
		centroid[i] = centroid[i] / n;
		idf[i] = Math.log(n/(1 + idf[i]));
	}
	var minSim = 1;
	var maxSim = 0;
	for (var graph in appData.graphs) {
		sim[graph] = {};
		for (var p in appData.graphs[graph]) {
			var person = appData.graphs[graph][p];
			var vector = personToVector(person);
			sim[graph][p] = cosineSimilarity(vector, centroid);
			minSim = Math.min(minSim, sim[graph][p]);
			maxSim = Math.max(maxSim, sim[graph][p]);
		}
	}
	return {
		n: n,
		centroid: centroid,
		idf: idf,
		maxNorm: maxNorm,
		minNorm: minNorm,
		minSim: minSim,
		maxSim: maxSim,
		sim: sim
	};
}

function personToVector(personData) {
	var charCodeA = "A".charCodeAt(0);
	var charCodeZ = "Z".charCodeAt(0);
	var vector = [];
	for (var i = charCodeA; i <= charCodeZ; i++) {
		var locations = personData[String.fromCharCode(i)] || [];
		vector.push(locations.length);
	}
	return vector;
}

function cosineSimilarity(vector1, vector2) {
	var r = vectorDotProduct(vector1, vector2) / (vectorNorm(vector1) * vectorNorm(vector2));
	return r;
}
//function centeredCosineSimilarity(vector1, vector2) {
//	var avg = personToVector({});
//	var v1 = personToVector({});
//	var v2 = personToVector({});
//	avg = vectorAvg(avg, vector1, vector2);
//	v1 = vectorMinus(v1, vector1, avg);
//	v2 = vectorMinus(v2, vector2, avg);
//	return cosineSimilarity(v1, v2);
//}
//function vectorAvg(result, vector1, vector2) {
//	for (var i = 0; i < result.length; i++) {
//		result[i] = (vector1[i] + vector2[i]) / 2;
//	}
//	return result;
//}
//function vectorMinus(result, vector1, vector2) {
//	for (var i = 0; i < result.length; i++) {
//		result[i] = vector1[i] - vector2[i];
//	}
//	return result;
//}
function vectorNorm(vector1) {
	var norm = 0;
	for (var i = 0; i < vector1.length; i++) {
		norm += vector1[i] * vector1[i];
	}
	return Math.sqrt(norm);
}
function vectorDotProduct(vector1, vector2) {
	var result = 0;
	for (var i = 0; i < vector1.length; i++) {
		result += vector1[i] * vector2[i];
	}
	return result;
}
function computeXPosition(i, j, person, width, radius) {
	return ((stats.maxSim - stats.sim[i][j])/(stats.maxSim - stats.minSim)) * (width - 2*radius);
}
function computeYPosition(i, j, person, height, radius) {
	var norm = vectorNorm(personToVector(person));
	var delta = (stats.maxNorm - norm) / (stats.maxNorm - stats.minNorm);
	var pos = (delta * (height - 2*radius));
	return pos;
}
