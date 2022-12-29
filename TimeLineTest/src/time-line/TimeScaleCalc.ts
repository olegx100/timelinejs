 //Scale handler
  //1, 2, 5 msec
  //1, 2, 5 sec
  //1, 2, 5, 10, 20, 30, 60 min
  //1, 2, 4, 8, 24 hours
  //1, 2, 5, 10 days
  //1, 2, 3, 6, 12 month
  //1, 2, 5 years

const mSecInDay = 86_400_000;
const mSecInMonth = mSecInDay * 31;
const mSecInYear = 366 * mSecInDay;
const msecs = [1, 2, 5, 10, 20, 50, 100, 200, 500,                 //msec
    1_000, 2_000, 5_000, 10_000, 30_000,                           //sec
    60_000, 120_000, 300_000, 600_000, 1_800_000,                  //min    
    3_600_000, 7_200_000, 14_400_000, 28_800_000,                  //hours  
    mSecInDay, mSecInDay * 2, mSecInDay * 5, mSecInDay * 10,       //days
    mSecInMonth, mSecInMonth * 2, mSecInMonth * 3, mSecInMonth * 6,
    mSecInYear, mSecInYear * 2, mSecInYear * 5, mSecInYear * 10
    ]

export class TimeScaleCalc {

    constructor () {
        
    }

    getMsecInDay () {
        return mSecInDay;
    }
    
    getScaleValue (timeSpanInMsec, timepoint) {
        let i = 0;
        while (i < msecs.length && timeSpanInMsec > msecs[i])
            i++;
        
        if (i >= msecs.length) {
            //no such huge scale - > 10 years 
            //???
        }

        if (i == 0)
            return 1; //lowest resolution - 1 msec

        if (msecs[i] < mSecInDay)
            return msecs[i - 1];

        //TODO: select day, month and year using timepoint   
        return msecs[i - 1];
    }
}