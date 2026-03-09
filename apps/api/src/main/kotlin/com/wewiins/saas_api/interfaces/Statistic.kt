package com.wewiins.saas_api.interfaces

data class Statistic(
    val totalRevenue: ComparisonStat<Double>,
    val totalCharges: ComparisonStat<Double>,
    val totalBooking: ComparisonStat<Int>,
    val averageOccupancy: ComparisonStat<Int>,
    val averageCancellation: ComparisonStat<Double>,
    val averageParticipants: ComparisonStat<Double>,
    val totalFavorites: ComparisonStat<Int>,
    val averageScore: ComparisonStat<Double>,
    val visitsByPeriod: List<VisitDataPoint>,
    val scoreDistribution: List<ScoreDistribution>,
    val filterRangeDays: Int,
)

data class VisitDataPoint(
    val date: Long,
    val count: Int
)

data class ScoreDistribution(
    val star: Int,
    val count: Int
)