const $ = require("jquery");
const fs = require("fs");

// document 
const dialog = require("electron").remote.dialog;
$(document).ready(function () {
    // console.log("Jquery Loaded");
    let db;
    let lsc;

    $(".content-container").on("scroll", function () {
        let scrollY = $(this).scrollTop();
        let scrollX = $(this).scrollLeft();
        // console.log(scrollY);
        $("#top-row,#top-left-cell").css("top", scrollY + "px");
        $("#top-left-cell,#left-col").css("left", scrollX + "px");
    })

    $("#grid .cell").on("keyup", function () {
        let { rowId } = getrc(this);
        let ht = $(this).height();
        console.log(ht);
        $($("#left-col .cell")[rowId]).height(ht);
    })

    $(".menu").on("click", function () {
        let Id = $(this).attr("id");
        // File
        $(".menu-options").removeClass("selected");
        $(`#${Id}-menu-options`).addClass("selected");
    })

    let lcell;
    $("#grid .cell").on("click", function () {
        let { colId, rowId } = getrc(this);
        let value = String.fromCharCode(65 + colId)
            + (rowId + 1);
        let cellObject = db[rowId][colId];
        $("#address-input").val(value);
        $("#formula-input").val(cellObject.formula);
        //    set cell formula 
        if (lcell && this != lcell) {
            $(lcell).removeClass("selected");
        }
        $(this).addClass("selected");
        if (cellObject.bold) {
            $("#bold").addClass("isOn")
        } else {
            $("#bold").removeClass("isOn")
        }
        lcell = this;
    })

    //bold
    $("#bold").on("click", function () {
        $(this).toggleClass("isOn");
        let isBold = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("font-weight", isBold ? "bolder" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.bold = isBold;
    })

    //italic
    $("#italic").on("click", function () {
        $(this).toggleClass("isOn");
        let isItalic = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("font-style", isItalic ? "italic" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.italic = isItalic;
    })

    //underline
    $("#underline").on("click", function () {
        $(this).toggleClass("isOn");
        let isUnderline = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("text-decoration", isUnderline ? "underline" : "none");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.underline = isUnderline;
    })

    //left align
    $("#left").on("click", function () {
        $(this).toggleClass("isOn");
        let isLeft = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("text-align", isLeft ? "left" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.left = isLeft;
    })

    //center align
    $("#center").on("click", function () {
        $(this).toggleClass("isOn");
        let isCenter = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("text-align", isCenter ? "center" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.center = isCenter;
    })

    //right align
    $("#right").on("click", function () {
        $(this).toggleClass("isOn");
        let isRight = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("text-align", isRight ? "right" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.right = isRight;
    })

    //change font family
    $("#font-family").on("change", function () {
        let fontFamily = $(this).val();
        $("#grid .cell.selected").css("font-family", fontFamily);
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.fontFamily = fontFamily;
    })
    
    //change font size
    $("#font-size").on("change", function () {
        let fontSize = $(this).val();
        console.log(fontSize);
        $(".cell.selected").css("font-size", fontSize + "px");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.fontSize = fontSize;
    })

    //text color click
    $("#text-color").on("click", function(){
        $("#text-color-palette").click();
    })

    //background color click
    $("#bg-color").on("click", function(){
        $("#bg-color-palette").click();
    })

    //change bg color of cell
    $("#bg-color-palette").on("change", function () {
        let bgColor = $(this).val();
        let cellElem = $("#grid .cell.selected");
        cellElem.css("background-color", bgColor);
        let cellObject = getcell(cellElem);
        cellObject.bgColor = bgColor;
    })

    //change text color
    $("#text-color-palette").on("change", function () {
        let textColor = $(this).val();
        let cellElem = $("#grid .cell.selected");
        cellElem.css("color", textColor);
        let cellObject = getcell(cellElem);
        cellObject.textColor = textColor;
    })

    //create new file
    $("#New").on("click", function () {
        db = [];
        let AllRows = $("#grid").find(".row");
        for (let i = 0; i < AllRows.length; i++) {
            let row = [];
            let AllCols = $(AllRows[i]).find(".cell");
            for (let j = 0; j < AllCols.length; j++) {
                //    DB
                let cell = {
                    value: "",
                    formula: "",
                    downstream: [],
                    upstream: [],
                    bold: false,
                    underline: false,
                    italic: false,
                    fontFamily: "Arial",
                    fontSize: 10,
                    bgColor: "white",
                    textColor: "black",
                    halign: "left"
                }

                $(AllCols[j]).html('');
                $(AllCols[j]).css("font-weight", cell.bold ? "bolder" : "normal");
                $(AllCols[j]).css("font-style", cell.italic ? "italic" : "normal");
                $(AllCols[j]).css("text-decoration", cell.underline ? "underline" : "none");
                $(AllCols[j]).css("font-family", cell.fontFamily);
                $(AllCols[j]).css("font-size", cell.fontSize);
                $(AllCols[j]).css("color", cell.textColor);
                $(AllCols[j]).css("background-color", cell.bgColor);
                $(AllCols[j]).css("text-align", cell.halign);

                row.push(cell);
            }
            db.push(row);
        }
        console.log(db);
        let cellArr = $("#grid .cell");
        $(cellArr[0]).trigger("click");
    })

    //save current file
    $("#Save").on("click", async function () {
        let sdb = await dialog.showOpenDialog();
        let fp = sdb.filePaths[0];
        if (fp == undefined) {
            console.log("Please select file first");
            return;
        }
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(fp, jsonData);
    })

    //open existing file
    $("#Open").on("click", async function () {
        let sdb = await dialog.showOpenDialog();
        let fp = sdb.filePaths[0];
        if (fp == undefined) {
            console.log("Please select file first");
            return;
        }
        let buffer = fs.readFileSync(fp);
        db = JSON.parse(buffer);
        let AllRows = $("#grid").find(".row");
        for (let i = 0; i < AllRows.length; i++) {
            let AllCols = $(AllRows[i]).find(".cell");
            for (let j = 0; j < AllCols.length; j++) {
                //    DB
                let cell = db[i][j];
                $(AllCols[j]).html(cell.value);
                $(AllCols[j]).css("font-weight", cell.bold ? "bolder" : "normal");
                $(AllCols[j]).css("font-style", cell.italic ? "italic" : "normal");
                $(AllCols[j]).css("text-decoration", cell.underline ? "underline" : "none");
                $(AllCols[j]).css("font-family", cell.fontFamily);
                $(AllCols[j]).css("font-size", cell.fontSize);
                $(AllCols[j]).css("color", cell.textColor);
                $(AllCols[j]).css("background-color", cell.bgColor);
                $(AllCols[j]).css("text-align", cell.halign);
            }
        }
    })

    // Formula Working
    $("#grid .cell").on("blur", function () {
        let { colId, rowId } = getrc(this);
        let cellObject = getcell(this);
        lsc = this;
        if (cellObject.value == $(this).html()) {
            return;
        }
        if (cellObject.formula) {
            rmusnds(cellObject, this);
        }
        cellObject.value = $(this).text();
        updateCell(rowId, colId, cellObject.value);
        // console.log(db);
    })

    // val=> formula convert
    //formula => new formula 
    $("#formula-input").on("blur", function () {
        let cellObj = getcell(lsc);
        if (cellObj.formula == $(this).val()) {
            return
        }
        let { colId, rowId } = getrc(lsc);
        if (cellObj.formula) {
            // delete Formula
            rmusnds(cellObj, lsc);
        }
        cellObj.formula = $(this).val();
        // add Formula
        setusnds(lsc, cellObj.formula);
        // 4. calculate value from formula
        let nVal = evaluate(cellObj);
        console.log(nVal);
        // update your cell
        updateCell(rowId, colId, nVal);
    })

    //evaluate
    function evaluate(cellObj) {
        let formula = cellObj.formula;
        console.log(formula);
        for (let i = 0; i < cellObj.upstream.length; i++) {
            let cuso = cellObj.upstream[i];
            let colAddress = String.fromCharCode(cuso.colId + 65);
            let cellAddress = colAddress + (cuso.rowId + 1);
            let fusokiVal = db[cuso.rowId][cuso.colId].value;
            //  remove formula 
            // return 
            let formulCompArr = formula.split(" ");
            formulCompArr = formulCompArr.map(function (elem) {
                if (elem == cellAddress) {
                    return fusokiVal;
                } else {
                    return elem;
                }
            })
            formula = formulCompArr.join(" ");
        }
        console.log(formula);
        // infix evaluation
        return eval(formula);
    }

    // set yourself to parents downstream set parent to your upstream
    function updateCell(rowId, colId, nVal) {
        let cellObject = db[rowId][colId];
        cellObject.value = nVal;
        // update ui 
        $(`#grid .cell[r-id=${rowId}][c-id=${colId}]`).html(nVal);

        for (let i = 0; i < cellObject.downstream.length; i++) {
            let dsocordObj = cellObject.downstream[i];
            let dso = db[dsocordObj.rowId][dsocordObj.colId];
            let dsonVal = evaluate(dso);
            updateCell(dsocordObj.rowId, dsocordObj.colId, dsonVal);
        }
    }

    function setusnds(cellElement, formula) {
        // (A1 + B1)
        formula = formula.replace("(", "").replace(")", "");
        // "A1 + B1"
        let formulaComponent = formula.split(" ");
        // [A1,+,B1]
        for (let i = 0; i < formulaComponent.length; i++) {
            let charAt0 = formulaComponent[i].charCodeAt(0);
            if (charAt0 > 64 && charAt0 < 91) {
                let { r, c } = getParentRowCol(formulaComponent[i], charAt0);
                let parentCell = db[r][c];

                let { colId, rowId } = getrc(cellElement);
                let cell = getcell(cellElement);
                // add yourself to downstream of your parent
                parentCell.downstream.push({
                    colId: colId, rowId: rowId
                });
                //update in db
                cell.upstream.push({
                    colId: c,
                    rowId: r
                })

            }
        }
    }

    // delete formula
    function rmusnds(cellObject, cellElem) {
        // 3.
        cellObject.formula = "";
        let { rowId, colId } = getrc(cellElem);
        for (let i = 0; i < cellObject.upstream.length; i++) {
            let uso = cellObject.upstream[i];
            let fuso = db[uso.rowId][uso.colId];
            let fArr = fuso.downstream.filter(function (dCell) {
                return !(dCell.colId == colId && dCell.rowId == rowId);
            })
            fuso.downstream = fArr;
        }
        cellObject.upstream = [];

    }
    
    function getParentRowCol(cellName, charAt0) {
        let sArr = cellName.split("");
        sArr.shift();
        let sRow = sArr.join("");
        let r = Number(sRow) - 1;
        let c = charAt0 - 65;
        return { r, c };
    }

    // get row and col from ui
    function getrc(elem) {
        let colId = Number($(elem).attr("c-id"));
        let rowId = Number($(elem).attr("r-id"));
        return {
            colId, rowId
        }
    }

    // Get cell from db
    function getcell(cellElem) {
        let { colId, rowId } = getrc(cellElem);
        console.log(colId + " " + rowId);
        return db[rowId][colId];
    }

    function init() {
        $("#File").trigger("click");
        $("#New").trigger("click");
    }
    init();
})