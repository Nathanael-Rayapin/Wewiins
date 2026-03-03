package com.wewiins.saas_api.repositories

import com.wewiins.saas_api.dto.activity.ActivityCategoryDto
import com.wewiins.saas_api.enums.Categories
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository

@Repository
class CategoryRepository(
    private val supabaseClient: SupabaseClient,
) {
    private val logger = LoggerFactory.getLogger(CategoryRepository::class.java)

    object CategoryConstants {
        const val CATEGORY_TABLE = "activities_categories"
        const val ACTIVITY_TO_CATEGORY_TABLE = "activities_to_categories"
    }

    suspend fun upsertCategories(
        activityId: String,
        categories: List<Categories>
    ) {
        logger.info("Upserting categories for $activityId")

        val categoryRows = supabaseClient
            .from(CategoryConstants.CATEGORY_TABLE)
            .select {
                filter {
                    isIn("name", categories.map { it.supabaseValue })
                }
            }
            .decodeList<ActivityCategoryDto>()

        val categoryIds = categoryRows.map { it.id }

        supabaseClient
            .from(CategoryConstants.ACTIVITY_TO_CATEGORY_TABLE)
            .delete {
                filter {
                    eq("activity_id", activityId)
                }
            }

        val rows = categoryIds.map { categoryId ->
            mapOf(
                "activity_id" to activityId,
                "category_id" to categoryId
            )
        }

        supabaseClient
            .from(CategoryConstants.ACTIVITY_TO_CATEGORY_TABLE)
            .insert(rows)
    }
}