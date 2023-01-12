import { ITimeLineItem, ITimeLineItemsProvider } from "src/time-line/time-line.module";

export class MyAppTimeLineItem implements ITimeLineItem {
    public Start: number;
    public Duration: number;
    public Text: string;
    public Description: string;
}

export class MyAppSeries implements ITimeLineItemsProvider {
    
    public type: string;
    public items: ITimeLineItem[];
    public legend: any | undefined;
    
    public onNewItemCreated(item: ITimeLineItem, el: HTMLElement): void {
        
    }

    public onNewItemSelected(item: ITimeLineItem | null, el: HTMLElement | null): void {
        
    }
}
