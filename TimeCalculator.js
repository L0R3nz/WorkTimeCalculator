
let ColumnMap = 
[
    { ID: 1, Name: "Monday",    WPageID: "0x0"  },
    { ID: 2, Name: "Tuesday",   WPageID: "0x2"  },
    { ID: 3, Name: "Wednesday", WPageID: "0x4"  },
    { ID: 4, Name: "Thursday",  WPageID: "0x6"  },
    { ID: 5, Name: "Friday",    WPageID: "0x8"  },
    { ID: 6, Name: "Saturday",  WPageID: "0x10" },
    { ID: 0, Name: "Sunday",    WPageID: "0x12" }
];


ColumnMap.forEach((item)=>{
   var handle =  document.querySelector("#work\\.\\.Worksheet\\.\\.calendarModel\\.\\."+item.WPageID+"\\.\\.Label");
   item.Left = handle.offsetLeft;
   item.Top = handle.offsetTop;
   item.Width = handle.offsetWidth;
});


//------------------

var WorksHoursFound = [];
document.querySelectorAll('[title="Czas pracy"]').forEach((handle) => {

    item = {};
    item.value = handle.firstElementChild.innerText
    item.Left = handle.offsetLeft;
    item.Top = handle.offsetTop;
    item.Height = handle.offsetHeight;
    item.Bottom = (item.Top + item.Height)-1;

    WorksHoursFound.push(item);
})



let getMonthDays = (today) => {
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
}


var DaysFound = [];
var currentDate = new Date();
for (let day = 1; day <= getMonthDays(currentDate); day++) {

    var date_string = String(day).padStart(2,0) + "-" + 
                      String(currentDate.getMonth() + 1).padStart(2,0) + "-" + 
                      String(currentDate.getFullYear()).padStart(2,0);

    var handle =  document.querySelector("[title='"+date_string+"']");
    
    item = {};
    item.DataString = date_string;

    if(handle !== null)
    {
        item.Left = handle.offsetLeft;
        item.Top = handle.offsetTop;
        item.Height = handle.offsetHeight;
        item.Bottom = (item.Top + item.Height)-1;
        item.Elements= WorksHoursFound.filter(e=> (e.Left === item.Left) && (e.Top === item.Bottom))
    }

    DaysFound.push(item);
}





console.log(DaysFound);

