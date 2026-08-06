const icons=[
    "🍎","🍌","🍇","🍉",
    "🍓","🍒","🥝","🍍"
    ];
    
    let cards=[...icons,...icons];
    
    cards.sort(()=>Math.random()-0.5);
    
    const board=document.getElementById("game");
    
    let first=null;
    let second=null;
    
    let lock=false;
    
    let score=0;
    
    let moves=0;
    
    let seconds=0;
    
    const timer=document.getElementById("timer");
    
    const scoreEl=document.getElementById("score");
    
    const movesEl=document.getElementById("moves");
    
    function format(t){
    
    let m=Math.floor(t/60);
    
    let s=t%60;
    
    return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    
    }
    
    setInterval(()=>{
    
    seconds++;
    
    timer.innerHTML=format(seconds);
    
    },1000);
    
    cards.forEach((icon,index)=>{
    
    let card=document.createElement("div");
    
    card.className="card flip";
    
    card.dataset.icon=icon;
    
    card.innerHTML=`
    
    <div class="face front">${icon}</div>
    
    <div class="face back">?</div>
    
    `;
    
    board.appendChild(card);
    
    });
    
    const all=document.querySelectorAll(".card");
    
    setTimeout(()=>{
    
    all.forEach(c=>c.classList.remove("flip"));
    
    },3000);
    
    all.forEach(card=>{
    
    card.onclick=()=>{
    
    if(lock)return;
    
    if(card.classList.contains("flip"))return;
    
    card.classList.add("flip");
    
    if(!first){
    
    first=card;
    
    return;
    
    }
    
    second=card;
    
    moves++;
    
    movesEl.innerHTML=moves;
    
    if(first.dataset.icon===second.dataset.icon){
    
    score+=10;
    
    scoreEl.innerHTML=score;
    
    first.classList.add("match");
    
    second.classList.add("match");
    
    first=null;
    
    second=null;
    
    if(document.querySelectorAll(".match").length===16){
    
    document.getElementById("win").classList.remove("hidden");
    
    document.getElementById("result").innerHTML=
    
    `زمان ${format(seconds)}<br>حرکت ${moves}`;
    
    }
    
    }else{
    
    lock=true;
    
    setTimeout(()=>{
    
    first.classList.remove("flip");
    
    second.classList.remove("flip");
    
    first=null;
    
    second=null;
    
    lock=false;
    
    },900);
    
    }
    
    }
    
    });
    
    document.getElementById("restart").onclick=()=>location.reload();