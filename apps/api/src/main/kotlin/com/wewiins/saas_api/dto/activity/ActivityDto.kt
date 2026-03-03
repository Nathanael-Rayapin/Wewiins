package com.wewiins.saas_api.dto.activity

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.OffsetDateTime

data class ActivityDto(
    val id: String,

    @field:JsonProperty("created_at")
    val createAt: OffsetDateTime,

    val title: String,

    val description: String?,

    @field:JsonProperty("provider_id")
    val providerId: String,

    @field:JsonProperty("main_photo_url")
    val mainPhotoUrl: String?,

    @field:JsonProperty("is_published")
    val isPublished: Boolean = false,

    @field:JsonProperty("average_score")
    val averageScore: Double?,

    val address: String?,

    val zipcode: String?,

    val city: String?,

    @field:JsonProperty("gallery_urls")
    val galleryUrls: List<String>?,

    @field:JsonProperty("ends_at")
    val endsAt: OffsetDateTime?,

    @field:JsonProperty("access_info")
    val accessInfo: String?
)
