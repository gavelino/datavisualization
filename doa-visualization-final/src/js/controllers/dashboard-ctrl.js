/**
 * Dashboard Controller
 */

angular
    .module('RDash')
    .controller('DashboardCtrl', ['$scope', DashboardCtrl]);

function DashboardCtrl($scope) {
    $('.breadcrumb-links').text('Home / Dashboard');

    $scope.data = {
        developers: '78561',
        repositories: '135',
        languages: '6',
        commits: '2575046',
        files: '412781'
    };

    var getRepositoryName = function(str){return str.substring(str.search("/")+1, str.length)};

    var dataset = [];
    d3.csv("data/new/doa-multiauthor.csv", function(data) {
        //id,repository,language,selectedfiles,nummult05,nummult06,nummult07,nummult081
        
        dataset = dataset.concat(data.map(function(d) { return {"id" : "10", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult01/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "20", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult02/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "30", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult03/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "40", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult04/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "50", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult05/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "60", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult06/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "70", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult07/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "80", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult08/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        dataset = dataset.concat(data.map(function(d) { return {"id" : "90", "language": d.language, "repository" : getRepositoryName(d.repository), "value" :                                                                         parseFloat(((d.nummult09/d.selectedfiles)*100).toFixed(2))} 
                                        }));
        var visualization = d3plus.viz()
            .container("#viz1")
            .data(dataset)
            .type("box")
            .zoom({"scroll":true, "pan":true, "click":true})
            .id("repository")
            .x({"label":"DOA Threshold (%)", "value":"id"})
            .y({"label":"Files With Multiple Author (%)", "value": "value"})
            .draw();
    
    
    });
}