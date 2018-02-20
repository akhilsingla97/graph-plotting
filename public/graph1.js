var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
	//.force("strength",0.9);
	//.gravity(0.1);
	
//force.gravity(0.1).charge(-500);

var info;

d3.json("test2.json",function(error,graph){
	if (error) throw error;
	info = JSON.parse(JSON.stringify(graph));
});

var sidebar = d3.select("#sidebar").append("ul");
var ul = d3.select("ul");

function draw(ind)
{
	d3.select("svg").remove();
	svg = d3.select("#chart")
				.append("svg")
				.attr("width",960)
				.attr("height",600);
	
	d3.json("test2.json", function(error, graph) 
	{
	if (error) throw error;      
	
	var link = svg.append("g")
						.attr("class", "links")
						.selectAll("line")
						.data(info.links.filter(d=>((d.source.id!==ind) && (d.target.id!==ind))))
						.enter().append("line")
						.attr("stroke-width", function(d) { return Math.sqrt(Math.sqrt(d.value)+1); })
						.on("click",function(d){console.log(d); return d.id;});						

	var node = svg.append("g")
						.attr("class", "nodes")
						.selectAll("circle")
						//.data(info.nodes.filter(d=>d.id != ind).forEach(d)=>{additem(d);})
    					.data(info.nodes.filter(d=>d.id != ind))
						.enter().append("circle")
						.attr("r", function(d){return 15-d.rank;})
						.attr("fill", function(d) { return color(Math.floor(d.id)); })
						.call(d3.drag()
						.on("start", dragstarted)
						.on("drag", dragged)
						.on("end", dragended))
						.on("click",function(d){
							if(d.id == 1){
							d3.json("test3.json",function(error,subgraph){
							if(error) throw error;
							var addinfo;
							addinfo = JSON.parse(JSON.stringify(subgraph));
							//console.log(addinfo);
							addinfo.nodes.forEach((items) => {
							info.nodes.push(items)});
							
							addinfo.links.forEach((items) => {
							info.links.push(items)});
							
							console.log(info);
							//info.links.push(addinfo.links);
							draw(d.id);
						}
						)}
						}
						);
					
						
	node.append("title")
			.text(function(d) { return d.id; });

	simulation
			.nodes(info.nodes)
			.on("tick", ticked);

	simulation
			.force("link")
			.links(info.links);

	function additem(item){
		if(item){
			var div = ul.selectAll("div").enter()
							.append("div");
			
			div.selectAll("circle")
				.enter().append("circle")
				.attr("r",3)
				.attr("fill",color(item.id))
			
			div.selectAll("li")
				.enter().append(li).text(item.id);
		}
	}		
	
	
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
	}
	
});

}

draw(0);

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.2).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}