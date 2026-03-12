import { IStatComparisonDto } from "./common";
import { IScoreDistributionDto } from "./statistic";

export interface IReviewDto {
    averageScore: IStatComparisonDto<number>;
    scoreDistribution: IScoreDistributionDto[];
    filterRangeDays: number;
    activities: IPaginatedResultDto<IActivityReviewDto>;
}

export interface IActivityReviewDto {
    activityId: string;
    activityName: string;
    averageScore: IStatComparisonDto<number>;
    totalReviews: number;
}

export interface IPaginatedResultDto<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}