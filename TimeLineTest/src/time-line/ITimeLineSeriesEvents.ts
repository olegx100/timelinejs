export interface ITimeLineItem {
    Start: number;
    Duration: number;
}

export interface ITimeLineItemsProvider {
    type: string; 
    items: Array<ITimeLineItem>;
    legend: TimeLinePointLegend;

    onNewItemCreated (item: ITimeLineItem | null, el: HTMLElement): void;
    onNewItemSelected (item: ITimeLineItem | null, el: HTMLElement | null): void;
}

export class TimeLinePointLegend {
    pointSize: number;
    borderColor: string;
    fillColor: string;
}