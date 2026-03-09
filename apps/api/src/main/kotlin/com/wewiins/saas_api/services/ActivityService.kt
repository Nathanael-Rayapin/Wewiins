package com.wewiins.saas_api.services

import com.wewiins.saas_api.enums.ImageType
import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.interfaces.ActivityDraft
import com.wewiins.saas_api.repositories.ActivityRepository
import com.wewiins.saas_api.repositories.BookingRepository
import com.wewiins.saas_api.repositories.FavoriteRepository
import com.wewiins.saas_api.repositories.ProviderRepository
import com.wewiins.saas_api.repositories.StorageRepository
import com.wewiins.saas_api.repositories.TimeSlotRepository
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class ActivityService(
    private val activityRepository: ActivityRepository,
    private val providerRepository: ProviderRepository,
    private val storageRepository: StorageRepository,
    private val timeSlotRepository: TimeSlotRepository,
    private val bookingRepository: BookingRepository,
    private val favoriteRepository: FavoriteRepository
) {
    private val logger = LoggerFactory.getLogger(ActivityService::class.java)

    fun saveDraft(
        existingActivityId: String?,
        verifiedAccountDto: VerifiedAccountDto,
        activityDraft: ActivityDraft,
        previewUrls: List<String>?,
        programUrls: List<String>?
    ): String {
        logger.info("Save Draft")

        return runBlocking {
            val providerId = providerRepository.getProviderIdByStripeAccountId(
                verifiedAccountDto.stripeConnectedAccountId!!
            )

            activityRepository.saveDraft(
                existingActivityId,
                providerId,
                activityDraft,
                previewUrls,
                programUrls
            )
        }
    }

    fun uploadImages(
        email: String,
        files: List<MultipartFile>,
        imageType: ImageType,
        activityName: String
    ): List<String> {
        logger.info("Upload Images")
        return runBlocking {
            storageRepository.uploadImages(email, files, imageType, activityName)
        }
    }

    fun getImages(
        email: String,
        imageType: ImageType,
        activityName: String
    ): List<String> {
        logger.info("Select Images for $activityName")
        return runBlocking {
            storageRepository.getImages(
                email,
                imageType,
                activityName
            )
        }
    }

    fun canStoreImages(
        email: String,
        imageType: ImageType,
        activityName: String
    ): Int {
        logger.info("Store Images")
        return runBlocking {
            storageRepository.canStoreImages(
                email,
                imageType,
                activityName
            )
        }
    }

    fun loadDraft(
        verifiedAccountDto: VerifiedAccountDto,
        existingActivityId: String?,
        existingActivityName: String?
    ): ActivityDraftDto {
        logger.info("Load Draft")

        return runBlocking {
            val providerId = providerRepository.getProviderIdByStripeAccountId(
                verifiedAccountDto.stripeConnectedAccountId!!
            )

            activityRepository.loadDraft(
                providerId,
                existingActivityId,
                existingActivityName
            )
        }
    }

    fun getActivityNameById(activityId: String): String {
        return runBlocking {
            activityRepository.getActivityNameById(activityId)
        }
    }
}