export class FilterTime {
  constructor(
    public timeCriteria: string,
    public dateFrom?: Date,
    public dateTo?: Date,
    public timeRange?: number,
  ) {  }
}
