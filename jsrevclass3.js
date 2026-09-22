/*
//OPERATORS AND COMPARISONS

let a = 10;
let b = "10";
console.log(a==b);                  //true
console.log(a===b);                 //false
console.log(a+5);                   //15
console.log(a>10 && b<20);          //false
*/

/*
//CONTROL FLOW

let marks = 75;
if(marks >= 75) console.log("Grade A");
else if(marks <75 && marks>60) console.log("Grade B");
else console.log("Grade F");
*/

/*
//FOR LOOP :PRINT 1-5
for(let i=1; i<=5; i++){
    console.log(i);
}
*/

/*
//WHILE LOOP 
let a = 10;
while(a <= 15){
    console.log(a);
    a++;
}
*/

/*
//FUNCTION DECLARATION AND EXPRESSION 
function add (x,y){
    return x+y; 
}
console.log(add(2,5));

function  multiply(x,y,z){
    return x*y*z ;
}
console.log(multiply(3,2,5));
*/

/*
//ARROW FUNCTION
const great = (name = "Harshita") => `Hello, ${name}!`;
console.log(great());

const numbers = [1,2,3,4,5,6];
const doubled = numbers.map(n => n*2);
const even = numbers.filter(n => n%2==0);
const sum = numbers.reduce((total, n)=> total+n, 0);
console.log(`my array is ${numbers}`);
console.log(`doubled array is ${doubled}`);
console.log(`filtering the even numbers ${even}`);
console.log(`sum of the numbers is ${sum}`);
*/


//SPREAD 
const arr1 = [1,2,3];
const arr2 = [4,5,6];
const combined = [...arr1, ...arr2];
console.log(combined);