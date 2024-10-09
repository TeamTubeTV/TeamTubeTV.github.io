var canvas = document.getElementById("cvs");
const ctx = canvas.getContext("2d");

// 1358*652

//RENDERING FUNCTIONS
function DrawButton(x,y,w,h,text,functionToCall,textcolor="#ffffff",font="50pt Arial",bgcolor=""){
	if(bgcolor != ""){ctx.fillStyle = bgcolor;ctx.fillRect(x,y,w,h);}
	ctx.fillStyle = textcolor;
	ctx.font = font
	var ts = ctx.measureText(text)
	ctx.textAlign = 'middle'
	var th = Number(font.split('p')[0])
	ctx.fillText(text,x+w/2-Math.min(w,ts.width)/2,y+h/2+th/2-th*0.12,w);
	buttons.push({bx:x*(canvas.width/1358),by:y*(canvas.height/652),bw:w*(canvas.width/1358),bh:h*(canvas.height/652),func:functionToCall});
}

function ResizeCanvas(w,h){
	canvas.width = w-15;
	canvas.height = h-20;
	console.log("Resized: " + canvas.width + ", " + canvas.height);
	ctx.scale(canvas.width/1358,canvas.height/652);
	
}

function DrawLine(x1,y1,x2,y2,w,color){
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.stroke();
}

function DrawPolygon(x,y,vector2Array,color,fill=true,bw=1,bcolor="none"){
	if(bcolor == "none")bcolor = color;
	ctx.strokeStyle = bcolor;
	ctx.lineWidth = bw;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(vector2Array[0].x+x,vector2Array[0].y+y);
	vector2Array.forEach((e,i)=>{
		if(i != 0)ctx.lineTo(e.x+x,e.y+y);
	});
	ctx.fill();
	ctx.stroke();
}

function Fill(color){
	ctx.fillStyle = color;
	ctx.clearRect(0,0,canvas.width*2,canvas.height*2);
	ctx.fillRect(0,0,canvas.width*2,canvas.height*2);
	buttons = [];//resets the buttons
}

function FillRect(x,y,w,h,color){
	ctx.fillStyle = color;
	ctx.fillRect(x,y,w,h);
}

function DrawText(x,y,text,color,font="50px Arial",maxwidth=-1){
	ctx.fillStyle = color
	ctx.font = font
	if (maxwidth == -1) {maxwidth = ctx.measureText(text).width;}
	ctx.fillText(text,x,y,maxwidth)
}

function DrawCenteredText(x,y,text,textcolor,font = "50px Arial",maxwidth=-1){
	ctx.fillStyle = textcolor;
	ctx.font = font
	var ts = ctx.measureText(text)
	ctx.textAlign = 'middle'
	var th = Number(font.split('p')[0])
	ctx.fillText(text,x-ts.width/2,y+th/2-th*0.12,maxwidth);
}

class Vector2{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
	magnitude(){
		return Math.sqrt(this.x**2 + this.y**2);
	}
	normalized(){
		var magnitude = this.magnitude()
		return new Vector2(this.x/magnitude,this.y/magnitude);
	}
	static angle_to(a/*start*/,b/*end*/){
		return Math.atan2((b.y-a.y),(b.x-a.x));
	}
	distance_to(vector){
		return Math.sqrt((this.x-vector.x)**2 + (this.y-vector.y)**2);
	}
	static zero(){
		return new Vector2(0,0);
	}
	multiply(m){
		return new Vector2(this.x * m,this.y * m);
	}
	add(vector2){
		return new Vector2(this.x+vector2.x,this.y+vector2.y);
	}
	substract(vector2){
		return new Vector2(this.x-vector2.x,this.y-vector2.y);
	}
	static lerp(from,to,weight){
		return from.add(to.substract(from).multiply(weight));
	}
}

var images = {card:document.getElementById("cardimg"),facedown:document.getElementById("facedownimg"),chips:document.getElementById("chipsimg"),win:document.getElementById("winimg"),lose:document.getElementById("loseimg"),tie:document.getElementById("tieimg")}

class Card{
	constructor(value,startx,starty,endx,endy,facedown = false){
		this.value = value;
		this.position = new Vector2(startx,starty);
		this.facedown = facedown;
		this.toPos = new Vector2(endx,endy);
	}
	goTo(x,y){
		this.toPos.x = x;
		this.toPos.y = y;
	}
	render(){
		if(!this.facedown){
			ctx.drawImage(images.card,this.position.x,this.position.y,175,200);
			DrawText(this.position.x+60,this.position.y+125,(this.value == 1) ? "A" : this.value.toString(10),"#000000");
		}else{
			ctx.drawImage(images.facedown,this.position.x,this.position.y,150,200);
		}
		this.position = Vector2.lerp(this.position,this.toPos,0.05);
	}
	reached(){
		//check if distance between target position and current position is less than 1 px on x and y
		if(Math.abs(this.position.x-this.toPos.x) < 1 && Math.abs(this.position.y-this.toPos.y) < 1)return true;
		return false;
	}
}

ResizeCanvas(window.innerWidth, window.innerHeight);

const mouse = {x:0,y:0};
window.addEventListener("mousedown",(e)=>{
	mouse.x = e.clientX
	mouse.y = e.clientY
	//LeftClick
	if(e.button == 0){
		buttons.forEach((b,id)=>{
			if(Math.abs(b.bx + b.bw/2 - mouse.x)< b.bw/2 && Math.abs(b.by + b.bh/2 - mouse.y)<b.bh/2){
				b.func()
			}
		});
	}
});
window.addEventListener("resize",(e)=>{
	ResizeCanvas(window.innerWidth, window.innerHeight);
});

window.addEventListener("beforeunload",(e)=>{localStorage.setItem("money",money.toString(10));})

const DECK = [
	1,1, //AKA 11 (A -> Ace)
	2,2,2,2,
	3,3,3,3,
	4,4,4,4,
	5,5,5,5,
	6,6,6,6,
	7,7,7,7,
	8,8,8,8,
	9,9,9,9,
	10,10,10,10,
	10,10,10,10,
	10,10,10,10,
	10,10,10,10,
];
var cards = [];
var hand = [];
var dealer = [];

var money = localStorage.getItem("tttvmoney");
if(money == undefined){money = 100;}else{money = Number(money)}
var gamestep = 0;
var winstatus = 0;
var bet = 0;

function draw(){
	var r = Math.floor(Math.random() * cards.length);
	if(cards[r] == 0)return draw();
	var val = cards[r];
	cards[r] = 0;
	return val;
}

function drawCards(){
	money -= bet;
	//start by drawing facedown and faceup card for dealer
	dealer.push(new Card(draw(),100,100,500,150,true));
	dealer.push(new Card(draw(),100,100,650,150));
	hand.push(new Card(draw(),100,100,300,400));
	hand.push(new Card(draw(),100,100,450,400));
	checkHandState(calculateTotalValue(hand),1);
	
}

function resetGame(){
	cards = [...DECK];
	hand = [];
	dealer = [];
	gamestep = 0;
	bet = 0;
}

resetGame();

function lose(){
	gamestep = 3;
	dealertimer = 120;
	winstatus = -1;
}
function win(blackjack){
	gamestep = 3;
	dealertimer = 120;
	winstatus = 1;
	money += bet * (blackjack ? 2.5 : 2);
}
function tie(){
	gamestep = 3;
	dealertimer = 120;
	winstatus = 0;
	money += bet;
}

function calculateTotalValue(givenHand){
	var rawval = 0;
	var aces = 0;
	var value = 0;
	givenHand.forEach((e)=>{
		rawval+=e.value;
		if(e.value == 1)aces++;
	});
	//ammount of aces able to fully deploy before 21 x 10 (1 -> 11)
	value = rawval+Math.min(aces,Math.floor(Math.abs(21-rawval)/10))*10
	return value;
}

function checkHandState(totalvalue,state){
	if(state == 1){
		if(totalvalue > 21)lose();
		if(totalvalue == 21)win(true);
		return;
	}else{
		if(totalvalue > 21)win();
		if(totalvalue == 21)lose();
		return;
	}
}

function cardsReachedPosition(){
	var reach = true;
	dealer.forEach((e)=>{if(!e.reached())reach=false;});
	hand.forEach((e)=>{if(!e.reached())reach=false;});
	return reach;
}

var dealertimer = 0;
function gameLoop(){
	Fill("#009933");
	DrawText(0,25,"BLACKJACK by TeamTube","#ffffff","25px Arial");
	DrawText(1000,25,"MONEY: "+money+"$","white","25px Arial")
	ctx.drawImage(images.chips,1100,550,200,100);
	DrawText(1100,650,"BET:"+bet,"yellow");
	//deck
	if(true){
		ctx.drawImage(images.facedown,100,115,150,200)
		ctx.drawImage(images.facedown,100,110,150,200)
		ctx.drawImage(images.facedown,100,105,150,200)
		ctx.drawImage(images.facedown,100,100,150,200)
	}
	var cardreach = cardsReachedPosition()
	var handtotal = 0;
	var dealertotal = 0;
	if(gamestep == 0){
		//START BY PLACING BET
		DrawButton(300,550,100,50,"BET 5",()=>{bet=5;gamestep=1;drawCards();},"#ffffff","30px Arial","grey");
		DrawButton(500,550,100,50,"BET 10",()=>{bet=10;gamestep=1;drawCards();},"#ffffff","30px Arial","grey");
		DrawButton(700,550,100,50,"BET 15",()=>{bet=15;gamestep=1;drawCards();},"#ffffff","30px Arial","grey");
	}if(gamestep >= 1){//RENDERING CARDS AND UI
		dealer.forEach((e)=>{e.render();});
		hand.forEach((e)=>{e.render();});
		//WRITING TOTALS
		handtotal = calculateTotalValue(hand);
		dealertotal = calculateTotalValue(dealer);
		DrawText(0,500,"Your Total: "+handtotal,"white","30px Arial")
		if(gamestep == 1 || (gamestep == 2 && dealer[0].facedown))DrawText(0,400,"Dealer's Total: ?+"+calculateTotalValue([dealer[1]]),"white","30px Arial")
		else if(!dealer[0].facedown && gamestep >= 2)DrawText(0,400,"Dealer's Total: "+calculateTotalValue(dealer),"white","30px Arial")
	}if(gamestep == 1){//PLAYER'S TURN
		DrawButton(300,600,100,50,"HIT",()=>{if(cardreach){hand.push(new Card(draw(),100,100,300+150*hand.length,400));checkHandState(calculateTotalValue(hand),1)}},"#ffffff","30px Arial",cardreach ? "grey" : "black");
		DrawButton(500,600,100,50,"STAND",()=>{if(cardreach){gamestep = 2;}},"#ffffff","30px Arial",cardreach ? "grey" : "black");
		DrawButton(700,600,200,50,"DOUBLE DOWN",()=>{if(cardreach){hand.push(new Card(draw(),100,100,300+150*hand.length,400));checkHandState(calculateTotalValue(hand),1);money-=bet;bet*=2;};if(gamestep == 1)gamestep = 2;},"#ffffff","30px Arial",cardreach ? "grey" : "black")
	}else if(gamestep == 2){//DEALER'S TURN
		//fake buttons
		DrawButton(300,600,100,50,"HIT",()=>{},"#ffffff","30px Arial","black");
		DrawButton(500,600,100,50,"STAND",()=>{},"#ffffff","30px Arial","black");
		DrawButton(700,600,200,50,"DOUBLE DOWN",()=>{},"#ffffff","30px Arial","black");
		dealertimer++;
		if(dealertimer >= 60)dealertimer = 0;
		
		if(cardreach && dealertimer == 0){
			if(dealer[0].facedown){
				dealer[0].facedown = false; 
			}else if(dealertotal < 17){//DRAW CARD AND CHECK FOR STATE, THEN ELSE START COMPARE
				dealer.push(new Card(draw(),100,100,500+150*dealer.length,150));
				checkHandState(calculateTotalValue(dealer));
			}else{
				//COMPARE
				if(handtotal > dealertotal){
					win(false);
				}else if(handtotal < dealertotal){
					lose();
				}else{
					tie();
				}
			}
		}
	}else if(gamestep == 3){//WIN/LOSE/TIE SCREEN SET DEALERTIMER TO 120
		var imgsize = (60-Math.abs(60-dealertimer))/60
		if(winstatus == 1){
			ctx.drawImage(images.win,canvas.width/2-imgsize*200,canvas.height/2-imgsize*100,400*imgsize,200*imgsize);
		}else if(winstatus == -1){
			ctx.drawImage(images.lose,canvas.width/2-imgsize*225,canvas.height/2-imgsize*100,450*imgsize,200*imgsize);
		}else if(winstatus == 0){
			ctx.drawImage(images.tie,canvas.width/2-imgsize*200,canvas.height/2-imgsize*100,400*imgsize,200*imgsize);
		}
		dealertimer--;
		if(dealertimer <= 0)resetGame();
	}
}

window.setInterval(gameLoop,1000/60)
