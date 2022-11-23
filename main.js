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
    if(formula.search(/^[\d|\+|\-|×|÷|\(|\)|\.|\^|π|√]*$/g) == -1){
        return false;
    }
    //先頭の記号
    if(formula.search(/^[\+×÷\.\^]/) != -1){
        return false;
    }
    //連続する記号
    if(formula.search(/[\+\-×÷\(\^√][×\+÷\.\)\^]/) != -1){
        return false;
    }
    //マイナスの制限
    if(formula.search(/[\+\-\.\^√][\-]/) != -1){
        return false;
    }
    //複数の小数点
    if(formula.search(/\d\.\d*\./) != -1){
        return false;
    }
    //末尾の記号
    if(formula.search(/[\-\+×÷\^√]$/) != -1){
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
            formula = formula.slice(0, result) + "3.14" + formula.slice(result+1, formula.length)
        }else{
            return formula
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
        let index = formula.slice(result+1, formula.length).search(/[\+\~×÷]/);
        if(index == -1){
            return [result+1, formula.length]
        }
        return [result+1, index+result+1];
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
    return Number(calculate(formula1) ** Number(calculate(formula2)))
}

function root(formula){
    console.log(`root:${formula}`)
    if(Number(formula) < 0){
        console.log("minus root");
        errorflag = 1;
        return false;
    }
    return Number(Math.sqrt(Number(formula)))
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
        return calculate(formula.slice(0, brackets[0]) + calculate(formula.slice(brackets[0]+1, brackets[1])) + formula.slice(brackets[1]+1, formula.length)); 
    }

    let roots = find_root(formula);
    console.log(`roots:${roots}`)
    if(roots !== -1){
        return calculate(formula.slice(0, roots[0]-1) + String(root(formula.slice(roots[0], roots[1])) + formula.slice(roots[1], formula.length)))
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
    console.log(formula);
    formula = hiddenMul(formula);
    console.log(formula)
    formula = minus(formula);

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