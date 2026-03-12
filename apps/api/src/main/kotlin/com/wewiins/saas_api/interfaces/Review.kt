package com.wewiins.saas_api.interfaces

data class Review(
    val averageScore: ComparisonStat<Double>,
    val scoreDistribution: List<ScoreDistribution>,
    val filterRangeDays: Int,
    val activities: PaginatedResult<ActivityReview>
)

data class ActivityReview(
    val activityId: String,
    val activityName: String,
    val averageScore: ComparisonStat<Double>,
    val totalReviews: Int
)

data class PaginatedResult<T>(
    val items: List<T>,
    val totalCount: Int,
    val page: Int,
    val pageSize: Int,
    val hasMore: Boolean
)