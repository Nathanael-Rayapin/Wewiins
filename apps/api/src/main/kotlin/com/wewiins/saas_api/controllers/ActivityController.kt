package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.enums.ImageType
import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.interfaces.ActivityDraft
import com.wewiins.saas_api.services.ActivityService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/activity")
class ActivityController(
    private val activityService: ActivityService
) {

    @PostMapping("/draft", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun saveDraft(
        @RequestParam email: String,
        @RequestParam existingActivityId: String?,
        @RequestPart("activityDraft") activityDraft: ActivityDraft,
        @RequestParam("preview", required = false) preview: List<MultipartFile>?,
        @RequestParam("program", required = false) program: List<MultipartFile>?,
        request: HttpServletRequest
    ): ResponseEntity<Map<String, String>> {
        require(!existingActivityId.isNullOrBlank() || !activityDraft.step1?.name.isNullOrBlank()) {
            "Un identifiant d'activité ou un nom est requis"
        }

        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val activityName = activityDraft.step1?.name
            ?: existingActivityId?.let { id ->
                activityService.getActivityNameById(id)
            }

        val previewUrls = preview?.let {
            requireNotNull(activityName) { "Le nom de l'activité est requis pour uploader des images" }
            activityService.uploadImages(email, it, ImageType.PREVIEW, activityName)
        }

        val programUrls = program?.let {
            requireNotNull(activityName) { "Le nom de l'activité est requis pour uploader des images de programme" }
            activityService.uploadImages(email, it, ImageType.PROGRAM, activityName)
        }

        val activityId = activityService.saveDraft(
            existingActivityId,
            verifiedAccountDto,
            activityDraft,
            previewUrls,
            programUrls
        )

        return ResponseEntity.ok(mapOf("activityId" to activityId))
    }

    @GetMapping("/draft/load")
    fun loadDraft(
        @RequestParam existingActivityId: String?,
        @RequestParam existingActivityName: String?,
        request: HttpServletRequest
    ): ResponseEntity<ActivityDraftDto> {
        require(!existingActivityId.isNullOrBlank() || !existingActivityName.isNullOrBlank()) {
            "Un identifiant ou un nom d'activité est requis"
        }

        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val draft = activityService.loadDraft(
            verifiedAccountDto,
            existingActivityId,
            existingActivityName
        )

        return ResponseEntity.ok(draft)
    }

    @GetMapping("{activityName}/{imageType}/images")
    fun getImages(
        @RequestParam email: String,
        @PathVariable imageType: ImageType,
        @PathVariable activityName: String
    ): List<String> {

        return activityService.getImages(
            email,
            imageType,
            activityName
        )
    }

    @GetMapping("{activityName}/{imageType}/images/count")
    fun canStoreImages(
        @RequestParam email: String,
        @PathVariable imageType: ImageType,
        @PathVariable activityName: String
    ): Int {

        return activityService.canStoreImages(
            email,
            imageType,
            activityName
        )
    }

}