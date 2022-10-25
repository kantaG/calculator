function onKey(e){
    let input = document.getElementById("numIn");
    let btnval = e.target.value;
    if(btnval == "="){
        main();
        return;
    }
    if(btnval == "⇦"){
        input.value = input.value.slice(0, input.value.length-1);
        return;
    }
    if(btnval == "C"){
        input.value = "";
        return;
    }
    input.value += btnval;
}

function isFormula(formula){
    //数式として正しいかを判別
    if(formula.search(/^[\d|\+|\-|×|÷|\(|\)|\.]*$/g) == -1){
        console.log(1);
        return false;
    }
    if(formula.search(/^[\+×÷\.]/) != -1){
        console.log(2);
        return false;
    }
    if(formula.search(/[\+\-×÷\(][×\+÷\.\)]/) != -1){
        console.log(3);
        return false;
    }
    if(formula.search(/[\+\-\.][\-]/) != -1){
        console.log(4);
        return false;
    }
    if(formula.search(/\d\.\d*\./) != -1){
        console.log(4);
        return false;
    }
    return true;
}

function hiddenMul(formula){
    //括弧と数字の間で省略された*を処理(要修正)
    let result;
    while(true){
        result = formula.search(/\d\(/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/\)\d/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    return formula;
}

function minus(formula){
    let result;
    while(true){
        result = formula.search(/[\d\)]\-[\d\(]/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "~" + formula.slice(result+2, formula.length);
        }else{
            return formula;
        }
    }
}

function find_brackets(formula){
    //括弧を処理
    //戻り値：最初の(と最後の)の位置
    let count = 0, flag = 0;
    let start;
    for(let i = 0; i < formula.length; i++){
        if(formula[i] == "("){
            count += 1;
            if(flag == 0){
                start = i;
                flag = 1
            }
        }else if (formula[i] == ")"){
            if(flag == 0){
                return false;
            }
            count -= 1;
        }
        if(count < 0){
            return false;
        }else if(count == 0 && flag == 1){
            return [start, i];
        }
    }
    if(flag == 1){
        return false;
    }else{
        return -1;
    }
}

function add(formula1, formula2){
    //足し算
    return Number(calculate(formula1)) + Number(calculate(formula2));
}

function sub(formula1, formula2){
    //引き算
    return Number(calculate(formula1)) - Number(calculate(formula2));
}

function mul(formula1, formula2){
    //掛け算
    return Number(calculate(formula1)) * Number(calculate(formula2));
}

function div(formula1, formula2){
    //割り算
    n = Number(calculate(formula2));
    if(n == 0){
        console.log("zero division");
        return false;
    }
    return Number(calculate(formula1)) / n;
}

function calculate(formula){
    //計算を実行
    //返り値：計算結果
    console.log(formula);
    let brackets = find_brackets(formula);
    if(brackets == false){
        console.log("invalid formula");
        return false;
    }else if(brackets !== -1){
        return calculate(formula.slice(0, brackets[0]) + calculate(formula.slice(brackets[0]+1, brackets[1])) + formula.slice(brackets[1]+1, formula.length)); 
    }
    let result = formula.search(/[\+\~]/);
    if(result != -1){
        if(formula[result] == "+"){
            return add(formula.slice(0, result), formula.slice(result+1, formula.length));
        }else{
            return sub(formula.slice(0, result), formula.slice(result+1, formula.length));
        }
    }
    result = formula.search(/[×÷]/);
    if(result != -1){
        if(formula[result] == "×"){
            return mul(formula.slice(0, result), formula.slice(result+1, formula.length));
        }else{
            return div(formula.slice(0, result), formula.slice(result+1, formula.length));
        }
    }
    return formula;
}

function main(){
    let input = document.getElementById("numIn");
    console.log(input.value);
    let formula = input.value.replace(/\s+/g, "");
    if(isFormula(formula) == false){
        console.log("input is not formula");
        return;
    }
    formula = hiddenMul(formula);
    formula = minus(formula);

    input.value = calculate(formula)
}

window.addEventListener("DOMContentLoaded", function(){
    console.log("contents loaded");

    let key = document.getElementsByClassName("numkey");
    let targets = Array.from(key);
    targets.forEach(function(key){
        key.addEventListener("click", onKey, false);
    })
}, false);