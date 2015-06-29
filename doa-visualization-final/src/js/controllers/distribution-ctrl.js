/**
 * Distribution Controller
 */

angular
    .module('RDash')
    .controller('DistributionCtrl', ['$scope', DistributionCtrl]);

function DistributionCtrl($scope) {
  $('.breadcrumb-links').text('Home / Distribution');

  var width = document.getElementById("viz1").offsetWidth,
  height = width/2,
  radius = Math.min(width, height) / 3,
  padding = 5,
  duration = 500;;

  var x = d3.scale.linear()
      .range([0, 2 * Math.PI]);

  var y = d3.scale.sqrt()
      .range([0, radius  + 100]);

  var color = d3.scale.category20c();
  var allAuthors;
  // Intervalo de cores disponiveis
  //var color = d3.scale.ordinal()
      
  // Função auxiliar que define as cores para as categorias
  function configureColors() {
      var labels = [];
      $.each( getGraphSet(), function(id, value) {
          labels.push({"id":id, "value": value});
      });
      labels.sort(function(a, b){
                      return  b.value-a.value;
      });
      //labels.push("other");
      var newlabels = [];
      labels.forEach(function(x){newlabels.push(x.id);});
      color.domain(newlabels);
  }


  var getGraphSet = function(){ 
      var newAuthors =  new Object();
      $.each(allAuthors, function(author, values) {
          newAuthors[author] = values;
      });
      return newAuthors;
  };
      
      
  var svg = d3.select("#viz1").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

  var partition = d3.layout.partition()
      .sort(null)
      .value(function(d) { return 1; });

  var arc = d3.svg.arc()
      .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
      .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
      .innerRadius(function(d) { return Math.max(0, y(d.y)); })
      .outerRadius(function(d) { 
          return Math.max(0, y(d.y + d.dy)); });

  // Keep track of the node that is currently being displayed as the root.
  var node;
  function brightness(rgb) {
    return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
  }
      
  function isParentOf(p, c) {
    if (p === c) return true;
    if (p.children) {
      return p.children.some(function(d) {
        return isParentOf(d, c);
      });
    }
    return false;
  }
      
  "#6baed6"
  function getAuthors(node, authors){
      if ("author" in node) {
          var author = node.author;
          if (author in authors){
              authors[author]++;
          }
          else 
              authors[author] = 1;
      }
      if("children" in node){
          node.children.forEach(function(child){
                  authors = getAuthors(child, authors);
          });                       
      }
      return authors;    
  }    
      
  function getBestAuthor(node){
      var bestValue = 0;
      var bestAuthor;
      $.each(getAuthors(node, new Object()), function(id, value) {
          if (value>bestValue){
              bestValue = value;
              bestAuthor = id;
          }
      });
      return bestAuthor;
  }
  d3.json("/data/repositories/activeadmin.json", function(error, root) {
    node = root;
    allAuthors = getAuthors(root, new Object());
    configureColors();
      
    var nodes = partition.nodes;
    var path = svg.datum(root).selectAll("path")
        .data(nodes)
      .enter().append("path")
        .attr("d", arc)
  //      .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
        .style("fill", function(d) { 
            return color(d.author ? d.author : getBestAuthor(d)); })
        .on("click", click)
        .each(stash);

    d3.selectAll("input").on("change", function change() {
      var value = this.value === "author"
          ? function() { return 1; }
          : function(d) { return d.size; };

      path
          .data(partition.value(value).nodes)
        .transition()
          .duration(1000)
          .attrTween("d", arcTweenData);
    });
      
    //NEW
    var text = svg.selectAll("text").data(nodes);
    var textEnter = text.enter().append("text")
        .style("fill-opacity", 1)
        .style("fill", function(d) {
          return  "#000" ;
        })
        .attr("text-anchor", function(d) {
          return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
        })
        .attr("dy", ".2em")
        .attr("transform", function(d) {
          var multiline = (d.name || "").split(" ").length > 1,
              angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
              rotate = angle + (multiline ? -.5 : 0);
          return "rotate(" + rotate + ")translate(" + (y(d.y) + 0) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        })
        .on("click", click);
    textEnter.append("tspan")
        .attr("x", 0)
        .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
    textEnter.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
  //END 
      var legend = d3.select("#viz2").append("svg")
        .attr("class", "legend")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
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
    function click(d) {
      node = d;
      path.transition()
        .duration(1000)
        .attrTween("d", arcTweenZoom(d));
        
      // Somewhat of a hack as we rely on arcTween updating the scales.
      text.style("visibility", function(e) {
            return isParentOf(d, e) ? null : d3.select(this).style("visibility");
          })
        .transition()
          .duration(duration)
          .attrTween("text-anchor", function(d) {
            return function() {
              return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
            };
          })
          .attrTween("transform", function(d) {
            var multiline = (d.name || "").split(" ").length > 1;
            return function() {
              var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                  rotate = angle + (multiline ? -.5 : 0);
              return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
            };
          })
          .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
          .each("end", function(e) {
            d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
          });
      
        
    }
      
  });

  d3.select(self.frameElement).style("height", height + "px");

  // Setup for switching data: stash the old values for transition.
  function stash(d) {
    d.x0 = d.x;
    d.dx0 = d.dx;
  }

  // When switching data: interpolate the arcs in data space.
  function arcTweenData(a, i) {
    var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
    function tween(t) {
      var b = oi(t);
      a.x0 = b.x;
      a.dx0 = b.dx;
      return arc(b);
    }
    if (i == 0) {
     // If we are on the first arc, adjust the x domain to match the root node
     // at the current zoom level. (We only need to do this once.)
      var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
      return function(t) {
        x.domain(xd(t));
        return tween(t);
      };
    } else {
      return tween;
    }
  }

  // When zooming: interpolate the scales.
  function arcTweenZoom(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function(d, i) {
      return i
          ? function(t) { return arc(d); }
          : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
    };
  }

  function sortObject(obj) {
      var arr = [];
      for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
              arr.push({
                  'author': prop,
                  'value': obj[prop]
              });
          }
      }
      arr.sort(function(a, b) { return b.value - a.value; });
      //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
      return arr; // returns array
  }    
}