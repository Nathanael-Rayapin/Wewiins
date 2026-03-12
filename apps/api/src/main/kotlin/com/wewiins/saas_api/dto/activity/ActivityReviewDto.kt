package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty

data class ActivityReviewDto(
    @field:JsonProperty("activity_id")
    val activityId: String,

    @field:JsonProperty("activity_name")
    val activityName: String,

    @field:JsonProperty("current_average_score")
    val currentAverageScore: String,

    @field:JsonProperty("previous_average_score")
    val previousAverageScore: String,

    @field:JsonProperty("total_reviews")
    val totalReviews: String,

    @field:JsonProperty("total_count")
    val totalCount: String,
)
