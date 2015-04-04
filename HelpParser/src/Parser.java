import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;



public class Parser {

	public static void main(String[] args) throws IOException {
		String filePath = "all.txt";
		if (args.length>0)
			filePath = args[1];
		List<Graph> graphs = parseFile(filePath);
		saveAsCsv("all2.csv", graphs);
//		processAndSaveAsCsv("all.csv", graphs);

	}


	private static List<Graph> parseFile(String filePath) throws IOException {
		String retStr = "";
		BufferedReader br = new BufferedReader(new FileReader(filePath));
		String sCurrentLine;
		String[] values = null;
		List<Graph> graphs = new ArrayList<Graph>();
		Graph currentGraph = null;
		while ((sCurrentLine = br.readLine()) != null) {
			values = sCurrentLine.split(" ");
			if (values.length == 2){
				currentGraph = new Graph(values[1]);
				graphs.add(currentGraph);
			}
			else{
				currentGraph.addInformation(new Information(values[1], values[2], values[3]));
			}
		}
		br.close();
		return graphs;
	}

	private static void saveAsCsv(String filePath, List<Graph> graphs) throws IOException {
		String strData = "graph,edge,category,catID" + System.lineSeparator();
		for (Graph graph : graphs) {
			for (Information info : graph.getInformations()) {
				strData += graph.getId()+","+info.getEdgeId()+","+info.getCategory()+","+info.getCategoryId()+System.lineSeparator();
			}
		}
		FileWriter fw = new FileWriter(new File(filePath));
		fw.write(strData);
		fw.close();
	}
	private static void processAndSaveAsCsv(String filePath, List<Graph> graphs) throws IOException {
		String strData = "";
		for (Graph graph : graphs) {
			List<Edge> edges = graph.process();	
			
		}
		FileWriter fw = new FileWriter(new File(filePath));
		fw.write(strData);
		fw.close();
	}
}
