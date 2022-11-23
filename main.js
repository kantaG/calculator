var errorflag = 0;

function onKey(e){
    //キー入力を受け付ける
    document.getElementById('se').currentTime = 0;
    document.getElementById('se').play();
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
    if(btnval == "sin"){
        input.value += "sin("
        return;
    }
    if(btnval == "cos"){
        input.value += "cos("
        return;
    }
    input.value += btnval;
}

function enter(e){
    //エンターキーで計算をスタートする
    if(e.keyCode === 13){
        main();
    }
}

function isFormula(formula){
    //数式として正しいかを判別
    //文字の種類(ホワイトリスト)
    if(formula.search(/^[\d|\+|\-|×|÷|\(|\)|\.|\^|π|√|e|!|sin|cos]*$/g) == -1){
        return false;
    }
    //先頭の記号
    if(formula.search(/^[\+×÷\.\^\!]/) != -1){
        return false;
    }
    //連続する記号
    if(formula.search(/[\+\-×÷\(\^√sinco][×\+÷\.\)\^\!]/) != -1){
        return false;
    }
    //マイナスの制限
    if(formula.search(/[\+\-\.\^√sinco][\-]/) != -1){
        return false;
    }
    //複数の小数点
    if(formula.search(/\d\.\d*\./) != -1){
        return false;
    }
    //末尾の記号
    if(formula.search(/[\-\+×÷\^√sinco]$/) != -1){
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
    while(true){
        result = formula.search(/\d√/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/√√/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/\dC/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/\dS/);
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
        result = formula.search(/[\d\)\!]\-[\d\(]/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "~" + formula.slice(result+2, formula.length);
        }else{
            return formula;
        }
    }
}

function pi(formula){
    let result;
    while(true){
        result = formula.search(/\dπ|π\d/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/π/);
        if(result != -1){
            formula = formula.slice(0, result) + "3.14159" + formula.slice(result+1, formula.length)
        }else{
            return formula
        }
    }
}

function napier(formula){
    let result;
    while(true){
        result = formula.search(/\de|e\d/);
        if(result != -1){
            formula = formula.slice(0, result+1) + "×" + formula.slice(result+1, formula.length);
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/e/);
        if(result != -1){
            formula = formula.slice(0, result) + "2.71828" + formula.slice(result+1, formula.length)
        }else{
            return formula
        }
    }
}

function trigonometric_function(formula){
    let result;
    while(true){
        result = formula.search(/cos/);
        if(result != -1){
            formula = formula.slice(0, result) + "C" + formula.slice(result+3, formula.length)
        }else{
            break;
        }
    }
    while(true){
        result = formula.search(/sin/);
        if(result != -1){
            formula = formula.slice(0, result) + "S" + formula.slice(result+3, formula.length)
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

function find_root(formula){
    let result = formula.lastIndexOf("√");
    if(result != -1){
        let index = formula.slice(result+1, formula.length).search(/[\+\~×÷\^\!]/);
        if(index == -1){
            return [result+1, formula.length]
        }
        return [result+1, index+result+1];
    }
    return -1;
}

function find_exp(formula){
    let result = formula.search(/\!/);
    if(result != -1){
        for(let i = result-1; i >= 0; i -= 1){
            if(formula[i].search(/[\*\+\~\×÷\/^]/) !== -1){
                return [i+1, result];
            }
        }
        return [0, result];
    }
    return -1;
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
        errorflag = 1;
        return false;
    }
    return Number(calculate(formula1)) / n;
}
function exp(formula1, formula2){
    return Number(calculate(formula1) ** Number(calculate(formula2)));
}

function root(formula){
    console.log(`root:${formula}`);
    if(Number(formula) < 0){
        console.log("minus root");
        errorflag = 1;
        return false;
    }
    return Number(Math.sqrt(Number(formula)));
}

function solv_fac(num){
    if (num === 0){
        return 1;
    }
    return num * solv_fac(num-1);
}

function factorial(formula){
    console.log(`factorial:${formula}`)
    if(Number.isInteger(Number(formula)) && Number(formula) >= 0){
        return solv_fac(formula);
    }else{
        errorflag = 1
        return false;
    }
}

function cal_sin(formula){
    return Number(Math.sin(calculate(formula)));
}

function cal_cos(formula){
    return Number(Math.cos(calculate(formula)));
}

function calculate(formula){
    console.log(`calculate:${formula}`)
    //計算を実行
    //返り値：計算結果
    //括弧
    let brackets = find_brackets(formula);
    if(brackets == false){
        errorflag = 1;
        return false;
    }else if(brackets !== -1){
        if(brackets[0] > 0 && formula[brackets[0]-1] == "S"){
            return calculate(formula.slice(0, brackets[0]-1) + cal_sin(formula.slice(brackets[0]+1, brackets[1])) + formula.slice(brackets[1]+1, formula.length));
        }else if(brackets[0] > 0 && formula[brackets[0]-1] == "C"){
            return calculate(formula.slice(0, brackets[0]-1) + cal_cos(formula.slice(brackets[0]+1, brackets[1])) + formula.slice(brackets[1]+1, formula.length));
        }else{
            return calculate(formula.slice(0, brackets[0]) + calculate(formula.slice(brackets[0]+1, brackets[1])) + formula.slice(brackets[1]+1, formula.length)); 
  
        }
    }

    //ルート
    let roots = find_root(formula);
    console.log(`roots:${roots}`)
    if(roots !== -1){
        return calculate(formula.slice(0, roots[0]-1) + String(root(formula.slice(roots[0], roots[1])) + formula.slice(roots[1], formula.length)))
    }

    //階乗
    let exps = find_exp(formula);
    console.log(`exps:${exps}`)
    if(exps !== -1){
        return calculate(formula.slice(0, exps[0]) + String(factorial(formula.slice(exps[0], exps[1])) + formula.slice(exps[1]+1, formula.length)))
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
    result = formula.lastIndexOf("^");
    if(result != -1){
        return exp(formula.slice(0, result), formula.slice(result+1, formula.length))
    }
    return formula;
}

function main(){
    let input = document.getElementById("numIn");
    let formula = input.value.replace(/\s+/g, "");
    let temp = formula;
    let logs = document.getElementById("log");

    errorflag = 0;

    //入力を検証
    if(isFormula(formula) === false){
        input.value = "error";
        logs.innerHTML += temp + " = error<br>";
        return;
    }
    formula = pi(formula);
    formula = napier(formula);
    formula = trigonometric_function(formula);
    console.log(formula);
    formula = hiddenMul(formula);
    console.log(formula)
    formula = minus(formula);

    if(formula.search(/^[\d|\+|\-|×|÷|\(|\)|\.|\^|√|!|~|S|C]*$/g) == -1){
        errorflag = 1;
    }

    //計算を実行
    result = calculate(formula);
    if(result === false){
        input.value = "error";
        logs.innerHTML += temp + " = error<br>";
        return;
    }

    //ゼロ除算を検知（要修正）
    if(errorflag == 1){
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

    let input = this.document.getElementById("numIn");
    input.addEventListener("keypress", enter, false);
}, false);