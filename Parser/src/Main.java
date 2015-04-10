import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import weka.core.Attribute;
import weka.core.EuclideanDistance;
import weka.core.FastVector;
import weka.core.Instance;
import weka.core.Instances;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;


public class Main {

	public static void main(String[] args) throws IOException {
		File file = new File("all.txt");

		Scanner scanner = new Scanner(file);

		//  Graphs -> [GraphId -> [EdgeId -> [Category -> [CategoryId]]]]
		Map<Integer, Map<Integer, Map<String, List<Integer>>>> graphs = new HashMap<Integer, Map<Integer, Map<String, List<Integer>>>>();

		Map<String, Attribute> attributesMap = new HashMap<String, Attribute>();

		Map<Integer, Map<String, List<Integer>>> graph = null;
		while (scanner.hasNext()) {
			String line = scanner.nextLine();
			String[] tokens = line.split(" ");
			if (line.startsWith("graph ")) {
				graph = new HashMap<Integer, Map<String, List<Integer>>>();
				graphs.put(Integer.parseInt(tokens[1]), graph);
			} else {
				Integer edgeId = Integer.parseInt(tokens[1]);
				if (!graph.containsKey(edgeId)) {
					graph.put(edgeId, new HashMap<String, List<Integer>>());
				}

				String edgeCategory = tokens[2];
				Map<String, List<Integer>> edge = graph.get(edgeId);
				if (!edge.containsKey(edgeCategory)) {
					edge.put(edgeCategory, new ArrayList<Integer>());
				}
				if (!attributesMap.containsKey(edgeCategory)) {
					attributesMap.put(edgeCategory, new Attribute(edgeCategory));
				}

				Integer edgeCategoryId = Integer.parseInt(tokens[3]);
				edge.get(edgeCategory).add(edgeCategoryId);
			}
		}

		scanner.close();


		FastVector attributesVector = new FastVector(attributesMap.size());
		for (Attribute att : attributesMap.values()) {
			attributesVector.addElement(att);
		}

		Instances wVector = new Instances("Vector", attributesVector, 0);

		Map<String, Instance> wekaInstances = new HashMap<String, Instance>();
		for (Integer graphId : graphs.keySet()) {
			Map<Integer, Map<String, List<Integer>>> graphMap = graphs.get(graphId);
			for (Integer edgeId : graphMap.keySet()) {
				Map<String, List<Integer>> categoryMap = graphMap.get(edgeId);
				Instance instance = new Instance(attributesVector.size());
				instance.setDataset(wVector);
				for (String category : attributesMap.keySet()) {
					if (categoryMap.containsKey(category)) {
						instance.setValue(attributesMap.get(category), categoryMap.get(category).size());
					} else {
						instance.setValue(attributesMap.get(category), 0);
					}
				}
				wekaInstances.put(new String("G"+graphId+"E"+edgeId), instance);
			}
		}

		Map<String, Map<String, Double>> distances = new HashMap<String, Map<String, Double>>();

		EuclideanDistance euclideanDistance = new EuclideanDistance(wVector);
		euclideanDistance.setDontNormalize(true);

		Map<String, Instance> wekaInstancesAux = new HashMap<String, Instance>(wekaInstances);
		for (String key : wekaInstances.keySet()) {
			distances.put(key, new HashMap<String, Double>());
		}

		for (String key : wekaInstances.keySet()) {
			Instance e1 = wekaInstancesAux.remove(key);
			for (String key2 : wekaInstancesAux.keySet()) {
				double distance = euclideanDistance.distance(e1, wekaInstancesAux.get(key2));
				distances.get(key).put(key2, distance);
				//				distances.get(key2).put(key, distance);
			}
		}

		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		JsonElement graphsTree = gson.toJsonTree(graphs);
		JsonElement distancesTree = gson.toJsonTree(distances);

		JsonObject finalJsonObject = new JsonObject();
		finalJsonObject.add("graphs", graphsTree);
		finalJsonObject.add("distances", distancesTree);

		FileOutputStream fos = new FileOutputStream("data.json");
		fos.write(gson.toJson(finalJsonObject).getBytes());
		fos.close();

	}
}
