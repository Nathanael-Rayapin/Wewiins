package com.wewiins.saas_api.repositories

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.stripe.StripeClient
import com.stripe.param.BalanceTransactionListParams
import com.wewiins.saas_api.dto.ImageType
import com.wewiins.saas_api.dto.activity.AverageScore
import com.wewiins.saas_api.dto.user.ProviderDto
import com.wewiins.saas_api.dto.VisitsCountDto
import com.wewiins.saas_api.dto.activity.ActivityBooking
import com.wewiins.saas_api.dto.activity.ActivityBookingRaw
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.dto.activity.ActivityUpsertDto
import com.wewiins.saas_api.enums.Categories
import com.wewiins.saas_api.interfaces.Revenue
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Count
import io.github.jan.supabase.storage.storage
import io.ktor.http.ContentType
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import org.springframework.stereotype.Repository
import org.slf4j.LoggerFactory
import org.springframework.web.multipart.MultipartFile
import java.util.UUID
import kotlin.math.roundToInt

@Repository
class ActivityRepository(
    private val supabaseClient: SupabaseClient,
    private val stripeClient: StripeClient
) {

    private val logger = LoggerFactory.getLogger(ActivityRepository::class.java)

    object StorageConstants {
        const val BUCKET_ID = "activities"
    }

    suspend fun getRevenueByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Revenue {
        logger.info(
            "🔎 Fetching Revenue for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        val params = BalanceTransactionListParams.builder()
            .setLimit(100L)
            .setType("charge")
            .setCreated(
                BalanceTransactionListParams.Created.builder()
                    .setGte(startDate)
                    .setLte(endDate)
                    .build()
            )
            .build()

        val result = stripeClient
            .v1()
            .balanceTransactions()
            .list(params)

        val revenue = result.data
            .filter { it.status == "available" }
            .sumOf { transaction ->
                transaction.amount.toDouble() / 100.0
            }

        val isComplete = !result.hasMore

        return Revenue(
            revenue = revenue,
            isComplete = isComplete
        )
    }

    suspend fun getBookingNumberByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info(
            "🔎 Fetching Bookings for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // Convertir les timestamps Unix (secondes) en format ISO pour Supabase
        val startDateTime = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val endDateTime = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val response = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                activity_offers!inner(
                    id,
                    activities!inner(
                        id,
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
            """.trimIndent()
                )
            ) {
                filter {
                    gte("created_at", startDateTime)
                    lte("created_at", endDateTime)
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                }
                count(Count.EXACT)
            }

        return response.countOrNull()?.toInt() ?: 0
    }

    suspend fun getVisitNumberByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Int {
        logger.info(
            "🔎 Fetching Visits for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // Convert timestamps to LocalDate (format YYYY-MM-DD)
        val startLocalDate = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()

        val endLocalDate = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDate()

        logger.debug("📅 Période convertie : {} à {}", startLocalDate, endLocalDate)

        // Retrieve the provider_id from stripe_connected_account_id
        val provider = supabaseClient
            .from("providers")
            .select {
                filter {
                    eq("stripe_connected_account_id", connectedAccountId)
                }
            }
            .decodeSingleOrNull<ProviderDto>()
            ?: run {
                logger.warn("⚠️ Aucun provider trouvé pour connected_account_id: {}", connectedAccountId)
                return 0
            }

        logger.debug("Provider trouvé : {}", provider.id)

        // Retrieve the total number of visits for this provider over the period
        val stats = supabaseClient
            .from("activity_visit_stats")
            .select(columns = Columns.list("visit_count")) {
                filter {
                    eq("provider_id", provider.id)
                    gte("visit_date", startLocalDate.toString())
                    lte("visit_date", endLocalDate.toString())
                }
            }
            .decodeList<VisitsCountDto>()

        // Calculate the total number of visits
        val totalVisits = stats.sumOf { it.visitCount }

        logger.info("📊 Total des visites pour le provider {} : {}", connectedAccountId, totalVisits)

        return totalVisits
    }

    suspend fun getAverageScoreByPeriod(
        connectedAccountId: String,
        startDate: Long,
        endDate: Long
    ): Double {
        logger.info(
            "🔎 Fetching Average Score for connected account {} from {} to {}",
            connectedAccountId,
            startDate,
            endDate
        )

        // Convertir les timestamps Unix (secondes) en format ISO pour Supabase
        val startDateTime = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val endDateTime = java.time.Instant.ofEpochSecond(endDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val response = supabaseClient.postgrest["activities"]
            .select(
                columns = Columns.raw(
                    """
                average_score,
                providers!inner(
                    stripe_connected_account_id
                )
            """.trimIndent()
                )
            ) {
                filter {
                    gte("created_at", startDateTime)
                    lte("created_at", endDateTime)
                    eq("providers.stripe_connected_account_id", connectedAccountId)
                }
                count(Count.EXACT)
            }

        val scores = response.decodeList<AverageScore>()
            .mapNotNull { it.averageScore }

        if (scores.isEmpty()) {
            return 0.0
        }

        return scores.average()
            .coerceIn(0.0, 5.0)
            .let { (it * 10).roundToInt() / 10.0 }
    }

    suspend fun getBookingsByPeriod(
        connectedAccountId: String,
        startDate: Long
    ): List<ActivityBooking> {
        logger.info(
            "🔎 Fetching Bookings list for connected account {} from {}",
            connectedAccountId,
            startDate,
        )

        // Convertir les timestamps Unix (secondes) en format ISO pour Supabase
        val startDateTime = java.time.Instant.ofEpochSecond(startDate)
            .atZone(java.time.ZoneId.systemDefault())
            .toLocalDateTime()
            .toString()

        val response = supabaseClient.postgrest["activity_slot_bookings"]
            .select(
                columns = Columns.raw(
                    """
                id,
                reference,
                date,
                start_time,
                end_time,
                participants,
                total_price,
                status,
                users!inner(
                    firstname,
                    lastname
                ),
                activity_offers!inner(
                    activities!inner(
                        title,
                        providers!inner(
                            stripe_connected_account_id
                        )
                    )
                )
            """.trimIndent()
                )
            ) {
                filter {
                    gte("date", startDateTime.split("T")[0])
                    eq("activity_offers.activities.providers.stripe_connected_account_id", connectedAccountId)
                    isIn("status", listOf("COMING_SOON", "CANCEL", "PENDING", "PAYMENT_FAILED"))
                }
                limit(2)
            }


        val bookingsData = response.decodeList<ActivityBookingRaw>()

        logger.info("📊 Total bookings found: {}", bookingsData.size)

        val bookings = bookingsData.map { raw ->
            ActivityBooking(
                id = raw.id,
                reference = raw.reference,
                name = "${raw.users.firstname} ${raw.users.lastname}",
                date = raw.date,
                startTime = raw.startTime,
                endTime = raw.endTime,
                participants = raw.participants,
                title = raw.activityOffers.activities.title,
                totalPrice = raw.totalPrice,
                status = raw.status
            )
        }

        return bookings
    }

    suspend fun uploadImages(
        email: String,
        files: List<MultipartFile>,
        imageType: ImageType,
        activityName: String
    ): List<String> {
        logger.info("Upload Images on Supabase Storage")

        val bucketPath = "$email/$activityName/${imageType.name.lowercase()}"

        try {
            supabaseClient.storage.getBucket(StorageConstants.BUCKET_ID)
        } catch (e: Exception) {
            logger.info("Bucket '${StorageConstants.BUCKET_ID}' not found, creating a new one")
            supabaseClient.storage.createBucket(StorageConstants.BUCKET_ID) {
                public = true
                allowedMimeTypes(ContentType.Image.WEBP)
            }
        }

        return files.map { file ->
            val fileName = "${UUID.randomUUID()}_${file.originalFilename}"
            val bucketFile = "${bucketPath}/${fileName}"
            val contentType = file.contentType ?: "application/octet-stream"

            try {
                supabaseClient.storage
                    .from(StorageConstants.BUCKET_ID)
                    .upload(
                        path = bucketFile,
                        data = file.bytes,
                    ) {
                        upsert = true
                        this.contentType = ContentType.parse(contentType)
                    }

                supabaseClient.storage
                    .from(StorageConstants.BUCKET_ID)
                    .publicUrl(bucketFile)

            } catch (e: Exception) {
                logger.error("Failed to upload file ${file.originalFilename}: ${e.message}")
                throw RuntimeException("Upload failed for file ${file.originalFilename}", e)
            }
        }
    }

    suspend fun saveDraft(
        connectedAccountId: String,
        activityDraft: ActivityDraftDto
    ) {
        val activityId = saveStep1(connectedAccountId, activityDraft)
        logger.info("Activity saved with id: $activityId")
    }

    private suspend fun saveStep1(
        connectedAccountId: String,
        activityDraft: ActivityDraftDto
    ): String {
        val existingActivity = supabaseClient
            .from("activities")
            .select {
                filter {
                    eq("title", activityDraft.name!!)
                    eq("provider_id", connectedAccountId)
                }
            }
            .decodeSingleOrNull<Map<String, Any>>()

        val dto = ActivityUpsertDto(
            id           = existingActivity?.get("id") as String?,
            title        = activityDraft.name,
            description  = activityDraft.description,
            providerId   = connectedAccountId,
            isPublished  = false,
            mainPhotoUrl = null,
            galleryUrls  = null,
        )

        val activityId: String

        if (existingActivity != null) {
            supabaseClient
                .from("activities")
                .update(dto) {
                    filter { eq("id", dto.id!!) }
                }
            activityId = dto.id!!
        } else {
            val inserted = supabaseClient
                .from("activities")
                .insert(dto) {
                    select()
                    single()
                }
                .decodeSingle<Map<String, Any>>()
            activityId = inserted["id"] as String
        }

        activityDraft.categories?.let { upsertCategories(activityId, it) }

        return activityId
    }

    private suspend fun upsertCategories(
        activityId: String,
        categories: List<Categories>
    ) {
        val categoryIds = supabaseClient
            .from("activities_categories")
            .select {
                filter { isIn("name", categories.map { it.name }) }
            }
            .decodeList<Map<String, Any>>()
            .map { it["id"] as String }

        supabaseClient
            .from("activities_to_categories")
            .delete {
                filter {
                    eq("activity_id", activityId)
                }
            }

        if (categoryIds.isNotEmpty()) {
            supabaseClient
                .from("activities_to_categories")
                .insert(categoryIds.map { categoryId ->
                    mapOf(
                        "activity_id" to activityId,
                        "category_id" to categoryId
                    )
                })
        }
    }

    suspend fun saveDraftImages(
        connectedAccountId: String,
        activityName: String,
        previewUrls: List<String>?,
        programUrls: List<String>?
    ) {
        // --- Récupérer l'activité existante par nom + provider ---
        val existingActivity = supabaseClient
            .from("activities")
            .select {
                filter {
                    eq("title", activityName)
                    eq("provider_id", connectedAccountId)
                }
            }
            .decodeSingleOrNull<Map<String, Any>>()
            ?: throw IllegalArgumentException("Activité '$activityName' introuvable pour ce prestataire")

        val activityId = existingActivity["id"] as String

        // --- Mettre à jour les photos si des previews sont fournies ---
        previewUrls?.let {
            val mainPhotoUrl = it.firstOrNull()

            supabaseClient
                .from("activities")
                .update(
                    mapOf(
                        "main_photo_url" to mainPhotoUrl,
                        "gallery_urls" to it
                    )
                ) {
                    filter { eq("id", activityId) }
                }
        }

        // --- Mettre à jour les images de programme si fournies ---
        programUrls?.let { urls ->
            urls.forEachIndexed { index, url ->
                supabaseClient
                    .from("activities_programs")
                    .update(mapOf("photo_url" to url)) {
                        filter {
                            eq("activity_id", activityId)
                            eq("position", index)
                        }
                    }
            }
        }
    }

    suspend fun selectImages(
        email: String,
        imageType: ImageType,
        activityName: String
    ): List<String> {
        logger.info("Select Images on Supabase Storage")

        val folderPath = "$email/$activityName/${imageType.name.lowercase()}"

        val files = supabaseClient.storage
            .from(StorageConstants.BUCKET_ID)
            .list(folderPath)

        return files.map {
            supabaseClient.storage
                .from(StorageConstants.BUCKET_ID)
                .publicUrl("$folderPath/${it.name}")
        }
    }

    private val objectMapper = jacksonObjectMapper().apply {
        configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    }
}