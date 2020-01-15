//--------------------------------------
//--- Settings
//--------------------------------------

let stringData = [{
    Language: "pl",
    HourSummary: "Czas wg delty",
    HourSummaryAll: "Czas w biurze",
    btnSwitch_Orginal: "Orginalne dane",
    btnSwitch_Replaced: "Obliczenia",
    //-------------------------------
    HTML_HourElement: "Czas pracy",
},
{
    Language: "en",
    HourSummary: "Time by delta",
    HourSummaryAll: "Overall time",
    btnSwitch_Orginal: "Orginal data",
    btnSwitch_Replaced: "Calculations",
    //-------------------------------
    HTML_HourElement: "Work time",
},
];

let Version = "Ver 1.0.3"
let ShowReplacedData = true;
//--------------------------------------
//--- Basic functions
//--------------------------------------

function getLanguage() {
    var match = document.cookie.match(new RegExp('(^| )SysLanguage=([^;]+)'));

    if (match) {
        return match[2];
    } else {
        return "en"
    }
}

function getStringValue() {
    return stringData.find(element => element.Language == getLanguage());
}


let getDayHeight = () => {
    return 47 + 1;
}

let getMonthDays = (today) => {
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
}

let getLocationProperties = (handle) => {
  if (handle !== null) {
    let item = {};

    item.Left = handle.offsetLeft;
    item.Top = handle.offsetTop;
    item.Height = handle.offsetHeight;
    item.Width = handle.offsetWidth;

    item.Bottom = item.Top + item.Height - 1;
    item.Right = item.Left + item.Width - 1;

    return item;
  } else {
    return null;
  }
}

//TODO change this function
let getGetStringFromMinutes = (minutes) => {
    let retval = "";

    if (minutes < 0) {
        minutes = -1 * minutes;
        retval += "-"
    } else if (minutes > 0) {
        retval += "+"
    }

    let hh = parseInt(minutes / 60);
    let mm = minutes - (hh * 60);

    if (hh < 10)
        retval += "0";

    retval += hh;
    retval += ":";

    if (mm < 10)
        retval += "0";

    retval += mm;

    return retval;
}



//--------------------------------------
//--- Extract data functions
//--------------------------------------

let getAllowedHoursList = () => {
    let allowedHours = [];
    for (let entry = 5; entry < 12; entry++) {

        let query_str = String(entry).padStart(2, 0) + ":00-" + String(entry + 8).padStart(2, 0) + ":00";

        document.querySelectorAll('[title="'+ query_str +'"]').forEach((handle)=>{
            let item = {};
            item.value = handle.firstElementChild.innerText.replace(/\s+/g, '');
            item.Location = getLocationProperties(handle);
            allowedHours.push(item);
        })
    }

    //Parse values into values
    allowedHours.forEach((element) => {
        let match_val = element.value.match("([0-9]{2}):([0-9]{2})-([0-9]{2}):([0-9]{2})");

        if(match_val.length > 0) {
            element.EnterMinutes = (parseInt(match_val[1])*60) + parseInt(match_val[2]);
            element.ExitMinutes  = (parseInt(match_val[3])*60) + parseInt(match_val[4]);
        }
    });

    return allowedHours;
}


let getDeltaList = () => {
    let deltaList = [];

    document.querySelectorAll('[title^="Delta"]').forEach((handle)=>{
        let item = {};
        item.value = handle.firstElementChild.innerText;
        item.Location = getLocationProperties(handle);
        deltaList.push(item);
    })

    //Parse values into values
    deltaList.forEach((element) => {
        let match_val = element.value.match("([0-9]{1,2}):([0-9]{2})");

        if(match_val.length > 0) {
            element.DeltaMinutes = (parseInt(match_val[1])*60) + parseInt(match_val[2]);
        }
    });
    
    return deltaList;
}


let getWorksHoursList = () => {
    let worksHoursFound = [];
    document.querySelectorAll('[title="'+getStringValue().HTML_HourElement+'"]').forEach((handle) => {
        
        let item = {};
        item.value = handle.firstElementChild.innerText.replace(/\s+/g, ''); 
        item.Location = getLocationProperties(handle);

        worksHoursFound.push(item);
    });

    //Parse values into values
    worksHoursFound.forEach((element) => {
        let match_val = element.value.match("(([0-9]{2}):([0-9]{2})){0,}-(([0-9]{2}):([0-9]{2})){0,}");

        if(match_val.length > 0) {
            if(match_val[1] !== undefined){
                element.EnterMinutes = (parseInt(match_val[2])*60) + parseInt(match_val[3])
            } else {
                element.EnterMinutes = null;
            }
    
            if(match_val[4] !== undefined){
                element.ExitMinutes = (parseInt(match_val[5])*60) + parseInt(match_val[6])
            } else {
                element.ExitMinutes = null;
            }
        }
    });

    return worksHoursFound;
}

let getDaysList = () => {
    let daysList = [];
    let currentDate = new Date();
    for (let day = 1; day <= getMonthDays(currentDate); day++) {

        var date_string = String(day).padStart(2, 0) + "-" +
            String(currentDate.getMonth() + 1).padStart(2, 0) + "-" +
            String(currentDate.getFullYear()).padStart(2, 0);

        var handle = document.querySelector("[title='" + date_string + "']");

        if (handle !== null) {
            let item = {};
            item.DataString = date_string;
            item.Location = getLocationProperties(handle);


            item.EntriesList = getWorksHoursList().filter( whl => ((whl.Location.Left === item.Location.Left) && 
                                                                   (whl.Location.Top >= item.Location.Bottom) && 
                                                                   (whl.Location.Bottom <= item.Location.Bottom + getDayHeight())));

            item.Delta = getDeltaList().find(dl => ((dl.Location.Left === item.Location.Right) &&
                                                    (dl.Location.Top >= item.Location.Top) &&
                                                    (dl.Location.Bottom <= item.Location.Bottom)))

            item.AllowedHours = getAllowedHoursList().find(wh => ((wh.Location.Left === item.Location.Right) &&
                                                                  (wh.Location.Top >= item.Location.Top) &&
                                                                  (wh.Location.Bottom <= item.Location.Bottom)))

            daysList.push(item);
        }
    }

    return daysList
}

let getDaysListFixed = () => {

    let daysListFixed = [];

    getDaysList().forEach((item) => {

        
        if(item.EntriesList.length == 2)
        {
            let firstElement = item.EntriesList[0];
            let lastElement = item.EntriesList[item.EntriesList.length - 1];

            //Fix Entry Issue
            // 08:00 - 08:00
            //       - 16:00
            if((firstElement.EnterMinutes !== null) && 
               (firstElement.ExitMinutes !== null) && 
               (firstElement.ExitMinutes - firstElement.EnterMinutes == 0) &&
               (lastElement.EnterMinutes === null) && 
               (lastElement.ExitMinutes !== null))
            {
                let val = firstElement.value.split('-')[1] + "-" + lastElement.value.split('-')[1];
                lastElement.value = val;
                lastElement.EnterMinutes = firstElement.ExitMinutes;
                lastElement.IsModified = true;
            }

            //Fix Entry Issue
            // 08:00 - 
            // 16:00 - 16:01
            if((firstElement.EnterMinutes !== null) && 
            (firstElement.ExitMinutes === null) && 
            (lastElement.EnterMinutes !== null) && 
            (lastElement.ExitMinutes !== null))
            {
                let val = firstElement.value.split('-')[0] + "-" + lastElement.value.split('-')[0];
                firstElement.value = val;
                firstElement.ExitMinutes = lastElement.EnterMinutes;
                firstElement.IsModified = true;
            }
        }

        //today
        if(item.EntriesList.length > 0)
        {
            let element = item.EntriesList[item.EntriesList.length - 1];
            if(element.ExitMinutes === null)
            {
                let date = new Date();

                let hourString = String(date.getHours()).padStart(2, 0) + ":" + String(date.getMinutes()).padStart(2, 0);

                element.value = element.value.split('-')[0] + "-" + hourString;
                element.ExitMinutes = parseInt((date.getHours() *60) + date.getMinutes());
            }
        }

        daysListFixed.push(item)
    });

    return daysListFixed;
}



let calculateMinutes = (day, IsNormalized = true) => {

    let dayBalance = 0;
    day.EntriesList.forEach((record) => {

        let record_enter = record.EnterMinutes;
        let record_exit  = record.ExitMinutes;

        if(IsNormalized == true)
        {
            if(record.EnterMinutes < day.AllowedHours.EnterMinutes) {
                record_enter = day.AllowedHours.EnterMinutes;
            }

            if(record.ExitMinutes > (day.AllowedHours.ExitMinutes + day.Delta.DeltaMinutes)) {
                record_exit = (day.AllowedHours.ExitMinutes + day.Delta.DeltaMinutes)
            }
        }

        dayBalance += (record_exit - record_enter);
    });

    return dayBalance - (60 * 8);
}



let createElement = (Handler, Location, Data) => {

//<div class="wstext" style="white-space: pre; text-align: center; color: rgb(0, 0, 0); font-family: Calibri; font-weight: bold; font-size: 15px; line-height: 15px; left: 2px; width: 157px; top: 15px;">09:19 - 14:09</div>


    let element  = document.createElement('div');
    element.id = Handler;
    element.style.left = (Location.Left + 1) +'px'
    element.style.top = (Location.Top + 1) +'px'
    element.style.width = (Location.Width - 2) +'px'
    element.style.height = (Location.Height - 2) +'px'
    
    
    element.style.backgroundColor = "rgb(145, 209, 255)";
    element.style.display = "block";
    element.style.position = "absolute";
    element.style.zIndex = "11";
    element.style.borderWidth = "1px";

    let subElement  = document.createElement('div')
    subElement.id = "Sub"+Handler;
    subElement.style.width = (Location.Width - 2) +'px'
    subElement.style.textAlign = "center";
    subElement.style.fontFamily = "Calibri";
    subElement.style.fontWeight = "bold";
    subElement.style.fontSize = "15px";
    subElement.style.lineHeight = "15px";
    subElement.innerHTML = Data;

    if(Location.Height < 40) {
        subElement.style.marginTop = "3px";
    } else {
        subElement.style.marginTop = "15px";
    }

    document.querySelector("#work\\.\\.Worksheet\\.\\.calendarModel > div:nth-child(6) > div").appendChild(element);
    document.querySelector("#"+Handler).appendChild(subElement)
    

    return element;
}



let CalculateTime = () => {

    let Balanse = {
        Minutes:0,
        AllMinutes:0
    }

    getDaysListFixed().filter(item => item.EntriesList.length > 0).forEach((day) => {

        Balanse.Minutes += calculateMinutes(day);
        Balanse.AllMinutes += calculateMinutes(day,false);

        day.EntriesList.forEach((record,index) => {
            
            let strEntry = "Day_" + day.DataString + "_" + index;
            let displayData = record.value + ' = ' + getGetStringFromMinutes(record.ExitMinutes - record.EnterMinutes);

            if (document.getElementById(strEntry) == null) {
                createElement(strEntry, record.Location, displayData);
            } else {
                document.getElementById(strEntry).firstChild.innerHTML = displayData;
            }

            if (document.getElementById(strEntry) != null) {
                if(ShowReplacedData == true) {
                    document.getElementById(strEntry).style.display = "block";
                } else {
                    document.getElementById(strEntry).style.display = "none";
                }
            }
        });
    });


    if (document.getElementById("worktime_summary") == null) {
        document.getElementsByClassName("leaflettoolbar")[0].children[1].style.width = "1000px";
        document.getElementsByClassName("leaflettoolbar")[0].children[1].style.fontWeight = "bold";
        document.getElementsByClassName("leaflettoolbar")[0].children[1].id = "worktime_summary";
    }


    if (document.getElementById("ShowData") == null) {
        let btnHandler = document.querySelector("#\\.\\.Navigation\\.\\.Navigation > div.rcbox > div.rcbox > div > div:nth-child(2) > div > div > div");
        
        let btn  = document.createElement('Button');
        btn.id = "ShowData";
        btn.style.position = "absolute";
        btn.style.left = "230px";
        btn.style.top = "10px";
        btn.style.width = "240px";
        btn.style.height = "28px";
        btn.style.zIndex = "11";
        btn.innerHTML = getStringValue().btnSwitch_Orginal;
        btn.onclick = ()=>{
            ShowReplacedData = !ShowReplacedData;

            if(ShowReplacedData == true) {
                btn.innerHTML = getStringValue().btnSwitch_Orginal;
            } else {
                btn.innerHTML = getStringValue().btnSwitch_Replaced;
            }

            CalculateTime();
        };
        btnHandler.appendChild(btn);
    }

    let text = getStringValue().HourSummary + ": ( " + getGetStringFromMinutes(Balanse.Minutes) + " )  "+ getStringValue().HourSummaryAll +": "+ getGetStringFromMinutes(Balanse.AllMinutes);
    document.getElementById("worktime_summary").innerHTML =  text + "  /  [ " + Version + " ]";
    console.log(text);

    return Balanse;
}

CalculateTime();

clearInterval(handleInterval);
var handleInterval = setInterval(function() {
    CalculateTime();
}, 1000);
