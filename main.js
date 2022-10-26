var zeroflag = 0;

function onKey(e){
    //キー入力を受け付ける
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
        return false;
    }
    if(formula.search(/^[\+×÷\.]/) != -1){
        return false;
    }
    if(formula.search(/[\+\-×÷\(][×\+÷\.\)]/) != -1){
        return false;
    }
    if(formula.search(/[\+\-\.][\-]/) != -1){
        return false;
    }
    if(formula.search(/\d\.\d*\./) != -1){
        return false;
    }
    return true;
}

function hiddenMul(formula){
    //括弧と数字の間、括弧と括弧の間で省略された掛け算を処理(要修正)
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
    while(true){
        result = formula.search(/\)\(/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    return formula;
}

function minus(formula){
    //二項演算子としての-を~に置換
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
        zeroflag = 1;
        return false;
    }
    return Number(calculate(formula1)) / n;
}

function calculate(formula){
    //計算を実行
    //返り値：計算結果
    console.log(formula);
    //括弧
    let brackets = find_brackets(formula);
    if(brackets == false){
        console.log("invalid formula");
        return false;
    }else if(brackets !== -1){
        return calculate(formula.slice(0, brackets[0]) + calculate(formula.slice(brackets[0]+1, brackets[1])) + formula.slice(brackets[1]+1, formula.length)); 
    }

    //加算。減算
    let result = Math.max(formula.lastIndexOf("+"), formula.lastIndexOf("~"));
    if(result != -1){
        if(formula[result] == "+"){
            return add(formula.slice(0, result), formula.slice(result+1, formula.length));
        }else{
            return sub(formula.slice(0, result), formula.slice(result+1, formula.length));
        }
    }

    //乗算、除算
    result = Math.max(formula.lastIndexOf("×"), formula.lastIndexOf("÷"));
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
    let formula = input.value.replace(/\s+/g, "");
    let temp = formula;
    let logs = document.getElementById("log");

    zeroflag = 0;

    //入力を検証
    if(isFormula(formula) == false){
        input.value = "error";
        logs.innerHTML += temp + " = error<br>";
        return;
    }
    formula = hiddenMul(formula);
    formula = minus(formula);

    //計算を実行
    result = calculate(formula);
    if(result == false){
        input.value = "error";
        logs.innerHTML += temp + " = error<br>";
        return;
    }

    //ゼロ除算を検知（要修正）
    if(zeroflag == 1){
        input.value = "error";
        logs.innerHTML += temp + " = error<br>";
        return;
    }

    //結果を反映
    input.value = result;
    logs.innerHTML += temp + " = " + result + "<br>"
}

window.addEventListener("DOMContentLoaded", function(){
    console.log("contents loaded");

    //イベントリスナーを設置
    let key = document.getElementsByClassName("numkey");
    let targets = Array.from(key);
    targets.forEach(function(key){
        key.addEventListener("click", onKey, false);
    })
}, false);