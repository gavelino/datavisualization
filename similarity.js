function hashCode(vector) {
    var hash = 0, i, chr, len;
    if (vector.length == 0) return hash;
    for (i = 0, len = vector.length; i < len; i++) {
        e   = vector[i];
        hash  = ((hash << 5) - hash) + e;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


// Daqui para baixo são funcões para calcular a similaridade e posição das pessoas.
function computeStatistics(appData) {
	var n = 0;
	var centroid = personToVector({});
	var maxNorm = 0;
	var minNorm = 1000;
	var idf = personToVector({});
	var sim = {};
	var top2 = {};
	
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
		top2[graph] = {};
		for (var p in appData.graphs[graph]) {
			var person = appData.graphs[graph][p];
			var vector = personToVector(person);
			var v1 = tfIdf(vector, idf);
			var v2 = tfIdf(centroid, idf);
//			var v1 = vector;
//			var v2 = centroid;
			sim[graph][p] = cosineSimilarity(v1, v2);
			minSim = Math.min(minSim, sim[graph][p]);
			maxSim = Math.max(maxSim, sim[graph][p]);
			
			top2[graph][p] = findTop2(vector);
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
		sim: sim,
		top2: top2
	};
}

function personToVector(personData) {
	var categories = color.domain();
	var vector = [];
	for (var i = 0; i < categories.length; i++) {
		var locations = personData[categories[i]] || [];
		vector.push(locations.length);
	}
	return vector;
}

function cosineSimilarity(vector1, vector2) {
	var r = vectorDotProduct(vector1, vector2) / (vectorNorm(vector1) * vectorNorm(vector2));
	return r;
}
function tfIdf(vector, idf) {
	var tfidf = [];
	for (var i = 0; i < vector.length; i++) {
		if (vector[i] > 0) {
			//tfidf.push((1 + Math.log(vector[i])) * idf[i]);
			tfidf.push(vector[i] * idf[i]);
		} else {
			tfidf.push(0);
		}
	}
	return tfidf;
}
function findTop2(vector) {
	var max = 0;
	var max2 = 0;
	var imax = 0;
	var imax2 = 0;
	for (var i = 0; i < vector.length; i++) {
		if (vector[i] > max) {
			imax2 = imax;
			max2 = max;
			max = vector[i];
			imax = i;
		} else if (vector[i] > max2) {
			max2 = vector[i];
			imax2 = i;
		}
	}
	return [imax, imax2];
}
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
function computePosition(i, j, person, width, height, radius) {
	var top2 = stats.top2[i][j];
	var first = top2[0];
	var second = top2[1];
	var catCount = color.domain().length;
	var angle = (first * (2 * Math.PI / catCount)) + second * ((2 * Math.PI / catCount)/catCount);
	var normalizedSim = ((1 - stats.sim[i][j])/(1 - stats.minSim)) * (height/2 - radius);
	var xpos = (width/2 - radius) + normalizedSim * Math.cos(angle - Math.PI/2);
	var ypos = (height/2 - radius) + normalizedSim * Math.sin(angle - Math.PI/2);
	return [xpos, ypos];
}
