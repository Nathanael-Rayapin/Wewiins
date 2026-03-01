package com.wewiins.saas_api.controllers

import com.wewiins.saas_api.dto.ImageType
import com.wewiins.saas_api.dto.VerifiedAccountDto
import com.wewiins.saas_api.dto.activity.ActivityDraftDto
import com.wewiins.saas_api.services.ActivityService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/activity")
class ActivityController(
    private val activityService: ActivityService
) {

    @PostMapping("/draft", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun saveDraft(
        @RequestBody activityDraft: ActivityDraftDto,
        request: HttpServletRequest
    ): ResponseEntity<Void> {
        require(!activityDraft.step1?.name.isNullOrBlank()) { "Le nom de l'activité est obligatoire" }

        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        activityService.saveDraft(verifiedAccountDto, activityDraft)

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

    @PostMapping("/{activityName}/images", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadDraftImages(
        @PathVariable activityName: String,
        @RequestParam email: String,
        @RequestParam("preview", required = false) preview: List<MultipartFile>?,
        @RequestParam("program", required = false) program: List<MultipartFile>?,
        request: HttpServletRequest
    ): ResponseEntity<Void> {
        val verifiedAccountDto = request.getAttribute("verifiedAccount") as VerifiedAccountDto

        val previewUrls = preview?.let { activityService.uploadImages(
            email, it, ImageType.PREVIEW, activityName
        ) }
        val programUrls = program?.let { activityService.uploadImages(
            email, it, ImageType.PROGRAM, activityName
        ) }

        activityService.saveDraftImages(verifiedAccountDto, activityName, previewUrls, programUrls)
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

    @GetMapping("{activityName}/{imageType}/images")
    fun selectImage(
        @RequestParam email: String,
        @PathVariable imageType: ImageType,
        @PathVariable activityName: String
    ): List<String> {

        return activityService.selectImages(
            email,
            imageType,
            activityName
        )
    }

}