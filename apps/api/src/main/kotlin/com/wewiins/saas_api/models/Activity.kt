package com.wewiins.saas_api.models

import com.wewiins.saas_api.models.enums.BookingStatus
import com.wewiins.saas_api.models.enums.BookingType
import java.time.OffsetDateTime
import java.util.UUID
import java.time.LocalDate

data class Activity(
    val id: UUID,
    val title: String,
    val description: String,
    val category_id: UUID,
    val provider_id: UUID,
    val main_photo_url: String,
    val is_published: Boolean,
    val average_score: Double?,
    val address: String,
    val zipcode: String,
    val city: String,
    val gallery_urls: List<String>,
    val created_at: OffsetDateTime,
    val ends_at: OffsetDateTime?,
)

data class ActivityOffer(
    val id: UUID,
    val activity_id: UUID,
    val booking_type: BookingType,
    val label: String,
    val redemption_validity_days: Int?,
    val price_adult: Double?,
    val price_child: Double?,
    val price_student: Double?,
    val min_age_child: Int?,
    val max_age_child: Int?,
    val adults_allowed: Boolean,
    val children_allowed: Boolean,
    val student_allowed: Boolean,
    val capacity: Int,
    val is_refund_expected: Boolean,
    val created_at: OffsetDateTime,
    val activities: Activity?,
)

data class ActivitySlotBooking(
    val id: UUID,
    val activity_offer_id: UUID,
    val user_id: UUID,
    val start_time: OffsetDateTime?,
    val end_time: OffsetDateTime?,
    val participants: Int,
    val adults: Int,
    val children: Int,
    val students: Int,
    val total_price: Double,
    val status: BookingStatus,
    val reference: String,
    val stripe_charge_id: String?,
    val stripe_payment_intent_id: String?,
    val stripe_checkout_id: String?,
    val has_seen: Boolean,
    val date: LocalDate,
    val reminder_date: LocalDate,
    val created_at: OffsetDateTime,
    val updated_at: OffsetDateTime,
    val activity_offers: ActivityOffer?,
)

data class ActivityRevenue(
    val activity_title: String,
    val total_price: Double
)