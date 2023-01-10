 //Scale handler
  //1, 2, 5 msec
  //1, 2, 5 sec
  //1, 2, 5, 10, 20, 30, 60 min
  //1, 2, 4, 8, 24 hours
  //1, 2, 5, 10 days
  //1, 2, 3, 6, 12 month
  //1, 2, 5 years

const mSecInHour = 3_600_000;
const mSecInDay = mSecInHour * 24;
const mSecInMonth = mSecInDay * 30;
const mSecInYear = 366 * mSecInDay;
const msecs = [1, 2, 5, 10, 20, 50, 100, 200, 500,                 //msec
    1_000, 2_000, 5_000, 10_000, 30_000,                           //sec
    60_000, 120_000, 300_000, 600_000, 1_800_000,                  //min    
    mSecInHour, mSecInHour * 2, mSecInHour * 4, mSecInHour * 8,    //hours  
    mSecInDay, mSecInDay * 2, mSecInDay * 5, mSecInDay * 10,       //days
    mSecInMonth, mSecInMonth * 2, mSecInMonth * 3, mSecInMonth * 6,
    mSecInYear, mSecInYear * 2, mSecInYear * 5, mSecInYear * 10, mSecInYear * 20, mSecInYear * 50, mSecInYear * 100
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

    public static getScaleSize (timeSpanInMsec: number) {

        let i = 0;
        while (i < msecs.length && timeSpanInMsec > msecs[i])
            i++;
        
        if (i >= msecs.length) 
            return msecs[msecs.length - 1];

        if (i == 0)
            return 1; //lowest resolution - 1 msec

        return msecs[i - 1];    
    }

    public static getNearestBiggerScalePoint (timepoint: number, timeSpanInMsec: number) {
        if (timeSpanInMsec < mSecInHour * 2)
            return Math.ceil(timepoint / timeSpanInMsec) * timeSpanInMsec;
            
        let currDate = new Date (timepoint);

        if (timeSpanInMsec < mSecInDay){
            let nHours = Math.round(timeSpanInMsec / mSecInHour);
            let hToRound = currDate.getHours() % nHours;
            currDate.setHours (currDate.getHours() - hToRound, 0, 0, 0);
            return currDate.getTime() + nHours * mSecInHour;
        }

        //Days
        currDate.setHours (0, 0, 0, 0);
        if (timeSpanInMsec < mSecInMonth) {
            let nDays = Math.round(timeSpanInMsec / mSecInDay);
            currDate.setDate (currDate.getDate() + nDays);
            return currDate.getTime();
        }

        //Month
        currDate.setDate(1);        
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
            currDate.setFullYear (currDate.getFullYear() + nYears - dateYear % nYears);
        }
        return currDate.getTime();        
    }

    public static getNextScaleValue (timePoint: number, scaleSpan: number): number {

        if (scaleSpan < mSecInDay)
            return timePoint + scaleSpan;

        let currDate = new Date(timePoint);            
        currDate.setHours (0, 0, 0, 0);
        if (scaleSpan < mSecInMonth) {
            let nDays = Math.round(scaleSpan / mSecInDay);
            currDate.setDate (currDate.getDate() + nDays);
            return currDate.getTime();
        }

        currDate.setDate (1);
        if (scaleSpan < mSecInYear) {
            let nMonth = Math.round(scaleSpan / mSecInMonth);
            currDate.setMonth (currDate.getMonth() + nMonth);
            return currDate.getTime();
        }
        
        let nYears = Math.round(scaleSpan / mSecInYear);
        currDate.setFullYear (currDate.getFullYear() + nYears);
        return currDate.getTime();
    }
}