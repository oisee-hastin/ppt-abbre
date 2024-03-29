Office.onReady();
let abbreDatabaseAry = [{ abbre: "", full: "" }];
let logDataExsit = false;
let logTags;
let abbreLogTag, excludeLogTag, tableLogTag;
let ary_registedAbbreObjIDs = [];
let ary_excludedAbbreObjIDs = [];
let ary_registedTableObjIDandContents = [];
// let abbreCsvFilePath = "";

async function searchRegistObj() {
     if (!logDataExsit) {
          await PowerPoint.run(async (context) => {
               let slide0 = context.presentation.slides.getItemAt(0);
               slide0.load("tags");
               await context.sync();
               logTags = slide0.logTags;
               // try {
               abbreLogTag = slide0.tags.getItemOrNullObject("ABBRELOG");
               excludeLogTag = slide0.tags.getItemOrNullObject("EXCLUDELOG");
               tableLogTag = slide0.tags.getItemOrNullObject("TABLELOG");
               await context.sync();
               abbreLogTag.load("key, value");
               excludeLogTag.load("key, value");
               tableLogTag.load("key, value");
               await context.sync();
               if (abbreLogTag.isNullObject) {
                    slide0.tags.add("ABBRELOG", JSON.stringify([]));
                    await context.sync();
                    console.log("Add abbre log");
               } else {
                    console.log("Found abbre log");
                    ary_registedAbbreObjIDs = JSON.parse(abbreLogTag.value);
                    console.log(ary_registedAbbreObjIDs);
               }
               if (excludeLogTag.isNullObject) {
                    slide0.tags.add("EXCLUDELOG", JSON.stringify([]));
                    await context.sync();
                    console.log("Add exclude log");
               } else {
                    console.log("Found exclude log");
                    ary_excludedAbbreObjIDs = JSON.parse(excludeLogTag.value);
                    console.log(ary_excludedAbbreObjIDs);
               }
               if (tableLogTag.isNullObject) {
                    slide0.tags.add("TABLELOG", JSON.stringify([]));
                    tableLogTag = slide0.tags.getItemOrNullObject("TABLELOG");
                    await context.sync();
                    console.log("Add table log");
               } else {
                    console.log("Found table log");
                    ary_registedTableObjIDandContents = JSON.parse(tableLogTag.value);
                    console.log(ary_registedTableObjIDandContents);
               }

               logDataExsit = true;
          });
     }
}
async function registAbbreObj() {
     await searchRegistObj();
     let alt = 0;
     let ctrl = 0;
     let shift = 0;
     try {
          if (event.altKey == 1) {
               alt = 1;
          }
          if (event.ctrlKey == 1) {
               ctrl = 1;
          }
          if (event.shiftKey == 1) {
               shift = 1;
          }
     } catch (err) {}
     if (ctrl && alt && shift) {
          ary_registedAbbreObjIDs = [];
          document.getElementById("notificationContents").innerText = "已清空縮寫表紀錄";
     } else if (ctrl && shift && !alt) {
          await PowerPoint.run(async (context) => {
               let slides = context.presentation.slides;
               let selectedShapes = context.presentation.getSelectedShapes();
               selectedShapes.load("items");
               slides.load("items");
               await context.sync();
               let registedCount = 0;
               let bottomPosRef = 900;
               if (selectedShapes.items.length > 0) {
                    selectedShapes.items[0].load("top", "height");
                    bottomPosRef = selectedShapes.items[0].top + selectedShapes.items[0].height - 10;
               }
               console.log(bottomPosRef);
               for (let i = 0; i < slides.items.length; i++) {
                    curPageShapes = slides.items[i].shapes;
                    curSlideID = slides.items[i].id;
                    curPageShapes.load("items");
                    await context.sync();
                    for (let k = 0; k < curPageShapes.items.length; k++) {
                         let tmpObj = new Object();
                         tmpObj.slideID = curSlideID;
                         tmpObj.shapeID = curPageShapes.items[k].id;
                         curPageShapes.items[k].load("top", "height");
                         await context.sync();
                         let checkAbbreRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                              return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                         });
                         console.log(curPageShapes.items[k].top + curPageShapes.items[k].height);
                         console.log(curPageShapes.items[k].top + curPageShapes.items[k].height > bottomPosRef);
                         try {
                              if (curPageShapes.items[k].top + curPageShapes.items[k].height > bottomPosRef) {
                                   curPageShapes.items[k].textFrame.textRange.load("text");
                                   await context.sync();
                                   let curItemTextContent = curPageShapes.items[k].textFrame.textRange.text;
                                   if (curItemTextContent.length > 5 && curItemTextContent.match(/[\:=,]/)) {
                                        if (checkAbbreRegisted == -1) {
                                             ary_registedAbbreObjIDs.push(tmpObj);
                                             registedCount++;
                                        } else {
                                             document.getElementById("notificationContents").innerText = "紀錄中已有此物件";
                                        }
                                   }
                              }
                         } catch (err) {}
                    }
               }
               if (registedCount > 0) {
                    document.getElementById("notificationContents").innerText = "已新增 " + registedCount + " 筆縮寫物件紀錄";
               } else {
                    document.getElementById("notificationContents").innerText = "未新增任何物件";
               }
          });
     } else {
          await PowerPoint.run(async (context) => {
               let slides = context.presentation.getSelectedSlides();
               slides.load("items");
               await context.sync();
               let curSlideID = slides.items[0].id;
               let shapes = context.presentation.getSelectedShapes();
               let shapeCount = shapes.getCount();
               shapes.load("items");
               await context.sync();
               shapes.items.map((shape) => {
                    let tmpObj = new Object();
                    tmpObj.slideID = curSlideID;
                    tmpObj.shapeID = shape.id;
                    let checkRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });
                    if (alt && checkRegisted != -1) {
                         ary_registedAbbreObjIDs.splice(checkRegisted, 1);
                         document.getElementById("notificationContents").innerText = "已刪除既有縮寫物件";
                    } else if (!alt && checkRegisted == -1) {
                         document.getElementById("notificationContents").innerText = "已記錄新縮寫物件";
                         ary_registedAbbreObjIDs.push(tmpObj);
                    } else if (alt) {
                         document.getElementById("notificationContents").innerText = "紀錄中無此物件，無法刪除";
                    } else {
                         document.getElementById("notificationContents").innerText = "紀錄中已有此物件";
                    }
                    console.log(ary_registedAbbreObjIDs);
               });
          });
     }
     await PowerPoint.run(async (context) => {
          $(".toast").toast({ delay: 4000 });
          $(".toast").toast("show");
          let slide0 = context.presentation.slides.getItemAt(0);
          slide0.load("tags");
          await context.sync();
          slide0.tags.add("ABBRELOG", JSON.stringify(ary_registedAbbreObjIDs));
          await context.sync();
     });
}
async function registExcludeObj() {
     await searchRegistObj();
     let alt = 0;
     let ctrl = 0;
     let shift = 0;
     try {
          if (event.altKey == 1) {
               alt = 1;
          }
          if (event.ctrlKey == 1) {
               ctrl = 1;
          }
          if (event.shiftKey == 1) {
               shift = 1;
          }
     } catch (err) {}
     if (ctrl && alt && shift) {
          ary_excludedAbbreObjIDs = [];
          document.getElementById("notificationContents").innerText = "已清空排除物件紀錄";
     } else {
          await PowerPoint.run(async (context) => {
               let slides = context.presentation.getSelectedSlides();
               slides.load("items");
               await context.sync();
               let curSlideID = slides.items[0].id;
               // console.log(slides.items[0].id);
               let shapes = context.presentation.getSelectedShapes();
               let shapeCount = shapes.getCount();
               shapes.load("items");
               await context.sync();
               shapes.items.map((shape) => {
                    let tmpObj = new Object();
                    tmpObj.slideID = curSlideID;
                    tmpObj.shapeID = shape.id;
                    let checkRegisted = ary_excludedAbbreObjIDs.findIndex((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });
                    if (alt && checkRegisted != -1) {
                         ary_excludedAbbreObjIDs.splice(checkRegisted, 1);
                         document.getElementById("notificationContents").innerText = "已刪除既有排除物件";
                    } else if (!alt && checkRegisted == -1) {
                         document.getElementById("notificationContents").innerText = "已記錄新排除物件";
                         ary_excludedAbbreObjIDs.push(tmpObj);
                    } else if (alt) {
                         document.getElementById("notificationContents").innerText = "紀錄中無此物件，無法刪除";
                    } else {
                         document.getElementById("notificationContents").innerText = "紀錄中已有此物件";
                    }
                    console.log(ary_excludedAbbreObjIDs);
               });
          });
     }
     await PowerPoint.run(async (context) => {
          $(".toast").toast({ delay: 4000 });
          $(".toast").toast("show");
          let slide0 = context.presentation.slides.getItemAt(0);
          slide0.load("tags");
          await context.sync();
          slide0.tags.add("EXCLUDELOG", JSON.stringify(ary_excludedAbbreObjIDs));
          await context.sync();
     });
}
async function registTableObj() {
     searchRegistObj();
     let alt = 0;
     let ctrl = 0;
     let shift = 0;
     try {
          if (event.altKey == 1) {
               alt = 1;
          }
          if (event.ctrlKey == 1) {
               ctrl = 1;
          }
          if (event.shiftKey == 1) {
               shift = 1;
          }
     } catch (err) {}
     if (ctrl && alt && shift) {
          ary_excludedAbbreObjIDs = [];
          document.getElementById("notificationContents").innerText = "已清空表格物件紀錄";
     } else {
          await PowerPoint.run(async (context) => {
               let slides = context.presentation.getSelectedSlides();
               slides.load("items");
               await context.sync();
               let curSlideID = slides.items[0].id;

               let shapes = context.presentation.getSelectedShapes();
               let shapeCount = shapes.getCount();
               if (shapes.getCount() > 0) {
                    alert("一次只能記錄一個物件");
                    return;
               }
               shapes.load("items");
               await context.sync();
               let tmpObj = new Object();
               tmpObj.slideID = curSlideID;
               tmpObj.shapeID = shapes.items[0].id;
               await Office.context.document.getSelectedDataAsync(
                    "text", // coercionType
                    {
                         valueFormat: "unformatted", // valueFormat
                         filterType: "all",
                    }, // filterType
                    function (result) {
                         tmpObj.contents = result.value;
                    }
               );

               let checkRegistedID = ary_registedTableObjIDandContents.findIndex((obj) => {
                    return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
               });
               if (alt) {
                    if (checkRegistedID != -1) {
                         ary_registedTableObjIDandContents.splice(checkRegistedID, 1);
                         document.getElementById("notificationContents").innerText = "已刪除既有表格物件";
                    } else {
                         document.getElementById("notificationContents").innerText = "紀錄中無此物件，無法刪除紀錄";
                    }
               } else {
                    if (checkRegistedID != -1) {
                         ary_registedTableObjIDandContents.splice(checkRegistedID, 1);
                         ary_registedTableObjIDandContents.push(tmpObj);
                         document.getElementById("notificationContents").innerText = "已更新既有表格物件記錄";
                    } else {
                         ary_registedTableObjIDandContents.push(tmpObj);
                         document.getElementById("notificationContents").innerText = "已記錄新表格物件";
                    }
               }
               await context.sync();
          });
     }
     await PowerPoint.run(async (context) => {
          let slide0 = context.presentation.slides.getItemAt(0);
          slide0.load("tags");
          await context.sync();
          slide0.tags.add("TABLELOG", JSON.stringify(ary_registedTableObjIDandContents));
          await context.sync();
          $(".toast").toast({ delay: 4000 });
          $(".toast").toast("show");
     });
}
async function listAbbreofActivePage() {
     searchRegistObj();
     await PowerPoint.run(async (context) => {
          let tmpCount = context.presentation.getSelectedShapes().getCount();
          await context.sync();
          if (tmpCount.value > 0) {
               registAbbreObj();
          }
     });
     let registedAbbreContents = "";
     await PowerPoint.run(async (context) => {
          let curPageContents = "";
          let IDofUndetectedItems = [];
          let slides = context.presentation.getSelectedSlides();
          slides.load("items");
          await context.sync();
          let curSlideID = slides.items[0].id;
          context.presentation.load("slides");
          await context.sync();
          let activeSlide = context.presentation.slides.getItem(curSlideID);
          activeSlide.load("shapes");
          await context.sync();
          let shapes = activeSlide.shapes;
          shapes.load("items");
          await context.sync();
          for (let i = 0; i < shapes.items.length; i++) {
               let tmpObj = new Object();
               tmpObj.slideID = curSlideID;
               tmpObj.shapeID = shapes.items[i].id;
               let checkAbbreRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                    return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
               });
               let checkExcluded = ary_excludedAbbreObjIDs.findIndex((obj) => {
                    return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
               });
               let checkTableRegisted = ary_registedTableObjIDandContents.find((obj) => {
                    return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
               });
               try {
                    if (checkTableRegisted != undefined) {
                         curPageContents += checkTableRegisted.contents;
                         console.log(checkTableRegisted.contents);
                    } else if (checkExcluded != -1) {
                         continue;
                    } else {
                         shapes.items[i].textFrame.textRange.load("text");
                         await context.sync();
                         if (checkAbbreRegisted == -1) {
                              curPageContents += shapes.items[i].textFrame.textRange.text;
                              curPageContents += "\n";
                         } else {
                              registedAbbreContents = shapes.items[i].textFrame.textRange.text;
                         }
                    }
               } catch (err) {
                    IDofUndetectedItems.push(shapes.items[i].id);
               }
          }
          if (IDofUndetectedItems.length > 0) {
               console.log("有無法偵測的物件");
               activeSlide.setSelectedShapes(IDofUndetectedItems);
               document.getElementById("notificationContents").innerText = "有 " + IDofUndetectedItems.length + " 個無法偵測的物件";
               $(".toast").toast({ delay: 4000 });
               $(".toast").toast("show");
          }
          filtWords(registedAbbreContents, curPageContents);
     });
}

async function sortAbbreofActivePage() {
     let format_1 = document.getElementById("abbre_format_1").value;
     let format_2 = document.getElementById("abbre_format_2").value;
     console.log(format_1);
     searchRegistObj();
     await PowerPoint.run(async (context) => {
          let tmpCount = context.presentation.getSelectedShapes().getCount();
          await context.sync();
          if (tmpCount.value > 0) {
               registAbbreObj();
          }
     });
     let registedAbbreContents = "";
     await PowerPoint.run(async (context) => {
          let slides = context.presentation.getSelectedSlides();
          slides.load("items");
          await context.sync();
          let curSlideID = slides.items[0].id;
          let shapes = context.presentation.getSelectedShapes();
          let shapeCount = shapes.getCount();
          await context.sync();
          if (shapeCount.value != 0) {
               shapes.load("items");
               await context.sync();
               for (let i = 0; i < shapes.items.length; i++) {
                    // shapes.items.map((shape) => {
                    let tmpObj = new Object();
                    tmpObj.slideID = curSlideID;
                    tmpObj.shapeID = shapes.items[i].id;
                    shapes.items[i].textFrame.textRange.load("text");
                    await context.sync();
                    registedAbbreContents += shapes.items[i].textFrame.textRange.text.replace(/[\s ]*[\:=][\s ]*/g, format_1);
                    // });
               }
          } else {
               console.log("A");
               let IDofUndetectedItems = [];
               await context.sync();
               let curSlideID = slides.items[0].id;
               context.presentation.load("slides");
               await context.sync();
               let activeSlide = context.presentation.slides.getItem(curSlideID);
               activeSlide.load("shapes");
               await context.sync();
               let shapes = activeSlide.shapes;
               shapes.load("items");
               await context.sync();
               console.log(ary_registedAbbreObjIDs);
               for (let i = 0; i < shapes.items.length; i++) {
                    let tmpObj = new Object();
                    tmpObj.slideID = curSlideID;
                    tmpObj.shapeID = shapes.items[i].id;
                    let checkAbbreRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });
                    let checkExcluded = ary_excludedAbbreObjIDs.findIndex((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });
                    try {
                         if (checkExcluded != -1) {
                              continue;
                         } else {
                              shapes.items[i].textFrame.textRange.load("text");
                              await context.sync();
                              if (checkAbbreRegisted != -1) {
                                   registedAbbreContents = shapes.items[i].textFrame.textRange.text.replace(/[\s ]*[\:=][\s ]*/g, format_1);
                              }
                         }
                    } catch (err) {
                         IDofUndetectedItems.push(shapes.items[i].id);
                    }
               }
          }

          let registedAbbreContents_modifiedAry = filtAbbreRefToAbbreAry(registedAbbreContents);
          registedAbbreContents_modifiedAry.sort((a, b) => {
               return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          document.getElementById("outcome").innerText = registedAbbreContents_modifiedAry.join(format_2) + "\r\r" + registedAbbreContents_modifiedAry.join("\r");
     });
     // await PowerPoint.run(async (context) => {

     //      let registedAbbreContents_modifiedAry = filtAbbreRefToAbbreAry(registedAbbreContents);
     //      registedAbbreContents_modifiedAry.sort((a, b) => {
     //           return a.toLowerCase().localeCompare(b.toLowerCase());
     //      });
     //      console.log(registedAbbreContents_modifiedAry);
     //      document.getElementById("outcome").innerText = registedAbbreContents_modifiedAry.join("; ") + "\r\r" + registedAbbreContents_modifiedAry.join("\r");
     // });
}
async function listAbbreofAllPages() {
     searchRegistObj();
     let registedAbbreContents = "";
     // readAbbreCsvFile();
     await PowerPoint.run(async (context) => {
          let allPageContents = "";
          let IDofUndetectedItems = [];
          let slides = context.presentation.slides;
          slides.load("items");
          await context.sync();
          for (let i = 0; i < slides.items.length; i++) {
               curPageShapes = slides.items[i].shapes;
               curSlideID = slides.items[i].id;
               curPageShapes.load("items");
               slides.items[i].load("id");
               await context.sync();
               for (let k = 0; k < curPageShapes.items.length; k++) {
                    let tmpObj = new Object();
                    tmpObj.slideID = curSlideID;
                    tmpObj.shapeID = curPageShapes.items[k].id;
                    let checkAbbreRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });
                    let checkTableRegisted = ary_registedTableObjIDandContents.find((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });

                    try {
                         if (checkTableRegisted != undefined) {
                              allPageContents += checkTableRegisted.contents;
                              console.log(checkTableRegisted.contents);
                         } else {
                              curPageShapes.items[k].textFrame.textRange.load("text");
                              await context.sync();
                              if (checkAbbreRegisted == -1) {
                                   allPageContents += curPageShapes.items[k].textFrame.textRange.text;
                                   allPageContents += "\n";
                              } else {
                                   registedAbbreContents += curPageShapes.items[k].textFrame.textRange.text;
                                   registedAbbreContents += "\n";
                                   console.log(registedAbbreContents);
                              }
                         }
                    } catch (err) {
                         IDofUndetectedItems.push(curPageShapes.items[k].id);
                    }
               }
          }
          if (IDofUndetectedItems.length > 0) {
               console.log("有無法偵測的物件");
          }
          console.log(allPageContents);
          filtWords(registedAbbreContents, allPageContents);
     });
}

function filtWords(registedAbbreContents, inputContents) {
     let allEngWords = inputContents.replace(/from [A-Za-z]+ [A-Z]+, et al./g, "").match(/[A-Za-z0-9αβγμ][A-Za-z0-9αβγμ\-\/]*[A-Za-z0-9αβγμ]+/g);

     allEngWords = allEngWords.filter(function (element, index, self) {
          return self.indexOf(element) === index;
     });

     if (inputContents.match(/\b([a-z]\.)+\b/g) != null) {
          let tmpAry = inputContents.match(/\b([a-z]\.)+\b/g);
          if (allEngWords == null) {
               allEngWords = [];
          }
          for (let k = 0; k < tmpAry.length; k++) {
               allEngWords.push(tmpAry[k]);
          }
     }
     let suspectedWords = [];

     if (allEngWords != null) {
          allEngWords.sort();
          for (let k = 0; k < allEngWords.length; k++) {
               tmpWord = allEngWords[k].toString();
               if (allEngWords[k].match(/\./)) {
                    continue;
               }
               if (
                    allEngWords[k].match(/[A-Z]/g) == null ||
                    allEngWords[k].match("CODECODE") ||
                    (allEngWords[k].match(/[X0\-]/g) != null && allEngWords[k].match(/[X0\-]/g).length == allEngWords[k].length)
               ) {
                    allEngWords.splice(k, 1);
                    k--;
                    continue;
               }

               if (
                    allEngWords[k].match(/PP-[A-Z]+-TWN-[0-9]+-20[0-9]+/g) ||
                    allEngWords[k].match(/Biogen-[0-9]+-TWN-[0-9\/]/g) ||
                    allEngWords[k].match(/[A-Z]+-20[0-9]+-[0-9]-20[0-9]+/g) ||
                    allEngWords[k].match(/[A-Z]+-TW-[0-9]+-[.0-9]-[0-9\/]+/g)
               ) {
                    allEngWords.splice(k, 1);
                    k--;
                    continue;
               }

               if (allEngWords[k] == "mmHg") {
                    allEngWords.splice(k, 1);
                    k--;
                    continue;
               }

               if (allEngWords[k] == "Ph" || allEngWords[k] == "Hb" || allEngWords[k] == "Af" || allEngWords[k] == "Pso") {
                    continue;
               }

               if (allEngWords[k] == "EP") {
                    suspectedWords.push(allEngWords[k]);
                    allEngWords.splice(k, 1);
                    k--;
                    continue;
               }
               if (allEngWords[k].length == 1) {
                    suspectedWords.push(allEngWords[k]);
                    allEngWords.splice(k, 1);
                    k--;
                    continue;
               }

               if (allEngWords[k].match(/[0-9\-]/)) {
                    if (allEngWords[k].match(/[0-9\-]/g).length >= allEngWords[k].length / 2) {
                         if (allEngWords[k].match(/[0-9\-]/g).length != allEngWords[k].length) {
                              suspectedWords.push(allEngWords[k]);
                         }
                         allEngWords.splice(k, 1);
                         k--;
                         continue;
                    }
               }
               if (allEngWords[k].match(/[a-z]/)) {
                    if (allEngWords[k].match(/[a-z\-]/g).length >= allEngWords[k].length / 2) {
                         if (allEngWords[k].match(/[A-Z][a-z\-\/][a-z\-\/]+/) != null && allEngWords[k].match(/[A-Z][a-z\-\/][a-z\-\/]+/)[0].length == allEngWords[k].length) {
                         } else {
                              suspectedWords.push(allEngWords[k]);
                         }
                         allEngWords.splice(k, 1);
                         k--;
                         continue;
                    }
               }
          }
     }

     if (allEngWords != null) {
          sortIgnoreUpperCase(allEngWords);
     }
     if (suspectedWords != null) {
          sortIgnoreUpperCase(suspectedWords);
     }

     let registedAbbreContents_modifiedAry = filtAbbreRefToAbbreAry(registedAbbreContents);

     outputAbbreOutcome(registedAbbreContents_modifiedAry, allEngWords, suspectedWords);
}

async function outputAbbreOutcome(excistedAbbreList, mainAbbreList, suspectList) {
     let excistedAbbreList_ObjedAry = [];
     let mainAbbreList_filtered = mainAbbreList;
     let format_1 = document.getElementById("abbre_format_1").value;
     let format_2 = document.getElementById("abbre_format_2").value;
     console.log(format_1);
     sortIgnoreUpperCase(mainAbbreList_filtered);

     for (let i = 0; i < excistedAbbreList.length; i++) {
          try {
               if (excistedAbbreList[i].toString().match(/[\:=,]/) != null && excistedAbbreList[i].toString().match(/[\:=,]/).length > 1) {
                    let tmpAry = excistedAbbreList[i].toString().split(/,[\s]*/);
                    excistedAbbreList.splice(i, 1, tmpAry);
                    i--;
                    continue;
               } else {
                    let tmpObj = new Object();
                    if (excistedAbbreList[i].split(/[\s ]*[\:=,][\s ]*/)[0] != "") {
                         tmpObj.abbre = excistedAbbreList[i].split(/[\s ]*[\:=,][\s ]*/)[0];
                         tmpObj.full = excistedAbbreList[i].split(/[\s ]*[\:=,][\s ]*/)[1];
                         excistedAbbreList_ObjedAry.push(tmpObj);
                    }
               }
          } catch (err) {
               continue;
          }
     }
     let mainAbbreList_matched = [];
     let databaseRefedList = [];
     let unmatchedList = [];
     let newAbbreToUpdateAry = [];
     for (let i = 0; i < excistedAbbreList_ObjedAry.length; i++) {
          if (excistedAbbreList_ObjedAry[i].abbre.match(/[\/\-]/)) {
               let tmpAry = excistedAbbreList_ObjedAry[i].abbre.split(/[\/\-]/);
               let matchedChecker = false;
               for (let k = 0; k < tmpAry.length; k++) {
                    let tmpIndex = mainAbbreList_filtered.indexOf(tmpAry[k]);

                    if (tmpIndex != -1) {
                         matchedChecker = true;
                         mainAbbreList_filtered.splice(tmpIndex, 1);
                         k--;
                    }
               }
               if (matchedChecker) {
                    mainAbbreList_matched.push(excistedAbbreList_ObjedAry[i].abbre + format_1 + excistedAbbreList_ObjedAry[i].full);
                    let tmpIndex = mainAbbreList_filtered.indexOf(excistedAbbreList_ObjedAry[i].abbre);
                    if (tmpIndex != -1) {
                         mainAbbreList_filtered.splice(tmpIndex, 1);
                    }
                    excistedAbbreList_ObjedAry.splice(i, 1);
                    i--;
               }
          }
     }
     console.log(mainAbbreList_filtered);
     for (let i = 0; i < mainAbbreList_filtered.length; i++) {
          let exsistedMatchObj = excistedAbbreList_ObjedAry.find((obj) => {
               return obj.abbre == mainAbbreList_filtered[i];
          });
          if (mainAbbreList_filtered[i].match(/[0-9]+\b/) && exsistedMatchObj == undefined) {
               exsistedMatchObj = excistedAbbreList_ObjedAry.find((obj) => {
                    return obj.abbre == mainAbbreList_filtered[i].replace(/[0-9]+\b/, "");
               });
               if (exsistedMatchObj != undefined) {
                    mainAbbreList_filtered[i] = mainAbbreList_filtered[i].replace(/[0-9]+\b/, "");
               }
          }
          if (mainAbbreList_filtered[i].match(/[\/\-]/) && exsistedMatchObj == undefined) {
               let tmpAry = mainAbbreList_filtered[i].split(/[\/\-]/);
               console.log(mainAbbreList_filtered[i]);
               let rematchFail = false;
               for (let k = 0; k < tmpAry.length && rematchFail == false; k++) {
                    if (mainAbbreList_filtered.indexOf(tmpAry[k]) == -1) {
                         exsistedMatchObj = excistedAbbreList_ObjedAry.find((obj) => {
                              return obj.abbre == tmpAry[k];
                         });
                         if (exsistedMatchObj == undefined) {
                              console.log(exsistedMatchObj);
                              rematchFail = true;
                         } else {
                         }
                    } else {
                         tmpAry.splice(k, 1);
                         k--;
                         continue;
                    }
               }
               if (rematchFail == false) {
                    console.log(i);
                    mainAbbreList_filtered = mainAbbreList_filtered.concat(tmpAry);
                    mainAbbreList_filtered.splice(i, 1);
                    i--;
                    continue;
               }
          }
          let databaseMatchObjAry = abbreDatabaseAry.filter((obj) => {
               return obj.abbre == mainAbbreList_filtered[i];
          });
          let full = "";
          if (exsistedMatchObj != undefined) {
               full = exsistedMatchObj.full;
               excistedAbbreList_ObjedAry.splice(
                    excistedAbbreList_ObjedAry.findIndex((obj) => {
                         return obj.abbre == exsistedMatchObj.abbre;
                    }),
                    1
               );
               // console.log(full.toLowerCase().replace(/\./g, ""));
               // console.log(
               //      abbreDatabaseAry.filter((obj) => {
               //           return obj.full.toLowerCase().replace(/\./g, "") == full.toLowerCase().replace(/\./g, "");
               //      })
               // );
               // console.log(
               //      abbreDatabaseAry.filter((obj) => {
               //           return obj.full.toLowerCase().replace(/\./g, "") == full.toLowerCase().replace(/\./g, "");
               //      }).length == 0
               // );
               if (
                    abbreDatabaseAry.filter((obj) => {
                         return obj.full.toLowerCase().replace(/\./g, "") == full.toLowerCase().replace(/\./g, "");
                    }).length == 0
               ) {
                    //待補充資料庫中有多筆不同資料時的處理
                    console.log("newData");
                    newAbbreToUpdateAry.push(exsistedMatchObj);
               }
               console.log(newAbbreToUpdateAry);
          } else if (databaseMatchObjAry != 0) {
               full = databaseMatchObjAry[0].full;
               unmatchedList.push(mainAbbreList_filtered[i] + format_1 + full);
               databaseRefedList.push(mainAbbreList_filtered[i] + format_1 + full);
          } else {
               unmatchedList.push(mainAbbreList_filtered[i] + format_1);
               full = "_______________";
          }

          mainAbbreList_matched.push(mainAbbreList_filtered[i] + format_1 + full);
     }

     let suspectList_filtered = [];
     for (let i = 0; i < suspectList.length; i++) {
          if (suspectList_filtered.indexOf(suspectList[i]) === -1) {
               suspectList_filtered.push(suspectList[i]);
          }
     }

     let unusedRefedList = [];
     for (let i = 0; i < excistedAbbreList_ObjedAry.length; i++) {
          if (excistedAbbreList_ObjedAry[i].abbre.match(/[ \/\-]/)) {
               let tmpRematchAry = [];
               let tmpSplitAbbreAry = excistedAbbreList_ObjedAry[i].abbre.toString().split(/[ \/\-]/);
               let rematchFail = false;
               for (let k = 0; k < tmpSplitAbbreAry.length; k++) {
                    if (mainAbbreList_filtered.indexOf(tmpSplitAbbreAry[k]) == -1) {
                         rematchFail = true;
                         continue;
                    } else {
                         tmpRematchAry.push[k];
                    }
               }
               if (rematchFail) {
                    unusedRefedList.push(excistedAbbreList_ObjedAry[i].abbre + format_1 + excistedAbbreList_ObjedAry[i].full);
                    continue;
               } else {
                    mainAbbreList_matched.push(excistedAbbreList_ObjedAry[i].abbre + format_1 + excistedAbbreList_ObjedAry[i].full);
                    tmpRematchAry.sort();
                    for (let k = 0; k < tmpRematchAry[i]; k++) {
                         suspectList_filtered.splice(tmpRematchAry.pop(), 1);
                    }
               }
          } else if (suspectList_filtered.indexOf(excistedAbbreList_ObjedAry[i].abbre) != -1) {
               mainAbbreList_matched.push(excistedAbbreList_ObjedAry[i].abbre + format_1 + excistedAbbreList_ObjedAry[i].full);
               suspectList_filtered.splice(suspectList_filtered.indexOf(excistedAbbreList_ObjedAry[i].abbre), 1);
          } else {
               unusedRefedList.push(excistedAbbreList_ObjedAry[i].abbre + format_1 + excistedAbbreList_ObjedAry[i].full);
          }
     }

     let arraysToSort = [mainAbbreList_matched, unusedRefedList, suspectList_filtered, unmatchedList, databaseRefedList];

     arraysToSort.forEach((element) => {
          element.sort(function compare(a, b) {
               if (a.toLowerCase() > b.toLowerCase()) {
                    return 1;
               } else {
                    return -1;
               }
          });
     });

     let mergedMatchedList = mainAbbreList_matched.join(format_2).toString();
     let mergedUnmatchedList = unmatchedList.join(format_2).toString();
     let mergedUnusedRefedList = unusedRefedList.join(format_2).toString();
     let mergedDatabaseRefedList = databaseRefedList.join(format_2).toString();
     let mergedSuspectList = suspectList_filtered.join(format_2).toString();
     // let newAbbreToUpdateList = newAbbreToUpdateAry.join(format_2).toString();
     console.log(newAbbreToUpdateAry);

     let saveString = mergedMatchedList + "\r\r縮寫表清單:\r" + mergedMatchedList.replace(/; /g, "\r") + "\r\r";
     if (mergedUnmatchedList != "") {
          saveString += "\r\r待補上的縮寫:\r" + mergedUnmatchedList.replace(/; /g, "\r");
     }
     if (mergedUnusedRefedList != "") {
          saveString += "\r\r未使用的縮寫:\r" + mergedUnusedRefedList.replace(/; /g, "\r");
     }
     if (mergedDatabaseRefedList != "") {
          saveString += "\r\r\r\r取自資料庫的縮寫:\r" + mergedDatabaseRefedList.replace(/; /g, "\r");
     }
     if (mergedSuspectList != "") {
          saveString += "\r\r\r\r疑似縮寫字:\r" + mergedSuspectList;
     }
     // newAbbreToUpdateAry = [];
     // excistedAbbreList_ObjedAry.forEach((obj) => {
     //      let databaseMatchObj = abbreDatabaseAry.filter((databaseObj) => {
     //           return (
     //                obj.full.toLowerCase.replace(/\./g, "") == databaseObj.full.toLowerCase.replace(/\./g, "") &&
     //                obj.abbre.toLowerCase.replace(/\./g, "") == databaseObj.abbre.toLowerCase.replace(/\./g, "")
     //           );
     //      });
     //      if (databaseMatchObj) {
     //      } else if (obj.abbre.match(/[\u4e00-\u9fa5]/) || obj.full.match(/[\u4e00-\u9fa5]/)) {
     //      } else {
     //           newAbbreToUpdateAry.push(obj);
     //           databaseObj.push(obj);
     //      }
     // });
     console.log("N " + newAbbreToUpdateAry);
     console.log(JSON.stringify(newAbbreToUpdateAry));

     if (newAbbreToUpdateAry.length != 0) {
          const url = "https://script.google.com/macros/s/AKfycbzy7Cb1wGvFfpTS_1tJ_eh1USkdbu2RTnP__uBLrDoskBkoczWOTlEfk7bqkXi1RIkI/exec?text=" + JSON.stringify(newAbbreToUpdateAry);
          const script = document.createElement("script");
          script.src = url;
          document.body.appendChild(script);
          abbreDatabaseAry = abbreDatabaseAry.concat(newAbbreToUpdateAry);
          document.getElementById("notificationContents").innerText = "已新增 " + newAbbreToUpdateAry.length + " 筆縮寫至資料庫";
          $(".toast").toast({ delay: 4000 });
          $(".toast").toast("show");
     }

     document.getElementById("outcome").innerText = saveString;
}

function filtAbbreRefToAbbreAry(abbreRefContents) {
     let outComeAry = [];
     if (abbreRefContents.at(-1) == ".") {
          abbreRefContents = abbreRefContents.slice(0, -1);
     }
     var tmpAbbreRefContentsAry = abbreRefContents.replace(/Abbreviation[s\s\n\r\:\u0003]*/i, "").split(/[\n\r\u0003]/);

     for (var k = 0; k < tmpAbbreRefContentsAry.length; k++) {
          if (tmpAbbreRefContentsAry[k].match(/reference/i)) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match("et al")) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match(/[0-9]+\.[\s ]*[A-Z]/)) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match(/[*†‡§]/)) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match(/[0-9]+\.[\s ]*[A-Z]/)) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match(/20[0-9]+;[\s ]*[0-9]+[:;(]/i)) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match(/http[s]*:\/\//)) {
               continue;
          } else if (tmpAbbreRefContentsAry[k].match(/\)[ \s]*:/)) {
               continue;
          } else {
               outComeAry.push(tmpAbbreRefContentsAry[k]);
          }
     }

     outComeAry = outComeAry.join("; ").split(/[\s ]*[;；]+[\s ]*/);
     outComeAry = outComeAry.filter(function (element, index, self) {
          if (element != "") {
               return self.indexOf(element) === index;
          }
     });

     return outComeAry;
}

async function sayHello() {
     try {
          // Set coercion type to text since
          let coercionType = { coercionType: Office.CoercionType.Text };

          // clear current selection
          let outcome = "";

          await Office.context.document.getSelectedDataAsync(
               "text", // coercionType
               {
                    valueFormat: "unformatted", // valueFormat
                    filterType: "all",
               }, // filterType
               function (result) {
                    // callback
                    outcome = result.value;
                    console.log(outcome);
                    document.getElementById("outcome").innerText = outcome;
                    //   write('Selected data is: ' + dataValue);
               }
          );
     } catch (err) {
          console.log(err, err.line);
     }

     // Set text in selection to 'Hello world!'
     // await Office.context.document.setSelectedDataAsync("Hello world!", coercionType);
}
async function sortIgnoreUpperCase(ary) {
     await ary.sort();
     await ary.sort(function compare(a, b) {
          a.toUpperCase() - b.toUpperCase();
     });
     // await console.log(ary);
}

function splitCsvRow(textdata) {
     let csvColAry = [];
     let quoted = false;
     let curContent = "";
     csvColAry.push(curContent);
     for (let k = 0; k < textdata.length; k++) {
          if (textdata[k] == '"') {
               quoted = !quoted;
          } else if (textdata[k] == "," && !quoted) {
               csvColAry.push("");
          } else {
               csvColAry[csvColAry.length - 1] += textdata[k];
          }
     }
     return csvColAry;
}

$(function () {
     $('[data-bs-toggle="tooltip"]').tooltip();
});

let databaseStatusBtn = document.getElementById("databaseStatusBtn");

let databaseLoadingContent =
     '<button class="btn btn-secondary btn-sm" type="button" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only"> Loading database...</span></button>';
let databaseLoadedContent =
     '<button class="btn btn-success btn-sm" type="button" data-bs-toggle="tooltip"	data-bs-placement="top"	data-bs-html="true"	title="重新讀取資料庫"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg></button>';

const dataSheetUrl = "https://script.google.com/macros/s/AKfycbwi7DtotOCj-7xbk7h3qzgSCobwaRr5-mXGNI_oG6OSjNfa9SXpjtI_47UnwqiGy65Kag/exec";
document.addEventListener("DOMContentLoaded", init);
function init() {
     databaseStatus.innerHTML = databaseLoadingContent;
     console.log("ready");
     fetch(dataSheetUrl)
          .then((res) => {
               return res.json();
          })
          .then((data) => {
               abbreDatabaseAry = data.data;
               console.log(abbreDatabaseAry);

               databaseStatus.innerHTML = databaseLoadedContent;
               document.getElementById("abbre_func1").disabled = false;
               document.getElementById("abbre_func2").disabled = false;
               document.getElementById("abbre_func3").disabled = false;
               // databaseStatus.disabled = false;

               document.getElementById("notificationContents").innerText = "已載入 " + abbreDatabaseAry.length + " 筆縮寫";
               $(".toast").toast({ delay: 4000 });
               $(".toast").toast("show");
          });
}
