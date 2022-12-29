 //Scale handler
  //1, 2, 5 msec
  //1, 2, 5 sec
  //1, 2, 5, 10, 20, 30, 60 min
  //1, 2, 4, 8, 24 hours
  //1, 2, 5, 10 days
  //1, 2, 3, 6, 12 month
  //1, 2, 5 years

import { DatePipe } from "@angular/common";

const mSecInDay = 86_400_000;
const mSecInMonth = mSecInDay * 30;
const mSecInYear = 366 * mSecInDay;
const msecs = [1, 2, 5, 10, 20, 50, 100, 200, 500,                 //msec
    1_000, 2_000, 5_000, 10_000, 30_000,                           //sec
    60_000, 120_000, 300_000, 600_000, 1_800_000,                  //min    
    3_600_000, 7_200_000, 14_400_000, 28_800_000,                  //hours  
    mSecInDay, mSecInDay * 2, mSecInDay * 5, mSecInDay * 10,       //days
    mSecInMonth, mSecInMonth * 2, mSecInMonth * 3, mSecInMonth * 6,
    mSecInYear, mSecInYear * 2, mSecInYear * 5, mSecInYear * 10, mSecInYear * 20, mSecInYear * 50
    ]

export class TimeScaleCalc {

    constructor () {
        
    }

    public static getMsecInDay () {
        return mSecInDay;
    }
    
    public static getMsecInYear () {
        return mSecInYear;
    }

    private static GetRoundMonth (date: Date) : Date {
        let dateCpy = new Date(date);
        if (dateCpy.getDay() != 1)
            dateCpy.setDate (1);
       
        dateCpy.setHours(0, 0, 0, 0);
        return dateCpy;
    }

    public static getScaleSize (timeSpanInMsec: number) {

        let i = 0;
        while (i < msecs.length && timeSpanInMsec > msecs[i])
            i++;
        
        if (i >= msecs.length) 
            return msecs.length[msecs.length - 1];

        if (i == 0)
            return 1; //lowest resolution - 1 msec

        return msecs[i - 1];    
    }

    public static getNearestBiggerScalePoint (timeSpanInMsec: number, timepoint: number) {
        if (timeSpanInMsec < mSecInMonth)
            return Math.ceil(timepoint / timeSpanInMsec) * timeSpanInMsec;

        let currDate = this.GetRoundMonth (new Date (timepoint));            
        if (timeSpanInMsec < mSecInYear) {
            let nMonth = Math.round(timeSpanInMsec / mSecInMonth);
            let dateMonth = currDate.getMonth();

            if (dateMonth % nMonth) 
                currDate.setMonth (currDate.getMonth() + nMonth - dateMonth % nMonth);
                        
            if (currDate.getTime() < timepoint)
                currDate.setMonth (currDate.getMonth() + nMonth);
                
            return currDate.getTime();
        }

        //Years
        currDate.setMonth(0);
        let nYears = Math.round(timeSpanInMsec / mSecInYear);
        let dateYear = currDate.getFullYear();
        if (dateYear % nYears) {
            let tmp = nYears - dateYear % nYears;
            console.log ("tmp:", tmp);
            currDate.setFullYear (currDate.getFullYear() + nYears - dateYear % nYears);
        }
        return currDate.getTime();        
    }

    public static getNextScaleValue (timePoint: number, scaleSpan: number): number {
        if (scaleSpan < mSecInMonth) 
            return timePoint + scaleSpan;

        let dp = new DatePipe ('en-US');    
        let fmtStr = "dd.MM.yyyy HH:mm.ss";
        let currDate = new Date(timePoint);

        if (scaleSpan < mSecInYear) {
            let nMonth = Math.round(scaleSpan / mSecInMonth);
            currDate.setMonth (currDate.getMonth() + nMonth);
            //console.log ("timePoint:", dp.transform(timePoint, fmtStr), "nMonth:", nMonth, "newDate:", dp.transform(currDate, fmtStr));
            return currDate.getTime();
        }
        
        let nYears = Math.floor(scaleSpan / mSecInYear);
        currDate.setFullYear (currDate.getFullYear() + nYears);
        //console.log ("timePoint:", dp.transform(timePoint, fmtStr), "nYears:", nYears, "newDate:", dp.transform(currDate, fmtStr));
        return currDate.getTime();
    }
}