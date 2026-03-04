function test(y) { 
    y = y + 10;
    return y > 10 && y < 20;
}
function test2(y) { 
    if(y > 0){ 
        return 1;
    }else {
        while(y < 5){
            console.log(10);
            y++;
        }    
        return y != 5? 0: -1;
    }
}