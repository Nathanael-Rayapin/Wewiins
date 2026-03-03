package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.enums.ImageType
import com.wewiins.saas_api.utils.Sanitize
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.storage.storage
import io.ktor.http.ContentType
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Repository
class StorageRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(StorageRepository::class.java)

    object StorageConstants {
        const val BUCKET_ID = "activities"
    }

    suspend fun uploadImages(
        email: String,
        files: List<MultipartFile>,
        imageType: ImageType,
        activityName: String
    ): List<String> {
        logger.info("Upload Images on Supabase Storage")

        val sanitizedTitle = Sanitize.text(activityName)

        val bucketPath = "$email/$sanitizedTitle/${imageType.name.lowercase()}"

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

    suspend fun getImages(
        email: String,
        imageType: ImageType,
        activityName: String
    ): List<String> {
        logger.info("Get Images on Supabase Storage for activity '$activityName'")

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

    suspend fun canStoreImages(
        email: String,
        imageType: ImageType,
        activityName: String
    ): Int {
        logger.info("Can Store Images on Supabase Storage fro activity '$activityName'")

        val folderPath = "$email/$activityName/${imageType.name.lowercase()}"

        return supabaseClient.storage
            .from(StorageConstants.BUCKET_ID)
            .list(folderPath)
            .size
    }
}