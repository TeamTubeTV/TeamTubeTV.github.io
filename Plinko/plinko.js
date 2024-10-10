//plinko.js
const ROWS = 13;
const BASEW = 1358;const BASEH = 652;
const FPS = 120;
var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");
var scale = 1;
var buttons = [];

var MONEY = 150;
if(localStorage.getItem("tttvmoney")){
	MONEY = Number(localStorage.getItem("tttvmoney"));
}

//images
var BALLIMG = document.getElementById("ball");
var PINIMG = document.getElementById("pin");

var PEGS = [];
var BALLS = [];
var ZONES = [];

//classes
class Vector2{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
	static zero(){
		return new Vector2(0,0);
	}
	static diff(a,b){
		return new Vector2(a.x-b.x,a.y-b.y);
	}
	static dist(a,b){
		var diff = new Vector2(a.x-b.x,a.y-b.y);
		return Math.sqrt(diff.x**2+diff.y**2);
	}
	multiply(m){
		return new Vector2(this.x*m,this.y*m);
	}
	divide(d){
		return new Vector2(this.x/d,this.y/d);
	}
	magnitude(){
		return Math.sqrt(this.x**2+this.y**2);
	}
	normalized(){
		var m = this.magnitude();
		return new Vector2(this.x/m,this.y/m);
	}
	add(vec2){
		return new Vector2(this.x+vec2.x,this.y+vec2.y);
	}
}

function direction_from_angle(angle/*radians*/){ //normalized vector2 already
	return new Vector2(Math.sin(angle),Math.cos(angle)); //Vector2
}

class Zone{
	constructor(x,y,w,h,value,color){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.color = color;
		this.value = value;
	}
	update(){
		var v = 0;
		BALLS.forEach((b,i)=>{
			if(b.position.x>this.x && b.position.x<this.x+this.w && b.position.y>this.y && b.position.y<this.y+this.h){
				//collision
				BALLS.splice(i,1);//DELETE BALL
				v += this.value*b.value; //get money (kaching kaching)
			}
		});
		return v;
	}
	render(){
		FillRect(this.x,this.y,this.w,this.h,this.color);
		DrawText(this.value.toString()+"x",this.x+this.w/2,this.y+this.h/2,"white","20px Arial",true);
	}
}

class CircleCollider{
	constructor(x,y,radius){
		this.position = new Vector2(x,y);
		this.radius = radius;
		this.vel = Vector2.zero();
	}
	update(checklist){
		//adding gravity
		this.vel.x -= this.vel.x * 0.1 * (1000/FPS/1000) 
		this.vel.y += 4.7 * (1000/FPS/1000);
		//in between and after collision
		var i = 0;
		while(i<2){
			var lastpos = this.position
			this.position.x += this.vel.x/2;
			this.position.y += this.vel.y/2;
			checklist.forEach((e)=>{
				if(Vector2.dist(this.position,e.position) < (this.radius+e.radius)){
					//collision -> get position to rebound off
					var impactStrength = this.vel.magnitude();
					this.vel = Vector2.diff(this.position,e.position).normalized().multiply((Vector2.dist(this.position,e.position)/(this.radius+e.radius)));
					this.position = this.position.add(this.vel); // pop back but keep the velocity
					this.vel = this.vel.multiply(impactStrength*0.55); //bounciness
					i = 2;
				}
			});
			//check if ball is out of the pinfall -> check if inside abs func
			
			i++;
		}
		var ballrange = [(this.position.y-5)/2+BASEW/2,-(this.position.y-5)/2+BASEW/2].sort((a,b)=>{return a-b;});
		if(this.position.x < ballrange[0] && this.position.y > 55) this.vel.x = ballrange[0]-this.position.x;
		else if(this.position.x > ballrange[1] && this.position > 55) this.vel.x = ballrange[1]-this.position.x;
	}
}

class Peg{
	constructor(x,y,radius){
		this.position = new Vector2(x,y)
		this.radius = radius;
	}
	render(){
		DrawImage(PINIMG,this.position.x,this.position.y,this.radius*2,this.radius*2,true);
	}
}

class Ball extends CircleCollider{
	constructor(x,y,radius,value){
		super(x,y,radius);
		this.value = value;
		this.vel.x = Math.random() * 0.8 - 0.4
	}
	//update
	render(){
		DrawImage(BALLIMG,this.position.x,this.position.y,this.radius*2,this.radius*2,true);
	}
}


function Resize(){
	scale = Math.min(window.innerWidth / BASEW, window.innerHeight / BASEH);
	console.log(scale);
	cvs.width = scale * (BASEW - 8);
	cvs.height = scale * (BASEH -8);
	ctx.scale(scale,scale);
}
Resize();

window.addEventListener("resize",(e)=>{
	Resize();
});

function Fill(clr){
	ctx.fillStyle = clr
	ctx.clearRect(0,0,cvs.width,cvs/scale.height/scale);
	ctx.fillRect(0,0,cvs.width/scale,cvs.height/scale);
}

function DrawImage(image,x,y,w,h,centered=false){
	if(centered){x-=w/2;y-=h/2;} //centers the x and y
	ctx.drawImage(image,x,y,w,h);
}

function DrawText(text,x,y,color="white",font="30px Arial",centered=false){
	ctx.fillStyle = color;
	ctx.font = font;
	var th = font.split("p")
	if(centered){y += (th.length>1) ? Number(th[0])*0.3 : 0;x-=ctx.measureText(text).width/2;}//center it
	ctx.fillText(text,x,y);
}

function FillRect(x,y,w,h,color,centered=false){
	if(centered){x-=w/2;y-=h/2;}
	ctx.fillStyle = color;
	ctx.fillRect(x,y,w,h);
}

function DrawButton(x,y,w,h,text,functionToCall,textcolor="#ffffff",font="50pt Arial",bgcolor=""){
	if(bgcolor != ""){ctx.fillStyle = bgcolor;ctx.fillRect(x,y,w,h);}
	ctx.fillStyle = textcolor;
	ctx.font = font
	var ts = ctx.measureText(text)
	ctx.textAlign = 'middle'
	var th = Number(font.split('p')[0])
	console.log(th)
	ctx.fillText(text,(x+w/2-Math.min(w,ts.width)/2),y+h/2+th/2-th*0.12,w);
	buttons.push({bx:x*scale,by:y*scale,bw:w*scale,bh:h*scale,func:functionToCall});
}
const mouse = {x:0,y:0};
window.addEventListener("mousedown",(e)=>{
	mouse.x = e.clientX;
	mouse.y = e.clientY;
	//LeftClick
	if(e.button == 0){
		buttons.forEach((b,id)=>{
			if(Math.abs(b.bx + b.bw/2 - mouse.x)< b.bw/2 && Math.abs(b.by + b.bh/2 - mouse.y)<b.bh/2){
				b.func()
			}
		});
	}
});
window.addEventListener("mouseup",(e)=>{
	if(dropcooldown)dropcooldown = false;
});
window.addEventListener("beforeunload",(e)=>{
	localStorage.setItem("tttvmoney",MONEY.toString());
})

var zoneColors = ["#800000","#b32d00","#e68a00","#e6b800","#44cc00","#00b300"];

var zoneValues = [0.5,1,1.25,1.5,2.5,5];

//OUTERWALLS FUNCTION(abs func) -> y = a=>(-55/27.5 = -2)*|x-h=>(BASEW/2 = 679)|+k=>(5)
// ex: x=? y=-2|x-679|+5
//         (y-5)/2=|x-679|
//        get the x's from here with the +- results
//   RESULTS: x1 = (y-5)/2+BASEW/2  x2 = -(y-5)/2+BASEW/2
for(let y = 2; y < ROWS; y++){
	for(let x = 0; x < y; x++){
		//create a PEG
		PEGS.push(new Peg((x*55)+(BASEW/2)-(y*55/2)+25,y*55-60,Math.sqrt(50)));
		if(y == 11){
			var zoneval = zoneValues[Math.abs(x-5)];
			var zonecolor = zoneColors[Math.abs(x-5)]
			ZONES.push(new Zone((x*55)+(BASEW/2)-(y*55/2),y+11*55-10,50,40,zoneval,zonecolor));
		}
	}
}

//BALLS.push(new Ball(cvs.width/2,10,15,1))
var dropcooldown = false;
var valueselected = 1;
function loop(){
	Fill("grey");
	DrawText("MONEY BALLS SIM 2024",300,25,"white","40px Arial",true);
	DrawText("MONEY BALLS SIM 2024",1050,25,"white","40px Arial",true);
	DrawText("MONEY: "+MONEY.toString()+"$",200,100,"#ffcc00","30px Arial",true);
	//BALL VALUE BUTTONS
	DrawButton(1100,200,100,50,"1$",()=>{valueselected = 1;}, (valueselected == 1) ? "black" : "white","30px Arial",(valueselected == 1) ? "white" : "black");
	DrawButton(1100,300,100,50,"2$",()=>{valueselected = 2;},(valueselected == 2) ? "black" : "white","30px Arial",(valueselected == 2) ? "white" : "black");
	DrawButton(1100,400,100,50,"5$",()=>{valueselected = 5;},(valueselected == 5) ? "black" : "white","30px Arial",(valueselected == 5) ? "white" : "black");
	DrawButton(1100,500,100,50,"10$",()=>{valueselected = 10;},(valueselected == 10) ? "black" : "white","30px Arial",(valueselected == 10) ? "white" : "black");
	
	DrawButton(100,200,200,50,"DROP",()=>{if(dropcooldown || MONEY < valueselected)return;BALLS.push(new Ball(BASEW/2,0,15,valueselected));MONEY-=valueselected;dropcooldown = true},"white","30px Arial","black")
	ZONES.forEach((e)=>{MONEY+=e.update();e.render()});
	PEGS.forEach((e)=>{e.render(0,0,2)});
	BALLS.forEach((e,i)=>{e.update(PEGS);e.render();if(e.position.y > BASEH){BALLS.splice(i,1);MONEY+=e.value}});
}

window.setInterval(loop,1000/FPS);
