
let index=0;
let startYear=1800;
let endYear=2015;
let gap=endYear-startYear;

let margin={top:10,right:10,left:100,bottom:100};
let width=800-margin.right-margin.left;
let height=400-margin.top-margin.bottom;

let continents=["asia","africa","americas","europe"];

let svg=d3.select("#chart-area").append('svg')
	.attr('width',width+margin.left+margin.right)
	.attr('height',height+margin.top+margin.bottom);

let g=svg.append('g')
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//---------SCALES--------------
let x=d3.scaleLog()
	.domain([100,150000])//to be set
	.range([0,width])
	.base(10);

let y=d3.scaleLinear()
	.domain([0,90])
	.range([height,0]);

let area=d3.scaleLinear()
	.range([Math.PI*25,Math.PI*625]);

let p=d3.scaleLinear()
	.domain([Math.PI*25,Math.PI*625])
	.range([5,25]);
	
let color=d3.scaleOrdinal()
	.domain(continents)
	.range(d3.schemePastel1);

//-------AXES------------------
let xAxis=d3.axisBottom(x)//dont forget to provide the scale
	.ticks(3)
	.tickValues([400,4000,40000])
	.tickFormat(d=>'$'+d);//Without this it wont understand in which format to display
	
let xAxisGroup=g.append('g')
	.attr('class','x-axis')
	.attr("transform", "translate(" + 0 + ", " + height+ ")")
	.call(xAxis);

let yAxis=d3.axisLeft(y);

let yAxisGroup=g.append('g')
	.attr('class','y-axis')
	.call(yAxis);

//------LABELS----------------
let xLabel=g.append('text')//for text u cant use transform
	.attr('x',width/2)
	.attr('y',height+60)
	.attr('text-anchor','middle')
	.attr('font-size','20px')
	.text('GDP-per-capita(in $)');

let yLabel=g.append('text')
	.attr('transform','rotate(-90)')
	.attr('x',-height/2)
	.attr('y',-60)
	.attr('text-anchor','middle')
	.attr('font-size','20px')
	.text('Life Expectancy (in Years)');

//-------YEAR-----------------
let yearText=g.append('text')
	.attr('x',width-10)
	.attr('y',height-10)
	.attr('text-anchor','end')
	.attr('font-size','40px');

//--------LEGEND--------------
let legend=g.append('g')
	.attr("transform", "translate(" +(width-20)+ ", " +(height-150)+ ")");

continents.forEach(function(continent,index){
	let legendRow=legend.append('g')
		.attr('class','legendRow-'+index)
		.attr("transform", "translate(" + 0+ ", " + index*20+ ")");

	legendRow.append("rect")//default (0,0)
		.attr('width',10)
		.attr('height',10)
		.attr('fill',color(continent));

	legendRow.append("text")
		.attr('x',-10)
		.attr('y',10)
		.attr('text-anchor','end')
		.style('text-transform','capitalize')//style is used to change the CSS properties attr and style are different
		.text(continent);
	})


d3.json("data/data.json").then(function(data){
	
	console.log(data);
	
	d3.interval(function(){
		index=(index<gap)?index+1:0;
		newData=extractData(data,index);
		update(newData);
	},100);


})

function extractData(data,index){
	let yearData=data[index];
	let countryData=yearData.countries;
	let newData=countryData.filter(function(country){
		return country.income!==null && country.life_exp!==null;
	})
	return newData;
}


function update(yearData){

	yearText.text(index+startYear);

	area.domain(d3.extent(yearData,function(d){
		return d.population;
	}))

	ScatterPlot=g.selectAll("circle").data(yearData,function(d){return d.country;});

	ScatterPlot.exit().remove();

	//ADD/UPDATE

	ScatterPlot.enter()
		.append("circle")
			.attr('stroke','rgb(50,50,50)')
			.attr('fill',d=>color(d.continent))
			.merge(ScatterPlot)
				.attr('cx',d=>x(d.income))
				.attr('cy',d=>y(d.life_exp))
				.attr('r',function(d){
					return p(area(d.population));
				});

}