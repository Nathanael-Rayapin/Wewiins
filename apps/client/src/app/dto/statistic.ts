import { IStatComparisonDto } from "./common";

export interface IStatisticDto {
    totalRevenue: IStatComparisonDto<number>;
    totalCharges: IStatComparisonDto<number>;
    totalBooking: IStatComparisonDto<number>;
    averageOccupancy: IStatComparisonDto<number>;
    averageCancellation: IStatComparisonDto<number>;
    averageParticipants: IStatComparisonDto<number>;
    totalFavorites: IStatComparisonDto<number>;
    averageScore: IStatComparisonDto<number>;
    visitsByPeriod: IVisitDataPointDto[];
    scoreDistribution: IScoreDistributionDto[];
    filterRangeDays: number;
}

export interface IVisitDataPointDto {
    date: number;
    count: number;
}

export interface IScoreDistributionDto {
    star: number;
    count: number;
}