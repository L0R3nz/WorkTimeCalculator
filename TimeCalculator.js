
//change in future 
let getDayHeight = () => {
    return 47 + 1;
}

let getDelta = () => {
    return 4;
}

let getEntryHour = () => {
    return 7;
}

let getExitHour = () => {
    return getEntryHour() + 8 + getDelta();
}

//----------------------------------------


let getDeltas = () => {
    let DeltaList = [];
    for (let entry = 5; entry < 12; entry++) {

        let query_str = String(entry).padStart(2, 0) + ":00-" + String(entry + 8).padStart(2, 0) + ":00";

        document.querySelectorAll('[title="'+ query_str +'"]').forEach((handle)=>{
            let item = {};
            item.value = handle.firstElementChild.innerText;
            item.Left = handle.offsetLeft;
            item.Top = handle.offsetTop;
            item.Height = handle.offsetHeight;
            item.Width = handle.offsetWidth;

            item.Bottom = (item.Top + item.Height) - 1;
            item.Right= (item.Left + item.Width) - 1;


            DeltaList.push(item);
        })
    }

    return DeltaList;
}


let getMinutesFromHour = (s) => {
    if (s == null)
        return null;

    var hh = parseInt(s.split(':')[0]);
    var mm = parseInt(s.split(':')[1]);

    return ((hh * 60) + mm)
}


let getMonthDays = (today) => {
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
}

let getWorksHoursList = () => {
    let WorksHoursFound = [];
    document.querySelectorAll('[title="Czas pracy"]').forEach((handle) => {
        let item = {};

        item.Hour = {
            Raw: handle.firstElementChild.innerText,
            Enter: handle.firstElementChild.innerText.replace(/\s+/g, '').split("-")[0],
            Exit: handle.firstElementChild.innerText.replace(/\s+/g, '').split("-")[1],
        }

        item.Hour.ElapsedMin = getMinutesFromHour(item.Hour.Exit) - getMinutesFromHour(item.Hour.Enter);



        item.Hour.ElapsedMin_N = getMinutesFromHour(item.Hour.Exit);

        if (getMinutesFromHour(item.Hour.Exit) > getExitHour() * 60) {
            item.Hour.ElapsedMin_N = getExitHour() * 60;
        }


        if (getMinutesFromHour(item.Hour.Enter) < getEntryHour() * 60) {
            item.Hour.ElapsedMin_N -= getEntryHour() * 60;
        }
        else {
            item.Hour.ElapsedMin_N -= getMinutesFromHour(item.Hour.Enter);
        }



        item.Left = handle.offsetLeft;
        item.Top = handle.offsetTop;
        item.Height = handle.offsetHeight;
        item.Bottom = (item.Top + item.Height) - 1;

        WorksHoursFound.push(item);
    });

    return WorksHoursFound;
}

let getDaysList = () => {
    let DaysFound = [];
    let currentDate = new Date();
    for (let day = 1; day <= getMonthDays(currentDate); day++) {

        var date_string = String(day).padStart(2, 0) + "-" +
            String(currentDate.getMonth() + 1).padStart(2, 0) + "-" +
            String(currentDate.getFullYear()).padStart(2, 0);

        var handle = document.querySelector("[title='" + date_string + "']");

        let item = {};
        item.DataString = date_string;

        if (handle !== null) {
            item.Left = handle.offsetLeft;
            item.Top = handle.offsetTop;
            item.Height = handle.offsetHeight;
            item.Width = handle.offsetWidth;

            item.Bottom = (item.Top + item.Height) - 1;
            item.Right= (item.Left + item.Width) - 1;

            item.EntriesList = getWorksHoursList().filter(e => (e.Left === item.Left) && (e.Top >= item.Bottom) && (e.Bottom <= item.Bottom + getDayHeight()));
            item.Delta = getDeltas().filter(d=> (d.Left === item.Right) && (d.Top >= item.Top) && (d.Top <= item.Bottom))
            DaysFound.push(item);
        }
    }

    return DaysFound
}

let calculateWorkTime = () => {

    let days_sum = 0;
    let days_sum_n = 0;

    getDaysList().filter(item => item.EntriesList.length > 0).forEach((day) => {
        let sum = 0;
        let sum_n = 0;

        for (let idx = 0; idx < day.EntriesList.length; idx++) {
            sum += (day.EntriesList[idx].Hour.ElapsedMin);
            sum_n += (day.EntriesList[idx].Hour.ElapsedMin_N);
        }

        console.log(day.DataString + "   S:" + (sum - 480) + "   SN: " + (sum_n - 480));

        days_sum += (sum - 480);
        days_sum_n += (sum_n - 480);
    });

    console.log("--------------------------------------");
    console.log("sum: " + days_sum);
    console.log("sum_n: " + days_sum_n);
    console.log("--------------------------------------");
}


calculateWorkTime();
