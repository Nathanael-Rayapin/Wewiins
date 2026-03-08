package com.wewiins.saas_api.interfaces

data class Statistic(
    val totalRevenue: ComparisonStat<Double>, // OK
    val totalCharges: ComparisonStat<Double>, // OK
    val totalBooking: ComparisonStat<Int>, // OK
    val occupancyRate: ComparisonStat<Int>, // OK
    val cancellationRate: ComparisonStat<Int>,
    val averageParticipants: ComparisonStat<Int>,
    val favoritesCount: ComparisonStat<Int>,
    val averageScore: ComparisonStat<Double>, // OK
    val visitsByPeriod: List<VisitDataPoint>,
    val scoreDistribution: List<ScoreDistribution>
)

data class VisitDataPoint(
    val date: Long,
    val count: Int
)

data class ScoreDistribution(
    val star: Int,
    val count: Int
)