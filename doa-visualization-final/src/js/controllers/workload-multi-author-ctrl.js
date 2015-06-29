/**
 * Workload Controller
 */

angular
    .module('RDash')
    .controller('WorkloadMultiAuthorCtrl', ['$scope', WorkloadMultiAuthorCtrl]);

function WorkloadMultiAuthorCtrl($scope) {
  $('.breadcrumb-links').text('Home / Workload Multi-Author');

  var width = 650;
  var height = 400;    
      
  var appData = [];   
  var workload = [];
  var repositories = new Object;    
    console.log("loading file... ");  
    d3.csv("data/new/files-author-multi-add.csv", function(d) {
      return {
        repository: getRepositoryName(d.fullname),
        path: d.path,
        developer: d.username,
        doa: d.doa
      };
    }, function(error, rows) {
        
        console.log("file loaded. "+ rows.length);
        
        rows.forEach(function(x){
            if (typeof(repositories[x.repository]) == "undefined"){
                repositories[x.repository] =  {files: new Object, developers: new Object};
            }
            if (typeof(repositories[x.repository].files[x.path]) == "undefined"){
                repositories[x.repository].files[x.path] =  {"developers" : [] };
            }
            if (typeof(repositories[x.repository].developers[x.developer]) == "undefined"){
                repositories[x.repository].developers[x.developer] =  {"files" : [] };
            }
            repositories[x.repository].files[x.path].developers.push({"username" : x.username, "doa" : x.doa});
            repositories[x.repository].developers[x.developer].files.push({"path": x.path, "doa" : x.doa})
        });

        //appData = rows;
        for (repName in repositories){
            var devs =  getOrderDevelopers(repName);
            var nFiles = getNumFiles(devs);
            var categories = splitDevs(devs);
            for(i=0;i<10;i++){
                appData.push({"repository" : repName,
                        "index" : i+") "+(i*10) +"% - " +  ((i+1)*10)+"%",
                        "perc" : getNumFiles(categories[i])/nFiles});
            }
               
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
        
        var visualization = d3plus.viz()
                        .container("#viz1")
                        .type("bar")
                        .data(appData)
                        .y({"value":"perc", "stacked" : true, "label": "Total Files (%)"})
                        .x({"value":"repository", "padding" : 0 , "label" : false} )
                        .id(["index","repository"])
                        //.width({"value": width})
                        //.height({"value": height})
                        //.color(colorf)
                        //.aggs({"value": "index"})
                        
                       // .ui([{ "method" : "x", "value"  : [ "repository" , "index" ]}])
                        .draw();
        
    });
      
    var getRepositoryName = function(str){return str.substring(str.search("/")+1, str.length)};
      
    var getOrderDevelopers = function(repName){
        var devObjects = repositories[repName].developers;
        var devs = [];
        for (d in devObjects) {
            //console.log(d+": "+devObjects[d]);
            devs.push({username : d, files: devObjects[d].files});
        }
        
        return devs.sort(function(a, b){return b.files.length - a.files.length});
    }  
    
    var getNumFiles = function(devs){
        var uniqueFiles =  new Object;
        var count = 0;
        devs.forEach(function(dev){
            var files = dev.files;
            files.forEach(function(file){
                if (typeof(uniqueFiles[file.path]) == "undefined"){
                    uniqueFiles[file.path] =  1;
                    count++;
                }
            });
        });
        return count;
    }
    
    var splitDevs = function(devs){
        var size;
        var ndevs = devs.length;
        var newDevs = devs.slice(0);
        if (ndevs<10)
            size = 1;
        else
            size = Math.round(ndevs/10);
        var chunks = []
        for(i=0; i<9; i++){
            if(newDevs.length>0)
                chunks.push(newDevs.splice(0,size));
            else
                chunks.push([]);
        }
        chunks.push(newDevs);
        return chunks;   
    }

   var colorf = function(x){
       var colors =  ["#ffffff","#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
       //var colors =  ["#fff7ec","#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]
       colors = colors.reverse();
//       if (x.index == "0) 0% - 10%")
//           return "gray";
//       else 
//           return "white";
       return colors[parseInt(x.index[0])];
   }
   
       
//      
//    var visualization = d3plus.viz()
//                      .container("#viz2")
//                      .type("stacked")
//                      .data(appData)
//                      .y({"value":"perc", "label": "Total Files (%)"})
//                      .x({"value": "repository"})
//                        //.color(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
//                        .id(["index", "repository"])
//                        .width({ "value": width})
//                        .height({"value": height})
//                      .draw();
}