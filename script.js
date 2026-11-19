const BOOKS=[
{id:1,t:"Clean Code",a:"Robert C. Martin",c:"Programming",p:549,col:"#2a4d69"},
{id:2,t:"Eloquent JavaScript",a:"Marijn Haverbeke",c:"Programming",p:499,col:"#7a5c00"},
{id:3,t:"Python Crash Course",a:"Eric Matthes",c:"Programming",p:620,col:"#1b5e5a"},
{id:4,t:"Wings of Fire",a:"A. P. J. Abdul Kalam",c:"Biography",p:240,col:"#a23b2a"},
{id:5,t:"Ponniyin Selvan",a:"Kalki Krishnamurthy",c:"Fiction",p:450,col:"#5b3a7a"},
{id:6,t:"The Alchemist",a:"Paulo Coelho",c:"Fiction",p:299,col:"#b5651d"},
{id:7,t:"Atomic Habits",a:"James Clear",c:"Self-help",p:399,col:"#2f6b3a"},
{id:8,t:"Deep Work",a:"Cal Newport",c:"Self-help",p:350,col:"#444c5e"}];
const $=s=>document.querySelector(s);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let cart=load("cart",{}),user=load("user",null),cat="All",mode="in";
const money=n=>"Rs. "+n.toLocaleString("en-IN");

function chips(){const cs=["All",...new Set(BOOKS.map(b=>b.c))];
 $("#chips").innerHTML=cs.map(c=>`<button class="${c===cat?"on":""}" data-c="${c}">${c}</button>`).join("");}
function grid(){const q=$("#q").value.toLowerCase();
 const list=BOOKS.filter(b=>(cat==="All"||b.c===cat)&&(b.t+b.a).toLowerCase().includes(q));
 $("#grid").innerHTML=list.length?list.map(b=>`<div class="book"><div class="cover" style="background:${b.col}">${b.t}</div>
 <div class="info"><span>${b.a}</span><small>${b.c}</small><span class="price">${money(b.p)}</span>
 <button data-add="${b.id}">Add to cart</button></div></div>`).join(""):"<p>No books match your search.</p>";}
function renderCart(){const ids=Object.keys(cart);let total=0,n=0;
 $("#items").innerHTML=ids.length?ids.map(id=>{const b=BOOKS.find(x=>x.id==id),q=cart[id];total+=b.p*q;n+=q;
 return `<div class="row"><span>${b.t}<br><small>${money(b.p)}</small></span><span class="qty">
 <button data-dec="${id}" aria-label="Remove one">-</button> ${q} <button data-inc="${id}" aria-label="Add one">+</button></span></div>`}).join(""):"<p>Your cart is empty. Add a book to get started.</p>";
 $("#total").textContent=money(total);$("#cnt").textContent=n;save("cart",cart);}
function orders(){const all=load("orders",[]).filter(o=>user&&o.user===user.email);
 if(!user)return;
 $("#orders").innerHTML=all.length?all.map(o=>`<div class="row"><span>Order #${o.id} - ${o.date}<br><small>${o.items}</small></span><strong>${money(o.total)}</strong></div>`).join(""):"<p>No orders yet.</p>";}
function acct(){$("#acct").textContent=user?"Sign out ("+user.email.split("@")[0]+")":"Sign in";orders();}

document.addEventListener("click",e=>{const d=e.target.dataset;
 if(d.c){cat=d.c;chips();grid()}
 if(d.add){cart[d.add]=(cart[d.add]||0)+1;renderCart()}
 if(d.inc){cart[d.inc]++;renderCart()}
 if(d.dec){if(--cart[d.dec]<=0)delete cart[d.dec];renderCart()}});
$("#q").oninput=grid;
$("#cartBtn").onclick=()=>$("#cart").classList.add("open");
$("#closeCart").onclick=()=>$("#cart").classList.remove("open");
$("#acct").onclick=()=>{if(user){user=null;save("user",null);$("#orders").innerHTML="<p>Sign in and place an order to see it here.</p>";acct()}else{mode="in";authUI();$("#auth").showModal()}};
function authUI(){$("#authTitle").textContent=mode==="in"?"Sign in":"Create account";$("#go").textContent=mode==="in"?"Sign in":"Create account";$("#sw").textContent=mode==="in"?"Create account":"I have an account";$("#authErr").textContent=""}
$("#sw").onclick=()=>{mode=mode==="in"?"up":"in";authUI()};
$("#x").onclick=()=>$("#auth").close();
$("#go").onclick=()=>{const email=$("#em").value.trim(),pw=$("#pw").value,users=load("users",{});
 if(!email||pw.length<4){$("#authErr").textContent="Enter an email and a password of at least 4 characters.";return}
 if(mode==="up"){if(users[email]){$("#authErr").textContent="This email already has an account. Sign in instead.";return}users[email]=pw;save("users",users)}
 else if(users[email]!==pw){$("#authErr").textContent="Email or password is incorrect.";return}
 user={email};save("user",user);$("#auth").close();acct()};
$("#order").onclick=()=>{const ids=Object.keys(cart),note=$("#note");
 if(!ids.length){note.innerHTML='<p>Add a book before placing an order.</p>';return}
 if(!user){$("#cart").classList.remove("open");mode="in";authUI();$("#auth").showModal();return}
 if(!$("#addr").value.trim()){note.innerHTML='<p>Enter a delivery address.</p>';return}
 const total=ids.reduce((s,id)=>s+BOOKS.find(b=>b.id==id).p*cart[id],0);
 const items=ids.map(id=>BOOKS.find(b=>b.id==id).t+" x"+cart[id]).join(", ");
 const all=load("orders",[]);const o={id:1001+all.length,user:user.email,items,total,date:new Date().toLocaleDateString("en-IN")};
 all.push(o);save("orders",all);cart={};renderCart();orders();
 note.innerHTML=`<div class="msg">Order #${o.id} placed. Total ${money(total)}.</div>`};
chips();grid();renderCart();acct();
