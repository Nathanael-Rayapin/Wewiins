import { signal } from "@angular/core";
import { IReviewDto } from "../../../dto/review";
import { defaultStats } from "../../dashboard/data/dashboard.data";

export const defaultReviewData = signal<IReviewDto>({
    averageScore: { ...defaultStats },
    scoreDistribution: [],
    filterRangeDays: 0,
    activities: {
        items: [],
        totalCount: 0,
        page: 0,
        pageSize: 10,
        hasMore: false
    }
})