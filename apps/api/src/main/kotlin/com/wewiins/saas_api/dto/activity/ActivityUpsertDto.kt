package com.wewiins.saas_api.dto.activity

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ActivityUpsertDto(
    @SerialName("id")             val id: String? = null,
    @SerialName("title")          val title: String?,
    @SerialName("description")    val description: String?,
    @SerialName("provider_id")    val providerId: String,
    @SerialName("is_published")   val isPublished: Boolean,
    @SerialName("main_photo_url") val mainPhotoUrl: String?,
    @SerialName("gallery_urls")   val galleryUrls: List<String>?,
)
