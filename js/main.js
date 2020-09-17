// ADDING UI SLIDER

let time=0;
let startYear=1800;
let endYear=2015;
let gap=endYear-startYear;

let margin={top:10,right:10,left:100,bottom:100};
let width=800-margin.right-margin.left;
let height=400-margin.top-margin.bottom;

let continents=["asia","africa","americas","europe"];
let interval;
let extractData;


let svg=d3.select("#chart-area").append('svg')
	.attr('width',width+margin.left+margin.right)
	.attr('height',height+margin.top+margin.bottom);

let g=svg.append('g')
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//---------SCALES--------------
let x=d3.scaleLog()
	.domain([100,150000])
	.range([0,width])
	.base(10);

let y=d3.scaleLinear()
	.domain([0,90])
	.range([height,0]);

let area=d3.scaleLinear()
	.range([Math.PI*25,Math.PI*625])
	.domain([2000, 1400000000]);


let color=d3.scaleOrdinal()
	.domain(continents)
	.range(d3.schemePastel1);

//-------AXES------------------
let xAxis=d3.axisBottom(x)
	.ticks(3)
	.tickValues([400,4000,40000])
	.tickFormat(d=>'$'+d);
	
let xAxisGroup=g.append('g')
	.attr('class','x-axis')
	.attr("transform", "translate(" + 0 + ", " + height+ ")")
	.call(xAxis);

let yAxis=d3.axisLeft(y);

let yAxisGroup=g.append('g')
	.attr('class','y-axis')
	.call(yAxis);

//------LABELS----------------
let xLabel=g.append('text')
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

	legendRow.append("rect")
		.attr('width',10)
		.attr('height',10)
		.attr('fill',color(continent));

	legendRow.append("text")
		.attr('x',-10)
		.attr('y',10)
		.attr('text-anchor','end')
		.style('text-transform','capitalize')
		.text(continent);
	})

//--------TOOLTIPS----------------
let tip=d3.tip().attr('class','d3-tip').html(function(d){
	let text="<strong>Country : </strong><span style='color:red'>"+d.country+"</span><br>"
	text+="<strong>Continent : </strong><span style='color:red;text-transform:capitalize'>"+d.continent+"</span><br>"
	text+="<strong>Life Expectancy : </strong><span style='color:red'>"+d.life_exp+"</span><br>"
	text+="<strong>GDP Per Capita : </strong><span style='color:red'>"+d.income+"</span><br>"
	text+="<strong>Population : </strong><span style='color:red'>"+d.population+"</span>"
	return text;
});
g.call(tip);

//---------DATA--------------------
d3.json("data/data.json").then(function(data){
	extractData=function formatData(index){
		let yearData=data[index];
		let countryData=yearData.countries;
		let modifiedData=countryData.filter(function(country){
			return country.income!==null && country.life_exp!==null;
		})
		return modifiedData;
	}
	update(extractData(time));
})


function step(){
	update(extractData(time));
	time=(time<214)?time+1:0;
}

//---------EVENT LISTENERS----------
$("#play-button")
	.on("click",function(){
		let buttonText=this.innerHTML;
		if(buttonText==="Play"){
			this.innerHTML="Pause";
			interval=setInterval(step,100);
		}
		else{
			this.innerHTML="Play";
			clearInterval(interval);
		}
	})

$("#reset-button")
	.on("click",function(){
		time=0;
		yearText.text(time+startYear);
		step();
	})

$("#continent-select")
	.on("change",function(){
		update(extractData(time));
	})

//-------UI SLIDER-----------------
$("#date-slider").slider({
	max:2014,
	min:1800,
	step:1,
	slide:function(event,ui){
		time=ui.value-1800;
		update(extractData(time));
	}
})

//-------UPDATE FUNCTION------------
function update(yearData){
	let c=$("#continent-select").val();
	if(c!=="all"){
		yearData=yearData.filter(function(year){
			return year.continent===c;
		})
	}

	//----Changing year label------
	yearText.text(time+startYear);

	//----Changing the UI Slider text----
	$("#year")[0].innerHTML=time+startYear;

	ScatterPlot=g.selectAll("circle").data(yearData,function(d){return d.country;});

	ScatterPlot.exit().remove();

	//ADD/UPDATE

	ScatterPlot.enter()
		.append("circle")
			.attr('stroke','rgb(150,150,150)')
			.attr('fill',d=>color(d.continent))
            .on('mouseover',tip.show)
            .on('mouseout',tip.hide)
			.merge(ScatterPlot)
				.attr('cx',d=>x(d.income))
				.attr('cy',d=>y(d.life_exp))
				.attr('r',function(d){
					return Math.sqrt(area(d.population)/Math.PI);
				});

}
