Office.onReady();
let logDataExsit = false;
let logTags;
let abbreLogTag, tableLogTag;
let ary_registedAbbreObjIDs = [];
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
               tableLogTag = slide0.tags.getItemOrNullObject("TABLELOG");
               await context.sync();
               abbreLogTag.load("key, value");
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
          document.getElementById("notificationContents").innerText = "????????????????????????";
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
                                             document.getElementById("notificationContents").innerText = "????????????????????????";
                                        }
                                   }
                              }
                         } catch (err) {}
                    }
                    // console.log(allPageContents);
               }
               if (registedCount > 0) {
                    document.getElementById("notificationContents").innerText = "????????? " + registedCount + " ?????????????????????";
               } else {
                    document.getElementById("notificationContents").innerText = "?????????????????????";
               }
          });
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
                    let checkRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                         return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
                    });
                    if (alt && checkRegisted != -1) {
                         ary_registedAbbreObjIDs.splice(checkRegisted, 1);
                         document.getElementById("notificationContents").innerText = "???????????????????????????";
                    } else if (!alt && checkRegisted == -1) {
                         document.getElementById("notificationContents").innerText = "????????????????????????";
                         ary_registedAbbreObjIDs.push(tmpObj);
                    } else if (alt) {
                         document.getElementById("notificationContents").innerText = "????????????????????????????????????";
                    } else {
                         document.getElementById("notificationContents").innerText = "????????????????????????";
                    }
                    console.log(ary_registedAbbreObjIDs);
                    // console.log(shape.id);
                    // console.log(shape);
                    // document.getElementById("outcome").innerText = shape.id;
               });
               // abbreLogTag = slide0.tags.getItemOrNullObject("ABBRELOG");
               // abbreLogTag.load("key, value");
               // await context.sync();
               // console.log(JSON.stringify(abbreLogTag.value));
               // await context.sync();
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
async function registTableObj() {
     searchRegistObj();
     let alt = 0;
     try {
          if (event.altKey == 1) {
               alt = 1;
          }
     } catch (err) {}
     await PowerPoint.run(async (context) => {
          let slides = context.presentation.getSelectedSlides();
          slides.load("items");
          await context.sync();
          let curSlideID = slides.items[0].id;

          let shapes = context.presentation.getSelectedShapes();
          let shapeCount = shapes.getCount();
          if (shapes.getCount() > 0) {
               alert("??????????????????????????????");
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
                    // callback
                    console.log(result.value);
                    tmpObj.contents = result.value;
                    //   write('Selected data is: ' + dataValue);
               }
          );

          let checkRegistedID = ary_registedTableObjIDandContents.findIndex((obj) => {
               return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
          });
          if (alt) {
               if (checkRegistedID != -1) {
                    ary_registedTableObjIDandContents.splice(checkRegistedID, 1);
                    document.getElementById("notificationContents").innerText = "???????????????????????????";
               } else {
                    document.getElementById("notificationContents").innerText = "??????????????????????????????????????????";
               }
          } else {
               if (checkRegistedID != -1) {
                    ary_registedTableObjIDandContents.splice(checkRegistedID, 1);
                    ary_registedTableObjIDandContents.push(tmpObj);
                    document.getElementById("notificationContents").innerText = "?????????????????????????????????";
               } else {
                    ary_registedTableObjIDandContents.push(tmpObj);
                    document.getElementById("notificationContents").innerText = "????????????????????????";
               }
          }

          console.log(ary_registedTableObjIDandContents.length);
          // console.log(shape.id);
          // console.log(shape);
          // document.getElementById("outcome").innerText = shape.id;
          await context.sync();
     });
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
          // console.log(tmpCount.value);
          if (tmpCount.value > 0) {
               registAbbreObj();
          }
     });
     let registedAbbreContents = "";
     readAbbreCsvFile();
     await PowerPoint.run(async (context) => {
          let curPageContents = "";
          let IDofUndetectedItems = [];
          let slides = context.presentation.getSelectedSlides();
          slides.load("items");
          await context.sync();
          let curSlideID = slides.items[0].id;
          context.presentation.load("slides");
          await context.sync();
          // console.log(curSlideID);
          let activeSlide = context.presentation.slides.getItem(curSlideID);
          activeSlide.load("shapes");
          await context.sync();
          let shapes = activeSlide.shapes;
          shapes.load("items");
          await context.sync();
          for (let i = 0; i < shapes.items.length; i++) {
               // shapes.items.map((shape) => {
               let tmpObj = new Object();
               tmpObj.slideID = curSlideID;
               tmpObj.shapeID = shapes.items[i].id;
               let checkAbbreRegisted = ary_registedAbbreObjIDs.findIndex((obj) => {
                    return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
               });
               let checkTableRegisted = ary_registedTableObjIDandContents.find((obj) => {
                    return obj.slideID == tmpObj.slideID && obj.shapeID == tmpObj.shapeID;
               });

               try {
                    if (checkTableRegisted != undefined) {
                         curPageContents += checkTableRegisted.contents;
                         console.log(checkTableRegisted.contents);
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
               console.log("????????????????????????");
               activeSlide.setSelectedShapes(IDofUndetectedItems);
               document.getElementById("notificationContents").innerText = "??? " + IDofUndetectedItems.length + " ????????????????????????";
               $(".toast").toast({ delay: 4000 });
               $(".toast").toast("show");
          }
          console.log(curPageContents);
          filtWords(registedAbbreContents, curPageContents);
     });
}
async function listAbbreofAllPages() {
     searchRegistObj();
     let registedAbbreContents = "";
     readAbbreCsvFile();
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
               // console.log(allPageContents);
          }
          if (IDofUndetectedItems.length > 0) {
               console.log("????????????????????????");
          }
          console.log(allPageContents);
          filtWords(registedAbbreContents, allPageContents);
     });
}

function filtWords(registedAbbreContents, inputContents) {
     let allEngWords = inputContents.match(/[A-Za-z0-9????????][A-Za-z0-9????????\-\/]*[A-Za-z0-9????????]+/g);

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
          // sortIgnoreUpperCase(allEngWords);
          allEngWords.sort();
          // let tmpWord = "";
          for (let k = 0; k < allEngWords.length; k++) {
               // if (tmpWord == allEngWords[k]) {
               //      console.log("dup " + allEngWords[k]);
               //      allEngWords.splice(k, 1);
               //      continue;
               // }
               tmpWord = allEngWords[k].toString();
               // await console.log("pre " + tmpWord);
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

               if (allEngWords[k] == "mmHg") {
                    allEngWords.splice(k, 1);
                    k--;
                    continue;
               }

               if (allEngWords[k] == "Ph" || allEngWords[k] == "Hb" || allEngWords[k] == "Af") {
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
          // await sortIgnoreUpperCase(allEngWords);
          // allAbbs = allAbbs.concat(allEngWords).sort(function compare(a, b) {
          //      a.toUpperCase() - b.toUpperCase();
          // });
          sortIgnoreUpperCase(allEngWords);
     }
     if (suspectedWords != null) {
          sortIgnoreUpperCase(suspectedWords);
          // allRemoved = allRemoved.concat(suspectedWords).sort(function compare(a, b) {
          //      a.toUpperCase() - b.toUpperCase();
          // });
     }
     let registedAbbreContents_modifier = registedAbbreContents.split(/[\n\r]/);
     for (let i = 0; i < registedAbbreContents_modifier.length; i++) {
          let tmpIndex = registedAbbreContents_modifier[i].match(/[0-9]+\.[\s ]*[A-Z]/);
          // console.log(tmpIndex);
          if (tmpIndex != undefined) {
               registedAbbreContents_modifier.splice(i, 1);
               i--;
               continue;
          }
          if (registedAbbreContents_modifier[i].match(/[*????????]/) != undefined) {
               registedAbbreContents_modifier.splice(i, 1);
               i--;
               continue;
          }
     }
     registedAbbreContents_modifier = registedAbbreContents_modifier.join("; ").split(/[\s ]*;[\s ]*/);
     registedAbbreContents_modifier = registedAbbreContents_modifier.filter(function (element, index, self) {
          return self.indexOf(element) === index;
     });

     outputAbbreOutcome(registedAbbreContents_modifier, allEngWords, suspectedWords);
}

async function outputAbbreOutcome(excistedAbbreList, mainAbbreList, suspectList) {
     // excistedAbbreList = excistedAbbreList.join("; ").split(/[\s ]*;[\s ]*/);
     // console.log(mainAbbreList);
     // let excistedAbbreList = registedAbbreContents_modifier.join("; ").split(/[\s ]*;[\s ]*/);
     // console.log(excistedAbbreList);
     // let mainAbbreList = allEngWords;
     // let suspectList = suspectedWords;
     let excistedAbbreList_ObjedAry = [];
     let mainAbbreList_filtered = mainAbbreList;
     // console.log(excistedAbbreList);
     // console.log(excistedAbbreList_ObjedAry);
     for (let i = 0; i < excistedAbbreList.length; i++) {
          // console.log(excistedAbbreList_ObjedAry);
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
                    // console.log(tmpObj);
               }
          } catch (err) {
               continue;
          }
          // console.log(excistedAbbreList);
          // console.log(excistedAbbreList_ObjedAry);
          // console.log(excistedAbbreList_ObjedAry.length);
     }

     let mainAbbreList_matched = [];
     let databaseRefedList = [];
     let unmatchedList = [];
     let newAbbreToUpdateAry = [];
     // console.log(excistedAbbreList_ObjedAry);
     for (let i = 0; i < excistedAbbreList_ObjedAry.length; i++) {
          if (excistedAbbreList_ObjedAry[i].abbre.match(/[\/\-]/)) {
               let tmpAry = excistedAbbreList_ObjedAry[i].abbre.split(/[\/\-]/);
               let matchedChecker = false;
               for (let k = 0; k < tmpAry.length; k++) {
                    let tmpIndex = mainAbbreList_filtered.indexOf(tmpAry[k]);
                    // console.log(mainAbbreList_filtered[tmpIndex]);
                    // console.log("matchedIndex: " + tmpIndex);
                    if (tmpIndex != -1) {
                         matchedChecker = true;
                         mainAbbreList_filtered.splice(tmpIndex, 1);
                         k--;
                    }
               }
               if (matchedChecker) {
                    // console.log(excistedAbbreList_ObjedAry[i].abbre + " added");
                    mainAbbreList_matched.push(excistedAbbreList_ObjedAry[i].abbre + " = " + excistedAbbreList_ObjedAry[i].full);
                    let tmpIndex = mainAbbreList_filtered.indexOf(excistedAbbreList_ObjedAry[i].abbre);
                    if (tmpIndex != -1) {
                         mainAbbreList_filtered.splice(tmpIndex, 1);
                    }
                    excistedAbbreList_ObjedAry.splice(i, 1);
                    i--;
               }
          }
     }
     // await console.log("A");
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
          // console.log(mainAbbreList_filtered);
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
               if (
                    abbreDatabaseAry.filter((obj) => {
                         return obj.full.toLowerCase().replace(/./g, "") == exsistedMatchObj.full.toLowerCase().replace(/./g, "");
                    }).length == 0
               ) {
                    // if (databaseMatchObjAry != undefined) {
                    //      alert(databaseMatchObjAry.full + "\r" + exsistedMatchObj.full);
                    // }
                    // newAbbreToUpdateAry_Obj.push("'" + exsistedMatchObj.abbre + "', '" + exsistedMatchObj.full + "'");

                    //??????????????????????????????????????????????????????
                    newAbbreToUpdateAry.push(mainAbbreList_filtered[i] + " = " + full);
               }
          } else if (databaseMatchObjAry != 0) {
               full = databaseMatchObjAry[0].full;
               unmatchedList.push(mainAbbreList_filtered[i] + " = " + full);
               databaseRefedList.push(mainAbbreList_filtered[i] + " = " + full);
               // } else if (mainAbbreList_filtered[i].match(/[A-Z]+\/[A-Z]+/)) {
               //      let tmpAry = mainAbbreList_filtered[i].split("/");
               //      for (let k = 0; k < tmpAry.length; k++) {
               //           if (mainAbbreList_filtered.indexOf(tmpAry[k]) === -1) {
               //                mainAbbreList_filtered.push(tmpAry[k]);
               //           }
               //      }
               //      mainAbbreList_filtered.splice(i, 1);
               //      i--;
               //      continue;
          } else {
               unmatchedList.push(mainAbbreList_filtered[i] + " = ");
               full = "_______________";
          }

          mainAbbreList_matched.push(mainAbbreList_filtered[i] + " = " + full);
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
                    // alert(mainAbbreList_filtered.indexOf(tmpSplitAbbreAry[k]));
                    if (mainAbbreList_filtered.indexOf(tmpSplitAbbreAry[k]) == -1) {
                         rematchFail = true;
                         continue;
                    } else {
                         tmpRematchAry.push[k];
                    }
               }
               if (rematchFail) {
                    unusedRefedList.push(excistedAbbreList_ObjedAry[i].abbre + " = " + excistedAbbreList_ObjedAry[i].full);
                    continue;
               } else {
                    mainAbbreList_matched.push(excistedAbbreList_ObjedAry[i].abbre + " = " + excistedAbbreList_ObjedAry[i].full);
                    tmpRematchAry.sort();
                    for (let k = 0; k < tmpRematchAry[i]; k++) {
                         suspectList_filtered.splice(tmpRematchAry.pop(), 1);
                    }
               }
          } else if (suspectList_filtered.indexOf(excistedAbbreList_ObjedAry[i].abbre) != -1) {
               mainAbbreList_matched.push(excistedAbbreList_ObjedAry[i].abbre + " = " + excistedAbbreList_ObjedAry[i].full);
               suspectList_filtered.splice(suspectList_filtered.indexOf(excistedAbbreList_ObjedAry[i].abbre), 1);
          } else {
               unusedRefedList.push(excistedAbbreList_ObjedAry[i].abbre + " = " + excistedAbbreList_ObjedAry[i].full);
          }
     }

     let arraysToSort = [mainAbbreList_matched, unusedRefedList, suspectList_filtered, unmatchedList, databaseRefedList, newAbbreToUpdateAry];

     arraysToSort.forEach((element) => {
          element.sort(function compare(a, b) {
               if (a.toLowerCase() > b.toLowerCase()) {
                    return 1;
               } else {
                    return -1;
               }
          });
     });

     let mergedMatchedList = mainAbbreList_matched.join("; ").toString();
     let mergedUnmatchedList = unmatchedList.join("; ").toString();
     let mergedUnusedRefedList = unusedRefedList.join("; ").toString();
     let mergedDatabaseRefedList = databaseRefedList.join("; ").toString();
     let mergedSuspectList = suspectList_filtered.join("; ").toString();
     let newAbbreToUpdateList = newAbbreToUpdateAry.join("; ").toString();

     let saveString = mergedMatchedList + "\r\r???????????????:\r" + mergedMatchedList.replace(/; /g, "\r") + "\r\r";
     if (mergedUnmatchedList != "") {
          saveString += "\r\r??????????????????:\r" + mergedUnmatchedList.replace(/; /g, "\r");
     }
     if (mergedUnusedRefedList != "") {
          saveString += "\r\r??????????????????:\r" + mergedUnusedRefedList.replace(/; /g, "\r");
     }
     if (mergedDatabaseRefedList != "") {
          saveString += "\r\r\r\r????????????????????????:\r" + mergedDatabaseRefedList.replace(/; /g, "\r");
     }
     if (mergedSuspectList != "") {
          saveString += "\r\r\r\r???????????????:\r" + mergedSuspectList;
     }
     // if (newAbbreToUpdateList != "") {
     //      saveString += "\r\r\r\r???????????????:\r" + newAbbreToUpdateList;
     // }

     // abbreTextFile.write(saveString);
     // await console.log("filtered\n" + allEngWords);
     // console.log("removed\n" + suspectedWords);
     document.getElementById("outcome").innerText = saveString;
}

async function sayHello() {
     try {
          // Set coercion type to text since
          let coercionType = { coercionType: Office.CoercionType.Text };

          // clear current selection
          let outcome = "";
          // await Office.context.document.getResourceByIndexAsync(
          //      1,

          //      function (result) {
          //           // callback
          //           outcome = result.value;
          //           console.log(outcome);
          //           document.getElementById("outcome").innerText = outcome;
          //           //   write('Selected data is: ' + dataValue);
          //      }
          // );
          // await PowerPoint.run(async (context) => {
          //      let slides = context.presentation.getSelectedSlides();
          //      slides.load("items");
          //      await context.sync();
          //      slides.items.map((slide) => {
          //           console.log(slide.id);
          //      });
          //      let shapes = context.presentation.getSelectedShapes();

          //      let shapeCount = shapes.getCount();
          //      shapes.load("items");
          //      await context.sync();
          //      shapes.items.map((shape) => {
          //           shape.fill.setSolidColor("red");
          //           document.getElementById("outcome").innerText = shape.id;
          //      });
          //      await context.sync();
          // });
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
function readAbbreCsvFile() {
     try {
          let xhr = new XMLHttpRequest();
          xhr.open("GET", "https://oisee-hastin.github.io/ppt-abbre/js/database/abbreListDatabase.csv", false);
          xhr.onload = function () {
               let inputTxt = xhr.responseText;

               let basicAry = inputTxt.replace(/[\r\n]+/g, "\n").split("\n");
               abbreDatabaseAry = [];
               // alert(basicAry);
               basicAry.forEach(function (row, i) {
                    let tmpObject = new Object();
                    tmpObject.abbre = splitCsvRow(row)[0].toString();
                    tmpObject.full = splitCsvRow(row)[1].toString();
                    abbreDatabaseAry.push(tmpObject);
               });
          };
          // reader.readAsText(file);
          xhr.send();
     } catch (err) {
          alert(err.line + "\n" + err);
     }
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
