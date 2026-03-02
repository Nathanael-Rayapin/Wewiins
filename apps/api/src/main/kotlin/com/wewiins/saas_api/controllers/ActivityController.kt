package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.enums.ImageType
import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.interfaces.ActivityDraft
import com.wewiins.saas_api.services.ActivityService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.MediaType
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
    ): String {
        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val previewUrls = preview?.let { activityService.uploadImages(
            email, it, ImageType.PREVIEW, activityDraft.step1.name)
        }
        val programUrls = program?.let { activityService.uploadImages(
            email,it, ImageType.PROGRAM, activityDraft.step1.name)
        }

        return activityService.saveDraft(
            existingActivityId,
            verifiedAccountDto,
            activityDraft,
            previewUrls,
            programUrls
        )
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