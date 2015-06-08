/**
 * Workload Controller
 */

angular
    .module('RDash')
    .controller('WorkloadCtrl', ['$scope', WorkloadCtrl]);

function WorkloadCtrl($scope) {
    var appData = [];   
    var originalData;

    $.getJSON("/data/test.json", function(data){
        originalData = data;
        for (var i =0; i < data.repository.length; i++){
            var perc = data.perc[i]*100;
            
            appData.push({"repository" : data.repository[i],
                          "index" : ((10-data.index[i])+") "+(10-data.index[i])*10) +"% - " +  ((11-data.index[i])*10)+"%",
                          "perc" : perc,
                          "ndev" : data.numdev[i]});    
        }
        var mainObjects = appData.filter(function(x) { return x.index =="0) 0% - 10%";});
        mainObjects.forEach(function(o){
                var repObjects =  appData.filter(function(x) { return x.repository == o.repository;});                       
                repObjects.forEach(function(r){
                        r["mainvalue"] = o.perc;
                    }
                );
            }
        );
        appData = appData.sort(function(a, b){
                    if (a.repository == b.repository)
                        return a.index == b.index ? 0 : +(a.index > b.index) || -1;
                    else
                        return a.mainvalue == b.mainvalue ? a.repository < b.repository : +(a.mainvalue > b.mainvalue) || -1;
        });
    });
   
    var colorf = function(x){
        var colors = ["#fff7ec","#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"];
        colors = colors.reverse();
        console.log(colors[parseInt(x.index[0])]);
        return colors[parseInt(x.index[0])];
    }
      
    var visualization = d3plus.viz()
                        .container("#viz1")
                        .type("bar")
                        .data(appData)
                        .y({"value":"perc", "stacked" : true, "label": "Total Files (%)"})
                        .x({"value":"repository", "padding" : 0.1 , "label" : false} )
                        .id(["index","repository"])
                        //.width({"value": width})
                        //.height({"value": 400})
                        //.color("index")
                        //.color(colorf)
                        //.aggs({"value": "index"})
    
                       // .ui([{ "method" : "x", "value"  : [ "repository" , "index" ]}])
                        .draw();
}