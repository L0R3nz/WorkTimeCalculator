
//--------------------------------------
//--- Basic functions
//--------------------------------------

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
    document.querySelectorAll('[title="Czas pracy"]').forEach((handle) => {
        
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



let calculateMinutes = (day, IsNormalized = true) => {

    let dayBalance = 0;
    day.EntriesList.forEach((record) => {

        let record_enter = record.EnterMinutes;
        let record_exit  = record.ExitMinutes;

        //TODO change logic to have independent function
        if(record_exit === null) {
            let date = new Date();
            record_exit = parseInt((date.getHours() *60) + date.getMinutes());
        }

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



let CalculateTime = () => {

    let calendarDays = [];
    getDaysList().filter(item => item.EntriesList.length > 0).forEach((day) => {
        
        let item = {};
        item.name = day.DataString;
        item.Minutes = calculateMinutes(day);
        item.AllMinutes = calculateMinutes(day,false);

        calendarDays.push(item);
    });

    let Balanse = {
        Minutes:0,
        AllMinutes:0
    }

    calendarDays.forEach((d)=>{
        Balanse.Minutes += d.Minutes;
        Balanse.AllMinutes += d.AllMinutes;
    })


    if (document.getElementById("worktime_summary") == null) {
        document.getElementsByClassName("leaflettoolbar")[0].children[1].style.width = "500px";
        document.getElementsByClassName("leaflettoolbar")[0].children[1].style.fontWeight = "bold";
        document.getElementsByClassName("leaflettoolbar")[0].children[1].id = "worktime_summary";
    }


    let text = "Bilans wg delty: ( " + getGetStringFromMinutes(Balanse.Minutes) + " )  Calość: " + getGetStringFromMinutes(Balanse.AllMinutes);
    document.getElementById("worktime_summary").innerHTML =  text;
    console.log(text);



    return Balanse;
}

CalculateTime();

clearInterval(handleInterval);
var handleInterval = setInterval(function() {
    CalculateTime();
}, 1000);
